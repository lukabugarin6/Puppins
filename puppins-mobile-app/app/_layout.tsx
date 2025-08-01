// app/_layout.tsx
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
import * as Linking from "expo-linking";
import { router } from "expo-router";

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
   if (Platform.OS === "android") {
     NavigationBar.setBackgroundColorAsync("red");
     SystemUI.setBackgroundColorAsync("#fff");

     NavigationBar.setButtonStyleAsync("dark");
     // colorScheme === "dark"
     //   ? NavigationBar.setButtonStyleAsync("light")
     //   : NavigationBar.setButtonStyleAsync("dark");
   }
 }, [colorScheme]);

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

 if (!appIsReady || !fontsLoaded) {
   return null;
 }

 return (
   <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
     <AuthProvider>
       <View style={{ flex: 1 }} onLayout={onLayoutRootView}>
         <RootNavigator />
         <StatusBar style={"dark"} translucent backgroundColor="transparent" />
       </View>
     </AuthProvider>
   </ThemeProvider>
 );
}

const RootNavigator = () => {
 const { isAuthenticated, verifyEmail, resetPassword } = useAuth();

 useEffect(() => {
   const handleDeepLink = async (url: string) => {
     console.log("Deep link received:", url);
     
     // Samo handleuj auth-related deep linkove kada nije ulogovan
     if (!isAuthenticated) {
       if (url.includes("/reset-password")) {
         const urlParams = new URLSearchParams(url.split("?")[1]);
         const token = urlParams.get("token");
         if (token) {
           router.push(`/reset-password?token=${token}`);
         } else {
           console.error("No token found in reset password deep link");
           router.replace("/(auth)/forgot-password");
         }
       } else if (url.includes("/verified")) {
         const urlParams = new URLSearchParams(url.split("?")[1]);
         const token = urlParams.get("token");
         if (token) {
           try {
             await verifyEmail(token);
           } catch (error) {
             console.error("Auto verification failed:", error);
             router.push(`/verified?token=${token}`);
           }
         } else {
           router.replace("/(auth)/login");
         }
       }
     }
     // Ako je ulogovan, ignoriši auth deep linkove
     else {
       console.log("User is authenticated, ignoring auth deep links");
     }
   };

   // Handleuj deep link kada se app otvori
   Linking.getInitialURL().then((url) => {
     if (url) {
       console.log("Initial URL:", url);
       handleDeepLink(url);
     }
   });

   // Handleuj deep link kada je app već otvoren
   const subscription = Linking.addEventListener("url", ({ url }) => {
     console.log("URL event:", url);
     handleDeepLink(url);
   });

   return () => subscription?.remove();
 }, [isAuthenticated, verifyEmail, resetPassword]);

 return (
   <Stack
     screenOptions={{
       headerShown: false,
       animation: "fade",
       animationDuration: 250,
     }}
     initialRouteName="(auth)/login"
   >
     <Stack.Protected guard={isAuthenticated}>
       <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
     </Stack.Protected>

     <Stack.Protected guard={!isAuthenticated}>
       <Stack.Screen name="(auth)" options={{ headerShown: false }} />
       <Stack.Screen name="reset-password" options={{ headerShown: false }} />
       <Stack.Screen name="verified" options={{ headerShown: false }} />
     </Stack.Protected>
     <Stack.Screen name="+not-found" />
   </Stack>
 );
};