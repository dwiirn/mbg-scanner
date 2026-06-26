import React from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View, Pressable } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useAlertStore } from '../../store/alert-store';

export default function CustomAlert() {
  const {
    visible,
    title,
    message,
    type,
    confirmText,
    cancelText,
    onConfirm,
    onCancel,
    hideAlert,
  } = useAlertStore();

  if (!visible) return null;

  const handleConfirm = () => {
    hideAlert();
    if (onConfirm) onConfirm();
  };

  const handleCancel = () => {
    hideAlert();
    if (onCancel) onCancel();
  };

  // Determine icon based on title or message keywords for premium context
  const getIcon = () => {
    const t = title.toLowerCase() + ' ' + message.toLowerCase();
    if (t.includes('sukses') || t.includes('berhasil')) {
      return { name: 'check-circle' as const, color: '#10B981', bg: '#ECFDF5' };
    }
    if (t.includes('gagal') || t.includes('error') || t.includes('salah') || t.includes('ditolak')) {
      return { name: 'alert-circle' as const, color: '#EF4444', bg: '#FEF2F2' };
    }
    if (t.includes('perhatian') || t.includes('peringatan') || t.includes('yakin') || t.includes('keluar')) {
      return { name: 'help-circle' as const, color: '#F59E0B', bg: '#FEF3C7' };
    }
    return { name: 'info' as const, color: '#3B82F6', bg: '#EFF6FF' };
  };

  const iconInfo = getIcon();

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      statusBarTranslucent
      onRequestClose={handleCancel}
    >
      <Pressable style={styles.overlay} onPress={type === 'confirm' ? undefined : handleConfirm}>
        <View style={styles.alertBox}>
          {/* Top Icon Banner */}
          <View style={[styles.iconWrapper, { backgroundColor: iconInfo.bg }]}>
            <Feather name={iconInfo.name} size={28} color={iconInfo.color} />
          </View>

          {/* Text Content */}
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>

          {/* Action Buttons */}
          <View style={styles.buttonContainer}>
            {type === 'confirm' && (
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={handleCancel}
                activeOpacity={0.8}
              >
                <Text style={styles.cancelButtonText}>{cancelText}</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={[
                styles.button,
                styles.confirmButton,
                { backgroundColor: iconInfo.color },
                type === 'alert' && { width: '100%' },
              ]}
              onPress={handleConfirm}
              activeOpacity={0.8}
            >
              <Text style={styles.confirmButtonText}>{confirmText}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)', // Glassmorphic overlay
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  alertBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    width: '100%',
    maxWidth: 380,
    alignItems: 'center',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 8,
  },
  iconWrapper: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0F172A',
    textAlign: 'center',
    marginBottom: 10,
  },
  message: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  buttonContainer: {
    flexDirection: 'row',
    width: '100%',
    gap: 12,
  },
  button: {
    flex: 1,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  confirmButton: {
    // Background color set dynamically
  },
  confirmButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  cancelButton: {
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  cancelButtonText: {
    color: '#475569',
    fontSize: 15,
    fontWeight: '600',
  },
});
