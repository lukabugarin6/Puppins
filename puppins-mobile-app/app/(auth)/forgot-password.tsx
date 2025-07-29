// app/(auth)/forgot-password.tsx
import React, { useCallback, useState } from "react";
import Button from "@/components/ui/Button";
import { CustomText } from "@/components/ui/CustomText";
import Input from "@/components/ui/Input";
import { PawTrail } from "@/components/ui/PawTrail";
import { animationValues } from "@/constants/AnimationValues";
import { router } from "expo-router";
import { StyleSheet, View, ActivityIndicator } from "react-native";
import MailIcon from "@/assets/icons/email.svg";
import SendIcon from "@/assets/icons/send.svg";
import UndoIcon from "@/assets/icons/undo.svg";
import { useAuth } from "@/contexts/AuthContext";
import { useFormValidation } from "@/hooks/useFormValidation";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { useFocusEffect } from "@react-navigation/native";

export default function ForgotPasswordScreen() {
  const { forgotPassword, forgotPasswordLoading } = useAuth();
  const [emailSent, setEmailSent] = useState(false);

  const { values, errors, setValue, validate, setFieldError, clearErrors } = useFormValidation(
    { email: '' },
    {
      email: { required: true, email: true }
    }
  );

  const handleForgotPassword = async () => {
    if (!validate()) return;

    try {
      clearErrors();
      await forgotPassword(values.email.trim());
      setEmailSent(true);
    } catch (error: any) {
      if (error.message?.includes("email")) {
        setFieldError('email', 'Nevaljan email format');
      } else {
        setFieldError('email', 'Greška pri slanju reset email-a');
      }
    }
  };

    useFocusEffect(
      useCallback(() => {
        // Ova funkcija se poziva kada se screen fokusira
  
        // Return cleanup funkcija koja se poziva kada se screen unfocus-uje
        return () => {
          // Reset state kada korisnik napusti screen (back dugme, navigacija, itd.)
          setEmailSent(false);
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
          {emailSent ? (
            // Success view
            <>
              <CustomText type="title" style={{ marginBottom: 4 }}>
                Check your email!
              </CustomText>
              <CustomText
                type="subtitle-small"
                style={{ marginBottom: 20, paddingHorizontal: 20 }}
              >
                We've sent password reset instructions to {values.email}
              </CustomText>
              
              <View style={styles.successContainer}>
                <MailIcon width={48} height={48} color="#ef8a32" />
                <CustomText style={{ textAlign: 'center', marginTop: 16, marginBottom: 24 }}>
                  Click the link in your email to reset your password. 
                  The link will expire in 1 hour.
                </CustomText>
              </View>

              <View style={styles.buttonsWrapper}>
                <Button
                  title="Back to login"
                  variant="primary"
                  onPress={() => router.replace("/(auth)/login")}
                  Icon={(props) => <UndoIcon {...props} color="#fff" />}
                />
                  <Button
                  title="Resend email"
                  variant="secondary"
                  onPress={() => {
                    setEmailSent(false);
                    handleForgotPassword();
                  }}
                  disabled={forgotPasswordLoading}
                  Icon={(props) => 
                    forgotPasswordLoading ? (
                      <ActivityIndicator color="#fff" size="small" />
                    ) : (
                      <SendIcon {...props} color="#fff" />
                    )
                  }
                />
              </View>
            </>
          ) : (
            // Form view
            <>
              <CustomText type="title" style={{ marginBottom: 4 }}>
                Forgot password?
              </CustomText>
              <CustomText
                type="subtitle-small"
                style={{ marginBottom: 20, paddingHorizontal: 40 }}
              >
                Enter your email so we could send you instructions for resetting your password
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
              
              <View style={styles.buttonsWrapper}>
                <Button
                  title="Send instructions"
                  variant="primary"
                  onPress={handleForgotPassword}
                  disabled={forgotPasswordLoading}
                  Icon={(props) =>
                    forgotPasswordLoading ? (
                      <ActivityIndicator color="#fff" size="small" />
                    ) : (
                      <SendIcon {...props} color="#fff" />
                    )
                  }
                />
                <Button
                  title="Back to login"
                  variant="secondary"
                  onPress={() => router.replace("/(auth)/login")}
                  Icon={(props) => <UndoIcon {...props} color="#fff" />}
                />
              </View>
            </>
          )}
        </View>
        <PawTrail animationValues={animationValues} />
      </View>
    </KeyboardAwareScrollView>
  );
}

const styles = StyleSheet.create({
  buttonsWrapper: {
    flexDirection: "column",
    marginTop: 30,
    gap: 10,
  },
  successContainer: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    marginBottom: 20,
  },
});