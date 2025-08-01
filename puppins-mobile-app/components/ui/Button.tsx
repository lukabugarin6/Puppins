import React from "react";
import { Pressable, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SvgProps } from "react-native-svg";

type ButtonProps = {
  title: string;
  variant?: "primary" | "secondary" | "ghost";
  onPress: () => void;
  Icon?: React.FC<SvgProps>;
  disabled?: boolean;
};

const Button: React.FC<ButtonProps> = ({
  title,
  variant = "primary",
  onPress,
  Icon,
  disabled
}) => {
  const isPrimary = variant === "primary";
  const isGhost = variant === "ghost";

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      style={[
        styles.button,
        isPrimary ? styles.primary : isGhost ? styles.ghost : styles.secondary,
        disabled && styles.disabled
      ]}
      disabled={disabled}
    >
      <View style={styles.innerContainer}>
        <View style={styles.iconContainer}>
          {Icon && <Icon width={20} height={20} />}
        </View>
        <View style={styles.textContainer}>
          <Text
            style={[
              styles.text,
              isPrimary
                ? styles.primaryText
                : isGhost
                ? styles.ghostText
                : styles.secondaryText,
            ]}
          >
            {title}
          </Text>
        </View>
        <View style={styles.iconContainer} />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  disabled: {
    pointerEvents: "none",
    opacity: 0.7,
  },
  button: {
    paddingVertical: 12,
    borderRadius: 8,
    paddingHorizontal: 16,
  },
  primary: {
    backgroundColor: "#ef8a32",
  },
  secondary: {
    backgroundColor: "#000",
  },
  ghost: {
    backgroundColor: "#4285F4",
    borderColor: "#4285F4",
    borderWidth: 1,
  },
  innerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  iconContainer: {
    width: 24,
    alignItems: "flex-start",
    justifyContent: "center",
  },
  textContainer: {
    flex: 1,
    alignItems: "center",
  },
  text: {
    fontSize: 16,
    // fontWeight: '600',
    fontFamily: "DefaultMedium",
  },
  primaryText: {
    color: "#fff",
  },
  secondaryText: {
    color: "#fff",
  },
  ghostText: {
    color: "#fff",
  },
});

export default Button;
