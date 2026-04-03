import InputElement from "@/components/InputElement";
import MainButton from "@/components/MainButton";
import { useStylesGlobal } from "@/hooks/use-styles-global";
import { AuthService } from "@/services/apis/authServices";
import { isSixDigitCode, normalizeEmail, normalizePhone, type ResetMethod, validatePassword } from "@/services/apis/authInput";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { Alert, Image, Text, View } from "react-native";

export default function ResetPasswordScreen() {
  const mainStyles = useStylesGlobal();
  const router = useRouter();
  const params = useLocalSearchParams<{ identifier?: string; method?: string }>();
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const method: ResetMethod | null = params.method === "email" || params.method === "phone" ? params.method : null;
  const identifier = typeof params.identifier === "string" ? (method === "email" ? normalizeEmail(params.identifier) : normalizePhone(params.identifier)) : "";

  const handleResetPassword = async () => {
    if (!identifier || !method) { Alert.alert("Reset session expired", "Start the password reset process again."); return; }
    if (!isSixDigitCode(code)) { Alert.alert("Invalid code", "Enter the six-digit reset code you received."); return; }
    const passwordErrors = validatePassword(newPassword);
    if (passwordErrors.length) { Alert.alert("Password does not meet requirements", passwordErrors.join("\n")); return; }
    if (newPassword !== confirmPassword) { Alert.alert("Passwords do not match", "Enter the same new password in both fields."); return; }
    setLoading(true);
    const result = await AuthService.resetPassword(identifier, code, newPassword, method);
    setLoading(false);
    if (!result.success) { setCode(""); Alert.alert("Unable to reset password", result.error || "Please request a new code and try again."); return; }
    Alert.alert("Password reset", result.message || "Sign in with your new password.", [{ text: "Sign in", onPress: () => router.replace("/(auth)/signin") }]);
  };

  return <View style={[mainStyles.authBackground, { gap: 30 }]}>
    <Image source={require("@/assets/images/civicsignal.png")} resizeMode="contain" style={{ width: 150, height: 150 }} />
    <Text style={[mainStyles.authTitles, { marginTop: -20 }]}>Reset your password</Text>
    <View style={{ width: "100%", gap: 10 }}>
      <InputElement placeholder="6-digit code" text={code} onChange={setCode} isPhone />
      <InputElement placeholder="New password" text={newPassword} onChange={setNewPassword} isPassword />
      <InputElement placeholder="Confirm new password" text={confirmPassword} onChange={setConfirmPassword} isPassword />
    </View>
    <MainButton title={loading ? "Resetting..." : "Reset password"} isFullWidth isDark toDo={handleResetPassword} disabled={loading || !identifier || !method} />
  </View>;
}
