import React, { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type InfoButtonProps = {
  title: string;
  text: string;
  top?: number;
  right?: number;
};

export default function InfoButton({ title, text, top = 60, right = 20 }: InfoButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <TouchableOpacity
        style={[styles.iconButton, { top, right }]}
        onPress={() => setOpen(true)}
        accessibilityRole="button"
        accessibilityLabel="Info"
      >
        <Ionicons name="information-circle" size={26} color="#C4B5FD" />
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
    backgroundColor: 'rgba(26, 16, 61, 0.45)',
    borderWidth: 1,
    borderColor: 'rgba(167, 139, 250, 0.25)',
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

