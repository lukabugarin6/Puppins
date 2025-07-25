import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
  Pressable,
} from "react-native";
import { SvgProps } from "react-native-svg";
import { Ionicons } from "@expo/vector-icons";

type InputProps = TextInputProps & {
  label: string;
  Icon?: React.FC<SvgProps>;
  error?: string;
  additionalElement?: React.ReactNode;
};

const Input: React.FC<InputProps> = ({
  label,
  Icon,
  error,
  additionalElement,
  secureTextEntry,
  ...rest
}) => {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  // Određujemo da li treba prikazati toggle dugme na osnovu secureTextEntry prop-a
  const isPasswordField = secureTextEntry === true;

  return (
    <View style={styles.wrapper}>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.inputContainer, error && styles.inputError]}>
        {Icon && <Icon width={20} height={20} style={styles.icon} />}
        <TextInput
          style={styles.input}
          placeholderTextColor="#999"
          secureTextEntry={isPasswordField && !isPasswordVisible}
          {...rest}
        />

        {/* Toggle dugme se prikazuje samo ako je secureTextEntry true */}
        {isPasswordField && (
          <Pressable
            onPress={togglePasswordVisibility}
            style={styles.eyeButton}
          >
            <Ionicons
              name={isPasswordVisible ? "eye-outline" : "eye-off-outline"}
              size={20}
              color="#777"
            />
          </Pressable>
        )}
      </View>

      {error && <Text style={styles.errorText}>{error}</Text>}

      {additionalElement && (
        <View style={styles.additionalElement}>{additionalElement}</View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 22,
  },
  label: {
    marginBottom: 4,
    fontSize: 14,
    color: "#000",
    fontFamily: "DefaultMedium",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    // backgroundColor: '#fafafa',
  },
  input: {
    flex: 1,
    height: 46,
    fontSize: 14,
    color: "#000",
    fontFamily: "DefaultRegular",
  },
  icon: {
    marginRight: 8,
  },
  eyeButton: {
    padding: 8,
    left: 8,
  },
  inputError: {
    borderColor: "red",
  },
  errorText: {
    color: "red",
    fontSize: 12,
    position: "absolute",
    bottom: 0,
    left: 0,
    width: "70%", // umesto maxWidth
    flexWrap: "wrap",
    textAlign: "left",
    transform: "translate(0, 100%)"
  },
  additionalElement: {
    position: "absolute",
    bottom: -18,
    right: 0,
  },
});

export default Input;
