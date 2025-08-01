// app/reset-password.tsx
import React, { useEffect, useState } from "react";
import { View, ActivityIndicator } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { CustomText } from "@/components/ui/CustomText";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { PawTrail } from "@/components/ui/PawTrail";
import { animationValues } from "@/constants/AnimationValues";
import { useAuth } from "@/contexts/AuthContext";
import { useFormValidation } from "@/hooks/useFormValidation";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import KeyIcon from "@/assets/icons/key.svg";
// import CheckIcon from "@/assets/icons/check.svg";

export default function ResetPasswordScreen() {
  const { resetPassword, resetPasswordLoading } = useAuth();
  const params = useLocalSearchParams();
  const token = params.token as string;
  const [passwordChanged, setPasswordChanged] = useState(false);

  const { values, errors, setValue, validate, setFieldError, clearErrors } = useFormValidation(
    { 
      newPassword: '',
      confirmPassword: ''
    },
    {
      newPassword: { required: true, minLength: 6 },
      confirmPassword: { required: true, minLength: 6 }
    }
  );

  useEffect(() => {
    if (!token) {
      router.replace("/(auth)/login");
    }
  }, [token]);

  const handleResetPassword = async () => {
    if (!validate()) return;

    if (values.newPassword !== values.confirmPassword) {
      setFieldError('confirmPassword', 'Lozinke se ne poklapaju');
      return;
    }

    if (!token) {
      alert('Neispravan reset token');
      return;
    }

    try {
      clearErrors();
      await resetPassword(token, values.newPassword);
      setPasswordChanged(true);
    } catch (error: any) {
      if (error.message?.includes("token")) {
        alert('Reset link je istekao. Zatražite novi reset email.');
        router.replace("/(auth)/forgot-password");
      } else {
        setFieldError('newPassword', 'Greška pri resetovanju lozinke');
      }
    }
  };

  if (!token) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#ef8a32" />
      </View>
    );
  }

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
          {passwordChanged ? (
            // Success view
            <>
              <CustomText type="title" style={{ marginBottom: 4 }}>
                Password changed!
              </CustomText>
              <CustomText
                type="subtitle-small"
                style={{ marginBottom: 20, paddingHorizontal: 20 }}
              >
                Your password has been successfully changed.
              </CustomText>
              
              <View style={{
                alignItems: 'center',
                padding: 20,
                backgroundColor: '#f8f9fa',
                borderRadius: 12,
                marginBottom: 20,
              }}>
                <CustomText style={{ textAlign: 'center', marginTop: 16, marginBottom: 24 }}>
                  You can now log in with your new password.
                </CustomText>
              </View>

              <Button
                title="Go to login"
                variant="primary"
                onPress={() => router.replace("/(auth)/login")}
              />
            </>
          ) : (
            // Form view
            <>
              <CustomText type="title" style={{ marginBottom: 4 }}>
                Reset password
              </CustomText>
              <CustomText
                type="subtitle-small"
                style={{ marginBottom: 20, paddingHorizontal: 20 }}
              >
                Enter your new password below
              </CustomText>
              
              <Input
                label="New password"
                placeholder="Enter new password"
                value={values.newPassword}
                onChangeText={(text) => setValue('newPassword', text)}
                secureTextEntry
                autoCapitalize="none"
                error={errors.newPassword}
                Icon={(props) => <KeyIcon {...props} />}
              />

              <Input
                label="Confirm password"
                placeholder="Confirm new password"
                value={values.confirmPassword}
                onChangeText={(text) => setValue('confirmPassword', text)}
                secureTextEntry
                autoCapitalize="none"
                error={errors.confirmPassword}
                Icon={(props) => <KeyIcon {...props} />}
              />
              
              <View style={{ marginTop: 30 }}>
                <Button
                  title="Change password"
                  variant="primary"
                  onPress={handleResetPassword}
                  disabled={resetPasswordLoading}
                  Icon={(props) =>
                    resetPasswordLoading ? (
                      <ActivityIndicator color="#fff" size="small" />
                    ) : (
                      <KeyIcon {...props} color="#fff" />
                    )
                  }
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