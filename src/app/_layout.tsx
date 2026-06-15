import { DarkTheme, DefaultTheme, ThemeProvider } from 'expo-router';
import { useState } from 'react';
import { useColorScheme } from 'react-native';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import AppTabs from '@/components/app-tabs';
import { AuthProvider, useAuth } from '@/context/auth';
import LoginScreen from './login';
import RegisterScreen from './register';

type AuthScreen = 'login' | 'register';

function AuthFlow() {
  const [screen, setScreen] = useState<AuthScreen>('login');

  if (screen === 'login') {
    return <LoginScreen onGoRegister={() => setScreen('register')} />;
  }
  return <RegisterScreen onGoLogin={() => setScreen('login')} />;
}

function AppContent() {
  const { isAuthenticated } = useAuth();
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <AnimatedSplashOverlay />
      {isAuthenticated ? <AppTabs /> : <AuthFlow />}
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
