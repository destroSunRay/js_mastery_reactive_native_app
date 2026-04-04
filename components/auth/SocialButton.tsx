import GithubIcon from "@/utils/icons/GithubIcon";
import GoogleIcon from "@/utils/icons/GoogleIcon";
import {
  ActivityIndicator,
  Text,
  TouchableOpacity,
  View,
  type TouchableOpacityProps,
} from "react-native";

type SocialProvider = "google" | "github";

interface SocialButtonProps extends TouchableOpacityProps {
  provider: SocialProvider;
  loading?: boolean;
}

const PROVIDER_CONFIG: Record<
  SocialProvider,
  { label: string; icon: React.ReactNode }
> = {
  google: {
    label: "Continue with Google",
    icon: <GoogleIcon size={20} />,
  },
  github: {
    label: "Continue with GitHub",
    icon: <GithubIcon size={20} color="#000" />,
  },
};

export default function SocialButton({
  provider,
  loading = false,
  disabled,
  ...props
}: SocialButtonProps) {
  const { label, icon } = PROVIDER_CONFIG[provider];

  return (
    <TouchableOpacity
      {...props}
      disabled={disabled || loading}
      activeOpacity={0.85}
      className={`h-14 flex-row items-center justify-center gap-3 rounded-xl border border-border bg-card ${
        disabled || loading ? "opacity-60" : ""
      }`}
    >
      {loading ? (
        <ActivityIndicator size="small" color="#000" />
      ) : (
        <>
          <View>{icon}</View>
          <Text className="text-base font-sans-semibold text-primary">
            {label}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
}
