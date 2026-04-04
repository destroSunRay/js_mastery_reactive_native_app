import AuthButton from "@/components/auth/AuthButton";
import AuthInput from "@/components/auth/AuthInput";
import PasswordStrength from "@/components/auth/PasswordStrength";
import SocialButton from "@/components/auth/SocialButton";
import { useSignUp } from "@/features/auth/auth.hooks";
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

const registerSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Please enter a valid email address"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Must contain an uppercase letter")
      .regex(/[a-z]/, "Must contain a lowercase letter")
      .regex(/[0-9]/, "Must contain a number")
      .regex(/[^A-Za-z0-9]/, "Must contain a special character"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterScreen() {
  const router = useRouter();
  const signUp = useSignUp();
  const [socialLoading, setSocialLoading] = useState<
    "google" | "github" | null
  >(null);

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: "", email: "", password: "", confirmPassword: "" },
  });

  const passwordValue = watch("password");

  const onSubmit = async (data: RegisterFormValues) => {
    try {
      const result = await signUp.mutateAsync({
        name: data.name,
        email: data.email,
        password: data.password,
      });
      if (result?.error) {
        Alert.alert(
          "Sign Up Failed",
          result.error.message ?? "Could not create account.",
        );
        return;
      }
      Alert.alert(
        "Account Created",
        "Please check your email to verify your account.",
        [{ text: "OK", onPress: () => router.replace("/(auth)/login") }],
      );
    } catch {
      Alert.alert("Sign Up Failed", "Something went wrong. Please try again.");
    }
  };

  const handleSocialSignUp = async (provider: "google" | "github") => {
    try {
      setSocialLoading(provider);
      await AuthService.signInWithSocial(provider);
    } catch {
      Alert.alert(
        "Sign Up Failed",
        `Could not sign up with ${provider}. Please try again.`,
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
              Create account
            </Text>
            <Text className="mt-2 text-base font-sans-medium text-muted-foreground">
              Sign up to start managing your subscriptions
            </Text>
          </View>

          {/* Social Sign Up */}
          <View className="gap-3">
            <SocialButton
              provider="google"
              loading={socialLoading === "google"}
              disabled={isSubmitting || socialLoading !== null}
              onPress={() => handleSocialSignUp("google")}
            />
            <SocialButton
              provider="github"
              loading={socialLoading === "github"}
              disabled={isSubmitting || socialLoading !== null}
              onPress={() => handleSocialSignUp("github")}
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
              name="name"
              render={({ field: { value, onChange, onBlur } }) => (
                <AuthInput
                  label="Full Name"
                  placeholder="John Doe"
                  textContentType="name"
                  autoComplete="name"
                  autoCapitalize="words"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.name?.message}
                />
              )}
            />

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
                <View className="gap-1.5">
                  <AuthInput
                    label="Password"
                    placeholder="Create a strong password"
                    textContentType="newPassword"
                    autoComplete="new-password"
                    showPasswordToggle
                    secureTextEntry
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    error={errors.password?.message}
                  />
                  <PasswordStrength value={passwordValue} />
                </View>
              )}
            />

            <Controller
              control={control}
              name="confirmPassword"
              render={({ field: { value, onChange, onBlur } }) => (
                <AuthInput
                  label="Confirm Password"
                  placeholder="Re-enter your password"
                  textContentType="newPassword"
                  autoComplete="new-password"
                  showPasswordToggle
                  secureTextEntry
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.confirmPassword?.message}
                />
              )}
            />
          </View>

          {/* Submit */}
          <AuthButton
            title="Create Account"
            loading={isSubmitting}
            disabled={isSubmitting || socialLoading !== null}
            onPress={handleSubmit(onSubmit)}
            className="mt-6"
          />

          {/* Footer */}
          <View className="mt-8 flex-row items-center justify-center gap-1">
            <Text className="text-sm font-sans-medium text-muted-foreground">
              Already have an account?
            </Text>
            <Link href="/(auth)/login" asChild>
              <Text className="text-sm font-sans-bold text-accent">
                Sign in
              </Text>
            </Link>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
