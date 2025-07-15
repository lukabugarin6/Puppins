 import { StyleSheet, Text, type TextProps } from "react-native";

import { useThemeColor } from "@/hooks/useThemeColor";

export type CustomTextProps = TextProps & {
  lightColor?: string;
  darkColor?: string;
  type?:
    | "default"
    | "title" 
    | "subtitle-small"
   
};

export function CustomText({
  style,
  lightColor = "#222222",
  darkColor = "#222222",
  type = "default",
  ...rest
}: CustomTextProps) {
  const color = useThemeColor({ light: lightColor, dark: darkColor }, "text");

  return (
    <Text
      style={[
        styles.defaultStyles,
        { color },
        type === "default" ? styles.default : undefined,
        type === "title" ? styles.title : undefined,
        type === "subtitle-small" ? styles.subtitleSmall : undefined,
        style,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  defaultStyles: {
    fontFamily: "DefaultRegular",
  },
  default: {
  },
  title: {
    fontSize: 32,
    fontFamily: "HeadingFont",
    lineHeight: 40,
    textAlign: "center"
  },
  subtitleSmall: {
    opacity: 0.5,
    fontSize: 12,
    fontFamily: "DefaultMedium",
    textAlign: "center",

  }
});
