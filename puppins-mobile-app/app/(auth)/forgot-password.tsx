import Button from "@/components/ui/Button";
import { CustomText } from "@/components/ui/CustomText";
import Input from "@/components/ui/Input";
import { PawTrail } from "@/components/ui/PawTrail";
import { animationValues } from "@/constants/AnimationValues";
import { router } from "expo-router";
import { StyleSheet, View } from "react-native";
import MailIcon from "@/assets/icons/email.svg";
import SendIcon from "@/assets/icons/send.svg";
import UndoIcon from "@/assets/icons/undo.svg";

export default function ForgotPasswordScreen() {
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: "#fff",
        justifyContent: "center",
        padding: 20,
        paddingBottom: 80
      }}
    >
      <View style={{ zIndex: 2 }}>
        <CustomText type="title" style={{ marginBottom: 4 }}>
          Forgot password?
        </CustomText>
        <CustomText
          type="subtitle-small"
          style={{ marginBottom: 20, paddingHorizontal: 40 }}
        >
          Enter your email so we could send you instructions for resetting your
          password
        </CustomText>
        <Input
          label="Email"
          placeholder="Enter your email"
          secureTextEntry
          Icon={(props) => <MailIcon {...props} width={16} height={16} />}
        />
        <View style={styles.buttonsWrapper}>
          <Button
            title="Send instructions"
            variant="primary"
            onPress={() => console.log("Login pressed")}
            Icon={(props) => <SendIcon {...props} color="#fff" />}
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
    </View>
  );
}

const styles = StyleSheet.create({
  buttonsWrapper: {
    flexDirection: "column",
    marginTop: 30,
    gap: 10,
  },
});
