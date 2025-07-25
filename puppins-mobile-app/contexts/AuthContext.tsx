import React, { createContext, useContext, useEffect, useState } from "react";
import * as WebBrowser from "expo-web-browser";
import * as Google from "expo-auth-session/providers/google";
import * as SecureStore from "expo-secure-store";
import { router } from "expo-router";
import * as AuthSession from "expo-auth-session";
import axios from "axios";
import * as Linking from "expo-linking";

// Omogući automatsko zatvaranje browser-a nakon prijave
WebBrowser.maybeCompleteAuthSession();

interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  profilePicture?: string;
  authProvider: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  googleLoading: boolean;
  signUpLoading: boolean;
  emailVerificationLoading: boolean;
  forgotPasswordLoading: boolean;
  resetPasswordLoading: boolean;
  verificationMessage: string;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUp: (
    firstName: string,
    lastName: string,
    email: string,
    password: string
  ) => Promise<void>;
  signOut: () => Promise<void>;
  verifyEmail: (token: string) => Promise<void>;
  resendVerification: (email: string) => Promise<void>;
  forgotPassword: (email: string) => Promise<void>; // NOVO
  resetPassword: (token: string, newPassword: string) => Promise<void>; // NOVO
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_URL = "http://10.0.1.129:3000"; // Promeni na tvoj IP za fizički uređaj

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [signUpLoading, setSignUpLoading] = useState(false);
  const [emailVerificationLoading, setEmailVerificationLoading] =
    useState(false);
  const [verificationMessage, setVerificationMessage] = useState("");
  const [forgotPasswordLoading, setForgotPasswordLoading] = useState(false);
  const [resetPasswordLoading, setResetPasswordLoading] = useState(false);

  // Google OAuth konfiguracija
  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    clientId:
      "603107276135-qkujt5gek43lu0uvveqnh77ukdh3b486.apps.googleusercontent.com",
    scopes: ["openid", "profile", "email"],
  });

  // Učitaj korisnika pri pokretanju
  useEffect(() => {
    loadStoredUser();
  }, []);

  // Obradi Google OAuth odgovor
  useEffect(() => {
    if (response?.type === "success") {
      const { id_token } = response.params;
      handleGoogleSignIn(id_token);
    }
  }, [response]);

  const loadStoredUser = async () => {
    try {
      const token = await SecureStore.getItemAsync("authToken");
      if (token) {
        axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        // Proveri token sa backend-om - koristimo axios
        const response = await axios.get(`${API_URL}/auth/profile`);

        setUser(response.data);
      }
    } catch (error) {
      console.error("Error loading user:", error);
      // Token nije valjan, obriši ga
      await SecureStore.deleteItemAsync("authToken");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async (idToken: string) => {
    try {
      setGoogleLoading(true);

      const response = await axios.post(`${API_URL}/auth/google`, {
        idToken,
      });

      const data = response.data;

      // Sačuvaj token
      await SecureStore.setItemAsync("authToken", data.token);

      console.log(data);

      setUser(data.user);

      router.replace("/(tabs)");
    } catch (error: any) {
      console.error("Google sign in error:", error);
      const message = error.response?.data?.message || "Greška pri prijavi";
      alert(message);
    } finally {
      setGoogleLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    try {
      setGoogleLoading(true);

      console.log("google loading...")
      await promptAsync();
    } catch (error) {
      console.error("Google sign in prompt error:", error);
      alert("Greška pri pokretanju Google prijave");
    } finally {
      setGoogleLoading(false);
    }
  };

  const signInWithEmail = async (email: string, password: string) => {
    try {
      setLoading(true);

      const response = await axios.post(`${API_URL}/auth/login`, {
        email,
        password,
      });

      const data = response.data;

      await SecureStore.setItemAsync("authToken", data.token);
      setUser(data.user);

      router.replace("/(tabs)");
    } catch (error: any) {
      console.error("Email sign in error:", error);

      console.log(error);
      const message = error.response?.data?.message || "Greška pri prijavi";
      alert(message);
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (
    firstName: string,
    lastName: string,
    email: string,
    password: string
  ) => {
    try {
      setSignUpLoading(true);

      const response = await axios.post(`${API_URL}/auth/register`, {
        firstName,
        lastName,
        email,
        password,
      });

      const data = response.data;

      // Backend sada ne vraća token odmah, već poruku o verifikaciji
      setVerificationMessage(data.message);

      // Ne redirektuj odmah - čekaj email verifikaciju
      // alert ili toast sa porukom da korisnik proveri email
      alert(data.message);
    } catch (error: any) {
      console.error("Sign up error:", error);
      const message =
        error.response?.data?.message || "Greška pri registraciji";
      alert(message);
    } finally {
      setSignUpLoading(false);
    }
  };

  const verifyEmail = async (token: string) => {
    try {
      setEmailVerificationLoading(true);

      const response = await axios.get(
        `${API_URL}/auth/verify-email?token=${token}`
      );
      const data = response.data;

      // Sada ćeš dobiti JWT token nakon uspešne verifikacije
      await SecureStore.setItemAsync("authToken", data.token);

      // Dekoduj token da dobiješ user podatke ili ih zatraži
      await loadStoredUser(); // funkcija za učitavanje user-a na osnovu token-a

      setVerificationMessage(data.message);
      alert(data.message);

      router.replace("/(tabs)");
    } catch (error: any) {
      console.error("Email verification error:", error);
      const message =
        error.response?.data?.message || "Greška pri verifikaciji";
      alert(message);
    } finally {
      setEmailVerificationLoading(false);
    }
  };

  const forgotPassword = async (email: string) => {
    try {
      setForgotPasswordLoading(true);

      const response = await axios.post(`${API_URL}/auth/forgot-password`, {
        email,
      });

      const data = response.data;
      alert(data.message);
    } catch (error: any) {
      console.error("Forgot password error:", error);
      const message =
        error.response?.data?.message || "Greška pri slanju reset email-a";
      alert(message);
    } finally {
      setForgotPasswordLoading(false);
    }
  };

  const resetPassword = async (token: string, newPassword: string) => {
    try {
      setResetPasswordLoading(true);

      const response = await axios.post(`${API_URL}/auth/reset-password`, {
        token,
        newPassword,
      });

      const data = response.data;
      alert(data.message);

      // Redirektuj na login posle uspešnog reset-a
      router.replace("/(auth)/login");
    } catch (error: any) {
      console.error("Reset password error:", error);
      const message =
        error.response?.data?.message || "Greška pri resetovanju lozinke";
      alert(message);
    } finally {
      setResetPasswordLoading(false);
    }
  };

  useEffect(() => {
    const handleDeepLink = (url: string) => {
      if (url.includes("/auth/verify-email")) {
        const urlParams = new URLSearchParams(url.split("?")[1]);
        const token = urlParams.get("token");
        if (token) {
          verifyEmail(token);
        }
      } else if (url.includes("/auth/reset-password")) {
        const urlParams = new URLSearchParams(url.split("?")[1]);
        const token = urlParams.get("token");
        if (token) {
          // Redirektuj na reset password screen sa token-om
          router.push(`/(auth)/forgot-password?token=${token}`);
        }
      }
    };

    // Handleuj deep link kada se app otvori
    Linking.getInitialURL().then((url) => {
      if (url) handleDeepLink(url);
    });

    // Handleuj deep link kada je app već otvoren
    const subscription = Linking.addEventListener("url", ({ url }) => {
      handleDeepLink(url);
    });

    return () => subscription?.remove();
  }, [verifyEmail, resetPassword]);

  const resendVerification = async (email: string) => {
    try {
      setEmailVerificationLoading(true);

      const response = await axios.post(`${API_URL}/auth/resend-verification`, {
        email,
      });

      const data = response.data;
      alert(data.message);
    } catch (error: any) {
      console.error("Resend verification error:", error);
      const message =
        error.response?.data?.message || "Greška pri slanju verifikacije";
      alert(message);
    } finally {
      setEmailVerificationLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      await SecureStore.deleteItemAsync("authToken");
      setUser(null);
      router.replace("/");
    } catch (error) {
      console.error("Sign out error:", error);
    } finally {
      setLoading(false);
    }
  };

  const value = {
  user,
  loading,
  googleLoading,
  signUpLoading,
  emailVerificationLoading,
  forgotPasswordLoading,
  resetPasswordLoading,
  verificationMessage,
  signInWithGoogle,
  signInWithEmail,
  signUp,
  signOut,
  verifyEmail,
  resendVerification,
  forgotPassword,
  resetPassword,
  isAuthenticated: !!user,
};

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
