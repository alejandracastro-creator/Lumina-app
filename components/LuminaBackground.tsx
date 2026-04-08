import React from 'react';
import { StyleSheet, View, ViewProps } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface LuminaBackgroundProps extends ViewProps {
  children: React.ReactNode;
}

export default function LuminaBackground({ children, style, ...props }: LuminaBackgroundProps) {
  return (
    <LinearGradient
      colors={['#1A103D', '#2D1B69', '#4C1D95']}
      style={[styles.container, style]}
      {...props}
    >
      {children}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
