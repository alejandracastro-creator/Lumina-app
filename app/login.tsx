import React, { useEffect, useState } from 'react';
import { Alert, Platform, StyleSheet, Text, View, TouchableOpacity, TextInput } from 'react-native';
import LuminaBackground from '../components/LuminaBackground';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { createClient } from '@supabase/supabase-js';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import * as Notifications from 'expo-notifications';

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const autoOpenedRef = React.useRef(false);

  const googleClientId = (Constants as any)?.expoConfig?.extra?.googleWebClientId || process.env.GOOGLE_CLIENT_ID;

  useEffect(() => {
    if (Platform.OS === 'web') return;
    GoogleSignin.configure({
      webClientId: googleClientId,
      offlineAccess: false,
      scopes: ['profile', 'email'],
    });
  }, [googleClientId]);

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

  const openLogin = async () => {
    if (Platform.OS !== 'web') {
      try {
        if (Platform.OS === 'android') {
          await GoogleSignin.hasPlayServices();
        }
        const userInfo: any = await GoogleSignin.signIn();
        const idToken = userInfo?.data?.idToken || userInfo?.idToken;
        if (!idToken) {
          Alert.alert('Login', 'No se recibió el token de Google.');
          return;
        }

        const supabaseUrlRaw = (Constants as any)?.expoConfig?.extra?.supabaseUrl || process.env.SUPABASE_URL;
        const supabaseAnonKey = (Constants as any)?.expoConfig?.extra?.supabaseAnonKey || process.env.SUPABASE_ANON_KEY;
        const supabaseUrl = typeof supabaseUrlRaw === 'string' ? supabaseUrlRaw.trim() : supabaseUrlRaw;
        console.log('SUPABASE URL:', supabaseUrl);
        console.log('SUPABASE KEY:', supabaseAnonKey ? 'EXISTE' : 'ES NULL');
        if (!supabaseUrl || !supabaseAnonKey) {
          Alert.alert('Login', 'Faltan SUPABASE_URL o SUPABASE_ANON_KEY.');
          return;
        }
        if (typeof supabaseUrl !== 'string' || !/^https:\/\/.+/i.test(supabaseUrl)) {
          Alert.alert('Login', 'SUPABASE_URL inválida.');
          return;
        }

        const supabase = createClient(supabaseUrl, supabaseAnonKey, {
          auth: {
            storage: AsyncStorage as any,
            persistSession: true,
            autoRefreshToken: true,
            detectSessionInUrl: false,
          },
        });

        const { data, error } = await supabase.auth.signInWithIdToken({
          provider: 'google',
          token: idToken,
        });
        if (error) {
          Alert.alert('Login', error.message || 'Error al iniciar sesión con Supabase.');
          return;
        }

        try {
          const projectId =
            (Constants as any)?.expoConfig?.extra?.eas?.projectId ??
            (Constants as any)?.easConfig?.projectId;

          const perms = await Notifications.getPermissionsAsync();
          const permStatus = perms?.status === 'granted' ? 'granted' : (await Notifications.requestPermissionsAsync())?.status;
          if (permStatus === 'granted' && projectId && data?.user?.id) {
            const expoToken = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
            if (expoToken) {
              await supabase
                .from('phone_notifications')
                .upsert(
                  { user_id: data.user.id, expo_push_token: expoToken, platform: Platform.OS },
                  { onConflict: 'expo_push_token' }
                );
            }
          }
        } catch (err) {
          console.error('Error guardando push token:', err);
        }

        const userObj = {
          id: data?.user?.id ?? null,
          email: data?.user?.email ?? null,
          name: (data?.user as any)?.user_metadata?.full_name ?? (data?.user as any)?.user_metadata?.name ?? null,
          provider: 'google',
        };
        await AsyncStorage.setItem('lumina_native_user_v1', JSON.stringify(userObj));
        setTimeout(() => {
          router.replace('/(tabs)');
        }, 500);
      } catch {
        Alert.alert('Login', 'No se pudo completar el login con Google. Probá de nuevo.');
      }
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
    if (Platform.OS !== 'web') return;
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

          {Platform.OS === 'web' && (
            <>
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
            </>
          )}
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
