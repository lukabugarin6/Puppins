import Button from "@/components/ui/Button";
import { CustomText } from "@/components/ui/CustomText";
import Input from "@/components/ui/Input";
import { PawTrail } from "@/components/ui/PawTrail";
import { animationValues } from "@/constants/AnimationValues";
import { router } from "expo-router";
import { useState } from "react";
import { Pressable, StyleSheet, View, ActivityIndicator } from "react-native";
import MailIcon from "../assets/icons/email.svg";
import GoogleIcon from "../assets/icons/google.svg";
import KeyIcon from "../assets/icons/key.svg";
import LoginIcon from "../assets/icons/login.svg";
import { useAuth } from "@/contexts/AuthContext";

export default function LoginScreen() {
  const { signInWithGoogle, signInWithEmail, loading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleEmailLogin = async () => {
    if (!email || !password) {
      alert("Molim vas unesite email i lozinku");
      return;
    }
    await signInWithEmail(email, password);
  };

  const handleGoogleLogin = async () => {
    await signInWithGoogle();
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#fff", justifyContent: "center", padding: 20, paddingBottom: 80 }}>
      <View style={{ zIndex: 2 }}>
        <CustomText type="title" style={{ marginBottom: 4 }}>Welcome!</CustomText>
        <CustomText type="subtitle-small" style={{ marginBottom: 20 }}>Sign in to continue</CustomText>
        
        <Input
          label="Email"
          placeholder="Enter your email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          Icon={(props) => <MailIcon {...props} width={16} height={16} />}
        />
        
        <Input
          label="Password"
          placeholder="Enter your password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          Icon={(props) => <KeyIcon {...props} />}
          additionalElement={
            <Pressable onPress={() => {
              router.push("/forgot-password");
            }}>
              <CustomText style={{ color: "#548CEB", fontSize: 12 }}>Forgot Password?</CustomText>
            </Pressable>
          }
        />
        
        <View style={styles.buttonsWrapper}>
          <Button
            title={loading ? "Loading..." : "Login with email"}
            variant="primary"
            onPress={handleEmailLogin}
            disabled={loading}
            Icon={(props) => loading ? 
              <ActivityIndicator color="#fff" size="small" /> : 
              <LoginIcon {...props} color="#fff" />
            }
          />

          <Button
            title="Register with email"
            variant="secondary"
            onPress={() => {
              router.push("/register");
            }}
            disabled={loading}
            Icon={(props) => <MailIcon {...props} color="#fff" />}
          />
          
          <Button
            title={loading ? "Loading..." : "Continue with Google"}
            variant="ghost"
            onPress={handleGoogleLogin}
            disabled={loading}
            Icon={(props) => loading ?
              <ActivityIndicator color="#4285f4" size="small" /> :
              <GoogleIcon {...props} width={24} height={24} translateX={-4} />
            }
          />
        </View>
      </View>
      <PawTrail animationValues={animationValues} />
    </View>
  );
}

const styles = StyleSheet.create({
  buttonsWrapper: {
    flexDirection: "column",
    marginTop: 30,
    gap: 10
  },
});