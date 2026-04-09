import React, { useEffect, useRef } from 'react';
import { StyleSheet, View, Text, Animated, Easing, TouchableOpacity } from 'react-native';

interface BreathingGuideProps {
  inhale: number;
  hold: number;
  exhale: number;
  hold2: number;
  repeat?: number;
  onFinish?: () => void;
}

export default function BreathingGuide({ inhale, hold, exhale, hold2, repeat = 3, onFinish }: BreathingGuideProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(0.3)).current;
  const [phase, setPhase] = React.useState('COMENZAR');
  const [round, setRound] = React.useState(1);
  const [isRunning, setIsRunning] = React.useState(false);
  const [secondsLeft, setSecondsLeft] = React.useState<number | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    if (!isRunning) return;

    let isMounted = true;
    let currentRound = 1;
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    const startCountdown = (seconds: number) => {
      if (!isMounted) return;
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (!seconds || seconds <= 0) {
        setSecondsLeft(null);
        return;
      }

      let remaining = Math.floor(seconds);
      setSecondsLeft(remaining);
      intervalRef.current = setInterval(() => {
        if (!isMounted) return;
        remaining -= 1;
        if (remaining <= 0) {
          setSecondsLeft(null);
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
          return;
        }
        setSecondsLeft(remaining);
      }, 1000);
    };

    const runAnimation = () => {
      if (!isMounted) return;

      // Fase 1: Inhala
      setPhase('Inhala...');
      startCountdown(inhale);
      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: 1.5,
          duration: inhale * 1000,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: inhale * 1000,
          useNativeDriver: true,
        }),
      ]).start(() => {
        if (!isMounted) return;

        // Fase 2: Sostén
        setPhase('Sostén');
        startCountdown(hold);
        const holdTimeout = setTimeout(() => {
          if (!isMounted) return;

          // Fase 3: Exhala
          setPhase('Exhala...');
          startCountdown(exhale);
          Animated.parallel([
            Animated.timing(scaleAnim, {
              toValue: 1,
              duration: exhale * 1000,
              easing: Easing.linear,
              useNativeDriver: true,
            }),
            Animated.timing(opacityAnim, {
              toValue: 0.3,
              duration: exhale * 1000,
              useNativeDriver: true,
            }),
          ]).start(() => {
            if (!isMounted) return;

            // Fase 4: Sostén vacío
            setPhase('Sostén');
            startCountdown(hold2);
            const hold2Timeout = setTimeout(() => {
              if (!isMounted) return;
              
              if (currentRound < repeat) {
                currentRound++;
                setRound(currentRound);
                runAnimation();
              } else {
                setPhase('¡Bien hecho!');
                setSecondsLeft(null);
                setIsRunning(false);
                if (onFinish) onFinish();
              }
            }, hold2 * 1000);
            timeoutsRef.current.push(hold2Timeout);
          });
        }, hold * 1000);
        timeoutsRef.current.push(holdTimeout);
      });
    };

    const startTimeout = setTimeout(runAnimation, 300);
    timeoutsRef.current.push(startTimeout);

    return () => {
      isMounted = false;
      timeoutsRef.current.forEach(clearTimeout);
      timeoutsRef.current = [];
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      scaleAnim.stopAnimation();
      opacityAnim.stopAnimation();
    };
  }, [inhale, hold, exhale, hold2, repeat, isRunning, onFinish, opacityAnim, scaleAnim]);

  const handleStart = () => {
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    scaleAnim.stopAnimation();
    opacityAnim.stopAnimation();
    scaleAnim.setValue(1);
    opacityAnim.setValue(0.3);
    setRound(1);
    setPhase('Inhala...');
    setSecondsLeft(Math.max(1, Math.floor(inhale)));
    setIsRunning(true);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.touchArea} activeOpacity={0.9} disabled={isRunning} onPress={handleStart}>
        <Animated.View
          style={[
            styles.circle,
            {
              transform: [{ scale: scaleAnim }],
              opacity: opacityAnim,
            },
          ]}
        />
        <View style={styles.textContainer}>
          <Text style={styles.phaseText}>
            {isRunning ? (secondsLeft ? String(secondsLeft) : '') : phase === '¡Bien hecho!' ? '¡BIEN HECHO!' : 'COMENZAR'}
          </Text>
          {isRunning && <Text style={styles.phaseLabel}>{phase}</Text>}
        </View>
      </TouchableOpacity>
      {isRunning && <Text style={styles.roundText}>Ronda {round} de {repeat}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 250,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 30,
  },
  touchArea: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  circle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#A78BFA',
    shadowColor: '#A78BFA',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 20,
    elevation: 10,
  },
  textContainer: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  phaseText: {
    color: '#FFF',
    fontSize: 30,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  phaseLabel: {
    marginTop: 6,
    color: 'rgba(255,255,255,0.9)',
    fontSize: 16,
    fontWeight: '700',
  },
  roundText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 14,
    marginTop: 14,
  },
});
