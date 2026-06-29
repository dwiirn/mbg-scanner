import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Platform,
  Image,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { HistoryItem, historyData } from '@/constants/history-store';
import { useAuthStore } from '../store/auth-store';
import { getAvatarUrl, getUploadUrl, ENDPOINTS } from '../constants/api';
import axios from 'axios';

type ActiveTab = 'beranda' | 'riwayat';

export default function HomeScreen() {
  const router = useRouter();
  const { user, token } = useAuthStore();

  const firstName = user?.fullName ? user.fullName.split(' ')[0] : 'User';
  const kitchenUnit = user?.kitchenUnit || 'SPPG Kalisari 1';
  
  const getInitials = (name: string) => {
    const parts = name.trim().split(/\s+/);
    if (parts.length === 0) return 'US';
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0].charAt(0) + parts[1].charAt(0)).toUpperCase();
  };
  const initials = user?.fullName ? getInitials(user.fullName) : 'US';

  // Get current date in Indonesian format (e.g. Kamis, 25 Juni 2026)
  const getFormattedCurrentDate = () => {
    const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const months = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];
    
    const now = new Date();
    const dayName = days[now.getDay()];
    const dateNum = now.getDate();
    const monthName = months[now.getMonth()];
    const year = now.getFullYear();
    
    return `${dayName}, ${dateNum} ${monthName} ${year}`;
  };

  // Get dynamic greeting based on system hour
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 11) return 'Selamat pagi';
    if (hour >= 11 && hour < 15) return 'Selamat siang';
    if (hour >= 15 && hour < 18) return 'Selamat sore';
    return 'Selamat malam';
  };
  const [activeTab, setActiveTab] = useState<ActiveTab>('beranda');
  const [filterMode, setFilterMode] = useState<'Semua' | 'Segar' | 'Tidak Segar'>('Semua');
  const [historyItems, setHistoryItems] = useState<HistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const formatHistoryItems = (scans: any[]): HistoryItem[] => {
    return scans.map((scan) => {
      const d = new Date(scan.createdAt);
      const pad = (n: number) => n.toString().padStart(2, '0');
      const time = `${pad(d.getHours())}:${pad(d.getMinutes())}`;
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
      const date = `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;

      return {
        id: scan.id.toString(),
        title: scan.title,
        time,
        date,
        status: scan.status as 'Segar' | 'Tidak Segar',
        rgb: `R: ${scan.r}, G: ${scan.g}, B: ${scan.b}`,
        staff: scan.User?.fullName || user?.fullName || 'Petugas',
        image: scan.image || undefined,
      };
    });
  };

  const PAGE_SIZE = 10;

  const fetchScansHistory = async () => {
    if (token === 'demo-jwt-token-expired-24h' || !token) {
      setHistoryItems(historyData);
      setHasMore(false); // data demo tidak berpaginasi
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const response = await axios.get(ENDPOINTS.SCANS, {
        headers: { Authorization: `Bearer ${token}` },
        params: { page: 1, limit: PAGE_SIZE },
      });
      const formatted = formatHistoryItems(response.data);
      setHistoryItems(formatted);
      setPage(1);
      setHasMore(response.data.length === PAGE_SIZE);
    } catch (error) {
      console.error('Error fetching scan history:', error);
      setHistoryItems(historyData);
      setHasMore(false);
    } finally {
      setIsLoading(false);
    }
  };

  const loadMoreScans = async () => {
    // Hentikan jika sedang memuat, tidak ada lagi, atau mode demo
    if (isLoadingMore || !hasMore || token === 'demo-jwt-token-expired-24h' || !token) {
      return;
    }

    try {
      setIsLoadingMore(true);
      const nextPage = page + 1;
      const response = await axios.get(ENDPOINTS.SCANS, {
        headers: { Authorization: `Bearer ${token}` },
        params: { page: nextPage, limit: PAGE_SIZE },
      });
      const formatted = formatHistoryItems(response.data);
      setHistoryItems((prev) => [...prev, ...formatted]);
      setPage(nextPage);
      setHasMore(response.data.length === PAGE_SIZE);
    } catch (error) {
      console.error('Error loading more scans:', error);
    } finally {
      setIsLoadingMore(false);
    }
  };

  // Deteksi scroll mendekati bawah untuk memicu fetch halaman berikutnya
  const handleScroll = ({ nativeEvent }: any) => {
    if (activeTab !== 'riwayat') return;
    const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
    const paddingToBottom = 120;
    const closeToBottom =
      layoutMeasurement.height + contentOffset.y >= contentSize.height - paddingToBottom;
    if (closeToBottom) {
      loadMoreScans();
    }
  };

  useEffect(() => {
    fetchScansHistory();
  }, [token]);
  
  // Date Range Picker States
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [isCalendarExpanded, setIsCalendarExpanded] = useState(false);

  // Custom Inline Calendar Picker States
  const [calendarMonth, setCalendarMonth] = useState(new Date(2026, 5, 1)); // Default to June 2026

  const months = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];
  
  const monthsShort = [
    'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
    'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'
  ];

  // Helper to parse date string from history store ("23 Jun 2026" -> Date object)
  const parseHistoryDateStr = (dateStr: string): Date | null => {
    const parts = dateStr.split(' ');
    if (parts.length < 3) return null;
    
    const day = parseInt(parts[0], 10);
    const monthShort = parts[1];
    const year = parseInt(parts[2], 10);
    
    const monthIndex = monthsShort.indexOf(monthShort);
    if (monthIndex === -1) return null;
    
    return new Date(year, monthIndex, day);
  };

  // Helper to format Date range text for display
  const getSelectedRangeText = () => {
    const formatDate = (d: Date) => {
      return `${d.getDate()} ${monthsShort[d.getMonth()]} ${d.getFullYear()}`;
    };

    if (!startDate && !endDate) return 'Semua Tanggal';
    if (startDate && !endDate) return formatDate(startDate);
    if (startDate && endDate) return `${formatDate(startDate)} - ${formatDate(endDate)}`;
    return 'Semua Tanggal';
  };

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  const handleDaySelect = (day: number) => {
    const year = calendarMonth.getFullYear();
    const month = calendarMonth.getMonth();
    const clickedDate = new Date(year, month, day);

    if (!startDate || (startDate && endDate)) {
      setStartDate(clickedDate);
      setEndDate(null);
    } else {
      if (clickedDate.getTime() < startDate.getTime()) {
        setStartDate(clickedDate);
      } else if (clickedDate.getTime() === startDate.getTime()) {
        setStartDate(null);
        setEndDate(null);
      } else {
        setEndDate(clickedDate);
        setIsCalendarExpanded(false); // Collapse calendar on range complete
      }
    }
  };

  const handlePrevMonth = () => {
    setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 1));
  };

  const renderCalendarDays = () => {
    const year = calendarMonth.getFullYear();
    const month = calendarMonth.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);
    
    const totalSlots = [];
    
    // Add empty slots for days of week before first day of month
    for (let i = 0; i < firstDay; i++) {
      totalSlots.push(<View key={`empty-${i}`} style={styles.calendarDayCellEmpty} />);
    }
    
    // Add calendar days
    for (let day = 1; day <= daysInMonth; day++) {
      const dayDate = new Date(year, month, day);
      const dayTime = dayDate.getTime();
      
      const isStart = startDate && dayTime === startDate.getTime();
      const isEnd = endDate && dayTime === endDate.getTime();
      const isWithinRange = startDate && endDate && dayTime > startDate.getTime() && dayTime < endDate.getTime();
      
      const isSelected = isStart || isEnd;
      const formattedDate = `${day} ${monthsShort[month]} ${year}`;
      const hasHistory = historyItems.some((item) => item.date === formattedDate);
      
      totalSlots.push(
        <TouchableOpacity
          key={`day-${day}`}
          style={styles.calendarDayCell}
          onPress={() => handleDaySelect(day)}
          activeOpacity={0.8}
        >
          <View
            style={[
              styles.calendarDayInner,
              isSelected && styles.calendarDayCellActive,
              isWithinRange && styles.calendarDayCellInRange,
            ]}
          >
            <Text
              style={[
                styles.calendarDayText,
                isSelected && styles.calendarDayTextActive,
                isWithinRange && styles.calendarDayTextInRange,
              ]}
            >
              {day}
            </Text>
            {hasHistory && (
              <View
                style={[
                  styles.calendarDayDot,
                  isSelected && { backgroundColor: '#FFFFFF' },
                  isWithinRange && { backgroundColor: '#1E60D5' },
                ]}
              />
            )}
          </View>
        </TouchableOpacity>
      );
    }
    
    return totalSlots;
  };

  const handleStartExam = () => {
    router.push('/camera');
  };

  const handleProfilePress = () => {
    router.push('/profile');
  };

  const handleItemPress = (item: HistoryItem) => {
    // Generate mock RGB values and staff name depending on quality
    const mockRgb = item.status === 'Segar' 
      ? 'R: 214, G: 160, B: 142' 
      : 'R: 180, G: 130, B: 120';
    const mockStaff = user?.fullName || 'Dwi Prasetyo';

    router.push({
      pathname: '/detail',
      params: {
        id: item.id,
        title: item.title,
        time: item.time,
        date: item.date,
        status: item.status,
        rgb: mockRgb,
        staff: mockStaff,
        image: item.image,
      },
    });
  };

  return (
    <SafeAreaView 
      style={[
        styles.container, 
        activeTab === 'beranda' ? { backgroundColor: '#1E60D5' } : { backgroundColor: '#FFFFFF' }
      ]}
    >
      <StatusBar
        barStyle={activeTab === 'beranda' ? 'light-content' : 'dark-content'}
        backgroundColor={activeTab === 'beranda' ? '#1E60D5' : '#FFFFFF'}
      />

      {/* Blue Header Section (Only for Beranda) */}
      {activeTab === 'beranda' && (
        <View style={styles.headerContainer}>
          <View style={styles.headerTopRow}>
            <View>
              <Text style={styles.greetingText}>{getGreeting()}, {firstName}!</Text>
              <Text style={styles.dateText}>{getFormattedCurrentDate()}</Text>
              <Text style={styles.locationText}>{kitchenUnit}</Text>
            </View>

            {/* User Avatar */}
            <TouchableOpacity style={styles.avatarButton} onPress={handleProfilePress}>
              {user?.pictureId ? (
                <Image source={{ uri: getAvatarUrl(user.pictureId) || undefined }} style={styles.avatarImage} />
              ) : (
                <Text style={styles.avatarText}>{initials}</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* White Header Section (Only for Riwayat) */}
      {activeTab === 'riwayat' && (
        <View style={styles.whiteHeaderContainer}>
          <Text style={styles.historyHeaderTitle}>Riwayat Pemeriksaan</Text>
          <Text style={styles.historyHeaderSubtitle}>{getFormattedCurrentDate()}</Text>
        </View>
      )}

      {/* Main Content Area */}
      <ScrollView
        style={activeTab === 'beranda' && { backgroundColor: '#F8FAFC' }}
        contentContainerStyle={[
          styles.scrollContent,
          activeTab === 'riwayat' && { backgroundColor: '#FFFFFF', paddingTop: 16 },
        ]}
        bounces={true}
        onScroll={handleScroll}
        scrollEventThrottle={400}
      >
        {activeTab === 'beranda' ? (
          <>
            {/* Summary Statistics Section */}
            <Text style={styles.sectionTitle}>Total Pemeriksaan Hari Ini</Text>
            <View style={styles.statsRow}>
              <TouchableOpacity
                style={[
                  styles.statsCard, 
                  styles.shadowEffect, 
                  { backgroundColor: '#FFFFFF', borderColor: '#E0EDFF' }
                ]}
                activeOpacity={0.85}
                onPress={() => {
                  setActiveTab('riwayat');
                  setFilterMode('Semua');
                }}
              >
                <Text style={[styles.statsNumber, { color: '#1E60D5' }]}>{historyItems.length}</Text>
                <Text style={styles.statsLabel}>Diperiksa</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.statsCard, 
                  styles.shadowEffect, 
                  { backgroundColor: '#FFFFFF', borderColor: '#D1F5E5' }
                ]}
                activeOpacity={0.85}
                onPress={() => {
                  setActiveTab('riwayat');
                  setFilterMode('Segar');
                }}
              >
                <Text style={[styles.statsNumber, { color: '#10B981' }]}>
                  {historyItems.filter((item) => item.status === 'Segar').length}
                </Text>
                <Text style={styles.statsLabel}>Segar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.statsCard, 
                  styles.shadowEffect, 
                  { backgroundColor: '#FFFFFF', borderColor: '#FEE2E2' }
                ]}
                activeOpacity={0.85}
                onPress={() => {
                  setActiveTab('riwayat');
                  setFilterMode('Tidak Segar');
                }}
              >
                <Text style={[styles.statsNumber, { color: '#EF4444' }]}>
                  {historyItems.filter((item) => item.status === 'Tidak Segar').length}
                </Text>
                <Text style={styles.statsLabel}>Tidak Segar</Text>
              </TouchableOpacity>
            </View>

            {/* Check Chicken Button Link */}
            <TouchableOpacity
              style={[styles.cameraActionCard, styles.shadowEffect]}
              activeOpacity={0.9}
              onPress={handleStartExam}
            >
              <View style={styles.cameraIconBg}>
                <Feather name="camera" size={24} color="#1E60D5" />
              </View>
              <View style={styles.cameraActionTextContainer}>
                <Text style={styles.cameraActionTitle}>Periksa Daging Ayam</Text>
                <Text style={styles.cameraActionSubtitle}>Ambil gambar untuk analisis</Text>
              </View>
            </TouchableOpacity>

            {/* Recent History Header */}
            <View style={styles.sectionHeaderRow}>
              <Text style={[styles.sectionTitle, { marginBottom: 0 }]}>Riwayat Terakhir</Text>
              <TouchableOpacity onPress={() => setActiveTab('riwayat')}>
                <Text style={styles.seeAllText}>Lihat semua</Text>
              </TouchableOpacity>
            </View>

            {/* History List (Recent 3 inspections) */}
            <View style={styles.historyList}>
              {historyItems.slice(0, 3).map((item) => (
                <HistoryRow key={item.id} item={item} onPress={() => handleItemPress(item)} />
              ))}
            </View>
          </>
        ) : (
          // Full History View (if "Riwayat" tab is active - Frame 9, 10, 11)
          <>
            {/* Collapsible Inline Calendar Date Picker Section */}
            <Text style={styles.filterLabel}>Pilih Rentang Tanggal</Text>
            <View style={[styles.inlineCalendarContainer, styles.shadowEffect]}>
              {/* Trigger Button Row */}
              <TouchableOpacity
                style={styles.calendarTriggerRow}
                activeOpacity={0.7}
                onPress={() => setIsCalendarExpanded(!isCalendarExpanded)}
              >
                <View style={styles.datePickerButtonLeft}>
                  <Feather name="calendar" size={18} color="#1E60D5" />
                  <Text style={styles.datePickerButtonText}>
                    {getSelectedRangeText()}
                  </Text>
                </View>
                <View style={styles.datePickerButtonRight}>
                  {(startDate !== null || endDate !== null) && (
                    <TouchableOpacity
                      style={styles.datePickerClearButton}
                      onPress={(e) => {
                        e.stopPropagation();
                        setStartDate(null);
                        setEndDate(null);
                      }}
                      activeOpacity={0.7}
                    >
                      <Feather name="x" size={16} color="#64748B" />
                    </TouchableOpacity>
                  )}
                  <Feather
                    name={isCalendarExpanded ? 'chevron-up' : 'chevron-down'}
                    size={20}
                    color="#64748B"
                  />
                </View>
              </TouchableOpacity>

              {/* Collapsible Grid Section */}
              {isCalendarExpanded && (
                <View style={styles.collapsibleCalendarContent}>
                  {/* Header: Navigation prev/next */}
                  <View style={styles.calendarHeader}>
                    <Text style={styles.calendarHeaderTitle}>
                      {months[calendarMonth.getMonth()]} {calendarMonth.getFullYear()}
                    </Text>
                    <View style={{ flexDirection: 'row', gap: 8 }}>
                      <TouchableOpacity style={styles.calendarNavButton} onPress={handlePrevMonth}>
                        <Feather name="chevron-left" size={18} color="#1E60D5" />
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.calendarNavButton} onPress={handleNextMonth}>
                        <Feather name="chevron-right" size={18} color="#1E60D5" />
                      </TouchableOpacity>
                    </View>
                  </View>

                  {/* Weekday labels */}
                  <View style={styles.weekdaysRow}>
                    {['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'].map((day) => (
                      <Text key={day} style={styles.weekdayLabel}>
                        {day}
                      </Text>
                    ))}
                  </View>

                  {/* Days grid */}
                  <View style={styles.daysGrid}>{renderCalendarDays()}</View>
                </View>
              )}
            </View>

            {/* Quality Filter Section */}
            <Text style={styles.filterLabel}>Kondisi Daging</Text>
            <View style={styles.filterRow}>
              {(['Semua', 'Segar', 'Tidak Segar'] as const).map((mode) => {
                const isActive = filterMode === mode;
                return (
                  <TouchableOpacity
                    key={mode}
                    style={[styles.filterPill, isActive && styles.filterPillActive]}
                    onPress={() => setFilterMode(mode)}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.filterPillText, isActive && styles.filterPillTextActive]}>
                      {mode}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* List of Filtered Items */}
            <View style={styles.historyList}>
              {historyItems
                .filter((item) => filterMode === 'Semua' || item.status === filterMode)
                .filter((item) => {
                  if (!startDate) return true;
                  const itemDate = parseHistoryDateStr(item.date);
                  if (!itemDate) return false;
                  const itemTime = itemDate.getTime();
                  if (startDate && !endDate) {
                    return itemTime === startDate.getTime();
                  } else if (startDate && endDate) {
                    return itemTime >= startDate.getTime() && itemTime <= endDate.getTime();
                  }
                  return true;
                })
                .map((item) => (
                  <HistoryRow key={item.id} item={item} onPress={() => handleItemPress(item)} />
                ))}
              {historyItems
                .filter((item) => filterMode === 'Semua' || item.status === filterMode)
                .filter((item) => {
                  if (!startDate) return true;
                  const itemDate = parseHistoryDateStr(item.date);
                  if (!itemDate) return false;
                  const itemTime = itemDate.getTime();
                  if (startDate && !endDate) {
                    return itemTime === startDate.getTime();
                  } else if (startDate && endDate) {
                    return itemTime >= startDate.getTime() && itemTime <= endDate.getTime();
                  }
                  return true;
                }).length === 0 && (
                <Text style={styles.emptyListText}>Tidak ada riwayat pada rentang tanggal dan kondisi ini.</Text>
              )}

              {/* Indikator memuat halaman berikutnya */}
              {isLoadingMore && (
                <ActivityIndicator size="small" color="#1E60D5" style={{ marginVertical: 16 }} />
              )}
              {!hasMore && historyItems.length > 0 && (
                <Text style={styles.endOfListText}>Tidak ada riwayat lagi.</Text>
              )}
            </View>
          </>
        )}
      </ScrollView>

      {/* Custom Bottom Tab Navigation Bar */}
      <View style={styles.bottomTabContainer}>
        {/* Tab 1: Beranda */}
        <TouchableOpacity
          style={styles.tabButton}
          onPress={() => setActiveTab('beranda')}
        >
          <Feather
            name="home"
            size={24}
            color={activeTab === 'beranda' ? '#1E60D5' : '#9CA3AF'}
          />
          <Text
            style={[
              styles.tabLabel,
              { color: activeTab === 'beranda' ? '#1E60D5' : '#9CA3AF' },
            ]}
          >
            Beranda
          </Text>
        </TouchableOpacity>

        {/* Center Scanner FAB */}
        <View style={styles.fabContainer}>
          <TouchableOpacity
            style={styles.fabButton}
            activeOpacity={0.8}
            onPress={handleStartExam}
          >
            <MaterialCommunityIcons name="scan-helper" size={28} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* Tab 2: Riwayat */}
        <TouchableOpacity
          style={styles.tabButton}
          onPress={() => setActiveTab('riwayat')}
        >
          <MaterialCommunityIcons
            name="history"
            size={26}
            color={activeTab === 'riwayat' ? '#1E60D5' : '#9CA3AF'}
          />
          <Text
            style={[
              styles.tabLabel,
              { color: activeTab === 'riwayat' ? '#1E60D5' : '#9CA3AF' },
            ]}
          >
            Riwayat
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

/* Helper Component for Rendering History Rows */
function HistoryRow({ item, onPress }: { item: HistoryItem; onPress?: () => void }) {
  const isSegar = item.status === 'Segar';
  return (
    <TouchableOpacity
      style={[styles.historyRow, styles.shadowEffect]}
      activeOpacity={0.7}
      onPress={onPress}
    >
      {/* Thumbnail: gambar hasil scan dari uploads, fallback ke gambar default */}
      <View style={styles.historyImageContainer}>
        <Image
          source={item.image ? { uri: getUploadUrl(item.image)! } : require('@/assets/images/raw_chicken.jpg')}
          style={styles.historyThumbnail}
          resizeMode="cover"
        />
      </View>

      <View style={styles.historyTextContainer}>
        <Text style={styles.historyTitle}>{item.title}</Text>
        <Text style={styles.historySubtitle}>
          {item.time} · {item.date}
        </Text>
      </View>

      {/* Status Badge */}
      <View
        style={[
          styles.badgeContainer,
          { backgroundColor: isSegar ? '#E6FBF2' : '#FEE2E2' },
        ]}
      >
        <Text
          style={[
            styles.badgeText,
            { color: isSegar ? '#10B981' : '#EF4444' },
          ]}
        >
          {item.status}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC', // Slate 50 background
  },
  headerContainer: {
    backgroundColor: '#1E60D5', // Matches blue header from mockup
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    paddingHorizontal: 20, // Adjusted from 24 to 20 to align horizontally with the page contents
    paddingTop: 24,
    paddingBottom: 32,
  },
  headerTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greetingText: {
    color: '#FFFFFF',
    fontSize: 21,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  dateText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    marginBottom: 6,
  },
  locationText: {
    color: '#FFFFFF',
    fontSize: 14.5,
    fontWeight: '700',
  },
  avatarButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.2)', // Soft overlay inside
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF', // Premium white border matching profile screen
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 20,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 100, // Make room for bottom tab bar
  },
  sectionTitle: {
    color: '#1E293B', // Slate 800
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 12,
  },
  seeAllText: {
    color: '#1E60D5',
    fontSize: 14,
    fontWeight: '600',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10, // Precise gap spacing between the 3 cards
    marginBottom: 20,
  },
  statsCard: {
    flex: 1,
    borderRadius: 16,
    paddingVertical: 18, // Height adjustment to make them beautifully proportioned
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5, // Thin themed borders for card-level visual depth
  },
  statsNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statsLabel: {
    color: '#475569', // Slate 600 for better contrast on pastel backgrounds
    fontSize: 12,
    fontWeight: '600',
  },
  cameraActionCard: {
    backgroundColor: '#1E60D5', // Matches blue card button
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginBottom: 16,
  },
  cameraIconBg: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  cameraActionTextContainer: {
    flex: 1,
  },
  cameraActionTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  cameraActionSubtitle: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 12,
  },
  historyList: {
    gap: 12,
  },
  historyRow: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  historyImageContainer: {
    width: 48,
    height: 48,
    borderRadius: 10,
    overflow: 'hidden',
    marginRight: 16,
    backgroundColor: '#E2E8F0',
  },
  historyThumbnail: {
    width: '100%',
    height: '100%',
  },
  historyTextContainer: {
    flex: 1,
  },
  historyTitle: {
    color: '#0F172A',
    fontSize: 15,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  historySubtitle: {
    color: '#64748B',
    fontSize: 12,
  },
  badgeContainer: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  bottomTabContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 72,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingBottom: Platform.OS === 'ios' ? 16 : 0,
    elevation: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  tabButton: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 70,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 4,
  },
  fabContainer: {
    top: -24,
    elevation: 25,
    zIndex: 10,
  },
  fabButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#1E60D5',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#1E60D5',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 10,
    borderWidth: 4,
    borderColor: '#FFFFFF',
  },
  shadowEffect: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  whiteHeaderContainer: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20, // Adjusted from 24 to 20 to align horizontally with the page contents
    paddingTop: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  historyHeaderTitle: {
    color: '#1E60D5',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  historyHeaderSubtitle: {
    color: '#64748B',
    fontSize: 14,
    fontWeight: '500',
  },
  filterRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  filterPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  filterPillActive: {
    backgroundColor: '#1E60D5',
    borderColor: '#1E60D5',
  },
  filterPillText: {
    color: '#64748B',
    fontSize: 14,
    fontWeight: '600',
  },
  filterPillTextActive: {
    color: '#FFFFFF',
  },
  emptyListText: {
    color: '#64748B',
    fontSize: 14,
    textAlign: 'center',
    fontStyle: 'italic',
    paddingVertical: 16,
  },
  endOfListText: {
    color: '#94A3B8',
    fontSize: 13,
    textAlign: 'center',
    paddingVertical: 12,
  },
  filterLabel: {
    color: '#64748B',
    fontSize: 12,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
    marginTop: 8,
  },
  inlineCalendarContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 20,
    overflow: 'hidden',
  },
  calendarTriggerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  datePickerButtonLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  datePickerButtonRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  datePickerButtonText: {
    color: '#334155',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  datePickerClearButton: {
    padding: 4,
  },
  collapsibleCalendarContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  calendarHeaderTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1E60D5',
  },
  calendarNavButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  weekdaysRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  weekdayLabel: {
    width: '14.28%',
    textAlign: 'center',
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '700',
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    rowGap: 8,
  },
  calendarDayCell: {
    width: '14.28%',
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  calendarDayCellEmpty: {
    width: '14.28%',
    height: 40,
  },
  calendarDayInner: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  calendarDayCellActive: {
    backgroundColor: '#1E60D5',
  },
  calendarDayCellInRange: {
    backgroundColor: '#EBF3FF',
    borderRadius: 8,
  },
  calendarDayText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
  },
  calendarDayTextActive: {
    color: '#FFFFFF',
  },
  calendarDayTextInRange: {
    color: '#1E60D5',
    fontWeight: 'bold',
  },
  calendarDayDot: {
    position: 'absolute',
    bottom: 4,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#1E60D5',
  },
  inlineCalendarFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  selectedDateInfo: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '600',
  },
  clearDateButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
  },
  clearDateButtonText: {
    fontSize: 12,
    color: '#1E60D5',
    fontWeight: 'bold',
  },
});
