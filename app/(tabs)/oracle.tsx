import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Alert, Platform, Share, StyleSheet, Text, View, TouchableOpacity, Animated, Image, Dimensions, ScrollView } from 'react-native';
import LuminaBackground from '../../components/LuminaBackground';
import { ORACLE_BACK_IMAGE, ORACLE_CARDS } from '../../constants/Cards';
import { ORACLE_REVIEW_MODE } from '../../constants/Data';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Audio } from 'expo-av';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import InfoButton from '../../components/InfoButton';

const { width } = Dimensions.get('window');
const ORACLE_USAGE_KEY = 'lumina_oracle_usage_v1';
const ORACLE_START_DATE_KEY = 'lumina_oracle_start_date';
const ORACLE_LIKES_KEY = 'lumina_oracle_likes_v1';

const FALLBACK_PALETTES = [
  ['#0F172A', '#7C3AED', '#F472B6'],
  ['#111827', '#A78BFA', '#FDE68A'],
  ['#0B1020', '#60A5FA', '#F472B6'],
  ['#111827', '#F472B6', '#A78BFA'],
  ['#0F172A', '#FDE68A', '#A78BFA'],
] as const;

function FallbackOracleImage({ title, message, id }: { title: string; message: string; id: string }) {
  const idx = (parseInt(id, 10) || 0) % FALLBACK_PALETTES.length;
  const colors = FALLBACK_PALETTES[idx];
  const topGlyph = (parseInt(id, 10) || 0) % 2 === 0 ? 'moon' : 'sparkles';
  const bottomGlyph = (parseInt(id, 10) || 0) % 3 === 0 ? 'star' : 'leaf';

  return (
    <View style={[styles.cardImageFull, styles.fallbackImage]}>
      <LinearGradient colors={colors} start={{ x: 0.1, y: 0.1 }} end={{ x: 0.9, y: 0.9 }} style={StyleSheet.absoluteFill} />
      <View style={styles.fallbackFrame} />
      <Ionicons name={topGlyph as any} size={34} color="rgba(253, 230, 138, 0.9)" style={styles.fallbackTopIcon} />
      <Ionicons name={bottomGlyph as any} size={30} color="rgba(233, 213, 255, 0.85)" style={styles.fallbackBottomIcon} />
      <View style={styles.fallbackTextWrap}>
        <Text style={styles.fallbackTitle} numberOfLines={2}>{title}</Text>
        <Text style={styles.fallbackSnippet} numberOfLines={2}>{message}</Text>
      </View>
    </View>
  );
}

export default function OracleScreen() {
  const [card, setCard] = useState<any>(null);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [usePngIcons, setUsePngIcons] = useState(true);
  const flipAnim = useRef(new Animated.Value(0)).current;
  const sound = useRef<Audio.Sound | null>(null);
  const isAnimatingRef = useRef(false);
  const shareWrapRef = useRef<any>(null);

  useEffect(() => {
    return () => {
      if (sound.current) {
        sound.current.unloadAsync();
      }
    };
  }, []);

  const trackOracleUse = useCallback(async (dateISO: string) => {
    try {
      const [raw, startDate] = await Promise.all([
        AsyncStorage.getItem(ORACLE_USAGE_KEY),
        AsyncStorage.getItem(ORACLE_START_DATE_KEY),
      ]);

      const parsed = raw ? JSON.parse(raw) : {};
      const byDay = typeof parsed.byDay === 'object' && parsed.byDay ? parsed.byDay : {};
      byDay[dateISO] = true;

      await AsyncStorage.setItem(ORACLE_USAGE_KEY, JSON.stringify({ byDay }));
      if (!startDate) await AsyncStorage.setItem(ORACLE_START_DATE_KEY, dateISO);
    } catch (e) {
      return;
    }
  }, []);

  const checkIfDrawnToday = useCallback(async () => {
    try {
      const lastDrawDate = await AsyncStorage.getItem('last_oracle_draw_date');
      const lastCardId = await AsyncStorage.getItem('last_oracle_card_id');
      const todayISO = new Date().toISOString().split('T')[0];
      const todayLegacy = new Date().toDateString();

      const isSameDay = lastDrawDate === todayISO || lastDrawDate === todayLegacy;
      if (isSameDay && lastCardId) {
        const drawnCard = ORACLE_CARDS.find(c => c.id === lastCardId);
        if (drawnCard) {
          setCard(drawnCard);
          try {
            const rawLikes = await AsyncStorage.getItem(ORACLE_LIKES_KEY);
            const likes = rawLikes ? JSON.parse(rawLikes) : {};
            setIsLiked(!!likes?.[todayISO]);
          } catch {
            setIsLiked(false);
          }
          await trackOracleUse(todayISO);
          return;
        }
      }
      setCard(null);
      setIsLiked(false);
    } catch (e) {
      console.error('Error checking draw date', e);
    }
  }, [trackOracleUse]);

  const resetCard = useCallback(() => {
    flipAnim.setValue(0);
    setIsFlipped(false);
    setCard(null);
  }, [flipAnim]);

  useFocusEffect(
    useCallback(() => {
      flipAnim.setValue(0);
      setIsFlipped(false);

      if (ORACLE_REVIEW_MODE) resetCard();
      else checkIfDrawnToday();

      return undefined;
    }, [checkIfDrawnToday, flipAnim, resetCard])
  );

  const playMagicSound = async () => {
    try {
      // Intentar cargar sonido si existe en assets/sounds/magic.mp3
      // const { sound: soundObj } = await Audio.Sound.createAsync(require('../../assets/sounds/magic.mp3'));
      // sound.current = soundObj;
      // await sound.current.playAsync();
      console.log('Reproduciendo sonido de magia...');
    } catch (e) {
      console.log('Sonido no encontrado o error al reproducir');
    }
  };

  const bumpOracleStreak = useCallback(async () => {
    try {
      const savedStreak = await AsyncStorage.getItem('oracle_streak');
      let currentStreak = savedStreak ? parseInt(savedStreak) : 0;
      currentStreak += 1;
      await AsyncStorage.setItem('oracle_streak', currentStreak.toString());
    } catch (e) {
      console.error('Error updating oracle streak', e);
    }
  }, []);

  const handleFirstTouch = async () => {
    if (isAnimatingRef.current) return;

    if (ORACLE_REVIEW_MODE) {
      const randomIndex = Math.floor(Math.random() * ORACLE_CARDS.length);
      const selected = ORACLE_CARDS[randomIndex];
      setCard(selected);
      flipAnim.setValue(0);
      setIsFlipped(false);
      await bumpOracleStreak();
      flipCard();
      return;
    }

    if (card) {
      if (isFlipped) {
        flipBack();
      } else {
        flipCard();
      }
      return;
    }

    const randomIndex = Math.floor(Math.random() * ORACLE_CARDS.length);
    const selected = ORACLE_CARDS[randomIndex];
    setCard(selected);

    try {
      const [lastDrawDate, savedStreak] = await Promise.all([
        AsyncStorage.getItem('last_oracle_draw_date'),
        AsyncStorage.getItem('oracle_streak'),
      ]);

      const todayISO = new Date().toISOString().split('T')[0];
      const todayLegacy = new Date().toDateString();
      const isSameDay = lastDrawDate === todayISO || lastDrawDate === todayLegacy;

      await AsyncStorage.setItem('last_oracle_draw_date', todayISO);
      await AsyncStorage.setItem('last_oracle_card_id', selected.id);

      if (!isSameDay) {
        let currentStreak = savedStreak ? parseInt(savedStreak) : 0;
        currentStreak += 1;
        await AsyncStorage.setItem('oracle_streak', currentStreak.toString());
        await trackOracleUse(todayISO);
      }
      try {
        const rawLikes = await AsyncStorage.getItem(ORACLE_LIKES_KEY);
        const likes = rawLikes ? JSON.parse(rawLikes) : {};
        setIsLiked(!!likes?.[todayISO]);
      } catch {
        setIsLiked(false);
      }
    } catch (e) {
      console.error('Error saving draw status', e);
    }

    flipCard();
  };

  const flipCard = () => {
    playMagicSound();

    isAnimatingRef.current = true;
    Animated.timing(flipAnim, {
      toValue: 180,
      duration: 1500,
      useNativeDriver: true,
    }).start(() => {
      setIsFlipped(true);
      isAnimatingRef.current = false;
    });
  };

  const flipBack = () => {
    isAnimatingRef.current = true;
    Animated.timing(flipAnim, {
      toValue: 0,
      duration: 900,
      useNativeDriver: true,
    }).start(() => {
      setIsFlipped(false);
      isAnimatingRef.current = false;
    });
  };

  const frontInterpolate = flipAnim.interpolate({
    inputRange: [0, 180],
    outputRange: ['0deg', '180deg'],
  });

  const backInterpolate = flipAnim.interpolate({
    inputRange: [0, 180],
    outputRange: ['180deg', '360deg'],
  });

  const frontAnimatedStyle = {
    transform: [{ rotateY: frontInterpolate }],
    zIndex: isFlipped ? 0 : 1, // El reverso está arriba al inicio
  };

  const backAnimatedStyle = {
    transform: [{ rotateY: backInterpolate }],
    zIndex: isFlipped ? 1 : 0, // El frente está arriba al final
  };

  const handleToggleLike = useCallback(async () => {
    if (!card) return;
    const todayISO = new Date().toISOString().split('T')[0];
    try {
      const raw = await AsyncStorage.getItem(ORACLE_LIKES_KEY);
      const likes = raw ? JSON.parse(raw) : {};
      const next = !likes?.[todayISO];
      const updated = { ...(likes || {}) };
      if (next) updated[todayISO] = true;
      else delete updated[todayISO];
      await AsyncStorage.setItem(ORACLE_LIKES_KEY, JSON.stringify(updated));
      setIsLiked(next);
    } catch {
      setIsLiked((v) => !v);
    }
  }, [card]);

  const handleShare = useCallback(async () => {
    if (!card) return;
    const shareUrl =
      Platform.OS === 'web' && typeof window !== 'undefined'
        ? window.location.href
        : 'https://luminavidaconsciente.netlify.app/';
    const shareText = `${card.title}\n\n${card.message}\n\n${shareUrl}`;

    if (Platform.OS !== 'web') {
      try {
        await Share.share({ message: shareText });
      } catch {}
      return;
    }

    const nav: any = typeof window !== 'undefined' ? window.navigator : null;
    if (!nav?.share) {
      try {
        await nav?.clipboard?.writeText?.(shareText);
        Alert.alert('Compartir', 'Copiado al portapapeles.');
      } catch {
        Alert.alert('Compartir', shareText);
      }
      return;
    }

    let files: File[] | undefined;
    try {
      const el = shareWrapRef.current as HTMLElement | null;
      if (el) {
        const mod: any = await import('html2canvas');
        const html2canvas = mod?.default ?? mod;
        const canvas: HTMLCanvasElement = await html2canvas(el, { backgroundColor: '#0B0720', scale: 2, useCORS: true });
        const blob: Blob | null = await new Promise((resolve) => canvas.toBlob(resolve, 'image/png'));
        if (blob) {
          const file = new File([blob], 'lumina-oraculo.png', { type: 'image/png' });
          if (typeof nav.canShare === 'function' && nav.canShare({ files: [file] })) {
            files = [file];
          }
        }
      }
    } catch {}

    try {
      const data: any = {
        title: 'LUMINA — Oráculo',
        text: `${card.title}\n\n${card.message}`,
        url: shareUrl,
      };
      if (files?.length) data.files = files;
      await nav.share(data);
    } catch {}
  }, [card]);

  return (
    <LuminaBackground style={styles.container}>
      <InfoButton
        title="Oráculo"
        text="El oráculo es un mensaje para vos en este momento. Cada día podés recibir una única carta, con una guía, una reflexión o una señal para acompañarte en tu día. Podes darla vuelta todas las veces que quieras y siempre será la misma. Mañana habrá una nueva. Cada día, un nuevo mensaje para acompañarte."
        size="sm"
        top={18}
        right={16}
      />
      <ScrollView contentContainerStyle={styles.cardWrapper} showsVerticalScrollIndicator={false}>
        <View ref={shareWrapRef as any} collapsable={false}>
          <TouchableOpacity activeOpacity={1} onPress={handleFirstTouch} disabled={false}>
            <View style={styles.flipContainer}>
              <Animated.View style={[styles.card, styles.cardBack, frontAnimatedStyle]}>
                <Image source={ORACLE_BACK_IMAGE} style={styles.cardBackImage} resizeMode="cover" />
              </Animated.View>

              <Animated.View
                style={[
                  styles.card,
                  styles.cardFront,
                  backAnimatedStyle,
                  { opacity: flipAnim.interpolate({ inputRange: [89, 90], outputRange: [0, 1] }) },
                ]}
              >
                {card && (
                  <>
                    {card.image ? (
                      <Image source={card.image} style={styles.cardImageFull} resizeMode="cover" />
                    ) : (
                      <FallbackOracleImage title={card.title} message={card.message} id={card.id} />
                    )}
                  </>
                )}
              </Animated.View>
            </View>
          </TouchableOpacity>
        
        {!isFlipped && (
          <Animated.Text style={[styles.instructions, { opacity: flipAnim.interpolate({ inputRange: [0, 45], outputRange: [1, 0] }) }]}>
            Toca la carta para revelar tu guía...
          </Animated.Text>
        )}

        {isFlipped && card && (
          <View style={styles.messagePanel}>
            <Text style={styles.messageTitle}>{card.title}</Text>
            <ScrollView style={styles.messageScroll} showsVerticalScrollIndicator={false}>
              <Text style={styles.messageText}>{card.message}</Text>
            </ScrollView>
          </View>
        )}
        </View>

        {isFlipped && card && (
          <View style={styles.actionsRow}>
            <TouchableOpacity style={styles.actionButton} onPress={handleToggleLike} accessibilityRole="button" accessibilityLabel="Me gusta">
              {Platform.OS === 'web' ? (
                <Image
                  source={{
                    uri: isLiked
                      ? usePngIcons
                        ? '/icons/boton-like-red.png'
                        : '/icons/boton-like-red.svg'
                      : usePngIcons
                        ? '/icons/boton-like.png'
                        : '/icons/boton-like.svg',
                  }}
                  style={styles.actionIcon}
                  resizeMode="contain"
                  onError={() => setUsePngIcons(false)}
                />
              ) : (
                <Ionicons name={isLiked ? 'heart' : 'heart-outline'} size={22} color={isLiked ? '#EF4444' : '#C4B5FD'} />
              )}
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton} onPress={handleShare} accessibilityRole="button" accessibilityLabel="Compartir">
              {Platform.OS === 'web' ? (
                <Image
                  source={{ uri: usePngIcons ? '/icons/boton-compartir.png' : '/icons/boton-compartir.svg' }}
                  style={styles.actionIcon}
                  resizeMode="contain"
                  onError={() => setUsePngIcons(false)}
                />
              ) : (
                <Ionicons name="share-outline" size={22} color="#C4B5FD" />
              )}
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </LuminaBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  cardWrapper: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 80,
    paddingBottom: 50,
  },
  flipContainer: {
    width: width * 0.75,
    height: width * 1.2,
  },
  instructions: {
    color: '#FDE68A',
    marginTop: 40,
    fontSize: 18,
    fontWeight: '400',
    letterSpacing: 1,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  card: {
    width: '100%',
    height: '100%',
    borderRadius: 20,
    backfaceVisibility: 'hidden',
    overflow: 'hidden',
    elevation: 20,
    shadowColor: '#FDE68A',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
  },
  cardBack: {
    backgroundColor: '#1E1B4B',
    position: 'absolute',
    top: 0,
  },
  cardBackImage: {
    width: '100%',
    height: '100%',
  },
  bohoFrame: {
    flex: 1,
    margin: 15,
    borderWidth: 2,
    borderColor: '#FDE68A',
    borderRadius: 15,
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  corner: {
    position: 'absolute',
  },
  tl: { top: 10, left: 10 },
  tr: { top: 10, right: 10 },
  bl: { bottom: 10, left: 10 },
  br: { bottom: 10, right: 10 },
  bohoCenter: {
    alignItems: 'center',
  },
  outerCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 1,
    borderColor: 'rgba(253, 230, 138, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  innerCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: '#FDE68A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bohoText: {
    color: '#FDE68A',
    fontSize: 32,
    fontWeight: 'bold',
    letterSpacing: 8,
    marginVertical: 10,
  },
  dividerLine: {
    width: 60,
    height: 1,
    backgroundColor: '#FDE68A',
    marginVertical: 10,
    opacity: 0.6,
  },
  tarotLabel: {
    color: '#FDE68A',
    fontSize: 14,
    letterSpacing: 4,
    fontWeight: '300',
  },
  cardFront: {
    backgroundColor: '#FDFCF0',
    borderWidth: 4,
    borderColor: '#FDE68A',
  },
  cardImage: {
    width: '100%',
    height: '60%',
  },
  cardImageFull: {
    width: '100%',
    height: '100%',
  },
  placeholderImage: {
    backgroundColor: '#E9D5FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fallbackImage: {
    justifyContent: 'flex-end',
  },
  fallbackFrame: {
    position: 'absolute',
    top: 12,
    left: 12,
    right: 12,
    bottom: 12,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(253, 230, 138, 0.55)',
  },
  fallbackTopIcon: {
    position: 'absolute',
    top: 18,
    left: 18,
  },
  fallbackBottomIcon: {
    position: 'absolute',
    bottom: 18,
    right: 18,
  },
  fallbackTextWrap: {
    paddingHorizontal: 18,
    paddingBottom: 18,
  },
  fallbackTitle: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 0.5,
    textShadowColor: 'rgba(0,0,0,0.35)',
    textShadowOffset: { width: 0, height: 1 },
    shadowRadius: 2,
  },
  fallbackSnippet: {
    marginTop: 6,
    color: 'rgba(255,255,255,0.85)',
    fontSize: 12,
    lineHeight: 16,
  },
  cardContent: {
    padding: 20,
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1E1B4B',
    textAlign: 'center',
    marginBottom: 8,
  },
  cardDivider: {
    width: 30,
    height: 2,
    backgroundColor: '#4C1D95',
    marginBottom: 10,
  },
  cardMessage: {
    fontSize: 15,
    color: '#2D1B69',
    textAlign: 'center',
    lineHeight: 22,
  },
  messagePanel: {
    width: width * 0.8,
    marginTop: 20,
    backgroundColor: 'rgba(26, 16, 61, 0.65)',
    borderWidth: 1,
    borderColor: 'rgba(167, 139, 250, 0.35)',
    borderRadius: 20,
    padding: 16,
    position: 'relative',
  },
  messageTitle: {
    color: '#E9D5FF',
    fontSize: 18,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 10,
  },
  messageScroll: {
    maxHeight: 240,
  },
  messageText: {
    color: 'rgba(233, 213, 255, 0.85)',
    fontSize: 14,
    lineHeight: 22,
    textAlign: 'center',
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 999,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(26, 16, 61, 0.35)',
    borderWidth: 1,
    borderColor: 'rgba(196, 181, 253, 0.35)',
    marginHorizontal: 10,
  },
  actionIcon: {
    width: 22,
    height: 22,
  },
  drawnNotice: {
    color: '#C4B5FD',
    marginTop: 30,
    fontSize: 16,
    fontStyle: 'italic',
  },
});
