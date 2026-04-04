import { colors } from "@/constants/theme";
import {
  ActivityIndicator,
  Text,
  TouchableOpacity,
  type TouchableOpacityProps,
} from "react-native";

interface AuthButtonProps extends TouchableOpacityProps {
  title: string;
  loading?: boolean;
  variant?: "primary" | "outline";
}

export default function AuthButton({
  title,
  loading = false,
  variant = "primary",
  disabled,
  style,
  ...props
}: AuthButtonProps) {
  const isPrimary = variant === "primary";

  return (
    <TouchableOpacity
      {...props}
      disabled={disabled || loading}
      activeOpacity={0.85}
      className={`h-14 items-center justify-center rounded-xl border ${
        isPrimary
          ? "border-transparent bg-accent"
          : "border-border bg-transparent"
      } ${disabled || loading ? "opacity-60" : ""}`}
      style={style}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={isPrimary ? "#fff" : colors.accent}
        />
      ) : (
        <Text
          className={`text-base font-sans-bold ${
            isPrimary ? "text-white" : "text-primary"
          }`}
        >
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
}
