import SplashScreenCustomComponent from "@/components/SplashScreen";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { useColorScheme } from "@/hooks/useColorScheme";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useCallback, useEffect, useState } from "react";
import { Platform, View } from "react-native";
import "react-native-reanimated";
import * as NavigationBar from "expo-navigation-bar";
import * as SystemUI from "expo-system-ui";

SplashScreen.preventAutoHideAsync();

SplashScreen.setOptions({
  duration: 1000,
  fade: true,
});

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [appIsReady, setAppIsReady] = useState(false);
  const [fontsLoaded, fontError] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
    HeadingFont: require("../assets/fonts/BreeSerif-Regular.ttf"),
    DefaultRegular: require("../assets/fonts/Inter-Regular.ttf"),
    DefaultMedium: require("../assets/fonts/Inter-Medium.ttf"),
    DefaultSemiBold: require("../assets/fonts/Inter-SemiBold.ttf"),
  });

  useEffect(() => {
    async function prepare() {
      try {
        await new Promise((resolve) => setTimeout(resolve, 2000));
      } catch (e) {
        console.warn(e);
      } finally {
        setAppIsReady(true);
      }
    }

    prepare();
  }, []);

  const onLayoutRootView = useCallback(async () => {
    if (appIsReady && fontsLoaded) {
      SplashScreen.hide();
    }
  }, [appIsReady, fontsLoaded]);

      useEffect(() => {
    if (Platform.OS === "android") {
      NavigationBar.setBackgroundColorAsync("#fff");
      SystemUI.setBackgroundColorAsync("#fff");

      colorScheme === "dark"
        ? NavigationBar.setButtonStyleAsync("light")
        : NavigationBar.setButtonStyleAsync("dark");
    }
  }, [colorScheme]);

  if (!appIsReady || !fontsLoaded) {
    return null;
  }

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <AuthProvider>
        <View style={{ flex: 1 }} onLayout={onLayoutRootView}>
          <RootNavigator />
          <StatusBar
            style={"light"}
            translucent
            backgroundColor="transparent"
          />
        </View>
      </AuthProvider>
    </ThemeProvider>
  );
}

const RootNavigator = () => {
  const { isAuthenticated } = useAuth();

  return (
    <Stack screenOptions={{ headerShown: false }} initialRouteName="(auth)/login">
      <Stack.Protected guard={isAuthenticated}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack.Protected>

      <Stack.Protected guard={!isAuthenticated}>
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      </Stack.Protected>
      <Stack.Screen name="+not-found" />
      <Stack.Screen name="index" />
    </Stack>
  );
};
