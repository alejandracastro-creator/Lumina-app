import React, { useEffect, useState, useCallback } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Animated } from 'react-native';
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

  return (
    <LuminaBackground style={styles.container}>
      <InfoButton
        title="Home"
        text="Acá podés ver tu racha (racha = días seguidos) del Oráculo (🔥) y tu avance del Ritual. Es una guía suave para acompañarte a sostener hábitos, sin exigencia."
        top={56}
        right={16}
      />
      {/* Indicadores de Racha y Progreso */}
      <View style={styles.statsHeader}>
        <View style={styles.statBadge}>
          <Ionicons name="flame" size={20} color="#F59E0B" />
          <Text style={styles.statText}>{streak}</Text>
        </View>
        <View style={[styles.statBadge, ritualBehind ? styles.statBadgeBad : styles.statBadgeGood]}>
          <Ionicons name="journal" size={20} color={ritualBehind ? '#EF4444' : '#10B981'} />
          <Text style={[styles.statText, ritualBehind ? styles.statTextBad : styles.statTextGood]}>{ritualProgress}/30</Text>
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
          <Text style={styles.oracleButtonText}>Oráculo del día</Text>
          <Animated.View style={[styles.sparkleContainer, { opacity: sparkleAnim }]}>
            <Ionicons name="sparkles" size={24} color="#FDE68A" />
          </Animated.View>
        </TouchableOpacity>
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
    top: 60,
    left: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  statBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(30, 27, 75, 0.6)',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginRight: 10,
    borderWidth: 1,
    borderColor: 'rgba(167, 139, 250, 0.3)',
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
  },
  sparkleContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});
