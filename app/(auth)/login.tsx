import AuthButton from "@/components/auth/AuthButton";
import AuthInput from "@/components/auth/AuthInput";
import SocialButton from "@/components/auth/SocialButton";
import { useLogin } from "@/features/auth/auth.hooks";
import { AuthService } from "@/features/auth/auth.services";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useRouter } from "expo-router";
import { styled } from "nativewind";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";
import { z } from "zod";

const SafeAreaView = styled(RNSafeAreaView);

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginScreen() {
  const router = useRouter();
  const login = useLogin();
  const [socialLoading, setSocialLoading] = useState<
    "google" | "github" | null
  >(null);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (data: LoginFormValues) => {
    try {
      const result = await login.mutateAsync(data);
      if (result?.error) {
        Alert.alert(
          "Sign In Failed",
          result.error.message ?? "Invalid email or password.",
        );
        return;
      }
      router.replace("/(tabs)");
    } catch {
      Alert.alert("Sign In Failed", "Something went wrong. Please try again.");
    }
  };

  const handleSocialLogin = async (provider: "google" | "github") => {
    try {
      setSocialLoading(provider);
      await AuthService.signInWithSocial(provider);
    } catch {
      Alert.alert(
        "Sign In Failed",
        `Could not sign in with ${provider}. Please try again.`,
      );
    } finally {
      setSocialLoading(null);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: "center",
            paddingHorizontal: 24,
            paddingVertical: 40,
          }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View className="mb-10">
            <Text className="text-4xl font-sans-extrabold text-primary">
              Welcome back
            </Text>
            <Text className="mt-2 text-base font-sans-medium text-muted-foreground">
              Sign in to your account to continue
            </Text>
          </View>

          {/* Social Login */}
          <View className="gap-3">
            <SocialButton
              provider="google"
              loading={socialLoading === "google"}
              disabled={isSubmitting || socialLoading !== null}
              onPress={() => handleSocialLogin("google")}
            />
            <SocialButton
              provider="github"
              loading={socialLoading === "github"}
              disabled={isSubmitting || socialLoading !== null}
              onPress={() => handleSocialLogin("github")}
            />
          </View>

          {/* Divider */}
          <View className="my-7 flex-row items-center gap-3">
            <View className="h-px flex-1 bg-border" />
            <Text className="text-sm font-sans-medium text-muted-foreground">
              or
            </Text>
            <View className="h-px flex-1 bg-border" />
          </View>

          {/* Form */}
          <View className="gap-4">
            <Controller
              control={control}
              name="email"
              render={({ field: { value, onChange, onBlur } }) => (
                <AuthInput
                  label="Email"
                  placeholder="you@example.com"
                  keyboardType="email-address"
                  textContentType="emailAddress"
                  autoComplete="email"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.email?.message}
                />
              )}
            />

            <Controller
              control={control}
              name="password"
              render={({ field: { value, onChange, onBlur } }) => (
                <View className="gap-1">
                  <AuthInput
                    label="Password"
                    placeholder="Enter your password"
                    textContentType="password"
                    autoComplete="password"
                    showPasswordToggle
                    secureTextEntry
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    error={errors.password?.message}
                  />
                  <Link href="/(auth)/forgot-password" asChild>
                    <Text className="self-end text-sm font-sans-semibold text-accent">
                      Forgot password?
                    </Text>
                  </Link>
                </View>
              )}
            />
          </View>

          {/* Submit */}
          <AuthButton
            title="Sign In"
            loading={isSubmitting}
            disabled={isSubmitting || socialLoading !== null}
            onPress={handleSubmit(onSubmit)}
            className="mt-6"
          />

          {/* Footer */}
          <View className="mt-8 flex-row items-center justify-center gap-1">
            <Text className="text-sm font-sans-medium text-muted-foreground">
              Don&apos;t have an account?
            </Text>
            <Link href="/(auth)/register" asChild>
              <Text className="text-sm font-sans-bold text-accent">
                Sign up
              </Text>
            </Link>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
