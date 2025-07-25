// components/ProtectedRoute.tsx
import { useAuth } from "@/contexts/AuthContext";
import { router } from "expo-router";
import { useEffect } from "react";
import SplashScreenCustomComponent from "./SplashScreen";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean; // true = mora biti ulogovan, false = mora biti odulogovan
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requireAuth = true,
}) => {
  const { isAuthenticated, loading, emailVerificationLoading } = useAuth();

  useEffect(() => {
    if (!loading) {
      if (requireAuth && !isAuthenticated) {
        // Treba auth a nema ga - idi na login
        router.replace("/(auth)/login");
      } else if (!requireAuth && isAuthenticated) {
        // Ne treba auth a ima ga - idi na tabs
        router.replace("/(tabs)");
      }
    }
  }, [isAuthenticated, loading, requireAuth]);

  // Prikaži loading dok se proverava auth
  // if (emailVerificationLoading) {
  //   return <SplashScreenCustomComponent />;
  // }

  // Prikaži sadržaj samo ako je auth stanje ispravno
  if (requireAuth && !isAuthenticated) {
    return <SplashScreenCustomComponent />; // ili null
  }

  if (!requireAuth && isAuthenticated) {
    return <SplashScreenCustomComponent />; // ili null
  }

  return <>{children}</>;
};
