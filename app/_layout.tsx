import { useAuth } from "@/features/auth/auth.hooks";
import "@/global.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useFonts } from "expo-font";
import { SplashScreen, Stack, useRouter, useSegments } from "expo-router";
import { PostHogProvider } from "posthog-react-native";
import { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";

SplashScreen.preventAutoHideAsync();
const queryClient = new QueryClient();

function AuthGate({ children }: { children: React.ReactNode }) {
  const { data: session, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  const inAuthGroup = segments[0] === "(auth)";
  const isAuthenticated = !!session?.user;

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated && !inAuthGroup) {
      router.replace("/(auth)/login");
    } else if (isAuthenticated && inAuthGroup) {
      router.replace("/(tabs)");
    }
  }, [session, isLoading, segments, router, inAuthGroup, isAuthenticated]);

  // Keep spinner while: still fetching, OR a redirect is about to happen
  const redirectPending =
    !isLoading &&
    ((!isAuthenticated && !inAuthGroup) || (isAuthenticated && inAuthGroup));

  if (isLoading || redirectPending) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator size="large" color="#ea7a53" />
      </View>
    );
  }

  return <>{children}</>;
}

export default function RootLayout() {
  const [fontLoaded] = useFonts({
    "sans-regular": require("../assets/fonts/PlusJakartaSans-Regular.ttf"),
    "sans-light": require("../assets/fonts/PlusJakartaSans-Light.ttf"),
    "sans-medium": require("../assets/fonts/PlusJakartaSans-Medium.ttf"),
    "sans-semibold": require("../assets/fonts/PlusJakartaSans-SemiBold.ttf"),
    "sans-bold": require("../assets/fonts/PlusJakartaSans-Bold.ttf"),
    "sans-extrabold": require("../assets/fonts/PlusJakartaSans-ExtraBold.ttf"),
  });

  useEffect(() => {
    if (fontLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontLoaded]);

  if (!fontLoaded) {
    return null;
  }
  return (
    <PostHogProvider
      apiKey="phc_l8jYvMlIU6QJu4wEVXWEmKCHr3F8NRZrPIFypLlQP6s"
      options={{ host: "https://us.i.posthog.com" }}
    >
      <QueryClientProvider client={queryClient}>
        <AuthGate>
          <Stack screenOptions={{ headerShown: false }} />
        </AuthGate>
      </QueryClientProvider>
    </PostHogProvider>
  );
}
