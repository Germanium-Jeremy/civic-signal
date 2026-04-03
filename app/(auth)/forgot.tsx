import InputElement from "@/components/InputElement";
import MainButton from "@/components/MainButton";
import { MainColors } from "@/constants/theme";
import { useStylesGlobal } from "@/hooks/use-styles-global";
import { AuthService } from "@/services/apis/authServices";
import { normalizeIdentifier } from "@/services/apis/authInput";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert, Image, Text, View } from "react-native";

export default function ForgotPasswordScreen() {
  const mainStyles = useStylesGlobal();
  const router = useRouter();
  const [identifier, setIdentifier] = useState("");
  const [loading, setLoading] = useState(false);

  const handleForgotPassword = async () => {
    if (!identifier.trim()) {
      Alert.alert("Missing details", "Enter your email address or phone number.");
      return;
    }
    const reset = normalizeIdentifier(identifier);
    setLoading(true);
    const result = await AuthService.forgotPassword(reset.identifier, reset.method);
    setLoading(false);
    if (!result.success) {
      Alert.alert("Unable to send code", result.error || "Please try again.");
      return;
    }
    Alert.alert("Check your messages", result.message || "A reset code has been sent.", [{
      text: "Continue",
      onPress: () => router.replace({ pathname: "/(auth)/reset", params: reset }),
    }]);
  };

  return <View style={mainStyles.authBackground}>
    <Image source={require("@/assets/images/civicsignal.png")} resizeMode="contain" style={{ width: 150, height: 150 }} />
    <Text style={[mainStyles.authTitles, { marginTop: -10 }]}>Reset your password</Text>
    <Text style={[mainStyles.normalText, { color: MainColors["Primary Blue"] }]}>Enter the email address or phone number linked to your account.</Text>
    <View style={{ width: "100%" }}><InputElement placeholder="Email address / Phone number" onChange={setIdentifier} text={identifier} /></View>
    <MainButton title={loading ? "Sending..." : "Get code"} isFullWidth isDark toDo={handleForgotPassword} disabled={loading} />
  </View>;
}
