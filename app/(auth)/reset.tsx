import { useState } from "react";
import { AuthService } from "@/services/apis/authServices";
import { useStylesGlobal } from "@/hooks/use-styles-global";
import InputElement from "@/components/InputElement";
import MainButton from "@/components/MainButton";
import { View, Image, Text, Alert } from "react-native";
import { useRouter } from "expo-router";
import { useLocalSearchParams } from "expo-router/build/hooks";

export default function ResetPasswordScreen() {
  const mainStyles = useStylesGlobal();
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
     const [loading, setLoading] = useState(false);
     const navigate = useRouter();
     const searchItems = useLocalSearchParams()

  const handleResetPassword = async () => {
    if (newPassword !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }

    setLoading(true);
    const response = await AuthService.resetPassword(
      searchItems.identifier as string,
      code,
      newPassword,
      searchItems.identifier.includes("@") ? "email" : "phone"
    )
    setLoading(false);

    if (response.success) {
         Alert.alert("Success", response.message);
           navigate.replace("/(auth)/signin");
    } else {
      Alert.alert("Error", response.error);
    }
  };

  return (
    <View style={[mainStyles.authBackground, { gap: 50 }]}>
      <Image
        source={require("@/assets/images/civicsignal.png")}
        resizeMode="contain"
        style={{ width: 150, height: 150 }}
      />
      <Text style={[mainStyles.authTitles, { marginTop: -50 }]}>
        Reset your password
      </Text>

      <View style={{ width: "100%", gap: 10 }}>
        <InputElement placeholder="Code" text={code} onChange={setCode} />
        <InputElement
          placeholder="New password"
          text={newPassword}
          onChange={setNewPassword}
        />
        <InputElement
          placeholder="Confirm password"
          text={confirmPassword}
          onChange={setConfirmPassword}
        />
      </View>

      <MainButton
        title={loading ? "Resetting..." : "Reset Password"}
        isFullWidth
        isDark
        toDo={handleResetPassword}
        disabled={loading}
      />
    </View>
  );
}
