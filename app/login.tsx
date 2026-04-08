import React, { useEffect, useState } from 'react';
import { Alert, Platform, StyleSheet, Text, View, TouchableOpacity, TextInput } from 'react-native';
import LuminaBackground from '../components/LuminaBackground';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const autoOpenedRef = React.useRef(false);

  useEffect(() => {
    if (Platform.OS !== 'web') return;
    const identity = (globalThis as any)?.netlifyIdentity || (window as any)?.netlifyIdentity;
    const user = identity?.currentUser?.();
    if (user) router.replace('/(tabs)');
  }, [router]);

  useEffect(() => {
    if (Platform.OS !== 'web') return;
    if (autoOpenedRef.current) return;

    const identity = (globalThis as any)?.netlifyIdentity || (window as any)?.netlifyIdentity;
    const user = identity?.currentUser?.();
    if (user) return;

    if (identity) {
      autoOpenedRef.current = true;
      setTimeout(() => {
        try {
          identity.open('login');
        } catch {}
      }, 50);
      return;
    }

    const poll = setInterval(() => {
      const id2 = (globalThis as any)?.netlifyIdentity || (window as any)?.netlifyIdentity;
      if (!id2) return;
      clearInterval(poll);
      const user2 = id2?.currentUser?.();
      if (user2) return;
      autoOpenedRef.current = true;
      setTimeout(() => {
        try {
          id2.open('login');
        } catch {}
      }, 50);
    }, 80);

    return () => clearInterval(poll);
  }, []);

  const openLogin = () => {
    if (Platform.OS !== 'web') {
      router.replace('/(tabs)');
      return;
    }
    const identity = (globalThis as any)?.netlifyIdentity || (window as any)?.netlifyIdentity;
    if (!identity) {
      Alert.alert('Login', 'Netlify Identity no está disponible todavía. Probá recargar la página.');
      return;
    }
    identity.open('login');
  };

  const loginWithEmail = async () => {
    if (Platform.OS !== 'web') {
      router.replace('/(tabs)');
      return;
    }
    const identity = (globalThis as any)?.netlifyIdentity || (window as any)?.netlifyIdentity;
    if (!identity) {
      Alert.alert('Login', 'Netlify Identity no está disponible todavía. Probá recargar la página.');
      return;
    }
    try {
      await identity.login(email, password, true);
    } catch {
      identity.open('login');
    }
  };

  return (
    <LuminaBackground style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.welcomeText}>Bienvenido a</Text>
          <Text style={styles.title}>LUMINA</Text>
        </View>

        <View style={styles.form}>
          <TouchableOpacity style={styles.googleButton} onPress={openLogin}>
            <Ionicons name="logo-google" size={24} color="#FFF" />
            <Text style={styles.googleButtonText}>Continuar con Google</Text>
          </TouchableOpacity>

          <View style={styles.dividerContainer}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>o</Text>
            <View style={styles.dividerLine} />
          </View>

          <View style={styles.inputContainer}>
            <Ionicons name="mail-outline" size={20} color="#C4B5FD" style={styles.inputIcon} />
            <TextInput 
              style={styles.input} 
              placeholder="Email" 
              placeholderTextColor="rgba(196, 181, 253, 0.5)"
              autoCapitalize="none"
              autoComplete="email"
              textContentType="emailAddress"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
            />
          </View>

          <View style={styles.inputContainer}>
            <Ionicons name="lock-closed-outline" size={20} color="#C4B5FD" style={styles.inputIcon} />
            <TextInput 
              style={styles.input} 
              placeholder="Contraseña" 
              placeholderTextColor="rgba(196, 181, 253, 0.5)"
              secureTextEntry
              autoComplete="current-password"
              textContentType="password"
              value={password}
              onChangeText={setPassword}
            />
          </View>

          <TouchableOpacity style={styles.loginButton} onPress={loginWithEmail}>
            <Text style={styles.loginButtonText}>Ingresar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </LuminaBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 30,
  },
  header: {
    alignItems: 'center',
    marginBottom: 60,
  },
  welcomeText: {
    fontSize: 24,
    color: '#C4B5FD',
    fontWeight: '300',
    letterSpacing: 2,
  },
  title: {
    fontSize: 60,
    fontWeight: 'bold',
    color: '#E9D5FF',
    letterSpacing: 10,
    marginTop: 10,
  },
  form: {
    width: '100%',
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4285F4',
    paddingVertical: 15,
    borderRadius: 15,
    marginBottom: 25,
    elevation: 4,
  },
  googleButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 15,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 25,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(196, 181, 253, 0.3)',
  },
  dividerText: {
    color: '#C4B5FD',
    marginHorizontal: 15,
    fontSize: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 15,
    marginBottom: 15,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: 'rgba(167, 139, 250, 0.2)',
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    paddingVertical: 15,
    color: '#FFF',
    fontSize: 16,
  },
  loginButton: {
    backgroundColor: '#1E1B4B',
    paddingVertical: 18,
    borderRadius: 15,
    alignItems: 'center',
    marginTop: 10,
    borderWidth: 2,
    borderColor: '#4C1D95',
  },
  loginButtonText: {
    color: '#FDE68A',
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
});
