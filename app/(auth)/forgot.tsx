import InputElement from "@/components/InputElement";
import MainButton from "@/components/MainButton";
import { MainColors } from "@/constants/theme";
import { useStylesGlobal } from "@/hooks/use-styles-global";
import { AuthService } from "@/services/apis/authServices";
import { Image, Text, View, Alert } from "react-native";
import { useState } from "react";
import { useRouter } from "expo-router";

export default function ForgotPasswordScreen() {
  const mainStyles = useStylesGlobal();
  const [identifier, setIdentifier] = useState("");
     const [loading, setLoading] = useState(false);
     const navigate = useRouter();

  const handleForgotPassword = async () => {
    setLoading(true);
    const response = await AuthService.forgotPassword(identifier, "email"); // Assuming email for now
    setLoading(false);

    if (response.success) {
         Alert.alert("Success", response.message);
         navigate.replace({ pathname: '/(auth)/reset', params: { identifier } });
    } else {
      Alert.alert("Error", response.error);
    }
  };

  return (
    <View style={[mainStyles.authBackground]}>
      <Image
        source={require("@/assets/images/civicsignal.png")}
        resizeMode="contain"
        style={{ width: 150, height: 150 }}
      />
      <Text style={[mainStyles.authTitles, { marginTop: -10 }]}>
        Enter your email or phone number
      </Text>
      <Text
        style={[mainStyles.normalText, { color: MainColors["Primary Blue"] }]}
      >
        You will a code that allows you recover your account and reset the
        password to your account.
      </Text>

      <View style={{ width: "100%", gap: 10 }}>
        <InputElement placeholder="Email Address / Phone"
                      onChange={setIdentifier}
                      text={identifier}
        />
      </View>

      <MainButton
        title={loading ? "Sending..." : "Get code"}
        isFullWidth
        isDark
        toDo={handleForgotPassword}
        disabled={loading}
      />
    </View>
  );
}
