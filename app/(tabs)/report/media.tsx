import { useStylesGlobal } from "@/hooks/use-styles-global";
import { Alert, Text, View, Pressable, StyleSheet, Image, ScrollView, ActivityIndicator, Platform } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system/legacy";
import { IssueService } from "@/services/apis/issueServices";
import { useState } from "react";
import MainButton from "@/components/MainButton";
import * as DocumentPicker from "expo-document-picker";
import { enqueueOfflineMediaAttachment } from "@/services/apis/offlineIssueQueue";

export const runtime = 'nodejs';

export default function MediaAttachScreen() {
     const mainStyles = useStylesGlobal();
     const { issueId } = useLocalSearchParams<{ issueId: string }>();
     const [mediaAssets, setMediaAssets] = useState<{ uri: string; type: 'image' | 'audio' | 'video'; mimeType: string }[]>([]);
     const [loading, setLoading] = useState(false);
     const navigate = useRouter()

     const pickImages = async () => {
          const res = await ImagePicker.launchImageLibraryAsync({
               mediaTypes: ImagePicker.MediaTypeOptions.Images,
               allowsMultipleSelection: true,
               quality: 0.6,
          });
          if (!res.canceled) {
               const selected = (res.assets || []).map((a) => ({ 
                   uri: a.uri, 
                   type: 'image' as const,
                   mimeType: a.mimeType || 'image/jpeg'
               }));
               setMediaAssets((prev) => [...prev, ...selected]);
          }
     };

     const pickVideo = async () => {
          const res = await ImagePicker.launchImageLibraryAsync({
               mediaTypes: ImagePicker.MediaTypeOptions.Videos,
               allowsMultipleSelection: false,
               quality: 0.6,
          });
          if (!res.canceled) {
               const selected = (res.assets || []).map((a) => ({ 
                   uri: a.uri, 
                   type: 'video' as const,
                   mimeType: a.mimeType || 'video/mp4'
               }));
               setMediaAssets((prev) => [...prev, ...selected]);
          }
     };

     const pickAudio = async () => {
          const res = await DocumentPicker.getDocumentAsync({
               type: 'audio/*',
               multiple: false,
          });
          if (!res.canceled) {
               const asset = res.assets[0];
               setMediaAssets((prev) => [...prev, { 
                   uri: asset.uri, 
                   type: 'audio',
                   mimeType: asset.mimeType || 'audio/mpeg'
               }]);
          }
     };

     const submitMedia = async () => {
          if (!issueId) return;
          if (!mediaAssets.length) {
               if (Platform.OS === 'web') {
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
               for (const asset of mediaAssets) {
                    const b64 = await FileSystem.readAsStringAsync(asset.uri, { encoding: "base64" });
                    base64Payload.push({ data: b64, mimeType: asset.mimeType });
               }

               const upload = await IssueService.uploadMedia(base64Payload);
               if (!upload.success) throw new Error(upload.error || "Upload failed");

               const media = upload.data.data.images; // Array of { url, mediaType, ... }
               const patch = await IssueService.updateIssueMedia(issueId as string, media);
               if (!patch.success) throw new Error(patch.error || "Failed to attach media");

               Alert.alert("Success", "Evidence attached to your issue.", [{
                    onPress: () => navigate.replace({
                         pathname: "/(tabs)/home",
                    })
               }]);
          } catch (e: any) {
               const likelyOffline = !e?.response || e?.message?.includes("Network Error");
               if (likelyOffline && issueId) {
                    await enqueueOfflineMediaAttachment(
                         issueId as string,
                         mediaAssets.map((asset) => ({
                              uri: asset.uri,
                              mimeType: asset.mimeType,
                              mediaType: asset.type,
                         }))
                    );
                    Alert.alert(
                         "Queued Offline",
                         "Media upload was saved and will sync automatically when you're online.",
                         [{ onPress: () => navigate.replace({ pathname: "/(tabs)/home" }) }]
                    );
               } else {
                    Alert.alert("Error", e?.message || "Failed to attach media.");
                    console.warn("Error uploading media: ", e);
               }
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

                     <Pressable onPress={pickAudio} style={styles.outlineBtn}>
                          <Text style={[mainStyles.normalText, styles.outlineBtnText]}>Upload Audio</Text>
                          <Text style={[mainStyles.normalText, styles.optionalText]}>(optional)</Text>
                     </Pressable>

                     <Pressable onPress={pickVideo} style={styles.outlineBtn}>
                          <Text style={[mainStyles.normalText, styles.outlineBtnText]}>Upload Video</Text>
                          <Text style={[mainStyles.normalText, styles.optionalText]}>(optional)</Text>
                     </Pressable>
                </View>

                {/* Selected media previews */}
                {mediaAssets.length > 0 && (
                     <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 16 }}>
                          <View style={{ flexDirection: "row", gap: 12 }}>
                               {mediaAssets.map((asset, idx) => (
                                    <View key={`${asset.uri}-${idx}`} style={styles.thumbWrap}>
                                         {asset.type === 'image' ? (
                                             <Image source={{ uri: asset.uri }} style={styles.thumb} />
                                         ) : (
                                             <View style={[styles.thumb, { backgroundColor: '#f0f0f0', justifyContent: 'center', alignItems: 'center' }]}>
                                                 <Text style={{ fontSize: 24 }}>{asset.type === 'audio' ? '🎵' : '🎥'}</Text>
                                                 <Text style={{ fontSize: 10, color: '#666' }}>{asset.type.toUpperCase()}</Text>
                                             </View>
                                         )}
                                         <Pressable style={styles.removeBadge} onPress={() => setMediaAssets((prev) => prev.filter((_, i) => i !== idx))}>
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
