import React, { useState } from 'react';
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
} from 'react-native';
import { useRouter } from 'expo-router';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';

export default function ProfileScreen() {
  const router = useRouter();

  const handleBack = () => {
    router.replace('/home');
  };
  
  // Profile Detail States
  const [fullName, setFullName] = useState('Dwi Prasetyo');
  const [email, setEmail] = useState('admin@gmail.com');
  const [employeeId, setEmployeeId] = useState('EMP-2026-9982');
  const [unitDapur, setUnitDapur] = useState('SPPG Kalisari 1');
  const [joinDate, setJoinDate] = useState('15 Jan 2024');

  // Edit Mode States
  const [isEditing, setIsEditing] = useState(false);
  const [tempFullName, setTempFullName] = useState('Dwi Prasetyo');
  const [tempEmail, setTempEmail] = useState('admin@gmail.com');
  const [tempEmployeeId, setTempEmployeeId] = useState('EMP-2026-9982');
  const [tempUnitDapur, setTempUnitDapur] = useState('SPPG Kalisari 1');
  const [tempJoinDate, setTempJoinDate] = useState('15 Jan 2024');

  // Collapse state for Change Password Form
  const [showPasswordForm, setShowPasswordForm] = useState(false);
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
    setTempEmployeeId(employeeId);
    setTempUnitDapur(unitDapur);
    setTempJoinDate(joinDate);
    setIsEditing(true);
  };

  const handleSaveChanges = () => {
    if (!tempFullName || !tempEmail || !tempEmployeeId || !tempUnitDapur || !tempJoinDate) {
      Alert.alert('Perhatian', 'Semua kolom informasi profil harus diisi.');
      return;
    }
    setFullName(tempFullName);
    setEmail(tempEmail);
    setEmployeeId(tempEmployeeId);
    setUnitDapur(tempUnitDapur);
    setJoinDate(tempJoinDate);
    setIsEditing(false);
    Alert.alert('Sukses', 'Informasi profil Anda berhasil diperbarui!');
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
  };

  const handleSavePassword = () => {
    if (!oldPassword || !newPassword || !confirmPassword) {
      Alert.alert('Perhatian', 'Silakan lengkapi semua kolom ubah kata sandi.');
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert('Gagal', 'Konfirmasi kata sandi baru tidak cocok.');
      return;
    }
    
    // Simulate successful password update
    Alert.alert('Sukses', 'Kata sandi Anda berhasil diperbarui!', [
      {
        text: 'OK',
        onPress: () => {
          setOldPassword('');
          setNewPassword('');
          setConfirmPassword('');
          setShowPasswordForm(false);
        },
      },
    ]);
  };

  const handleLogout = () => {
    Alert.alert('Keluar Akun', 'Apakah Anda yakin ingin keluar dari akun?', [
      { text: 'Batal', style: 'cancel' },
      {
        text: 'Keluar',
        style: 'destructive',
        onPress: () => router.replace('/signin'),
      },
    ]);
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
          <View style={{ width: 40 }} /> {/* Spacer */}
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} bounces={true}>
          {/* Avatar and Summary Box */}
          <View style={styles.profileSummaryContainer}>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarText}>{getInitials(fullName)}</Text>
            </View>
            <Text style={styles.profileName}>{fullName}</Text>
            <Text style={styles.profileRole}>Petugas Pemeriksa (Quality Control)</Text>
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

                {/* ID Karyawan */}
                <Text style={styles.editInputLabel}>ID Karyawan</Text>
                <TextInput
                  style={styles.editInput}
                  value={tempEmployeeId}
                  onChangeText={setTempEmployeeId}
                  placeholder="Masukkan ID karyawan"
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

                {/* Tanggal Bergabung */}
                <Text style={styles.editInputLabel}>Tanggal Bergabung</Text>
                <TextInput
                  style={styles.editInput}
                  value={tempJoinDate}
                  onChangeText={setTempJoinDate}
                  placeholder="Masukkan tanggal bergabung"
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

                {/* Info Item 3: Employee ID */}
                <View style={styles.infoRow}>
                  <View style={styles.infoLabelContainer}>
                    <Feather name="credit-card" size={18} color="#64748B" />
                    <Text style={styles.infoLabel}>ID Karyawan</Text>
                  </View>
                  <Text style={styles.infoValue}>{employeeId}</Text>
                </View>

                <View style={styles.divider} />

                {/* Info Item 4: Kitchen/Location Unit */}
                <View style={styles.infoRow}>
                  <View style={styles.infoLabelContainer}>
                    <Feather name="map-pin" size={18} color="#64748B" />
                    <Text style={styles.infoLabel}>Unit Dapur</Text>
                  </View>
                  <Text style={styles.infoValue}>{unitDapur}</Text>
                </View>

                <View style={styles.divider} />

                {/* Info Item 5: Join Date */}
                <View style={styles.infoRow}>
                  <View style={styles.infoLabelContainer}>
                    <Feather name="calendar" size={18} color="#64748B" />
                    <Text style={styles.infoLabel}>Tanggal Bergabung</Text>
                  </View>
                  <Text style={styles.infoValue}>{joinDate}</Text>
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
});
