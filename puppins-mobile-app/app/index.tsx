import SplashScreenCustomComponent from "@/components/SplashScreen";import { useAuth } from "@/contexts/AuthContext";
import { router } from "expo-router";
import { useEffect } from "react";
import { View, Text } from "react-native";

export default function App() {
  const { isAuthenticated, loading } = useAuth();

  useEffect(() => {
    if (!loading) {
      if (isAuthenticated) {
        // Korisnik je ulogovan, idi na tabs
        router.replace("/(tabs)");
      } else {
        // Korisnik nije ulogovan, idi na login
        router.replace("/(auth)/login");
      }
    }
  }, [isAuthenticated, loading]);

  // Loading screen dok se proverava autentifikacija
  if (loading) {
    return (
      <SplashScreenCustomComponent />
    );
  }

  return null; // Ovo se neće ni prikazati jer će redirect da se desi
}