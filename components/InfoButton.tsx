import React, { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type InfoButtonProps = {
  title: string;
  text: string;
  top?: number;
  right?: number;
  variant?: 'icon' | 'pill';
  label?: string;
  size?: 'sm' | 'md';
};

export default function InfoButton({
  title,
  text,
  top = 60,
  right = 20,
  variant = 'icon',
  label,
  size = 'md',
}: InfoButtonProps) {
  const [open, setOpen] = useState(false);
  const isSmall = variant === 'icon' && size === 'sm';

  return (
    <>
      <TouchableOpacity
        style={[
          variant === 'pill' ? styles.pillButton : styles.iconButton,
          isSmall && styles.iconButtonSmall,
          { top, right },
        ]}
        onPress={() => setOpen(true)}
        accessibilityRole="button"
        accessibilityLabel="Info"
      >
        {variant === 'pill' ? (
          <Text style={styles.pillText}>{label || 'Info'}</Text>
        ) : (
          <Ionicons name="information-circle" size={isSmall ? 22 : 26} color="#FFFFFF" />
        )}
      </TouchableOpacity>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.overlay} onPress={() => setOpen(false)}>
          <Pressable style={styles.card} onPress={() => undefined}>
            <View style={styles.header}>
              <Text style={styles.title}>{title}</Text>
              <TouchableOpacity onPress={() => setOpen(false)} style={styles.close}>
                <Ionicons name="close" size={22} color="#E9D5FF" />
              </TouchableOpacity>
            </View>
            <Text style={styles.body}>{text}</Text>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  iconButton: {
    position: 'absolute',
    zIndex: 20,
    width: 40,
    height: 40,
    borderRadius: 999,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(219, 39, 119, 0.78)',
    borderWidth: 1,
    borderColor: 'rgba(251, 207, 232, 0.65)',
  },
  iconButtonSmall: {
    width: 32,
    height: 32,
  },
  pillButton: {
    position: 'absolute',
    zIndex: 20,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 999,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(219, 39, 119, 0.78)',
    borderWidth: 1,
    borderColor: 'rgba(251, 207, 232, 0.65)',
  },
  pillText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 22,
  },
  card: {
    width: '100%',
    maxWidth: 520,
    backgroundColor: 'rgba(26, 16, 61, 0.95)',
    borderRadius: 22,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(167, 139, 250, 0.35)',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 10,
  },
  title: {
    flex: 1,
    color: '#E9D5FF',
    fontSize: 18,
    fontWeight: '900',
  },
  close: {
    width: 34,
    height: 34,
    borderRadius: 999,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  body: {
    color: 'rgba(233, 213, 255, 0.88)',
    fontSize: 14,
    lineHeight: 20,
  },
});
