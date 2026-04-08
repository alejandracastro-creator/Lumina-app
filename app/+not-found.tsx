import { Link, Stack } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import LuminaBackground from '../components/LuminaBackground';

export default function NotFoundScreen() {
  return (
    <LuminaBackground style={styles.container}>
      <Stack.Screen options={{ title: 'Oops!' }} />
      <View style={styles.content}>
        <Text style={styles.title}>Esta pantalla no existe.</Text>
        <Link href="/" style={styles.link}>
          <Text style={styles.linkText}>Volver al inicio</Text>
        </Link>
      </View>
    </LuminaBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  content: {
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#E9D5FF',
  },
  link: {
    marginTop: 15,
    paddingVertical: 15,
  },
  linkText: {
    fontSize: 14,
    color: '#A78BFA',
  },
});
