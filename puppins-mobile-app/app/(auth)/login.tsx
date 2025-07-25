import Button from "@/components/ui/Button";
import { CustomText } from "@/components/ui/CustomText";
import Input from "@/components/ui/Input";
import { PawTrail } from "@/components/ui/PawTrail";
import { animationValues } from "@/constants/AnimationValues";
import { router } from "expo-router";
import { Pressable, StyleSheet, View, ActivityIndicator } from "react-native";
import MailIcon from "@/assets/icons/email.svg";
import GoogleIcon from "@/assets/icons/google.svg";
import KeyIcon from "@/assets/icons/key.svg";
import LoginIcon from "@/assets/icons/login.svg";
import { useAuth } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { useFormValidation } from "@/hooks/useFormValidation";

export default function LoginScreen() {
  const { signInWithGoogle, signInWithEmail, loading, googleLoading } = useAuth();

  const { values, errors, setValue, validate, setFieldError, clearErrors } = useFormValidation(
    { email: '', password: '' },
    {
      email: { required: true, email: true },
      password: { required: true, minLength: 6 }
    }
  );

  const handleEmailLogin = async () => {
    if (!validate()) return;

    try {
      await signInWithEmail(values.email, values.password);
    } catch (error: any) {
      // Server greške
      if (error.message?.includes("email") || error.message?.includes("password")) {
        setFieldError('email', 'Nepostojeći email ili pogrešna lozinka');
      } else {
        setFieldError('email', 'Greška pri prijavljivanju');
      }
    }
  };

  const handleGoogleLogin = async () => {
    clearErrors();
    await signInWithGoogle();
  };

  return (
    <ProtectedRoute requireAuth={false}>
      <KeyboardAwareScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
        enableOnAndroid={true}
        extraScrollHeight={20}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: "#fff",
            justifyContent: "center",
            padding: 20,
            paddingBottom: 80,
          }}
        >
          <View style={{ zIndex: 2 }}>
            <CustomText type="title" style={{ marginBottom: 4 }}>
              Welcome!
            </CustomText>
            <CustomText type="subtitle-small" style={{ marginBottom: 20 }}>
              Sign in to continue
            </CustomText>

            <Input
              label="Email"
              placeholder="Enter your email"
              value={values.email}
              onChangeText={(text) => setValue('email', text)}
              keyboardType="email-address"
              autoCapitalize="none"
              error={errors.email}
              Icon={(props) => <MailIcon {...props} width={16} height={16} />}
            />

            <Input
              label="Password"
              placeholder="Enter your password"
              value={values.password}
              onChangeText={(text) => setValue('password', text)}
              secureTextEntry
              autoCapitalize="none"
              error={errors.password}
              Icon={(props) => <KeyIcon {...props} />}
              additionalElement={
                <Pressable onPress={() => router.push("/forgot-password")}>
                  <CustomText style={{ color: "#548CEB", fontSize: 12 }}>
                    Forgot Password?
                  </CustomText>
                </Pressable>
              }
            />

            <View style={styles.buttonsWrapper}>
              <Button
                title="Login with email"
                variant="primary"
                onPress={handleEmailLogin}
                disabled={loading}
                Icon={(props) =>
                  loading ? (
                    <ActivityIndicator color="#fff" size="small" />
                  ) : (
                    <LoginIcon {...props} color="#fff" />
                  )
                }
              />

              <Button
                title="Register with email"
                variant="secondary"
                onPress={() => router.push("/register")}
                disabled={googleLoading}
                Icon={(props) => <MailIcon {...props} color="#fff" />}
              />

              <Button
                title="Continue with Google"
                variant="ghost"
                onPress={handleGoogleLogin}
                disabled={googleLoading}
                Icon={(props) =>
                  googleLoading ? (
                    <ActivityIndicator color="#fff" size="small" />
                  ) : (
                    <GoogleIcon {...props} width={24} height={24} translateX={-4} />
                  )
                }
              />
            </View>
          </View>
          <PawTrail animationValues={animationValues} />
        </View>
      </KeyboardAwareScrollView>
    </ProtectedRoute>
  );
}

const styles = StyleSheet.create({
  buttonsWrapper: {
    flexDirection: "column",
    marginTop: 30,
    gap: 10,
  },
});