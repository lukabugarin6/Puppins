import React, { createContext, useContext, useEffect, useState } from "react";
import * as WebBrowser from "expo-web-browser";
import * as Google from "expo-auth-session/providers/google";
import * as SecureStore from "expo-secure-store";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import * as AuthSession from "expo-auth-session";
import axios from "axios";

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
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
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

  const redirectUri = AuthSession.makeRedirectUri({
    scheme: "com.puppins",
    path: "/oauth2",
  });

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
        // Proveri token sa backend-om
        const response = await fetch(`${API_URL}/auth/profile`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
        } else {
          // Token nije valjan, obriši ga
          await SecureStore.deleteItemAsync("authToken");
        }
      }
    } catch (error) {
      console.error("Error loading user:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async (idToken: string) => {
    try {
      setGoogleLoading(true);

      const response = await fetch(`${API_URL}/auth/google`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ idToken }),
      });

      if (response.ok) {
        const data = await response.json();

        // Sačuvaj token
        await SecureStore.setItemAsync("authToken", data.token);

        // Sačuvaj korisnika

        console.log(data);

        setUser(data.user);

        // router.replace("/(tabs)");
      } else {
        const error = await response.json();
        throw new Error(error.message || "Google prijava neuspešna");
      }
    } catch (error: any) {
      console.error("Google sign in error:", error);
      alert(error.message || "Greška pri prijavi");
    } finally {
      setGoogleLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    try {
      setGoogleLoading(true);
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

      console.log(error)
      const message = error.response?.data?.message || "Greška pri prijavi";
      alert(message);
    } finally {
      setLoading(false);
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
    signInWithGoogle,
    signInWithEmail,
    signOut,
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
