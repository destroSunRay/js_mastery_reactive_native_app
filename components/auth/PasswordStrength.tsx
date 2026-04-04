import { Text, View } from "react-native";

const PASSWORD_RULES = [
  { label: "8+ characters", test: (v: string) => v.length >= 8 },
  { label: "Uppercase", test: (v: string) => /[A-Z]/.test(v) },
  { label: "Lowercase", test: (v: string) => /[a-z]/.test(v) },
  { label: "Number", test: (v: string) => /[0-9]/.test(v) },
  {
    label: "Special char",
    test: (v: string) => /[^A-Za-z0-9]/.test(v),
  },
];

export const PASSWORD_VALIDATION_REGEX = {
  uppercase: /[A-Z]/,
  lowercase: /[a-z]/,
  number: /[0-9]/,
  special: /[^A-Za-z0-9]/,
};

interface PasswordStrengthProps {
  value: string;
}

export default function PasswordStrength({ value }: PasswordStrengthProps) {
  if (!value) return null;

  const passed = PASSWORD_RULES.filter((r) => r.test(value)).length;

  const barColor =
    passed <= 2
      ? "bg-destructive"
      : passed <= 3
        ? "bg-yellow-500"
        : "bg-success";

  return (
    <View className="gap-2 pt-1">
      {/* Strength bar */}
      <View className="flex-row gap-1">
        {PASSWORD_RULES.map((_, i) => (
          <View
            key={i}
            className={`h-1 flex-1 rounded-full ${i < passed ? barColor : "bg-muted"}`}
          />
        ))}
      </View>

      {/* Rule checklist */}
      <View className="flex-row flex-wrap gap-x-4 gap-y-1">
        {PASSWORD_RULES.map((rule) => {
          const ok = rule.test(value);
          return (
            <View key={rule.label} className="flex-row items-center gap-1">
              <Text
                className={`text-xs font-sans-medium ${ok ? "text-success" : "text-muted-foreground"}`}
              >
                {ok ? "✓" : "·"} {rule.label}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}
