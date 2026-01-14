import { useEffect, useState } from "react";
import { View, Text, TextInput, StyleSheet, Pressable, ActivityIndicator, Alert } from "react-native";
import { useRouter } from "expo-router";
import { MainColors } from "@/constants/theme";
import { useStylesGlobal } from "@/hooks/use-styles-global";
import api, { TokenManager } from "@/services/apis/config";
import { AuthService } from "@/services/apis/authServices";
import { UserDataInterface } from "@/constants/UserInterface";

export default function EditProfileScreen() {
     const mainStyles = useStylesGlobal();
     const router = useRouter();

     const [profileImage, setProfileImage] = useState<string>("");
     const [loading, setLoading] = useState(false);

     useEffect(() => {
          const loadUser = async () => {
               const user = (await AuthService.getCurrentUser()) as UserDataInterface | null;
               if (user?.profileImage) {
                    setProfileImage(user.profileImage);
               }
          };
          loadUser();
     }, []);

     const handleSave = async () => {
          setLoading(true);
          try {
               const response = await api.patch("/user/profile", { profileImage });

               // Persist updated user data locally so Profile screen reflects it
               if (response.data?.user) {
                    await TokenManager.saveUserData(response.data.user);
               }

               Alert.alert("Success", "Profile image updated successfully");
               router.back();
          } catch (error: any) {
               console.error("Failed to update profile image", error);
               const message =
                    error?.response?.data?.error ||
                    error?.message ||
                    "Failed to update profile image";
               Alert.alert("Error", message);
          } finally {
               setLoading(false);
          }
     };

     return (
          <View style={[mainStyles.pages, styles.container]}>
               <Text style={[mainStyles.normalText, styles.title]}>Edit Profile</Text>
               <Text style={[mainStyles.normalText, styles.label]}>Profile Image URL</Text>
               <TextInput
                    style={[styles.input]}
                    placeholder="https://example.com/image.jpg"
                    placeholderTextColor={MainColors["Neutral Gray"]}
                    value={profileImage}
                    onChangeText={setProfileImage}
                    autoCapitalize="none"
               />
               <Pressable
                    style={[styles.button, loading && { opacity: 0.7 }]}
                    onPress={handleSave}
                    disabled={loading}
               >
                    {loading ? (
                         <ActivityIndicator color={MainColors["Main Background"]} />
                    ) : (
                         <Text style={[mainStyles.normalText, styles.buttonText]}>Save</Text>
                    )}
               </Pressable>
          </View>
     );
}

const styles = StyleSheet.create({
     container: {
          gap: 20,
     },
     title: {
          fontSize: 22,
          fontWeight: "600",
     },
     label: {
          marginTop: 10,
          marginBottom: 4,
          color: MainColors["Neutral Gray"],
     },
     input: {
          borderWidth: 1,
          borderColor: MainColors["Light Gray"],
          borderRadius: 12,
          paddingHorizontal: 12,
          paddingVertical: 10,
          color: MainColors["Almost Black"],
          backgroundColor: "#fff",
     },
     button: {
          marginTop: 20,
          backgroundColor: MainColors["Primary Blue"],
          borderRadius: 20,
          paddingVertical: 12,
          alignItems: "center",
          justifyContent: "center",
     },
     buttonText: {
          color: MainColors["Main Background"],
          fontWeight: "600",
     },
});
