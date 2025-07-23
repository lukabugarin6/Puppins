import React, { createContext, useContext, useEffect, useState } from 'react';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';

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
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_URL = 'http://localhost:3000'; // Promeni na tvoj IP za fizički uređaj

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Google OAuth konfiguracija
  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    clientId: '603107276135-a92l8qerjep5gimdspuoug28mdo148ps.apps.googleusercontent.com',

  });

  // Učitaj korisnika pri pokretanju
  useEffect(() => {
    loadStoredUser();
  }, []);

  // Obradi Google OAuth odgovor
  useEffect(() => {
    if (response?.type === 'success') {
      const { id_token } = response.params;
      handleGoogleSignIn(id_token);
    }
  }, [response]);

  const loadStoredUser = async () => {
    try {
      const token = await SecureStore.getItemAsync('authToken');
      if (token) {
        // Proveri token sa backend-om
        const response = await fetch(`${API_URL}/auth/profile`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        
        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
        } else {
          // Token nije valjan, obriši ga
          await SecureStore.deleteItemAsync('authToken');
        }
      }
    } catch (error) {
      console.error('Error loading user:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async (idToken: string) => {
    try {
      setLoading(true);
      
      const response = await fetch(`${API_URL}/auth/google`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ idToken }),
      });

      if (response.ok) {
        const data = await response.json();
        
        // Sačuvaj token
        await SecureStore.setItemAsync('authToken', data.token);
        
        // Sačuvaj korisnika
        setUser(data.user);
        
        // Navigiraj na home
        router.replace('/(tabs)');
      } else {
        const error = await response.json();
        throw new Error(error.message || 'Google prijava neuspešna');
      }
    } catch (error: any) {
      console.error('Google sign in error:', error);
      alert(error.message || 'Greška pri prijavi');
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    try {
      setLoading(true);
      await promptAsync();
    } catch (error) {
      console.error('Google sign in prompt error:', error);
      alert('Greška pri pokretanju Google prijave');
    } finally {
      setLoading(false);
    }
  };

  const signInWithEmail = async (email: string, password: string) => {
    try {
      setLoading(true);
      
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const data = await response.json();
        
        await SecureStore.setItemAsync('authToken', data.token);
        setUser(data.user);
        router.replace('/(tabs)');
      } else {
        const error = await response.json();
        throw new Error(error.message || 'Prijava neuspešna');
      }
    } catch (error: any) {
      console.error('Email sign in error:', error);
      alert(error.message || 'Greška pri prijavi');
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      await SecureStore.deleteItemAsync('authToken');
      setUser(null);
      router.replace('/');
    } catch (error) {
      console.error('Sign out error:', error);
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    loading,
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
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};