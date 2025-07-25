import React from "react";
import { ActivityIndicator, Image, StyleSheet, View } from "react-native";

const SplashScreen: React.FC = () => {
  return (
    <View style={styles.background}>
      {/* <Image
        source={require("../assets/images/puppins-splash-logo.png")}
        style={styles.logo}
      /> */}
      <ActivityIndicator 
        size="large" 
        color="#ef8a32" 
        style={styles.spinner}
      />
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
    // backgroundColor: "#F4E8D8",
    backgroundColor: "#fff",
  },
  logo: {
    width: 292,
    height: 292,
    marginBottom: 40, // Razmak između loga i spinnera
  },
  spinner: {
    // Možeš dodati dodatno stilizovanje ako treba
  },
});

export default SplashScreen;