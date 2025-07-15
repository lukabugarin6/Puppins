import Button from "@/components/ui/Button";
import { CustomText } from "@/components/ui/CustomText";
import Input from "@/components/ui/Input";
import { PawTrail } from "@/components/ui/PawTrail";
import { animationValues } from "@/constants/AnimationValues";
import { router } from "expo-router";
import { useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import MailIcon from "../assets/icons/email.svg";
import GoogleIcon from "../assets/icons/google.svg";
import KeyIcon from "../assets/icons/key.svg";
import LoginIcon from "../assets/icons/login.svg";

export default function LoginScreen() {
  const [opacities, setOpacities] = useState([]);

  const [progress, setProgress] = useState(0);
  const [appIsReady, setAppIsReady] = useState(false);

  return (
    <View style={{ flex: 1, backgroundColor: "#fff", justifyContent: "center", padding: 20, paddingBottom: 80 }}>
      <View style={{ zIndex: 2 }}>
        <CustomText type="title" style={{ marginBottom: 4 }}>Welcome!</CustomText>
        <CustomText type="subtitle-small" style={{ marginBottom: 20 }}>Sign in to continue</CustomText>
        <Input
          label="Email"
          placeholder="Enter your email"
          secureTextEntry
          Icon={(props) => <MailIcon {...props} width={16} height={16} />}
        />
        <Input
          label="Password"
          placeholder="Enter your password"
          secureTextEntry
          Icon={(props) => <KeyIcon {...props} />}
          additionalElement={
            <Pressable onPress={() => {
              router.replace("/forgot-password");
            }}>
              <CustomText style={{ color: "#548CEB", fontSize: 12 }}>Forgot Password?</CustomText>
            </Pressable>
          }
        />
        <View style={styles.buttonsWrapper} >
          <Button
            title="Login with email"
            variant="primary"
            onPress={() => console.log("Login pressed")}
            Icon={(props) => <LoginIcon {...props} color="#fff" />}
          />

          <Button
            title="Register with email"
            variant="secondary"
            onPress={() => {
              router.replace("/register");
            }}
            Icon={(props) => <MailIcon {...props} color="#fff" />}
          />
          <Button
            title="Continue with google"
            variant="ghost"
            onPress={() => console.log("Login pressed")}
            Icon={(props) =>
              <GoogleIcon {...props} width={24} height={24} translateX={-4} />}
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
