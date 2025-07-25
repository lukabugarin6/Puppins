import React from "react";
import Button from "@/components/ui/Button";
import { CustomText } from "@/components/ui/CustomText";
import Input from "@/components/ui/Input";
import { PawTrail } from "@/components/ui/PawTrail";
import { animationValues } from "@/constants/AnimationValues";
import { router } from "expo-router";
import {
  StyleSheet,
  View,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import MailIcon from "@/assets/icons/email.svg";
import KeyIcon from "@/assets/icons/key.svg";
import UndoIcon from "@/assets/icons/undo.svg";
import UserIcon from "@/assets/icons/user.svg";
import UsersIcon from "@/assets/icons/users.svg";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { useAuth } from "@/contexts/AuthContext";
import { useFormValidation } from "@/hooks/useFormValidation";

export default function RegisterScreen() {
  const { signUp, signUpLoading } = useAuth();

  const { values, errors, setValue, validate, setFieldError, clearErrors } = useFormValidation(
    { 
      firstName: '', 
      lastName: '', 
      email: '', 
      password: '', 
      confirmPassword: '' 
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
        }
      }
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
    } catch (error: any) {
      // Server greške
      if (error.message?.includes("već postoji") || error.message?.includes("already exists")) {
        setFieldError('email', 'Email već postoji');
      } else if (error.message?.includes("email")) {
        setFieldError('email', 'Nevaljan email format');
      } else {
        setFieldError('email', 'Greška pri registraciji');
      }
    }
  };

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
            onChangeText={(text) => setValue('firstName', text)}
            error={errors.firstName}
            Icon={(props) => <UserIcon {...props} width={16} height={16} />}
          />
          
          <Input
            label="Last name"
            placeholder="Enter your last name"
            value={values.lastName}
            onChangeText={(text) => setValue('lastName', text)}
            error={errors.lastName}
            Icon={(props) => <UsersIcon {...props} width={16} height={16} />}
          />
          
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
          />
          
          <Input
            label="Confirm Password"
            placeholder="Enter your password again"
            value={values.confirmPassword}
            onChangeText={(text) => setValue('confirmPassword', text)}
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
                  <UserIcon {...props} color="#fff" />
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
});