import React, { useState, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Image, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { AppContext } from '../context/AppContext';
import { AppTheme as theme } from '../theme';

export default function Login() {
  const { login, registerUser } = useContext(AppContext);
  const [email, setEmail] = useState('test');
  const [password, setPassword] = useState('test');
  const [isRegistering, setIsRegistering] = useState(false);

  const handleLogin = () => {
    if (!email || !password) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos.');
      return;
    }
    if (isRegistering) {
      const success = registerUser(email, password);
      if (success) {
        Alert.alert('Sucesso', 'Conta criada! Você já pode fazer login.');
        setIsRegistering(false);
      } else {
        Alert.alert('Erro', 'Este e-mail já está cadastrado.');
      }
    } else {
      const success = login(email, password);
      if (!success) {
        Alert.alert('Erro', 'E-mail ou senha inválidos.');
      }
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
      <ScrollView 
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps='handled'
      >
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.logoText}>L'OCCITANE</Text>
            <Text style={styles.subLogoText}>EN PROVENCE</Text>
          </View>
          
          <View style={styles.formContainer}>
            <Text style={styles.title}>{isRegistering ? 'Criar Conta' : 'Bem-vindo(a)'}</Text>
            <Text style={styles.subtitle}>{isRegistering ? 'Cadastre um novo usuário' : 'Faça login para continuar'}</Text>

            <TextInput
              style={styles.input}
              placeholder="E-mail"
              placeholderTextColor={theme.colors.textLight}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />
            
            <TextInput
              style={styles.input}
              placeholder="Senha"
              placeholderTextColor={theme.colors.textLight}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />

            <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
              <Text style={styles.loginButtonText}>{isRegistering ? 'Cadastrar' : 'Entrar'}</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={{marginTop: 20}} onPress={() => setIsRegistering(!isRegistering)}>
              <Text style={{textAlign: 'center', color: theme.colors.primary, fontWeight: 'bold'}}>
                {isRegistering ? 'Já tenho uma conta. Fazer Login' : 'Criar novo usuário'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.primary,
  },
  header: {
    flex: 0.4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    fontSize: 32,
    fontWeight: 'serif', // using serif to mimic the logo slightly
    color: theme.colors.secondary,
    letterSpacing: 2,
  },
  subLogoText: {
    fontSize: 14,
    color: theme.colors.secondary,
    letterSpacing: 4,
    marginTop: 5,
  },
  formContainer: {
    flex: 0.6,
    backgroundColor: theme.colors.background,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.primary,
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 14,
    color: theme.colors.textLight,
    marginBottom: 30,
  },
  input: {
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    fontSize: 16,
    color: theme.colors.text,
  },
  loginButton: {
    backgroundColor: theme.colors.secondary,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  loginButtonText: {
    color: theme.colors.primary,
    fontWeight: 'bold',
    fontSize: 18,
  },
  hint: {
    textAlign: 'center',
    marginTop: 20,
    color: theme.colors.textLight,
    fontSize: 12,
  }
});
