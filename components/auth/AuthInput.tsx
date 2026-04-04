import { colors } from "@/constants/theme";
import { useState } from "react";
import {
  Text,
  TextInput,
  TouchableOpacity,
  View,
  type TextInputProps,
} from "react-native";

interface AuthInputProps extends TextInputProps {
  label: string;
  error?: string;
  showPasswordToggle?: boolean;
}

export default function AuthInput({
  label,
  error,
  showPasswordToggle = false,
  secureTextEntry,
  style,
  ...props
}: AuthInputProps) {
  const [hidden, setHidden] = useState(secureTextEntry ?? false);

  return (
    <View className="gap-1.5">
      <Text className="text-sm font-sans-semibold text-primary">{label}</Text>

      <View
        className={`flex-row items-center rounded-xl border bg-card px-4 ${
          error ? "border-destructive" : "border-border"
        }`}
      >
        <TextInput
          {...props}
          secureTextEntry={hidden}
          autoCapitalize={props.autoCapitalize ?? "none"}
          autoCorrect={props.autoCorrect ?? false}
          className="flex-1 py-3.5 font-sans-medium text-base text-primary"
          placeholderTextColor={colors.mutedForeground}
          style={[{ fontFamily: "sans-medium" }, style]}
        />
        {showPasswordToggle && (
          <TouchableOpacity
            onPress={() => setHidden((prev) => !prev)}
            className="ml-2 py-1"
            hitSlop={8}
          >
            <Text className="text-sm font-sans-semibold text-accent">
              {hidden ? "Show" : "Hide"}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {error ? (
        <Text className="text-xs font-sans-medium text-destructive">
          {error}
        </Text>
      ) : null}
    </View>
  );
}
