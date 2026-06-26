import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ImageBackground,
  TouchableOpacity,
  Alert,
  ScrollView,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { ScannerIcon } from '@/components/scanner-icon';

export default function WelcomeScreen() {
  const router = useRouter();

  const handleSignIn = () => {
    router.push('/signin');
  };

  const handleSignUp = () => {
    router.push('/signup');
  };

  const [cardWidth, setCardWidth] = useState(Dimensions.get('window').width - 56);
  const [activeIndex, setActiveIndex] = useState(0);

  const handleScroll = (event: any) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(contentOffsetX / cardWidth);
    if (index !== activeIndex) {
      setActiveIndex(index);
    }
  };

  const slides = [
    {
      icon: 'camera',
      color: '#1E60D5',
      bgColor: '#F4F8FF', // Soft light blue card background
      iconBgColor: '#D6E4FF', // Darker blue icon background
      borderColor: '#BCD7FC',
      title: 'Pindai Cepat',
      description: 'Ambil foto daging ayam melalui kamera Anda untuk mendeteksi kesegaran secara instan.',
    },
    {
      icon: 'activity',
      color: '#10B981',
      bgColor: '#F4FDF8', // Soft light green card background
      iconBgColor: '#CFF5E5', // Darker green icon background
      borderColor: '#A8EDCD',
      title: 'Analisis Warna RGB',
      description: 'Menganalisis kadar warna piksel daging secara presisi menggunakan metode pengolahan citra.',
    },
    {
      icon: 'database',
      color: '#F97316',
      bgColor: '#FFF9F0', // Soft light orange card background
      iconBgColor: '#FFEAD4', // Darker orange icon background
      borderColor: '#FFD7AF',
      title: 'Riwayat Terpusat',
      description: 'Semua riwayat hasil deteksi otomatis tersimpan rapi untuk mempermudah pemantauan kualitas.',
    },
  ];

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        bounces={true}
        showsVerticalScrollIndicator={false}
      >
        {/* Upper part: Background with blue overlay and ScannerIcon */}
        <View style={styles.headerSection}>
          <ImageBackground
            source={require('@/assets/images/chicken_bg.jpg')}
            style={styles.backgroundImage}
            resizeMode="cover"
          >
            <View style={styles.blueOverlay}>
              <View style={styles.iconContainer}>
                <ScannerIcon size={120} />
              </View>
            </View>
          </ImageBackground>
        </View>

        {/* Lower part: White Card (Bottom Sheet style) */}
        <View style={styles.cardSection} onLayout={(e) => setCardWidth(e.nativeEvent.layout.width - 56)}>
          <Text style={styles.cardTitle}>Selamat Datang</Text>
          <Text style={styles.cardSubtitle}>
            Mulailah dengan akunmu untuk memantau kesegaran ayam secara akurat
          </Text>

          {/* Interactive Feature Slider */}
          <View style={styles.sliderContainer}>
            <ScrollView
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onScroll={handleScroll}
              scrollEventThrottle={16}
              style={{ width: cardWidth }}
              contentContainerStyle={{ alignItems: 'center' }}
            >
              {slides.map((slide, index) => (
                <View 
                  key={index} 
                  style={[
                    styles.slideCard, 
                    { 
                      width: cardWidth - 48, // Smaller width to increase side margins
                      marginHorizontal: 24, // 24px margins for better centering and peek spacing
                      backgroundColor: slide.bgColor,
                      borderColor: slide.borderColor,
                    }
                  ]}
                >
                  <View style={[styles.slideIconBg, { backgroundColor: slide.iconBgColor }]}>
                    <Feather name={slide.icon as any} size={22} color={slide.color} />
                  </View>
                  <Text style={styles.slideTitle}>{slide.title}</Text>
                  <Text style={styles.slideDesc}>{slide.description}</Text>
                </View>
              ))}
            </ScrollView>

            {/* Pagination Dots */}
            <View style={styles.dotsRow}>
              {slides.map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.dot,
                    activeIndex === index ? styles.activeDot : styles.inactiveDot,
                  ]}
                />
              ))}
            </View>
          </View>

          {/* Buttons Container */}
          <View style={styles.buttonsWrapper}>
            <TouchableOpacity
              style={styles.signInButton}
              activeOpacity={0.8}
              onPress={handleSignIn}
            >
              <Text style={styles.signInButtonText}>Sign in</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.signUpButton}
              activeOpacity={0.8}
              onPress={handleSignUp}
            >
              <Text style={styles.signUpButtonText}>Sign up</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContainer: {
    flexGrow: 1,
    backgroundColor: '#FFFFFF',
  },
  headerSection: {
    height: 240, // Use fixed height to ensure content is fully visible on any screen size
    width: '100%',
  },
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  blueOverlay: {
    flex: 1,
    backgroundColor: 'rgba(30, 115, 220, 0.76)', // Rich blue overlay matching splash screen
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainer: {
    marginTop: 20,
  },
  cardSection: {
    flex: 1, // Automatically fill the remaining screen space
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    marginTop: -30, // Negative margin to overlap the blue header, matching mockup card overlay
    paddingHorizontal: 28,
    paddingTop: 36,
    paddingBottom: 24,
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 8,
  },
  cardTitle: {
    color: '#0D0E10',
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  cardSubtitle: {
    color: '#4A607A', // Soft slate-blue text
    fontSize: 14,
    textAlign: 'center',
    fontWeight: '500',
    marginBottom: 20,
    lineHeight: 20,
  },
  sliderContainer: {
    width: '100%',
    alignItems: 'center',
    marginVertical: 8,
  },
  slideCard: {
    borderRadius: 18,
    borderWidth: 1.5,
    paddingHorizontal: 16,
    paddingVertical: 14, // Reduced from 20 to 14 for compact height
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.02,
    shadowRadius: 6,
    elevation: 2,
  },
  slideIconBg: {
    width: 44, // Reduced from 48 to 44
    height: 44,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  slideTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#0F172A',
    marginBottom: 4,
    textAlign: 'center',
  },
  slideDesc: {
    fontSize: 11.5,
    color: '#64748B',
    lineHeight: 16.5,
    textAlign: 'center',
    paddingHorizontal: 8,
  },
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    marginTop: 10,
    marginBottom: 4,
  },
  dot: {
    height: 6,
    borderRadius: 3,
  },
  activeDot: {
    width: 14,
    backgroundColor: '#1E60D5',
  },
  inactiveDot: {
    width: 6,
    backgroundColor: '#E2E8F0',
  },
  buttonsWrapper: {
    width: '100%',
    marginTop: 'auto', // Pushes buttons to the bottom of the card
    paddingTop: 12,
  },
  signInButton: {
    backgroundColor: '#1E60D5', // High premium blue button
    width: '100%',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    shadowColor: '#1E60D5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  signInButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  signUpButton: {
    backgroundColor: '#F3F6FC', // Soft pastel blue-gray background
    width: '100%',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  signUpButtonText: {
    color: '#1E60D5', // Matches sign in button background
    fontSize: 16,
    fontWeight: '600',
  },
});
