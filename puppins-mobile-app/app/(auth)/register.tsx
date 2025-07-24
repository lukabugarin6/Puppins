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
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import MailIcon from "../assets/icons/email.svg";
import KeyIcon from "../assets/icons/key.svg";
import UndoIcon from "../assets/icons/undo.svg";
import UserIcon from "../assets/icons/user.svg";
import UsersIcon from "../assets/icons/users.svg";

export default function RegisterScreen() {
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
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
            secureTextEntry
            Icon={(props) => <UserIcon {...props} width={16} height={16} />}
          />
          <Input
            label="Last name"
            placeholder="Enter your last name"
            secureTextEntry
            Icon={(props) => <UsersIcon {...props} width={16} height={16} />}
          />
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
          />
          <Input
            label="Confirm Password"
            placeholder="Enter your password again"
            secureTextEntry
            Icon={(props) => <KeyIcon {...props} />}
          />
          <View style={styles.buttonsWrapper}>
            <Button
              title="Register"
              variant="primary"
              onPress={() => console.log("Login pressed")}
              Icon={(props) => <MailIcon {...props} color="#fff" />}
            />
            <Button
              title="Back to login"
              variant="secondary"
              onPress={() => {
                router.replace("/");
              }}
              Icon={(props) => <UndoIcon {...props} color="#fff" />}
            />
          </View>
        </View>
        <PawTrail animationValues={animationValues} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  buttonsWrapper: {
    flexDirection: "column",
    marginTop: 30,
    gap: 10,
  },
});
