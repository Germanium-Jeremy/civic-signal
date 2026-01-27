import { useEffect, useState } from "react";
import { View, Text, StyleSheet, Pressable, ActivityIndicator, Alert, Image } from "react-native";
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system/legacy";
import { MainColors } from "@/constants/theme";
import { useStylesGlobal } from "@/hooks/use-styles-global";
import { TokenManager } from "@/services/apis/config";
import { AuthService } from "@/services/apis/authServices";
import { UserDataInterface } from "@/constants/UserInterface";

export default function EditProfileScreen() {
     const mainStyles = useStylesGlobal();
     const router = useRouter();

     const [profileImageUri, setProfileImageUri] = useState<string | null>(null);
     const [profileImageUrl, setProfileImageUrl] = useState<string>("");
     const [loading, setLoading] = useState(false);

     useEffect(() => {
          const loadUser = async () => {
               const user = (await AuthService.getCurrentUser()) as UserDataInterface | null;
               if (user?.profileImage) {
                    setProfileImageUrl(user.profileImage);
               }
          };
          loadUser();
     }, []);

     const pickImage = async () => {
          // Request permissions
          const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
          if (status !== 'granted') {
               Alert.alert("Permission Required", "We need access to your photos to upload a profile image.");
               return;
          }

          // Launch image picker
          const result = await ImagePicker.launchImageLibraryAsync({
               mediaTypes: ImagePicker.MediaTypeOptions.Images,
               allowsEditing: true,
               aspect: [1, 1],
               quality: 0.8,
          });

          if (!result.canceled && result.assets[0]) {
               setProfileImageUri(result.assets[0].uri);
          }
     };

     const handleSave = async () => {
          if (!profileImageUri) {
               Alert.alert("Error", "Please select an image first");
               return;
          }

          setLoading(true);
          try {
               // Convert image to base64
               const base64 = await FileSystem.readAsStringAsync(profileImageUri, {
                    encoding: FileSystem.EncodingType.Base64,
               });

               // Determine MIME type
               let mimeType = "image/jpeg";
               if (profileImageUri.toLowerCase().endsWith('.png')) {
                    mimeType = "image/png";
               }

               // Upload image
               const uploadResult = await AuthService.uploadProfileImage({
                    data: base64,
                    mimeType,
               });

               if (!uploadResult.success) {
                    throw new Error(uploadResult.error || "Failed to upload image");
               }

               // Update local user data
               const user = (await AuthService.getCurrentUser()) as UserDataInterface | null;
               if (user && uploadResult.data?.data?.url) {
                    user.profileImage = uploadResult.data.data.url;
                    await TokenManager.saveUserData(user);
                    setProfileImageUrl(uploadResult.data.data.url);
               }

               Alert.alert("Success", "Profile image updated successfully");
               router.back();
          } catch (error: any) {
               console.error("Failed to update profile image", error);
               const message =
                    error?.message ||
                    "Failed to update profile image";
               Alert.alert("Error", message);
          } finally {
               setLoading(false);
          }
     };

     const displayImage = profileImageUri || (profileImageUrl ? { uri: profileImageUrl } : null);

     return (
          <View style={[mainStyles.pages, styles.container]}>
               <Text style={[mainStyles.normalText, styles.title]}>Edit Profile</Text>
               
               <View style={styles.imageContainer}>
                    {displayImage ? (
                         <Image source={displayImage} style={styles.profileImage} />
                    ) : (
                         <View style={[styles.profileImage, styles.placeholderImage]}>
                              <Text style={styles.placeholderText}>No Image</Text>
                         </View>
                    )}
               </View>

               <Pressable
                    style={[styles.pickButton]}
                    onPress={pickImage}
                    disabled={loading}
               >
                    <Text style={[mainStyles.normalText, styles.pickButtonText]}>
                         {profileImageUri ? "Change Image" : "Select Image"}
                    </Text>
               </Pressable>

               <Pressable
                    style={[styles.button, loading && { opacity: 0.7 }]}
                    onPress={handleSave}
                    disabled={loading || !profileImageUri}
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
     imageContainer: {
          alignItems: "center",
          marginVertical: 20,
     },
     profileImage: {
          width: 150,
          height: 150,
          borderRadius: 75,
     },
     placeholderImage: {
          backgroundColor: MainColors["Light Gray"],
          justifyContent: "center",
          alignItems: "center",
     },
     placeholderText: {
          color: MainColors["Neutral Gray"],
          fontSize: 14,
     },
     pickButton: {
          borderWidth: 1,
          borderColor: MainColors["Primary Blue"],
          borderRadius: 12,
          paddingVertical: 12,
          paddingHorizontal: 20,
          alignItems: "center",
          backgroundColor: "#fff",
     },
     pickButtonText: {
          color: MainColors["Primary Blue"],
          fontWeight: "600",
     },
     button: {
          marginTop: 10,
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
