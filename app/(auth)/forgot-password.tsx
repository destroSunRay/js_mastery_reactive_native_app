import AuthButton from "@/components/auth/AuthButton";
import AuthInput from "@/components/auth/AuthInput";
import { useSendPasswordReset } from "@/features/auth/auth.hooks";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link } from "expo-router";
import { styled } from "nativewind";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";
import { z } from "zod";

const SafeAreaView = styled(RNSafeAreaView);

const forgotPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordScreen() {
  const sendReset = useSendPasswordReset();
  const [sent, setSent] = useState(false);

  const {
    control,
    handleSubmit,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  const onSubmit = async (data: ForgotPasswordFormValues) => {
    await sendReset.mutateAsync({ email: data.email });
    setSent(true);
  };

  if (sent) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: "center",
            paddingHorizontal: 24,
            paddingVertical: 40,
          }}
          showsVerticalScrollIndicator={false}
        >
          {/* Success State */}
          <View className="mb-10 items-center">
            <View className="mb-6 size-20 items-center justify-center rounded-full bg-muted">
              <Text className="text-4xl">📬</Text>
            </View>
            <Text className="text-3xl font-sans-extrabold text-primary">
              Check your inbox
            </Text>
            <Text className="mt-3 text-center text-base font-sans-medium text-muted-foreground">
              We&apos;ve sent a password reset link to{" "}
              <Text className="font-sans-bold text-primary">
                {getValues("email")}
              </Text>
            </Text>
            <Text className="mt-2 text-center text-sm font-sans-medium text-muted-foreground">
              Didn&apos;t receive it? Check your spam folder or request a new
              link.
            </Text>
          </View>

          <AuthButton
            title="Send Again"
            variant="outline"
            onPress={() => setSent(false)}
          />

          <View className="mt-5 items-center">
            <Link href="/(auth)/login" asChild>
              <Text className="text-sm font-sans-bold text-accent">
                Back to Sign In
              </Text>
            </Link>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

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
          {/* Back button */}
          <Link href="/(auth)/login" asChild>
            <Text className="mb-8 self-start text-sm font-sans-bold text-accent">
              ← Back to Sign In
            </Text>
          </Link>

          {/* Header */}
          <View className="mb-10">
            <Text className="text-4xl font-sans-extrabold text-primary">
              Forgot password?
            </Text>
            <Text className="mt-2 text-base font-sans-medium text-muted-foreground">
              Enter your email and we&apos;ll send you a link to reset your
              password.
            </Text>
          </View>

          {/* Form */}
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

          <AuthButton
            title="Send Reset Link"
            loading={isSubmitting}
            onPress={handleSubmit(onSubmit)}
            className="mt-6"
          />

          <View className="mt-8 flex-row items-center justify-center gap-1">
            <Text className="text-sm font-sans-medium text-muted-foreground">
              Remember your password?
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
