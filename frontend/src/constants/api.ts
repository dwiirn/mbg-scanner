import { Platform } from 'react-native';

// Silakan ubah IP ini ke alamat IP komputer lokal Anda jika menggunakan HP fisik untuk pengujian
// Emulator Android menggunakan '10.0.2.2' sebagai jembatan ke localhost PC
const LOCAL_IP = '10.0.2.2'; 
const DEV_PORT = '5000';

export const API_URL = Platform.select({
  android: `http://${LOCAL_IP}:${DEV_PORT}`,
  default: `http://localhost:${DEV_PORT}`,
});

export const ENDPOINTS = {
  SIGNUP: `${API_URL}/signup`,
  SIGNIN: `${API_URL}/signin`,
  PROFILE: `${API_URL}/profile`,
  UPLOAD_AVATAR: `${API_URL}/profile/avatar`,
  ANALYZE: `${API_URL}/analyze`,
  SCANS: `${API_URL}/scans`,
  UPDATE_PASSWORD: `${API_URL}/profile/password`,
};

export const getAvatarUrl = (pictureId: string | null | undefined) => {
  if (!pictureId) return null;
  if (pictureId.startsWith('http://') || pictureId.startsWith('https://')) {
    return pictureId;
  }
  return `${API_URL}/uploads/${pictureId}`;
};
