import React, { useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useAuth } from './context';

export function LoginScreen() {
  const { login } = useAuth();
  const [email, setEmail] = useState('basicuser@gmail.com');
  const [password, setPassword] = useState('123Pa$$word!');
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async () => {
    if (pending) return;
    setPending(true);
    setError(null);
    const result = await login(email, password);
    if (result) {
      setError(result);
    }
    setPending(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>AntAPP Mobile User Login</Text>
      <Text style={styles.subtitle}>User client only</Text>

      <TextInput
        autoCapitalize="none"
        keyboardType="email-address"
        style={styles.input}
        value={email}
        onChangeText={setEmail}
        placeholder="Email"
      />
      <TextInput
        secureTextEntry
        style={styles.input}
        value={password}
        onChangeText={setPassword}
        placeholder="Password"
      />

      <Pressable style={styles.loginButton} onPress={onSubmit} disabled={pending}>
        {pending ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.loginButtonText}>Login</Text>
        )}
      </Pressable>

      {error && <Text style={styles.errorText}>{error}</Text>}

      <View style={styles.hintBox}>
        <Text style={styles.hintText}>Test user</Text>
        <Text style={styles.hintText}>basicuser@gmail.com</Text>
        <Text style={styles.hintText}>123Pa$$word!</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    justifyContent: 'center',
    gap: 10,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  loginButton: {
    backgroundColor: '#111',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  loginButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  errorText: {
    color: '#c62828',
    marginTop: 4,
  },
  hintBox: {
    marginTop: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#eee',
    padding: 10,
    gap: 4,
  },
  hintText: {
    color: '#666',
  },
});
