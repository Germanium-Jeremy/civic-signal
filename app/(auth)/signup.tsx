import InputElement from "@/components/InputElement";
import MainButton from "@/components/MainButton";
import { MainColors } from "@/constants/theme";
import { useStylesGlobal } from "@/hooks/use-styles-global";
import { AuthService } from "@/services/apis/authServices";
import { normalizeEmail, normalizePhone, validatePassword } from "@/services/apis/authInput";
import { Link, useRouter } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, Alert, Image, Text, View } from "react-native";

export default function SignupScreen() {
  const mainStyles = useStylesGlobal();
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    const normalizedEmail = normalizeEmail(email);
    const normalizedPhone = normalizePhone(phone);
    if (!fullName.trim() || !normalizedEmail || !normalizedPhone || !password) {
      Alert.alert("Missing details", "All fields are required.");
      return;
    }
    const passwordErrors = validatePassword(password);
    if (passwordErrors.length) {
      Alert.alert("Password does not meet requirements", passwordErrors.join("\n"));
      return;
    }

    setLoading(true);
    const result = await AuthService.register({ fullName, email: normalizedEmail, phone: normalizedPhone, password });
    setLoading(false);
    if (!result.success) {
      Alert.alert("Registration failed", [result.error, ...(result.details || [])].filter(Boolean).join("\n"));
      return;
    }

    const verificationEmail = result.data?.email;
    const verificationPhone = result.data?.phone;
    if (!verificationEmail || !verificationPhone) {
      Alert.alert("Registration incomplete", "Your account was created, but verification details were not returned. Please sign in to continue.");
      return;
    }
    Alert.alert("Account created", result.message || "Check your email and phone for verification codes.", [{
      text: "Continue",
      onPress: () => router.replace({ pathname: "/(auth)/verifyaccount", params: { email: verificationEmail, phone: verificationPhone, emailVerified: "false", phoneVerified: "false" } }),
    }]);
  };

  return (
    <View style={mainStyles.authBackground}>
      <Image source={require("@/assets/images/civicsignal.png")} resizeMode="contain" style={{ width: 150, height: 150 }} />
      <Text style={[mainStyles.authTitles, { marginTop: -10 }]}>Create an Account</Text>
      <View style={{ width: "100%", gap: 10 }}>
        <InputElement placeholder="Full Names" text={fullName} onChange={setFullName} />
        <InputElement placeholder="Email Address" text={email} onChange={setEmail} isEmail autoCapitalize={false} />
        <InputElement placeholder="Phone Number" text={phone} onChange={setPhone} isPhone />
        <InputElement placeholder="Password" text={password} onChange={setPassword} isPassword />
      </View>
      <MainButton title={loading ? "Signing up..." : "Sign up"} isFullWidth isDark toDo={handleSignup} disabled={loading} />
      {loading && <ActivityIndicator size="small" color={MainColors["Almost Black"]} />}
      <Text style={[mainStyles.normalText, { color: MainColors["Primary Blue"] }]}>Already have an account? <Link href="/(auth)/signin" style={{ color: MainColors["Almost Black"] }}>Sign in</Link></Text>
    </View>
  );
}
