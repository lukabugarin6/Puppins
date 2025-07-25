import { useCallback, useState } from "react";
import { useFocusEffect } from "@react-navigation/native";
import Button from "@/components/ui/Button";
import { CustomText } from "@/components/ui/CustomText";
import Input from "@/components/ui/Input";
import { PawTrail } from "@/components/ui/PawTrail";
import { animationValues } from "@/constants/AnimationValues";
import { router } from "expo-router";
import { StyleSheet, View, ScrollView, ActivityIndicator } from "react-native";
import MailIcon from "@/assets/icons/email.svg";
import KeyIcon from "@/assets/icons/key.svg";
import UndoIcon from "@/assets/icons/undo.svg";
import UserIcon from "@/assets/icons/user.svg";
import UsersIcon from "@/assets/icons/users.svg";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { useAuth } from "@/contexts/AuthContext";
import { useFormValidation } from "@/hooks/useFormValidation";

export default function RegisterScreen() {
  const {
    signUp,
    signUpLoading,
    verificationMessage,
    resendVerification,
    emailVerificationLoading,
  } = useAuth();
  const [showSuccessView, setShowSuccessView] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState("");

  const { values, errors, setValue, validate, setFieldError, clearErrors } =
    useFormValidation(
      {
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        confirmPassword: "",
      },
      {
        firstName: { required: true },
        lastName: { required: true },
        email: { required: true, email: true },
        password: { required: true, minLength: 6 },
        confirmPassword: {
          required: true,
          custom: (value: string) => {
            if (value !== values.password) {
              return "Lozinke se ne poklapaju";
            }
            return null;
          },
        },
      }
    );

  const handleRegister = async () => {
    if (!validate()) return;

    try {
      clearErrors();
      await signUp(
        values.firstName.trim(),
        values.lastName.trim(),
        values.email.trim(),
        values.password
      );

      setRegisteredEmail(values.email);
      setShowSuccessView(true);
    } catch (error: any) {
      // Server greške
      if (
        error.message?.includes("već postoji") ||
        error.message?.includes("already exists")
      ) {
        setFieldError("email", "Email već postoji");
      } else if (error.message?.includes("email")) {
        setFieldError("email", "Nevaljan email format");
      } else {
        setFieldError("email", "Greška pri registraciji");
      }
    }
  };

  const handleBackToLogin = () => {
    setShowSuccessView(false); // Reset lokalni state
    router.replace("/(auth)/login");
  };

  useFocusEffect(
    useCallback(() => {
      // Ova funkcija se poziva kada se screen fokusira

      // Return cleanup funkcija koja se poziva kada se screen unfocus-uje
      return () => {
        // Reset state kada korisnik napusti screen (back dugme, navigacija, itd.)
        setShowSuccessView(false);
        setRegisteredEmail("");
      };
    }, [])
  );

  return (
    <KeyboardAwareScrollView
      contentContainerStyle={{ flexGrow: 1 }}
      keyboardShouldPersistTaps="handled"
      enableOnAndroid={true}
      extraScrollHeight={20}
    >
      <ScrollView
        contentContainerStyle={{
          justifyContent: "center",
          flexGrow: 1,
          backgroundColor: "#fff",
          padding: 20,
        }}
      >
        {showSuccessView ? (
          <View style={{ zIndex: 2 }}>
            <CustomText type="title" style={{ marginBottom: 4 }}>
              Check your email!
            </CustomText>
            <CustomText type="subtitle-small" style={{ marginBottom: 20 }}>
              {verificationMessage}
            </CustomText>

            <View style={styles.successContainer}>
              <MailIcon width={48} height={48} color="#ef8a32" />
              <CustomText
                style={{
                  textAlign: "center",
                  marginTop: 16,
                  marginBottom: 16,
                  fontWeight: "600",
                }}
              >
                Check your email
              </CustomText>
              <CustomText
                style={{ textAlign: "center", marginBottom: 24, color: "#666" }}
              >
                We've sent a verification link to {registeredEmail}. Tap the
                link in your email to activate your account and you'll be
                automatically signed in.
              </CustomText>

              <CustomText
                style={{
                  textAlign: "center",
                  fontSize: 12,
                  color: "#888",
                  marginBottom: 16,
                }}
              >
                Can't find the email? Check your spam folder.
              </CustomText>
            </View>

            <View style={styles.buttonsWrapper}>
              <Button
                title="Back to login"
                variant="primary"
                onPress={handleBackToLogin}
                Icon={(props) => <UndoIcon {...props} color="#fff" />}
              />
              <Button
                title="Resend email"
                variant="secondary"
                onPress={() => resendVerification(registeredEmail)}
                disabled={emailVerificationLoading}
                Icon={(props) =>
                  emailVerificationLoading ? (
                    <ActivityIndicator color="#fff" size="small" />
                  ) : (
                    <MailIcon {...props} color="#fff" />
                  )
                }
              />
            </View>
          </View>
        ) : (
          <View style={{ zIndex: 2 }}>
            <CustomText type="title" style={{ marginBottom: 4 }}>
              First time here?
            </CustomText>
            <CustomText type="subtitle-small" style={{ marginBottom: 20 }}>
              Register to continue
            </CustomText>

            <Input
              label="First name"
              placeholder="Enter your first name"
              value={values.firstName}
              onChangeText={(text) => setValue("firstName", text)}
              error={errors.firstName}
              Icon={(props) => <UserIcon {...props} width={16} height={16} />}
            />

            <Input
              label="Last name"
              placeholder="Enter your last name"
              value={values.lastName}
              onChangeText={(text) => setValue("lastName", text)}
              error={errors.lastName}
              Icon={(props) => <UsersIcon {...props} width={16} height={16} />}
            />

            <Input
              label="Email"
              placeholder="Enter your email"
              value={values.email}
              onChangeText={(text) => setValue("email", text)}
              keyboardType="email-address"
              autoCapitalize="none"
              error={errors.email}
              Icon={(props) => <MailIcon {...props} width={16} height={16} />}
            />

            <Input
              label="Password"
              placeholder="Enter your password"
              value={values.password}
              onChangeText={(text) => setValue("password", text)}
              secureTextEntry
              autoCapitalize="none"
              error={errors.password}
              Icon={(props) => <KeyIcon {...props} />}
            />

            <Input
              label="Confirm Password"
              placeholder="Enter your password again"
              value={values.confirmPassword}
              onChangeText={(text) => setValue("confirmPassword", text)}
              secureTextEntry
              autoCapitalize="none"
              error={errors.confirmPassword}
              Icon={(props) => <KeyIcon {...props} />}
            />

            <View style={styles.buttonsWrapper}>
              <Button
                title="Register"
                variant="primary"
                onPress={handleRegister}
                disabled={signUpLoading}
                Icon={(props) =>
                  signUpLoading ? (
                    <ActivityIndicator color="#fff" size="small" />
                  ) : (
                    <MailIcon {...props} color="#fff" />
                  )
                }
              />
              <Button
                title="Back to login"
                variant="secondary"
                onPress={() => {
                  router.replace("/(auth)/login");
                }}
                Icon={(props) => <UndoIcon {...props} color="#fff" />}
              />
            </View>
          </View>
        )}

        <PawTrail animationValues={animationValues} />
      </ScrollView>
    </KeyboardAwareScrollView>
  );
}

const styles = StyleSheet.create({
  buttonsWrapper: {
    flexDirection: "column",
    marginTop: 22,
    gap: 10,
  },
  successContainer: {
    alignItems: "center",
    padding: 20,
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
    marginBottom: 20,
  },
});
