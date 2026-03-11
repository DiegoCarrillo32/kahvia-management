import { Stack } from "expo-router";
import { GluestackUIProvider } from "@gluestack-ui/themed";
import { config } from "@gluestack-ui/config";
import { useFonts } from "expo-font";
import { Text } from "react-native";
import { AuthProvider } from "../contexts/AuthContext";
import "../globals.css";

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    "Gotham": require("../assets/fonts/Gotham-Font/GothamMedium.ttf"),
    "Gotham-Bold": require("../assets/fonts/Gotham-Font/GothamBold.ttf"),
    "Gotham-Light": require("../assets/fonts/Gotham-Font/GothamLight.ttf"),
    "TitanOne": require("../assets/fonts/Titan_One/TitanOne-Regular.ttf"),
  });

  if (!fontsLoaded) {
    return <Text>Loading...</Text>;
  }

  return (
    <GluestackUIProvider config={config}>
      <AuthProvider>
        <Stack screenOptions={{ headerShown: false }} />
      </AuthProvider>
    </GluestackUIProvider>
  );
}
