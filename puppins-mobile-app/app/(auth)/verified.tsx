import { useEffect } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useAuth } from "@/contexts/AuthContext";
import * as SecureStore from "expo-secure-store";
import axios from "axios";
import SplashScreenCustomComponent from "@/components/SplashScreen";
import { ProtectedRoute } from "@/components/ProtectedRoute";

export default function VerifiedScreen() {
  const { token } = useLocalSearchParams();
  const router = useRouter();
  const { loadStoredUser } = useAuth();

  useEffect(() => {
    handleVerification();
  }, []);

  const handleVerification = async () => {
    if (token) {
      try {
        await SecureStore.setItemAsync("authToken", token as string);

        const API_URL = "http://10.0.1.129:3000";
        axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

        await loadStoredUser();
        
        // PROMENITE OVO - prvo očistite stack, pa onda idite na tabs
        router.dismissAll();
        router.replace("/(tabs)");
        
      } catch (error) {
        console.error("❌ Verification error:", error);
        router.replace("/(auth)/login");
      }
    } else {
      router.replace("/(auth)/login");
    }
  };

  return (
    <ProtectedRoute requireAuth={false}>
      <SplashScreenCustomComponent />
    </ProtectedRoute>
  );
}