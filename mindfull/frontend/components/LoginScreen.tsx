import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { colors } from '../theme';
import { signIn, signUp } from '../utils/auth';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState('');

  const handleAuth = async () => {
    setLoading(true);
    setError(null);
    try {
      if (mode === 'login') {
        await signIn(email, password);
      } else {
        await signUp(email, password, name);
      }
    } catch (err: any) {
      setError(err?.message || 'Authentication failed');
    }
    setLoading(false);
  };

  return (
    <View style={styles.loginContainer}>
      <Text style={styles.headerTitle}>Mindfull</Text>
      <Text style={styles.loginSubtitle}>{mode === 'login' ? 'Sign In' : 'Sign Up'}</Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
      />

      <TextInput
        style={styles.input}
        placeholder="Password"
        autoCapitalize="none"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      {mode === 'signup' && (
        <TextInput
          style={styles.input}
          placeholder="Name"
          autoCapitalize="words"
          value={name}
          onChangeText={setName}
        />
      )}

      {error && <Text style={styles.errorText}>{error}</Text>}

      <TouchableOpacity style={styles.loginButton} onPress={handleAuth}>
        <Text style={styles.loginButtonText}>{loading ? 'Loading...' : mode === 'login' ? 'Sign In' : 'Sign Up'}</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => setMode(mode === 'login' ? 'signup' : 'login')}>
        <Text style={styles.switchText}>{mode === 'login' ? "Don't have an account? Sign Up" : 'Already have an account? Sign In'}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  loginContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#9db7ab',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  loginSubtitle: {
    fontSize: 22,
    marginBottom: 16,
    color: '#f1d797ff',
    fontWeight: 'bold',
  },
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#c49a2f',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    fontSize: 16,
    backgroundColor: '#ffffff',
    color: '#1e1e1e',
  },
  errorText: {
    color: '#d32f2f',
    marginBottom: 8,
  },
  switchText: {
    color: '#110c01ff',
    marginTop: 16,
    textDecorationLine: 'underline',
  },
  loginButton: {
    backgroundColor: '#c49a2f',
    padding: 10,
    borderRadius: 8,
    marginTop: 8,
    width: '100%',
    alignItems: 'center',
  },
  loginButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});
