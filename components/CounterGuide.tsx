import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface CounterGuideProps {
  target: number;
  onComplete?: () => void;
}

export default function CounterGuide({ target, onComplete }: CounterGuideProps) {
  const [count, setCount] = useState(0);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | undefined;
    if (isActive && count < target) {
      interval = setInterval(() => {
        setCount((prev) => prev + 1);
      }, 1000);
    } else if (count >= target) {
      setIsActive(false);
      if (onComplete) onComplete();
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, count]);

  return (
    <View style={styles.container}>
      <Text style={styles.targetText}>Cuenta hasta {target} despacio</Text>
      <View style={styles.counterCircle}>
        <Text style={styles.countNumber}>{count}</Text>
      </View>
      
      {!isActive && count === 0 && (
        <TouchableOpacity style={styles.startButton} onPress={() => setIsActive(true)}>
          <Ionicons name="play" size={24} color="#1A103D" />
          <Text style={styles.startButtonText}>Empezar conteo</Text>
        </TouchableOpacity>
      )}

      {isActive && (
        <TouchableOpacity style={styles.pauseButton} onPress={() => setIsActive(false)}>
          <Ionicons name="pause" size={24} color="#FFF" />
          <Text style={styles.pauseButtonText}>Pausar</Text>
        </TouchableOpacity>
      )}

      {count >= target && (
        <View style={styles.completeBadge}>
          <Ionicons name="checkmark-circle" size={24} color="#10B981" />
          <Text style={styles.completeText}>¡Logrado!</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginVertical: 30,
  },
  targetText: {
    color: '#C4B5FD',
    fontSize: 18,
    marginBottom: 20,
  },
  counterCircle: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(167, 139, 250, 0.1)',
    borderWidth: 4,
    borderColor: '#A78BFA',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
  },
  countNumber: {
    fontSize: 60,
    fontWeight: 'bold',
    color: '#E9D5FF',
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#A78BFA',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 30,
  },
  startButtonText: {
    color: '#1A103D',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  pauseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: '#FFF',
  },
  pauseButtonText: {
    color: '#FFF',
    fontSize: 16,
    marginLeft: 10,
  },
  completeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  completeText: {
    color: '#10B981',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
  },
});
