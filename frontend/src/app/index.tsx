import React, { useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ImageBackground,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ScannerIcon } from '@/components/scanner-icon';

export default function SplashScreen() {
  const router = useRouter();

  useEffect(() => {
    // Automatically navigate to Welcome page after 2.5 seconds
    const timer = setTimeout(() => {
      handleNavigate();
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  const handleNavigate = () => {
    router.replace('/welcome');
  };

  return (
    <TouchableOpacity
      activeOpacity={0.95}
      style={styles.container}
      onPress={handleNavigate}
    >
      <ImageBackground
        source={require('@/assets/images/chicken_bg.jpg')}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        {/* Deep blue overlay for mockup style */}
        <View style={styles.blueOverlay}>
          {/* Central Logo & Vector Scanner */}
          <View style={styles.iconContainer}>
            <ScannerIcon size={150} />
          </View>

          {/* Text Titles */}
          <View style={styles.titleContainer}>
            <Text style={styles.title}>Monitoring</Text>
            <Text style={styles.title}>Kualitas Daging</Text>
            <Text style={styles.title}>Ayam</Text>
          </View>

          {/* Micro-hint to let the user know they can tap */}
          <Text style={styles.hintText}>Ketuk di mana saja untuk melanjutkan</Text>
        </View>
      </ImageBackground>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  blueOverlay: {
    flex: 1,
    backgroundColor: 'rgba(30, 115, 220, 0.76)', // Rich blue-tinted overlay from mockup
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  iconContainer: {
    marginBottom: 40,
  },
  titleContainer: {
    alignItems: 'center',
  },
  title: {
    color: '#FFFFFF',
    fontSize: 34,
    fontWeight: '900',
    textAlign: 'center',
    lineHeight: 44,
    letterSpacing: -0.5,
    textShadowColor: 'rgba(0, 0, 0, 0.15)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  hintText: {
    position: 'absolute',
    bottom: 40,
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 12,
    fontWeight: '500',
  },
});
