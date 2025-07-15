import React from "react";
import { Image, StyleSheet, View } from "react-native";

const SplashScreen: React.FC = () => {
  return (
    <View style={styles.background}>
      <Image
        source={require("../assets/images/puppins-splash-logo.png")}
        style={styles.logo}
      ></Image>
    </View>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    height: "100%",
    backgroundColor: "#F4E8D8",
  },
  logo: {
    width: 292,
    height: 292,
  },
});

export default SplashScreen;
