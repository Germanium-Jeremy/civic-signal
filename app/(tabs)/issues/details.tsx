import { MainColors } from "@/constants/theme";
import { useStylesGlobal } from "@/hooks/use-styles-global";
import { IssueService } from "@/services/apis/issueServices";
import { formatDate } from "@/services/apis/functions";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, Image, Pressable, ScrollView, StyleSheet, Text, View, Alert } from "react-native";
import { Image as ExpoImage } from 'expo-image';
import { API_BASE_URL } from "@/services/apis/config";

interface Issue {
     _id: string;
     title: string;
     description: string;
     category: string;
     priority: string;
     status: string;
     trackingNumber: string;
     submittedAt: string;
     location?: {
          address: string;
          district?: string;
          sector?: string;
     };
     photos?: Array<{
          url: string;
          thumbnailUrl?: string;
     }>;
     reportedBy?: {
          fullName: string;
          email: string;
     };
}

export default function IssueDetailsScreen() {
     const mainStyles = useStylesGlobal()
     const { id } = useLocalSearchParams<{ id: string }>()
     const router = useRouter()
     const [issue, setIssue] = useState<Issue | null>(null)
     const [loading, setLoading] = useState(true)
     const [error, setError] = useState<string | null>(null)

     useEffect(() => {
          const fetchIssueDetails = async () => {
               if (!id) {
                    setError('Issue ID not provided')
                    setLoading(false)
                    return
               }

               try {
                    setLoading(true)
                    const response = await IssueService.getIssue(id)
                    if (response.success) {
                         setIssue(response.data.data.issue)
                    } else {
                         setError(response.error || 'Failed to fetch issue details')
                    }
               } catch (err) {
                    console.error('Error fetching issue details:', err)
                    setError('Failed to fetch issue details')
               } finally {
                    setLoading(false)
               }
          }

          fetchIssueDetails()
     }, [id])

     const getStatusColor = (status: string) => {
          const colors = {
               submitted: MainColors["Error red"],
               acknowledged: MainColors["Warning Yellow"],
               pending: MainColors["Warning Yellow"],
               resolved: MainColors["Accent Green"]
          };
          return colors[status as keyof typeof colors] || MainColors["Neutral Gray"];
     };

     const getPriorityColor = (priority: string) => {
          const colors = {
               low: MainColors["Accent Green"],
               medium: MainColors["Warning Yellow"],
               high: MainColors["Error red"],
               urgent: MainColors["Almost Black"]
          };
          return colors[priority as keyof typeof colors] || MainColors["Neutral Gray"];
     };

     const MediaGallery = ({ photos }: { photos?: Array<{ url: string; thumbnailUrl?: string }> }) => {
          if (!photos || photos.length === 0) return null;
          
          const baseHost = API_BASE_URL.replace(/\/api\/?$/, "");
          const toAbsolute = (u: string) => {
               if (!u) return u;
               if (u.startsWith("http://") || u.startsWith("https://")) return u;
               return `${baseHost}${u.startsWith("/") ? "" : "/"}${u}`;
          };

          return (
               <View style={styles.mediaContainer}>
                    <Text style={[mainStyles.authTitles, styles.sectionTitle]}>Media Files</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                         {photos.map((photo, index) => (
                              <View key={index} style={styles.mediaItem}>
                                   <ExpoImage
                                        source={toAbsolute(photo.url)}
                                        style={styles.mediaImage}
                                        contentFit="cover"
                                        placeholder={require("@/assets/images/civic-signal.png")}
                                        placeholderContentFit="contain"
                                   />
                              </View>
                         ))}
                    </ScrollView>
               </View>
          );
     };

     if (loading) {
          return (
               <View style={[mainStyles.pages, styles.loadingContainer]}>
                    <ActivityIndicator size="large" color={MainColors["Primary Blue"]} />
                    <Text style={[mainStyles.normalText, { marginTop: 10 }]}>Loading issue details...</Text>
               </View>
          );
     }

     if (error || !issue) {
          return (
               <View style={[mainStyles.pages, styles.errorContainer]}>
                    <Ionicons name="alert-circle" size={48} color={MainColors["Error red"]} />
                    <Text style={[mainStyles.normalText, { color: MainColors["Error red"], marginTop: 10 }]}>
                         {error || 'Issue not found'}
                    </Text>
                    <Pressable style={styles.retryButton} onPress={() => router.back()}>
                         <Text style={[mainStyles.normalText, { color: MainColors["Primary Blue"] }]}>Go Back</Text>
                    </Pressable>
               </View>
          );
     }

     return (
          <ScrollView style={[mainStyles.pages, styles.container]}>
               {/* Issue Title and Category */}
               <View style={styles.header}>
                    <Text style={[mainStyles.authTitles, styles.title]}>{issue.category}</Text>
                    <Text style={[mainStyles.normalText, styles.subtitle]}>{issue.title}</Text>
               </View>

               {/* Description */}
               <View style={styles.section}>
                    <Text style={[mainStyles.authTitles, styles.sectionTitle]}>Description</Text>
                    <Text style={[mainStyles.normalText, styles.description]}>
                         {issue.description || 'No description provided'}
                    </Text>
               </View>

               {/* Tracking Number and Date */}
               <View style={styles.infoRow}>
                    <View style={styles.infoItem}>
                         <Text style={[mainStyles.normalText, styles.infoLabel]}>Tracking #</Text>
                         <Text style={[mainStyles.normalText, styles.infoValue]}>{issue.trackingNumber}</Text>
                    </View>
                    <View style={styles.infoItem}>
                         <Text style={[mainStyles.normalText, styles.infoLabel]}>Reported</Text>
                         <Text style={[mainStyles.normalText, styles.infoValue]}>{formatDate(issue.submittedAt)}</Text>
                    </View>
               </View>

               {/* Status and Priority */}
               <View style={styles.statusContainer}>
                    <View style={styles.statusItem}>
                         <View style={[styles.statusDot, { backgroundColor: getStatusColor(issue.status) }]} />
                         <Text style={[mainStyles.normalText, { textTransform: 'capitalize' }]}>{issue.status}</Text>
                    </View>
                    <View style={styles.statusItem}>
                         <View style={[styles.priorityDot, { backgroundColor: getPriorityColor(issue.priority) }]} />
                         <Text style={[mainStyles.normalText, { textTransform: 'capitalize' }]}>{issue.priority} Priority</Text>
                    </View>
               </View>

               {/* Location */}
               {issue.location && (
                    <View style={styles.section}>
                         <Text style={[mainStyles.authTitles, styles.sectionTitle]}>Location</Text>
                         <Text style={[mainStyles.normalText, styles.locationText]}>
                              {issue.location.address}
                         </Text>
                         {(issue.location.district || issue.location.sector) && (
                              <Text style={[mainStyles.normalText, styles.locationDetails]}>
                                   {issue.location.district && `${issue.location.district}`}
                                   {issue.location.district && issue.location.sector && ', '}
                                   {issue.location.sector && issue.location.sector}
                              </Text>
                         )}
                    </View>
               )}

               {/* Media Gallery */}
               <MediaGallery photos={issue.photos} />

               <View style={{ paddingVertical: 20 }}></View>
          </ScrollView>
     )
}

const styles = StyleSheet.create({
     container: {
          display: 'flex',
          flexDirection: 'column',
          gap: 20,
     },
     loadingContainer: {
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
     },
     errorContainer: {
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          padding: 20,
     },
     retryButton: {
          marginTop: 20,
          padding: 10,
          backgroundColor: MainColors["Light Gray"],
          borderRadius: 20,
     },
     header: {
          marginBottom: 10,
     },
     title: {
          fontSize: 24,
          fontWeight: 'bold',
          color: MainColors["Almost Black"],
          marginBottom: 5,
     },
     subtitle: {
          fontSize: 18,
          color: MainColors["Neutral Gray"],
     },
     section: {
          backgroundColor: MainColors["Light Gray"],
          borderRadius: 15,
          padding: 15,
          marginBottom: 15,
     },
     sectionTitle: {
          fontSize: 18,
          fontWeight: '600',
          color: MainColors["Almost Black"],
          marginBottom: 10,
     },
     description: {
          fontSize: 16,
          lineHeight: 24,
          color: MainColors["Almost Black"],
     },
     infoRow: {
          flexDirection: 'row',
          justifyContent: 'space-between',
          backgroundColor: MainColors["Light Gray"],
          borderRadius: 15,
          padding: 15,
          marginBottom: 15,
     },
     infoItem: {
          flex: 1,
     },
     infoLabel: {
          fontSize: 12,
          color: MainColors["Neutral Gray"],
          marginBottom: 5,
     },
     infoValue: {
          fontSize: 16,
          fontWeight: '500',
          color: MainColors["Almost Black"],
     },
     statusContainer: {
          flexDirection: 'row',
          justifyContent: 'space-around',
          backgroundColor: MainColors["Light Gray"],
          borderRadius: 15,
          padding: 15,
          marginBottom: 15,
     },
     statusItem: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: 8,
     },
     statusDot: {
          width: 12,
          height: 12,
          borderRadius: 6,
     },
     priorityDot: {
          width: 12,
          height: 12,
          borderRadius: 6,
     },
     locationText: {
          fontSize: 16,
          fontWeight: '500',
          color: MainColors["Almost Black"],
          marginBottom: 5,
     },
     locationDetails: {
          fontSize: 14,
          color: MainColors["Neutral Gray"],
     },
     mediaContainer: {
          backgroundColor: MainColors["Light Gray"],
          borderRadius: 15,
          padding: 15,
          marginBottom: 15,
     },
     mediaItem: {
          marginRight: 10,
     },
     mediaImage: {
          width: 120,
          height: 120,
          borderRadius: 10,
     },
})