import React, { useEffect, useState, useCallback } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Animated, Alert } from 'react-native';
import LuminaBackground from '../../components/LuminaBackground';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import InfoButton from '../../components/InfoButton';

export default function HomeScreen() {
  const router = useRouter();
  const sparkleAnim = new Animated.Value(0);
  const [streak, setStreak] = useState(0);
  const [ritualProgress, setRitualProgress] = useState(0);
  const [ritualBehind, setRitualBehind] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminJwt, setAdminJwt] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  const loadStats = useCallback(async () => {
    try {
      const [savedProgress, savedOracleStreak, savedStartDate, savedAppStart] = await Promise.all([
        AsyncStorage.getItem('lumina_ritual_progress_v2'),
        AsyncStorage.getItem('oracle_streak'),
        AsyncStorage.getItem('lumina_ritual_start_date'),
        AsyncStorage.getItem('lumina_app_start_date'),
      ]);

      if (!savedAppStart) {
        const todayIso = new Date().toISOString().split('T')[0];
        await AsyncStorage.setItem('lumina_app_start_date', todayIso);
      }

      const oracleStreak = savedOracleStreak ? parseInt(savedOracleStreak) : 0;
      setStreak(oracleStreak);

      const progressData = savedProgress ? JSON.parse(savedProgress) : [];
      const completedCount = progressData.filter((p: any) => p.morningCompleted && p.nightCompleted).length;
      setRitualProgress(completedCount);

      if (savedStartDate) {
        const todayStr = new Date().toISOString().split('T')[0];
        const diffMs = Date.parse(todayStr) - Date.parse(savedStartDate);
        const diffDays = Math.floor(diffMs / 86400000);
        const currentDayNumber = Math.max(1, Math.min(30, diffDays + 1));

        const hasMissed = progressData.some((p: any) => {
          if (typeof p?.day !== 'number') return false;
          if (p.day >= currentDayNumber) return false;
          return !(p.morningCompleted && p.nightCompleted);
        });

        const currentDayEntry = progressData.find((p: any) => p?.day === currentDayNumber);
        const currentDayComplete = currentDayEntry ? currentDayEntry.morningCompleted && currentDayEntry.nightCompleted : false;

        setRitualBehind(hasMissed || !currentDayComplete);
      } else {
        const hasPartial = progressData.some((p: any) => !!p?.morningCompleted !== !!p?.nightCompleted);
        setRitualBehind(hasPartial);
      }
      
    } catch (e) {
      console.error('Error loading stats', e);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadStats();
      return undefined;
    }, [loadStats])
  );

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(sparkleAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(sparkleAnim, {
          toValue: 0,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const identity = (globalThis as any)?.netlifyIdentity || (window as any)?.netlifyIdentity;
    const current = identity?.currentUser?.();
    const email = current?.email;
    const jwt =
      current?.token?.access_token ||
      current?.token?.accessToken ||
      current?.token?.token ||
      current?.token ||
      null;
    setIsAdmin(email === 'disalejandracastro@gmail.com');
    setAdminJwt(typeof jwt === 'string' ? jwt : null);
  }, []);

  const handleSendOracleToAll = useCallback(async () => {
    if (sending) return;
    setSending(true);
    try {
      const messages = [
        '🌟¿Ya viste qué carta te revela el Oráculo hoy?',
        '🌟 Tu mensaje del Oráculo ya está listo.',
        '🌟¿Qué tiene LUMINA para vos hoy? Descubrí tu carta.',
        '🌟 Un momento para vos: Mirá qué dice el Oráculo.',
      ];
      const day = Math.floor(Date.UTC(new Date().getUTCFullYear(), new Date().getUTCMonth(), new Date().getUTCDate()) / 86400000);
      const msg = messages[((day % messages.length) + messages.length) % messages.length];

      const res = await fetch('/.netlify/functions/push-send', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          ...(adminJwt ? { authorization: `Bearer ${adminJwt}` } : {}),
        },
        body: JSON.stringify({ title: 'LUMINA', body: msg, url: '/oracle' }),
      });

      const text = await res.text();
      if (!res.ok) {
        Alert.alert('Error', `push-send: ${res.status}\n${text}`);
        return;
      }
      Alert.alert('Enviado', text);
    } catch (e: any) {
      Alert.alert('Error', e?.message || String(e));
    } finally {
      setSending(false);
    }
  }, [adminJwt, sending]);

  return (
    <LuminaBackground style={styles.container}>
      <InfoButton
        variant="pill"
        label="¿Que es Lumina?"
        title="Bienvenido a LUMINA"
        text={`Este es tu espacio para pausar, conectar con vos y volver a tu centro.\n\nAcá vas a encontrar tu carta del día, tu ritual y herramientas para acompañarte.\n\nTambién podés ver tus rachas: (los días seguidos que elegís estar con vos, ya sea a través del oráculo o del ritual). Cada día cuenta.`}
        top={56}
        right={16}
      />
      {/* Indicadores de Racha y Progreso */}
      <View style={styles.statsHeader}>
        <View style={styles.statBadge}>
          <View style={styles.statTopRow}>
            <Ionicons name="flame" size={20} color="#F59E0B" />
            <Text style={styles.statText}>{streak}</Text>
          </View>
          <Text style={styles.statLabel}>RACHA{"\n"}ORACULO</Text>
        </View>
        <View style={[styles.statBadge, ritualBehind ? styles.statBadgeBad : styles.statBadgeGood]}>
          <View style={styles.statTopRow}>
            <Ionicons name="journal" size={20} color={ritualBehind ? '#EF4444' : '#10B981'} />
            <Text style={[styles.statText, ritualBehind ? styles.statTextBad : styles.statTextGood]}>{ritualProgress}/30</Text>
          </View>
          <Text style={styles.statLabel}>RACHA{"\n"}RITUAL</Text>
        </View>
      </View>

      <View style={styles.header}>
        <Text style={styles.title}>LUMINA</Text>
        <Text style={styles.subtitle}>Tu lugar interior</Text>
      </View>

      <View style={styles.content}>
        <TouchableOpacity 
          style={styles.oracleButton} 
          onPress={() => router.push('/oracle')}
        >
          <Animated.View style={[styles.sparkleContainer, { opacity: sparkleAnim }]}>
            <Ionicons name="sparkles" size={24} color="#FDE68A" />
          </Animated.View>
          <Text style={styles.oracleButtonText} numberOfLines={1} ellipsizeMode="clip">
            Oráculo del día
          </Text>
          <Animated.View style={[styles.sparkleContainer, { opacity: sparkleAnim }]}>
            <Ionicons name="sparkles" size={24} color="#FDE68A" />
          </Animated.View>
        </TouchableOpacity>
        {isAdmin && (
          <TouchableOpacity style={[styles.adminButton, sending && styles.adminButtonDisabled]} onPress={handleSendOracleToAll}>
            <Text style={styles.adminButtonText}>{sending ? 'ENVIANDO…' : 'ENVIAR ORÁCULO A TODOS'}</Text>
          </TouchableOpacity>
        )}
      </View>
    </LuminaBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  statsHeader: {
    position: 'absolute',
    top: 56,
    left: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  statBadge: {
    alignItems: 'center',
    backgroundColor: 'rgba(30, 27, 75, 0.6)',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 20,
    marginRight: 10,
    borderWidth: 1,
    borderColor: 'rgba(167, 139, 250, 0.3)',
  },
  statTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statBadgeGood: {
    borderColor: 'rgba(16, 185, 129, 0.6)',
  },
  statBadgeBad: {
    borderColor: 'rgba(239, 68, 68, 0.7)',
  },
  statText: {
    color: '#E9D5FF',
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 6,
  },
  statLabel: {
    marginTop: 4,
    color: 'rgba(233, 213, 255, 0.7)',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.8,
    textAlign: 'center',
    lineHeight: 12,
  },
  statTextGood: {
    color: '#D1FAE5',
  },
  statTextBad: {
    color: '#FCA5A5',
  },
  header: {
    alignItems: 'center',
    marginBottom: 60,
  },
  title: {
    fontSize: 52,
    fontWeight: 'bold',
    color: '#E9D5FF',
    letterSpacing: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 22,
    color: '#C4B5FD',
    marginTop: 15,
    fontWeight: '300',
    letterSpacing: 2,
    textAlign: 'center',
  },
  content: {
    width: '100%',
    alignItems: 'center',
  },
  oracleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    backgroundColor: '#1E1B4B',
    paddingVertical: 22,
    paddingHorizontal: 35,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: '#4C1D95',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  oracleButtonText: {
    color: '#FDE68A',
    fontSize: 26,
    fontWeight: '600',
    marginHorizontal: 15,
    letterSpacing: 1.5,
    textAlign: 'center',
    flexShrink: 0,
  },
  sparkleContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 24,
    height: 24,
  },
  adminButton: {
    marginTop: 18,
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 14,
    backgroundColor: 'rgba(239, 68, 68, 0.92)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
    width: '100%',
    maxWidth: 520,
    alignItems: 'center',
  },
  adminButtonDisabled: {
    opacity: 0.65,
  },
  adminButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 0.6,
    textAlign: 'center',
  },
});
