import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
  StatusBar as RNStatusBar,
  Animated,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';
import { ENDPOINTS, getAvatarUrl } from '../constants/api';
import { useAuthStore } from '../store/auth-store';
import { showAlert, showConfirm } from '../utils/alert';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, token, clearAuth } = useAuthStore();
  const [isFetching, setIsFetching] = useState(true);
  const pulseAnim = useRef(new Animated.Value(0.4)).current;

  const handleBack = () => {
    router.replace('/home');
  };
  
  // Profile Detail States
  const [fullName, setFullName] = useState(user?.fullName || 'Dwi Prasetyo');
  const [email, setEmail] = useState(user?.email || 'admin@gmail.com');
  const [unitDapur, setUnitDapur] = useState(user?.kitchenUnit || 'SPPG Kalisari 1');

  // Edit Mode States
  const [isEditing, setIsEditing] = useState(false);
  const [tempFullName, setTempFullName] = useState('');
  const [tempEmail, setTempEmail] = useState('');
  const [tempUnitDapur, setTempUnitDapur] = useState('');

  // Collapse state for Change Password Form
  const [showPasswordForm, setShowPasswordForm] = useState(false);

  useEffect(() => {
    const fetchUserProfile = async () => {
      // If we are using the demo token (local admin dev bypass), simulate a brief delay for skeleton demonstration, then show mock data
      if (token === 'demo-jwt-token-expired-24h' || !token) {
        setTimeout(() => {
          setIsFetching(false);
        }, 800);
        return;
      }

      try {
        const response = await axios.get(ENDPOINTS.PROFILE, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        
        // Sync local states
        setFullName(response.data.fullName);
        setEmail(response.data.email);
        setUnitDapur(response.data.kitchenUnit);

        // Sync Zustand store
        useAuthStore.setState({ user: response.data });
      } catch (error: any) {
        console.error('Error fetching profile:', error);
        
        // Check if 401 Unauthorized (expired token)
        if (error.response?.status === 401) {
          showAlert('Sesi Berakhir', 'Sesi login Anda telah kedaluwarsa. Silakan masuk kembali.', () => {
            clearAuth();
            router.replace('/signin');
          });
        } else {
          showAlert('Gagal Mengambil Data', 'Tidak dapat memuat profil terbaru dari server.');
        }
      } finally {
        setIsFetching(false);
      }
    };

    fetchUserProfile();
  }, [token]);

  useEffect(() => {
    let animation: Animated.CompositeAnimation | null = null;
    if (isFetching) {
      animation = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.0,
            duration: 850,
            useNativeDriver: Platform.OS !== 'web',
          }),
          Animated.timing(pulseAnim, {
            toValue: 0.4,
            duration: 850,
            useNativeDriver: Platform.OS !== 'web',
          }),
        ])
      );
      animation.start();
    }
    return () => {
      if (animation) {
        animation.stop();
      }
    };
  }, [isFetching]);

  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Get initials helper
  const getInitials = (name: string) => {
    const parts = name.trim().split(/\s+/);
    if (parts.length === 0) return '';
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0].charAt(0) + parts[1].charAt(0)).toUpperCase();
  };

  const handleStartEdit = () => {
    setTempFullName(fullName);
    setTempEmail(email);
    setTempUnitDapur(unitDapur);
    setIsEditing(true);
  };

  const handleChoosePicture = async () => {
    // Request permission first
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      showAlert('Izin Ditolak', 'Aplikasi memerlukan akses ke galeri foto Anda untuk mengubah foto profil.');
      return;
    }

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      });

      if (result.canceled || !result.assets || result.assets.length === 0) {
        return;
      }

      setIsFetching(true); // show skeleton while uploading
      const selectedImage = result.assets[0];
      const localUri = selectedImage.uri;
      const filename = localUri.split('/').pop() || 'avatar.png';
      
      // Determine content type
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : `image/png`;

      const formData = new FormData();
      
      if (Platform.OS === 'web') {
        const response = await fetch(localUri);
        const blob = await response.blob();
        formData.append('picture', blob, filename);
      } else {
        formData.append('picture', {
          uri: localUri,
          name: filename,
          type,
        } as any);
      }

      // Hit UPLOAD_AVATAR API
      const uploadResponse = await axios.post(ENDPOINTS.UPLOAD_AVATAR, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
      });

      console.log('Upload avatar response:', uploadResponse.data);
      const updatedUser = uploadResponse.data.user;

      // Sync Zustand store
      useAuthStore.setState({ user: updatedUser });
      
      showAlert('Sukses', 'Foto profil Anda berhasil diperbarui!');
    } catch (error: any) {
      console.error('Error uploading avatar:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Gagal mengunggah foto profil.';
      showAlert('Gagal Mengunggah', errorMessage);
    } finally {
      setIsFetching(false);
    }
  };

  const handleSaveChanges = async () => {
    if (!tempFullName || !tempEmail || !tempUnitDapur) {
      showAlert('Perhatian', 'Semua kolom informasi profil harus diisi.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(tempEmail.trim())) {
      showAlert('Error', 'Format email tidak valid.');
      return;
    }

    setIsFetching(true);
    try {
      const response = await axios.put(
        ENDPOINTS.PROFILE,
        {
          fullName: tempFullName,
          email: tempEmail,
          kitchenUnit: tempUnitDapur,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const updatedUser = response.data.user;
      console.log('Update profile response:', response.data);

      setFullName(updatedUser.fullName);
      setEmail(updatedUser.email);
      setUnitDapur(updatedUser.kitchenUnit);
      setIsEditing(false);

      // Sync updated info to the global persistent Zustand auth store
      useAuthStore.setState({ user: updatedUser });

      showAlert('Sukses', 'Informasi profil Anda berhasil diperbarui!');
    } catch (error: any) {
      console.error('Error updating profile:', error);
      const errorMessage =
        error.response?.data?.error || error.message || 'Gagal menyimpan perubahan ke server.';
      showAlert('Gagal Memperbarui', errorMessage);
    } finally {
      setIsFetching(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
  };

  const handleSavePassword = async () => {
    if (!oldPassword || !newPassword || !confirmPassword) {
      showAlert('Perhatian', 'Silakan lengkapi semua kolom ubah kata sandi.');
      return;
    }
    if (newPassword !== confirmPassword) {
      showAlert('Gagal', 'Konfirmasi kata sandi baru tidak cocok.');
      return;
    }
    
    if (token === 'demo-jwt-token-expired-24h' || !token) {
      showAlert('Sukses', 'Kata sandi Anda berhasil diperbarui! (Demo)', () => {
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setShowPasswordForm(false);
      });
      return;
    }

    setIsFetching(true);
    try {
      await axios.put(
        ENDPOINTS.UPDATE_PASSWORD,
        {
          oldPassword: oldPassword,
          newPassword: newPassword,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      showAlert('Sukses', 'Kata sandi Anda berhasil diperbarui!', () => {
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setShowPasswordForm(false);
      });
    } catch (error: any) {
      console.error('Error updating password:', error);
      const errorMessage =
        error.response?.data?.error || error.message || 'Gagal memperbarui kata sandi.';
      showAlert('Gagal Ubah Sandi', errorMessage);
    } finally {
      setIsFetching(false);
    }
  };

  const handleLogout = () => {
    showConfirm(
      'Keluar Akun',
      'Apakah Anda yakin ingin keluar dari akun?',
      () => {
        clearAuth();
        router.replace('/signin');
      }
    );
  };

  const renderSkeleton = () => {
    return (
      <Animated.View style={[styles.skeletonContainer, { opacity: pulseAnim }]}>
        {/* Avatar and Summary Skeleton */}
        <View style={styles.profileSummaryContainer}>
          <View style={[styles.avatarCircle, styles.skeletonBg]} />
          <View style={[styles.skeletonTextBar, { width: 140, height: 18, marginTop: 12, marginBottom: 8 }]} />
        </View>

        {/* Section 1 Skeleton */}
        <View style={[styles.skeletonTextBar, { width: 120, height: 16, marginBottom: 12 }]} />
        <View style={[styles.infoCard, styles.shadowEffect, { paddingVertical: 16 }]}>
          {[1, 2, 3].map((item, idx) => (
            <View key={item}>
              <View style={[styles.infoRow, { paddingVertical: 8 }]}>
                <View style={styles.infoLabelContainer}>
                  <View style={[styles.skeletonIcon, styles.skeletonBg]} />
                  <View style={[styles.skeletonTextBar, { width: 90, height: 12 }]} />
                </View>
                <View style={[styles.skeletonTextBar, { width: 120, height: 12, marginRight: 8 }]} />
              </View>
              {idx < 2 && <View style={styles.divider} />}
            </View>
          ))}
          <View style={[styles.skeletonButton, styles.skeletonBg, { marginTop: 16 }]} />
        </View>

        {/* Section 2 Skeleton */}
        <View style={[styles.skeletonTextBar, { width: 80, height: 16, marginTop: 24, marginBottom: 12 }]} />
        <View style={[styles.infoCard, styles.shadowEffect, { height: 60, justifyContent: 'center' }]}>
          <View style={[styles.infoRow, { paddingVertical: 8, alignItems: 'center' }]}>
            <View style={styles.infoLabelContainer}>
              <View style={[styles.skeletonIcon, styles.skeletonBg]} />
              <View style={[styles.skeletonTextBar, { width: 110, height: 12 }]} />
            </View>
            <Feather name="chevron-right" size={20} color="#E2E8F0" />
          </View>
        </View>

        {/* Logout button Skeleton */}
        <View style={[styles.skeletonBg, { height: 54, borderRadius: 12, marginTop: 28 }]} />
      </Animated.View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        {/* Top Header Bar */}
        <View style={styles.topHeader}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={handleBack}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Feather name="arrow-left" size={24} color="#0D0E10" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Profil Pengguna</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} bounces={true}>
          {isFetching ? (
            renderSkeleton()
          ) : (
            <>
              {/* Avatar and Summary Box */}
              <View style={styles.profileSummaryContainer}>
                <TouchableOpacity 
                  style={styles.avatarCircle} 
                  onPress={handleChoosePicture}
                  activeOpacity={0.8}
                >
                  {user?.pictureId ? (
                    <Image source={{ uri: getAvatarUrl(user.pictureId) }} style={styles.avatarImage} />
                  ) : (
                    <Text style={styles.avatarText}>{getInitials(fullName)}</Text>
                  )}
                  <View style={styles.avatarEditBadge}>
                    <Feather name="camera" size={12} color="#FFFFFF" />
                  </View>
                </TouchableOpacity>
                <Text style={styles.profileName}>{fullName}</Text>
              </View>

          {/* Section 1: Important Information Card */}
          <Text style={styles.sectionTitle}>Informasi Penting</Text>
          <View style={[styles.infoCard, styles.shadowEffect]}>
            {isEditing ? (
              <View style={styles.editFormContainer}>
                {/* Nama Lengkap */}
                <Text style={styles.editInputLabel}>Nama Lengkap</Text>
                <TextInput
                  style={styles.editInput}
                  value={tempFullName}
                  onChangeText={setTempFullName}
                  placeholder="Masukkan nama lengkap"
                  placeholderTextColor="#9CA3AF"
                />

                {/* Email */}
                <Text style={styles.editInputLabel}>Email</Text>
                <TextInput
                  style={styles.editInput}
                  value={tempEmail}
                  onChangeText={setTempEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  placeholder="Masukkan email"
                  placeholderTextColor="#9CA3AF"
                />

                {/* Unit Dapur */}
                <Text style={styles.editInputLabel}>Unit Dapur</Text>
                <TextInput
                  style={styles.editInput}
                  value={tempUnitDapur}
                  onChangeText={setTempUnitDapur}
                  placeholder="Masukkan unit dapur"
                  placeholderTextColor="#9CA3AF"
                />

                {/* Action Buttons Row */}
                <View style={styles.editButtonRow}>
                  <TouchableOpacity
                    style={styles.cancelEditButton}
                    onPress={handleCancelEdit}
                  >
                    <Text style={styles.cancelEditButtonText}>Batal</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.saveEditButton}
                    onPress={handleSaveChanges}
                  >
                    <Text style={styles.saveEditButtonText}>Simpan</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <>
                {/* Info Item 1: Full Name */}
                <View style={styles.infoRow}>
                  <View style={styles.infoLabelContainer}>
                    <Feather name="user" size={18} color="#64748B" />
                    <Text style={styles.infoLabel}>Nama Lengkap</Text>
                  </View>
                  <Text style={styles.infoValue}>{fullName}</Text>
                </View>

                <View style={styles.divider} />

                {/* Info Item 2: Email */}
                <View style={styles.infoRow}>
                  <View style={styles.infoLabelContainer}>
                    <Feather name="mail" size={18} color="#64748B" />
                    <Text style={styles.infoLabel}>Email</Text>
                  </View>
                  <Text style={styles.infoValue}>{email}</Text>
                </View>

                <View style={styles.divider} />

                {/* Info Item 3: Kitchen/Location Unit */}
                <View style={styles.infoRow}>
                  <View style={styles.infoLabelContainer}>
                    <Feather name="map-pin" size={18} color="#64748B" />
                    <Text style={styles.infoLabel}>Unit Dapur</Text>
                  </View>
                  <Text style={styles.infoValue}>{unitDapur}</Text>
                </View>

                {/* Edit Profil Button */}
                <TouchableOpacity
                  style={styles.editProfileTriggerButton}
                  onPress={handleStartEdit}
                  activeOpacity={0.7}
                >
                  <Feather name="edit-2" size={14} color="#1E60D5" style={{ marginRight: 6 }} />
                  <Text style={styles.editProfileTriggerButtonText}>Edit Profil</Text>
                </TouchableOpacity>
              </>
            )}
          </View>

          {/* Section 2: Security & Password */}
          <Text style={styles.sectionTitle}>Keamanan</Text>
          <View style={[styles.infoCard, styles.shadowEffect]}>
            {/* Toggle Change Password Form Button */}
            <TouchableOpacity
              style={styles.changePasswordHeader}
              onPress={() => setShowPasswordForm(!showPasswordForm)}
              activeOpacity={0.7}
            >
              <View style={styles.infoLabelContainer}>
                <Feather name="lock" size={18} color="#64748B" />
                <Text style={styles.infoLabel}>Ubah Kata Sandi</Text>
              </View>
              <Feather
                name={showPasswordForm ? 'chevron-down' : 'chevron-right'}
                size={20}
                color="#64748B"
              />
            </TouchableOpacity>

            {/* Collapsible Password Form */}
            {showPasswordForm && (
              <View style={styles.passwordForm}>
                <View style={styles.formDivider} />

                {/* Old Password Input */}
                <Text style={styles.inputLabel}>Kata Sandi Lama</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Masukkan kata sandi lama Anda"
                  placeholderTextColor="#9CA3AF"
                  secureTextEntry={true}
                  value={oldPassword}
                  onChangeText={setOldPassword}
                />

                {/* New Password Input */}
                <Text style={styles.inputLabel}>Kata Sandi Baru</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Masukkan kata sandi baru Anda"
                  placeholderTextColor="#9CA3AF"
                  secureTextEntry={true}
                  value={newPassword}
                  onChangeText={setNewPassword}
                />

                {/* Confirm Password Input */}
                <Text style={styles.inputLabel}>Konfirmasi Kata Sandi Baru</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Ulangi kata sandi baru Anda"
                  placeholderTextColor="#9CA3AF"
                  secureTextEntry={true}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                />

                {/* Form Buttons */}
                <View style={styles.formButtonRow}>
                  <TouchableOpacity
                    style={styles.cancelFormButton}
                    onPress={() => setShowPasswordForm(false)}
                  >
                    <Text style={styles.cancelFormButtonText}>Batal</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.saveFormButton}
                    onPress={handleSavePassword}
                  >
                    <Text style={styles.saveFormButtonText}>Perbarui</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>

          {/* Log Out Button */}
          <TouchableOpacity
            style={[styles.logoutButton, styles.shadowEffect]}
            activeOpacity={0.8}
            onPress={handleLogout}
          >
            <Feather name="log-out" size={20} color="#EF4444" style={styles.logoutIcon} />
            <Text style={styles.logoutButtonText}>Keluar dari Akun</Text>
          </TouchableOpacity>
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  topHeader: {
    height: Platform.OS === 'android' ? 60 + (RNStatusBar.currentHeight || 0) : 60,
    paddingTop: Platform.OS === 'android' ? RNStatusBar.currentHeight || 0 : 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  headerTitle: {
    color: '#0F172A',
    fontSize: 18,
    fontWeight: 'bold',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 28,
    paddingBottom: 40,
  },
  profileSummaryContainer: {
    alignItems: 'center',
    marginBottom: 28,
  },
  avatarCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#1E60D5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 4,
    borderColor: '#FFFFFF',
    shadowColor: '#1E60D5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
    position: 'relative', // so badge can overlay absolute
  },
  avatarImage: {
    width: 82,
    height: 82,
    borderRadius: 41,
  },
  avatarEditBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: '#1E60D5',
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: 'bold',
  },
  profileName: {
    color: '#0F172A',
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  profileRole: {
    color: '#64748B',
    fontSize: 13.5,
    fontWeight: '500',
  },
  sectionTitle: {
    color: '#1E293B',
    fontSize: 15,
    fontWeight: 'bold',
    marginBottom: 12,
    marginTop: 8,
  },
  infoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginBottom: 24,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
  },
  infoLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  infoLabel: {
    color: '#64748B',
    fontSize: 14,
    fontWeight: '600',
  },
  infoValue: {
    color: '#0F172A',
    fontSize: 14,
    fontWeight: '700',
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
  },
  changePasswordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
  },
  passwordForm: {
    paddingBottom: 16,
  },
  formDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginBottom: 16,
  },
  inputLabel: {
    color: '#334155',
    fontSize: 13,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    width: '100%',
    height: 48,
    borderRadius: 10,
    paddingHorizontal: 14,
    fontSize: 14,
    color: '#0F172A',
    marginBottom: 16,
  },
  formButtonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  cancelFormButton: {
    flex: 1,
    height: 44,
    backgroundColor: '#F1F5F9',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelFormButtonText: {
    color: '#64748B',
    fontSize: 14,
    fontWeight: 'bold',
  },
  saveFormButton: {
    flex: 2,
    height: 44,
    backgroundColor: '#1E60D5',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveFormButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  logoutButton: {
    backgroundColor: '#FFF1F2', // Soft red-tinted background
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#FFE4E6',
    marginTop: 8,
    marginBottom: 20,
  },
  logoutIcon: {
    marginRight: 8,
  },
  logoutButtonText: {
    color: '#EF4444', // Warning red
    fontSize: 15,
    fontWeight: 'bold',
  },
  shadowEffect: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  editFormContainer: {
    paddingVertical: 10,
  },
  editInputLabel: {
    color: '#334155',
    fontSize: 13,
    fontWeight: 'bold',
    marginBottom: 6,
    marginTop: 10,
  },
  editInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    height: 44,
    borderRadius: 10,
    paddingHorizontal: 14,
    fontSize: 14,
    color: '#0F172A',
    marginBottom: 8,
  },
  editButtonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  cancelEditButton: {
    flex: 1,
    height: 44,
    backgroundColor: '#F1F5F9',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelEditButtonText: {
    color: '#64748B',
    fontSize: 14,
    fontWeight: 'bold',
  },
  saveEditButton: {
    flex: 2,
    height: 44,
    backgroundColor: '#1E60D5',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveEditButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  editProfileTriggerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    marginTop: 12,
  },
  editProfileTriggerButtonText: {
    color: '#1E60D5',
    fontSize: 14,
    fontWeight: 'bold',
  },
  skeletonContainer: {
    paddingHorizontal: 0,
  },
  skeletonBg: {
    backgroundColor: '#E2E8F0',
  },
  skeletonTextBar: {
    backgroundColor: '#E2E8F0',
    borderRadius: 4,
  },
  skeletonIcon: {
    width: 20,
    height: 20,
    borderRadius: 4,
    backgroundColor: '#E2E8F0',
    marginRight: 8,
  },
  skeletonButton: {
    height: 38,
    borderRadius: 8,
    width: '100%',
  },
});
