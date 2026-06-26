import { DarkTheme, DefaultTheme, ThemeProvider } from 'expo-router';
import { Stack } from 'expo-router';
import { useColorScheme, Platform } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import CustomAlert from '../components/ui/custom-alert';

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
              
              html, body, #root {
                margin: 0;
                padding: 0;
                overflow-x: hidden;
                width: 100%;
                height: 100%;
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
