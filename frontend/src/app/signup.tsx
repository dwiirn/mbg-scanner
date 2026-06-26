import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import axios from "axios";
import { ENDPOINTS } from "../constants/api";

export default function SignUpScreen() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [kitchenUnit, setKitchenUnit] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [validationError, setValidationError] = useState("");
  const [registrationSuccess, setRegistrationSuccess] = useState(false);

  const handleRegister = async () => {
    setValidationError("");
    setRegistrationSuccess(false);

    // Inline validation
    if (!fullName || !email || !password || !kitchenUnit) {
      setValidationError("Silakan lengkapi semua kolom pendaftaran.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setValidationError("Format email tidak valid.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await axios.post(ENDPOINTS.SIGNUP, {
        fullName,
        email,
        password,
        kitchenUnit,
      });

      setRegistrationSuccess(true);

      // Clear form
      setFullName("");
      setEmail("");
      setPassword("");
      setKitchenUnit("");

      // Auto navigate to signin after 1.5 seconds
      setTimeout(() => {
        router.replace("/signin");
      }, 1500);
    } catch (error: any) {
      console.error("Error saat pendaftaran:", error);
      const errorMessage =
        error.response?.data?.error ||
        error.message ||
        "Tidak dapat terhubung ke server.";
      setValidationError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoginNavigation = () => {
    // Navigate back to Sign In
    router.replace("/signin");
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header Back Button */}
          <TouchableOpacity
            style={styles.backButton}
            onPress={() =>
              router.canGoBack() ? router.back() : router.replace("/welcome")
            }
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
            <View style={styles.passwordWrapper}>
              <TextInput
                style={[styles.input, styles.passwordInput]}
                placeholder="Masukkan kata sandi Anda"
                placeholderTextColor="#9CA3AF"
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoCorrect={false}
                value={password}
                onChangeText={setPassword}
              />
              <TouchableOpacity
                style={styles.eyeButton}
                onPress={() => setShowPassword((prev) => !prev)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Feather name={showPassword ? 'eye-off' : 'eye'} size={20} color="#9CA3AF" />
              </TouchableOpacity>
            </View>

            {/* Kitchen Unit Field */}
            <Text style={styles.label}>Dapur Unit Layanan</Text>
            <TextInput
              style={[styles.input, { marginBottom: 20 }]}
              placeholder="Masukkan dapur unit layanan Anda"
              placeholderTextColor="#9CA3AF"
              value={kitchenUnit}
              onChangeText={setKitchenUnit}
            />

            {/* Error Message Inline validation */}
            {validationError ? (
              <View style={styles.errorContainer}>
                <Feather name="alert-circle" size={16} color="#DC2626" />
                <Text style={styles.errorText}>{validationError}</Text>
              </View>
            ) : null}

            {/* Success Message Inline validation */}
            {registrationSuccess ? (
              <View style={styles.successContainer}>
                <Feather name="check-circle" size={16} color="#16A34A" />
                <Text style={styles.successText}>
                  Pendaftaran berhasil! Mengalihkan ke halaman login...
                </Text>
              </View>
            ) : null}

            {/* DAFTAR Button */}
            <TouchableOpacity
              style={[
                styles.registerButton,
                isLoading && styles.registerButtonDisabled,
              ]}
              activeOpacity={0.8}
              onPress={handleRegister}
              disabled={isLoading || registrationSuccess}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <Feather
                    name="log-in"
                    size={20}
                    color="#FFFFFF"
                    style={styles.buttonIcon}
                  />
                  <Text style={styles.registerButtonText}>DAFTAR</Text>
                </>
              )}
            </TouchableOpacity>

            {/* Sign In Link */}
            <TouchableOpacity
              style={styles.loginWrapper}
              onPress={handleLoginNavigation}
            >
              <Text style={styles.loginText}>
                Sudah punya akun? Masuk di sini.
              </Text>
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
    backgroundColor: "#FFFFFF",
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
    justifyContent: "center",
    alignItems: "flex-start",
    marginBottom: 20,
  },
  titleSection: {
    alignItems: "center",
    marginBottom: 24,
  },
  title: {
    color: "#1E60D5", // Matches the blue title
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 12,
  },
  subtitle: {
    color: "#4A607A", // Slate-blue subtitle color
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
    paddingHorizontal: 12,
  },
  formContainer: {
    width: "100%",
  },
  label: {
    color: "#0D0E10",
    fontSize: 15,
    fontWeight: "bold",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#F3F6FC", // Soft light gray-blue background
    width: "100%",
    height: 52,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 15,
    color: "#0D0E10",
    marginBottom: 16,
  },
  passwordWrapper: {
    position: "relative",
    justifyContent: "center",
    marginBottom: 16,
  },
  passwordInput: {
    marginBottom: 0,
    paddingRight: 48,
  },
  eyeButton: {
    position: "absolute",
    right: 12,
    top: 0,
    bottom: 0,
    justifyContent: "center",
    paddingHorizontal: 4,
  },
  registerButton: {
    backgroundColor: "#1E60D5", // High premium blue background
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    height: 54,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#4DA1FF", // Matches light blue outline from mockup
    shadowColor: "#1E60D5",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
    marginTop: 12,
    marginBottom: 24,
  },
  registerButtonDisabled: {
    backgroundColor: "#9CA3AF",
    borderColor: "#D1D5DB",
    shadowOpacity: 0,
    elevation: 0,
  },
  buttonIcon: {
    marginRight: 8,
  },
  registerButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
    letterSpacing: 0.5,
  },
  loginWrapper: {
    alignItems: "center",
  },
  loginText: {
    color: "#1E60D5",
    fontSize: 14,
    fontWeight: "600",
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FEF2F2",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#FCA5A5",
    marginBottom: 16,
  },
  errorText: {
    color: "#DC2626",
    fontSize: 14,
    fontWeight: "500",
    marginLeft: 8,
    flex: 1,
  },
  successContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0FDF4",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#86EFAC",
    marginBottom: 16,
  },
  successText: {
    color: "#16A34A",
    fontSize: 14,
    fontWeight: "500",
    marginLeft: 8,
    flex: 1,
  },
});
