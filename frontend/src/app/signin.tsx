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
  Modal,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';

export default function SignInScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Forgot Password Modal States
  const [isForgotModalVisible, setIsForgotModalVisible] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [isSent, setIsSent] = useState(false);

  const handleLogin = () => {
    if (!email || !password) {
      Alert.alert('Perhatian', 'Silakan isi email dan kata sandi Anda.');
      return;
    }
    if (email.trim() === 'admin@gmail.com' && password === 'admin123') {
      router.replace('/home');
    } else {
      Alert.alert('Gagal Masuk', 'Email atau kata sandi Anda salah.');
    }
  };

  const handleForgotPassword = () => {
    setForgotEmail(email); // Pre-fill email input with what's typed in the login form
    setIsSent(false);
    setIsForgotModalVisible(true);
  };

  const handleRegisterNavigation = () => {
    router.push('/signup');
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
            <Text style={styles.title}>Sign In</Text>
            <Text style={styles.subtitle}>
              Silakan masuk menggunakan akun yang telah terdaftar.
            </Text>
          </View>

          {/* Input Fields Container */}
          <View style={styles.formContainer}>
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

            {/* Forgot Password Link */}
            <TouchableOpacity style={styles.forgotPasswordWrapper} onPress={handleForgotPassword}>
              <Text style={styles.forgotPasswordText}>Lupa kata sandi?</Text>
            </TouchableOpacity>

            {/* MASUK Button */}
            <TouchableOpacity
              style={styles.loginButton}
              activeOpacity={0.8}
              onPress={handleLogin}
            >
              <Feather name="log-in" size={20} color="#FFFFFF" style={styles.buttonIcon} />
              <Text style={styles.loginButtonText}>MASUK</Text>
            </TouchableOpacity>

            {/* Sign Up Link */}
            <TouchableOpacity style={styles.registerWrapper} onPress={handleRegisterNavigation}>
              <Text style={styles.registerText}>Belum punya akun? Daftar di sini.</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Forgot Password Modal */}
      <Modal
        visible={isForgotModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsForgotModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, styles.shadowEffect]}>
            {/* Close Button */}
            <TouchableOpacity 
              style={styles.modalCloseButton}
              onPress={() => setIsForgotModalVisible(false)}
            >
              <Feather name="x" size={20} color="#64748B" />
            </TouchableOpacity>

            {!isSent ? (
              <>
                <View style={styles.modalIconBg}>
                  <Feather name="key" size={28} color="#1E60D5" />
                </View>
                <Text style={styles.modalTitle}>Lupa Kata Sandi</Text>
                <Text style={styles.modalSubtitle}>
                  Masukkan alamat email Anda untuk menerima tautan pemulihan kata sandi.
                </Text>

                <TextInput
                  style={styles.modalInput}
                  placeholder="name@example.com"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  value={forgotEmail}
                  onChangeText={setForgotEmail}
                />

                <TouchableOpacity
                  style={styles.modalPrimaryButton}
                  activeOpacity={0.8}
                  onPress={() => {
                    if (!forgotEmail.trim()) {
                      Alert.alert('Perhatian', 'Silakan masukkan email Anda.');
                      return;
                    }
                    // Validate basic email format
                    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                    if (!emailRegex.test(forgotEmail.trim())) {
                      Alert.alert('Error', 'Format email tidak valid.');
                      return;
                    }
                    setIsSent(true);
                  }}
                >
                  <Text style={styles.modalPrimaryButtonText}>Kirim Tautan Pemulihan</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <View style={[styles.modalIconBg, { backgroundColor: '#E6FBF2' }]}>
                  <Feather name="mail" size={28} color="#10B981" />
                </View>
                <Text style={styles.modalTitle}>Email Terkirim!</Text>
                <Text style={styles.modalSubtitle}>
                  Tautan pemulihan kata sandi telah dikirim ke:
                </Text>
                <Text style={styles.modalEmailHighlight}>{forgotEmail}</Text>
                <Text style={styles.modalDetailText}>
                  Silakan periksa kotak masuk atau folder spam email Anda.
                </Text>

                <TouchableOpacity
                  style={[styles.modalPrimaryButton, { backgroundColor: '#10B981' }]}
                  activeOpacity={0.8}
                  onPress={() => setIsForgotModalVisible(false)}
                >
                  <Text style={styles.modalPrimaryButtonText}>Kembali ke Masuk</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
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
    color: '#1E60D5', // Matches the exact blue title
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
  forgotPasswordWrapper: {
    alignSelf: 'flex-end',
    marginBottom: 24,
  },
  forgotPasswordText: {
    color: '#1E60D5',
    fontSize: 14,
    fontWeight: '600',
  },
  loginButton: {
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
    marginBottom: 24,
  },
  buttonIcon: {
    marginRight: 8,
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  registerWrapper: {
    alignItems: 'center',
  },
  registerText: {
    color: '#1E60D5',
    fontSize: 14,
    fontWeight: '600',
  },
  shadowEffect: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.45)', // Soft dark backdrop
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    width: '100%',
    maxWidth: 380,
    padding: 24,
    alignItems: 'center',
    position: 'relative',
  },
  modalCloseButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalIconBg: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#EBF3FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0F172A',
    marginBottom: 8,
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 20,
    paddingHorizontal: 8,
  },
  modalInput: {
    backgroundColor: '#F3F6FC',
    width: '100%',
    height: 52,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 15,
    color: '#0D0E10',
    marginBottom: 16,
  },
  modalPrimaryButton: {
    backgroundColor: '#1E60D5',
    width: '100%',
    height: 52,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  modalPrimaryButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: 'bold',
  },
  modalEmailHighlight: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1E60D5',
    marginVertical: 4,
    textAlign: 'center',
  },
  modalDetailText: {
    fontSize: 13,
    color: '#94A3B8',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 16,
    lineHeight: 18,
  },
});
