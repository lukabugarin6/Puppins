import { useEffect } from 'react';
import { router } from 'expo-router';
import SplashScreenCustomComponent from "@/components/SplashScreen";

export default function OAuthRedirect() {
  useEffect(() => {
    router.replace('/(auth)/login');
  }, []);

  return <SplashScreenCustomComponent />;
}