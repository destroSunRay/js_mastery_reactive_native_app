import { Link } from "expo-router";
import { Text, View } from "react-native";

export default function App() {
  return (
    <View className="flex-1 items-center justify-center bg-white">
      <Text className="text-xl font-bold text-blue-500">
        Welcome to Nativewind!
      </Text>
      <Link
        href="/(auth)/sign-in"
        className="mt-4 rounded bg-primary text-white px-4 py-2"
      >
        Go to Sign-In
      </Link>
      <Link
        href="/(auth)/sign-up"
        className="mt-4 rounded bg-primary text-white px-4 py-2"
      >
        Go to Sign-Up
      </Link>
      <Link
        href="/onboarding"
        className="mt-4 rounded bg-primary text-white px-4 py-2"
      >
        Go to Onboarding
      </Link>
      <Link
        href="/subscriptions"
        className="mt-4 rounded bg-primary text-white px-4 py-2"
      >
        Go to Subscriptions
      </Link>
      <Link
        href="/subscriptions/profile"
        className="mt-4 rounded bg-primary text-white px-4 py-2"
      >
        Go to Profile
      </Link>
    </View>
  );
}
