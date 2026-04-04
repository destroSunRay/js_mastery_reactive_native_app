import { Link } from "expo-router";
import { styled } from "nativewind";
import React from "react";
import { Text, View } from "react-native";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";

const SafeAreaView = styled(RNSafeAreaView);

const subscriptions = () => {
  return (
    <SafeAreaView className="flex-1 bg-background p-5">
      <Text>subscriptions</Text>
      <View className="bg-primary p-4 mx-auto rounded-lg mt-4">
        <Link href="/(auth)/login" className="text-white">
          Go to Sign-In
        </Link>
      </View>
    </SafeAreaView>
  );
};

export default subscriptions;
