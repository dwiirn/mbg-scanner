import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
  Image,
  ScrollView,
  Platform,
  StatusBar as RNStatusBar,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';

export default function DetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const handleBack = () => {
    router.replace('/home');
  };

  // Extract navigation parameters or use default mock values
  const title = (params.title as string) || 'Daging Ayam';
  const status = (params.status as string) || 'Segar';
  const time = (params.time as string) || '08:42';
  const date = (params.date as string) || '23 Jun 2026';
  const rgb = (params.rgb as string) || 'R: 220, G: 168, B: 155';
  const staff = (params.staff as string) || 'Dwi Prasetyo';
  const location = 'SPPG Kalisari 1';

  // Parse RGB values to render a dynamic color preview block
  const parseRgbColor = (rgbStr: string) => {
    const matches = rgbStr.match(/\d+/g);
    if (matches && matches.length >= 3) {
      return `rgb(${matches[0]}, ${matches[1]}, ${matches[2]})`;
    }
    return '#E2E8F0'; // Default gray fallback
  };

  // Parse individual RGB numbers for the color dot indicators
  const getRgbComponents = (rgbStr: string) => {
    const matches = rgbStr.match(/\d+/g);
    if (matches && matches.length >= 3) {
      return { r: matches[0], g: matches[1], b: matches[2] };
    }
    return { r: '0', g: '0', b: '0' };
  };

  const { r, g, b } = getRgbComponents(rgb);

  const dynamicColorSwatch = parseRgbColor(rgb);
  const isSegar = status === 'Segar';

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />

      {/* Top Header Bar */}
      <View style={styles.topHeader}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleBack}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Feather name="arrow-left" size={24} color="#0D0E10" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Detail Pemeriksaan</Text>
        <TouchableOpacity style={styles.shareButton} activeOpacity={0.7}>
          <Feather name="share-2" size={20} color="#0D0E10" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Main Detail Card */}
        <View style={[styles.detailCard, styles.shadowEffect]}>
          {/* Meat Image Header */}
          <View style={styles.imageContainer}>
            <Image
              source={require('@/assets/images/raw_chicken.jpg')}
              style={styles.meatImage}
              resizeMode="cover"
            />
          </View>

          {/* Card Body */}
          <View style={styles.cardBody}>
            {/* Status Section */}
            <View style={styles.statusSection}>
              <Text style={styles.statusLabel}>Kondisi Daging:</Text>
              <View
                style={[
                  styles.statusBadge,
                  { backgroundColor: isSegar ? '#E6FBF2' : '#FEE2E2' },
                ]}
              >
                <Text
                  style={[
                    styles.statusBadgeText,
                    { color: isSegar ? '#10B981' : '#EF4444' },
                  ]}
                >
                  {status.toUpperCase()}
                </Text>
              </View>
            </View>

            <View style={styles.divider} />

            {/* Parameter Data Table */}
            <View style={styles.infoTable}>
              {/* Row 1: Nama Objek */}
              <View style={styles.infoRow}>
                <View style={styles.rowLabelContainer}>
                  <MaterialCommunityIcons name="food-drumstick-outline" size={20} color="#64748B" />
                  <Text style={styles.rowLabel}>Nama Objek</Text>
                </View>
                <Text style={styles.rowValue}>{title}</Text>
              </View>

              {/* Row 2: Nilai RGB with R, G, B color dot badges */}
              <View style={styles.infoRow}>
                <View style={styles.rowLabelContainer}>
                  <MaterialCommunityIcons name="palette-outline" size={20} color="#64748B" />
                  <Text style={styles.rowLabel}>Nilai RGB</Text>
                </View>
                <View style={styles.rgbBadgeRow}>
                  {/* R Component */}
                  <View style={styles.rgbComponentBadge}>
                    <View style={[styles.rgbComponentDot, { backgroundColor: '#EF4444' }]} />
                    <Text style={styles.rgbComponentText}>R: {r}</Text>
                  </View>
                  {/* G Component */}
                  <View style={styles.rgbComponentBadge}>
                    <View style={[styles.rgbComponentDot, { backgroundColor: '#10B981' }]} />
                    <Text style={styles.rgbComponentText}>G: {g}</Text>
                  </View>
                  {/* B Component */}
                  <View style={styles.rgbComponentBadge}>
                    <View style={[styles.rgbComponentDot, { backgroundColor: '#3B82F6' }]} />
                    <Text style={styles.rgbComponentText}>B: {b}</Text>
                  </View>
                </View>
              </View>

              {/* Row 3: Jam/Waktu Pindai */}
              <View style={styles.infoRow}>
                <View style={styles.rowLabelContainer}>
                  <Feather name="clock" size={18} color="#64748B" />
                  <Text style={styles.rowLabel}>Waktu Pindai</Text>
                </View>
                <Text style={styles.rowValue}>
                  {time} · {date}
                </Text>
              </View>

              {/* Row 4: Nama Petugas */}
              <View style={styles.infoRow}>
                <View style={styles.rowLabelContainer}>
                  <Feather name="user" size={18} color="#64748B" />
                  <Text style={styles.rowLabel}>Petugas</Text>
                </View>
                <Text style={styles.rowValue}>{staff}</Text>
              </View>

              {/* Row 5: Lokasi Unit */}
              <View style={styles.infoRow}>
                <View style={styles.rowLabelContainer}>
                  <Feather name="map-pin" size={18} color="#64748B" />
                  <Text style={styles.rowLabel}>Lokasi</Text>
                </View>
                <Text style={styles.rowValue}>{location}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Back to Home Button */}
        <TouchableOpacity
          style={styles.homeActionButton}
          activeOpacity={0.8}
          onPress={() => router.back()}
        >
          <Text style={styles.homeActionButtonText}>Kembali</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC', // Slate 50 background
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
  shareButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  headerTitle: {
    color: '#0F172A',
    fontSize: 18,
    fontWeight: 'bold',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 40,
  },
  detailCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    overflow: 'hidden',
    marginBottom: 24,
  },
  imageContainer: {
    width: '100%',
    height: 240,
    backgroundColor: '#E2E8F0',
  },
  meatImage: {
    width: '100%',
    height: '100%',
  },
  cardBody: {
    padding: 24,
  },
  statusSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  statusLabel: {
    color: '#64748B', // Slate 500
    fontSize: 15,
    fontWeight: 'bold',
  },
  statusBadge: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 8,
  },
  statusBadgeText: {
    fontSize: 14,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 4,
    marginBottom: 20,
  },
  infoTable: {
    gap: 18,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rowLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  rowLabel: {
    color: '#64748B',
    fontSize: 14,
    fontWeight: '600',
  },
  rowValue: {
    color: '#0F172A',
    fontSize: 14,
    fontWeight: '700',
  },
  rgbValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  colorSwatch: {
    width: 14,
    height: 14,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  homeActionButton: {
    backgroundColor: '#1E60D5',
    width: '100%',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#1E60D5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 3,
  },
  homeActionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  shadowEffect: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 4,
  },
  rgbBadgeRow: {
    flexDirection: 'row',
    gap: 8,
  },
  rgbComponentBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9', // Soft background
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 6,
  },
  rgbComponentDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  rgbComponentText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#334155',
  },
});
