import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';

export default function SignUpScreen() {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [kitchenUnit, setKitchenUnit] = useState('');

  const handleRegister = () => {
    if (!fullName || !email || !password || !kitchenUnit) {
      Alert.alert('Perhatian', 'Silakan lengkapi semua kolom pendaftaran.');
      return;
    }
    Alert.alert(
      'Sukses',
      `Akun berhasil didaftarkan!\nNama: ${fullName}\nEmail: ${email}\nDapur: ${kitchenUnit}`
    );
  };

  const handleLoginNavigation = () => {
    // Navigate back to Sign In
    router.replace('/signin');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header Back Button */}
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => (router.canGoBack() ? router.back() : router.replace('/welcome'))}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Feather name="arrow-left" size={24} color="#0D0E10" />
          </TouchableOpacity>

          {/* Main Title Section */}
          <View style={styles.titleSection}>
            <Text style={styles.title}>Sign Up</Text>
            <Text style={styles.subtitle}>
              Silakan buat akun Anda untuk memulai.
            </Text>
          </View>

          {/* Input Fields Container */}
          <View style={styles.formContainer}>
            {/* Full Name Field */}
            <Text style={styles.label}>Nama Lengkap</Text>
            <TextInput
              style={styles.input}
              placeholder="Masukkan nama lengkap Anda"
              placeholderTextColor="#9CA3AF"
              value={fullName}
              onChangeText={setFullName}
            />

            {/* Email Field */}
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="Masukkan email Anda"
              placeholderTextColor="#9CA3AF"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              value={email}
              onChangeText={setEmail}
            />

            {/* Password Field */}
            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              placeholder="Masukkan kata sandi Anda"
              placeholderTextColor="#9CA3AF"
              secureTextEntry={true}
              autoCapitalize="none"
              autoCorrect={false}
              value={password}
              onChangeText={setPassword}
            />

            {/* Kitchen Unit Field */}
            <Text style={styles.label}>Dapur Unit Layanan</Text>
            <TextInput
              style={styles.input}
              placeholder="Masukkan dapur unit layanan Anda"
              placeholderTextColor="#9CA3AF"
              value={kitchenUnit}
              onChangeText={setKitchenUnit}
            />

            {/* DAFTAR Button */}
            <TouchableOpacity
              style={styles.registerButton}
              activeOpacity={0.8}
              onPress={handleRegister}
            >
              <Feather name="log-in" size={20} color="#FFFFFF" style={styles.buttonIcon} />
              <Text style={styles.registerButtonText}>DAFTAR</Text>
            </TouchableOpacity>

            {/* Sign In Link */}
            <TouchableOpacity style={styles.loginWrapper} onPress={handleLoginNavigation}>
              <Text style={styles.loginText}>Sudah punya akun? Masuk di sini.</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 40,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  titleSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    color: '#1E60D5', // Matches the blue title
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  subtitle: {
    color: '#4A607A', // Slate-blue subtitle color
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 12,
  },
  formContainer: {
    width: '100%',
  },
  label: {
    color: '#0D0E10',
    fontSize: 15,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F3F6FC', // Soft light gray-blue background
    width: '100%',
    height: 52,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 15,
    color: '#0D0E10',
    marginBottom: 16,
  },
  registerButton: {
    backgroundColor: '#1E60D5', // High premium blue background
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: 54,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#4DA1FF', // Matches light blue outline from mockup
    shadowColor: '#1E60D5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
    marginTop: 12,
    marginBottom: 24,
  },
  buttonIcon: {
    marginRight: 8,
  },
  registerButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  loginWrapper: {
    alignItems: 'center',
  },
  loginText: {
    color: '#1E60D5',
    fontSize: 14,
    fontWeight: '600',
  },
});
