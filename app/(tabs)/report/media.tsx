import { useStylesGlobal } from "@/hooks/use-styles-global";
import { Alert, Text, View, Pressable, StyleSheet, Image, ScrollView, ActivityIndicator, Platform } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system/legacy";
import { IssueService } from "@/services/apis/issueServices";
import { useState } from "react";
import MainButton from "@/components/MainButton";

export const runtime = 'nodejs';

export default function MediaAttachScreen() {
     const mainStyles = useStylesGlobal();
     const { issueId } = useLocalSearchParams<{ issueId: string }>();
     const [images, setImages] = useState<{ uri: any }[]>([]);
     const [loading, setLoading] = useState(false);
     const navigate = useRouter()

     const pickImages = async () => {
          const res = await ImagePicker.launchImageLibraryAsync({
               mediaTypes: ImagePicker.MediaTypeOptions.Images,
               allowsMultipleSelection: true,
               quality: 0.6,
          });
          if (!res.canceled) {
               const selected = (res.assets || []).map((a) => ({ uri: a.uri }));
               setImages(selected);
          }
     };

     const submitMedia = async () => {
          if (!issueId) return;
          if (!images.length) {
               if (Platform.OS == 'web') {
                    alert("Issue submitted successfully.")
                    return
               }
               Alert.alert("Done", "Issue submitted without media.", [{
                    onPress: () => navigate.replace({
                         pathname: "/(tabs)/home",
                    })
               }]);
               return;
          }
          setLoading(true);

          try {
               // Convert to base64
               const base64Payload: { data: string; mimeType: string }[] = [];
               for (const img of images) {
                    const b64 = await FileSystem.readAsStringAsync(img.uri, { encoding: "base64" });
                    base64Payload.push({ data: b64, mimeType: "image/jpeg" });
               }
               const upload = await IssueService.uploadPhotos(base64Payload);
               if (!upload.success) throw new Error(upload.error || "Upload failed");

               const photos = upload.data.data.images; // { url, thumbnailUrl, ... }
               const patch = await IssueService.updateIssuePhotos(issueId as string, photos);
               if (!patch.success) throw new Error(patch.error || "Failed to attach photos");

               Alert.alert("Success", "Photos attached to your issue.");
          } catch (e: any) {
               Alert.alert("Error", e?.message || "Failed to attach photos.");
               console.warn("Error uploading media: ", e)
          } finally {
               setLoading(false);
          }
     };

     return (
          <ScrollView contentContainerStyle={[mainStyles.pages, { paddingVertical: 24 }]}>
               {/* Header/title */}
               <Text style={[mainStyles.authTitles]}>Add supportive evidence</Text>

               {/* Outline buttons matching design */}
               <View style={{ gap: 16, marginTop: 24 }}>
                    <Pressable onPress={pickImages} style={styles.outlineBtn}>
                         <Text style={[mainStyles.normalText, styles.outlineBtnText]}>Upload Images</Text>
                         <Text style={[mainStyles.normalText, styles.optionalText]}>(optional)</Text>
                    </Pressable>

                    <Pressable onPress={() => Alert.alert("Info", "Audio recording will be added soon.")} style={styles.outlineBtn}>
                         <Text style={[mainStyles.normalText, styles.outlineBtnText]}>Record Audio</Text>
                         <Text style={[mainStyles.normalText, styles.optionalText]}>(optional)</Text>
                    </Pressable>

                    <Pressable onPress={() => Alert.alert("Info", "Video recording will be added soon.")} style={styles.outlineBtn}>
                         <Text style={[mainStyles.normalText, styles.outlineBtnText]}>Record Video</Text>
                         <Text style={[mainStyles.normalText, styles.optionalText]}>(optional)</Text>
                    </Pressable>
               </View>

               {/* Selected image previews */}
               {images.length > 0 && (
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 16 }}>
                         <View style={{ flexDirection: "row", gap: 12 }}>
                              {images.map((img, idx) => (
                                   <View key={`${img.uri}-${idx}`} style={styles.thumbWrap}>
                                        <Image source={{ uri: img.uri }} style={styles.thumb} />
                                        <Pressable style={styles.removeBadge} onPress={() => setImages((prev) => prev.filter((_, i) => i !== idx))}>
                                             <Text style={{ color: "#fff", fontWeight: "700" }}>×</Text>
                                        </Pressable>
                                   </View>
                              ))}
                         </View>
                    </ScrollView>
               )}

               {/* Helper text */}
               <Text style={[mainStyles.normalText, { marginTop: 24 }]}>
                    Supportive media files are optional, in case they are not available, you can just submit
                    without them.
               </Text>

               {/* Submit */}
               {loading ? 
                    <ActivityIndicator color="#fff" /> :
                    <MainButton isDark title="Report" toDo={submitMedia} disabled={loading} />
               }
          </ScrollView>
     );
}

const styles = StyleSheet.create({
     outlineBtn: {
          borderWidth: 1,
          borderColor: "#BDE3CF",
          borderRadius: 18,
          paddingVertical: 14,
          paddingHorizontal: 16,
          backgroundColor: "#fff",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
     },
     outlineBtnText: {
          fontWeight: "600",
     },
     optionalText: {
          color: "#6B7280",
          fontSize: 12,
     },
     thumbWrap: {
          width: 100,
          height: 100,
          borderRadius: 12,
          overflow: "hidden",
          position: "relative",
          backgroundColor: "#eee",
     },
     thumb: {
          width: "100%",
          height: "100%",
          resizeMode: "cover",
     },
     removeBadge: {
          position: "absolute",
          top: 6,
          right: 6,
          width: 22,
          height: 22,
          borderRadius: 11,
          backgroundColor: "#ef4444",
          alignItems: "center",
          justifyContent: "center",
     },
     submitBtn: {
          backgroundColor: "#0B3552",
          borderRadius: 14,
          height: 52,
          alignItems: "center",
          justifyContent: "center",
     },
});