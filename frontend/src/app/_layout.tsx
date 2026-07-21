import { DarkTheme, DefaultTheme, ThemeProvider } from 'expo-router';
import { Stack } from 'expo-router';
import { useColorScheme, Platform, LogBox } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import CustomAlert from '../components/ui/custom-alert';

// Sembunyikan semua notifikasi log/warning developer agar tampilan HP bersih saat didemonstrasikan
LogBox.ignoreAllLogs();

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <SafeAreaProvider>
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <StatusBar style="light" />
      {Platform.OS === 'web' && (
        <style
          dangerouslySetInnerHTML={{
            __html: `
              @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap');
              
              html, body {
                margin: 0;
                padding: 0;
                background-color: #0F172A;
                width: 100%;
                height: 100%;
                overflow-x: hidden;
              }
              
              #root {
                width: 100%;
                max-width: 460px;
                height: 100%;
                margin: 0 auto;
                background-color: #FFFFFF;
                box-shadow: 0 20px 40px rgba(0, 0, 0, 0.35);
                position: relative;
                overflow: hidden;
              }

              @media (max-width: 500px) {
                #root {
                  max-width: 100%;
                  box-shadow: none;
                }
              }
              
              /* Terapkan font Plus Jakarta Sans ke seluruh elemen KECUALI yang memiliki class/style font khusus (seperti Icon) */
              *:not([class*="r-fontFamily-"]):not([style*="font-family"]):not([class*="Feather"]):not([class*="MaterialCommunityIcons"]):not([class*="Ionicons"]):not([class*="FontAwesome"]) {
                font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif !important;
              }
            `,
          }}
        />
      )}
      <Stack screenOptions={{ headerShown: false, animation: 'fade' }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="welcome" />
        <Stack.Screen name="signin" />
        <Stack.Screen name="signup" />
        <Stack.Screen name="home" />
        <Stack.Screen name="camera" />
        <Stack.Screen name="detail" />
        <Stack.Screen name="profile" />
      </Stack>
      <CustomAlert />
    </ThemeProvider>
    </SafeAreaProvider>
  );
}
