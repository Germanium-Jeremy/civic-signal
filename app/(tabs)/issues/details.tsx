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
     activities?: Array<{
          action: string;
          description: string;
          performedBy: string;
          performedByModel: string;
          timestamp: string;
     }>;
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
               submitted: MainColors["Primary Blue"],
               acknowledged: MainColors["Warning Yellow"],
               pending: "#FFD700",
               resolved: "#32CD32"
          };
          return colors[status as keyof typeof colors] || MainColors["Neutral Gray"];
     };

     const getPriorityColor = (priority: string) => {
          const colors = {
               low: "#32CD32",
               medium: "#FFD700",
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
                    <Text style={[mainStyles.authTitles, styles.sectionTitle, { backgroundColor: 'transparent', paddingLeft: 0 }]}>Media Files</Text>
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
          <ScrollView style={[mainStyles.pages, styles.container]} contentContainerStyle={{ paddingBottom: 40 }}>
               {/* Issue Title and Category - Centered Header to match Swift */}
               <View style={styles.headerCentered}>
                    <Text style={[mainStyles.authTitles, styles.titleCentered]}>{issue.title || issue.category}</Text>
                    {issue.description && (
                         <Text style={[mainStyles.normalText, styles.descriptionCentered]}>{issue.description}</Text>
                    )}
                    
                    <View style={styles.statusPillContainer}>
                         <View style={styles.statusPill}>
                              <View style={[styles.statusDotLarge, { backgroundColor: getStatusColor(issue.status) }]} />
                              <Text style={[mainStyles.normalText, styles.statusText]}>{issue.status.charAt(0).toUpperCase() + issue.status.slice(1)}</Text>
                         </View>
                    </View>
               </View>

               {/* Info Grid */}
               <View style={styles.infoGrid}>
                    <View style={styles.infoBox}>
                         <Text style={styles.infoLabel}>CATEGORY</Text>
                         <Text style={styles.infoValue}>{issue.category}</Text>
                    </View>
                    <View style={styles.infoBox}>
                         <Text style={styles.infoLabel}>PRIORITY</Text>
                         <Text style={styles.infoValue}>{issue.priority.charAt(0).toUpperCase() + issue.priority.slice(1)}</Text>
                    </View>
               </View>

               {/* Tracking and Date */}
               <View style={styles.metaSection}>
                    <View style={styles.metaItem}>
                         <Text style={styles.metaLabel}>Tracking #</Text>
                         <Text style={styles.metaValue}>{issue.trackingNumber}</Text>
                    </View>
                    <View style={[styles.metaItem, { borderLeftWidth: 1, borderLeftColor: '#DDD' }]}>
                         <Text style={styles.metaLabel}>Reported</Text>
                         <Text style={styles.metaValue}>{formatDate(issue.submittedAt)}</Text>
                    </View>
               </View>

               {/* Media Gallery */}
               <MediaGallery photos={issue.photos} />

               {/* Activities Section - Authority Comments */}
               {issue.activities && issue.activities.length > 0 && (
                    <View style={styles.activitiesCard}>
                         <Text style={[mainStyles.authTitles, { color: '#FFF', fontSize: 18, marginBottom: 10 }]}>Comments Given By Authorities</Text>
                         <View style={{ height: 1, backgroundColor: 'rgba(255,255,255,0.2)', marginBottom: 15 }} />
                         
                         {issue.activities.map((activity, index) => (
                              <View key={index} style={styles.activityItem}>
                                   <View style={styles.activityAvatar}>
                                        <Ionicons name="person" size={20} color={MainColors["Almost Black"]} />
                                   </View>
                                   <View style={styles.activityContent}>
                                        <Text style={styles.activityAuthor}>Government Agency</Text>
                                        <Text style={styles.activityDate}>{formatDate(activity.timestamp)}</Text>
                                        <Text style={styles.activityDescription}>{activity.description}</Text>
                                   </View>
                              </View>
                         ))}
                    </View>
               )}

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
          </ScrollView>
     )
}

const styles = StyleSheet.create({
     container: {
          flex: 1,
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
     headerCentered: {
          alignItems: 'center',
          paddingVertical: 20,
          marginBottom: 10,
     },
     titleCentered: {
          fontSize: 26,
          fontWeight: 'bold',
          color: MainColors["Almost Black"],
          textAlign: 'center',
          marginBottom: 8,
     },
     descriptionCentered: {
          fontSize: 16,
          color: MainColors["Almost Black"],
          textAlign: 'center',
          paddingHorizontal: 20,
          lineHeight: 22,
     },
     statusPillContainer: {
          marginTop: 15,
          alignItems: 'center',
     },
     statusPill: {
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: 'rgba(0,0,0,0.05)',
          paddingHorizontal: 20,
          paddingVertical: 10,
          borderRadius: 20,
          gap: 10,
     },
     statusDotLarge: {
          width: 12,
          height: 12,
          borderRadius: 6,
     },
     statusText: {
          fontSize: 16,
          fontWeight: '500',
          color: MainColors["Almost Black"],
     },
     infoGrid: {
          flexDirection: 'row',
          gap: 15,
          marginBottom: 20,
     },
     infoBox: {
          flex: 1,
          backgroundColor: 'rgba(0,0,0,0.03)',
          borderRadius: 12,
          padding: 12,
     },
     infoLabel: {
          fontSize: 10,
          color: '#888',
          fontWeight: '700',
          marginBottom: 4,
     },
     infoValue: {
          fontSize: 16,
          color: MainColors["Almost Black"],
          fontWeight: '500',
     },
     metaSection: {
          flexDirection: 'row',
          backgroundColor: 'rgba(0,0,0,0.03)',
          borderRadius: 15,
          marginBottom: 20,
     },
     metaItem: {
          flex: 1,
          padding: 15,
     },
     metaLabel: {
          fontSize: 12,
          color: '#888',
          marginBottom: 4,
     },
     metaValue: {
          fontSize: 15,
          fontWeight: '600',
          color: MainColors["Almost Black"],
     },
     activitiesCard: {
          backgroundColor: MainColors["Almost Black"],
          borderRadius: 24,
          padding: 20,
          marginBottom: 25,
     },
     activityItem: {
          flexDirection: 'row',
          backgroundColor: 'rgba(255,255,255,0.1)',
          borderRadius: 16,
          padding: 12,
          marginBottom: 12,
          gap: 12,
     },
     activityAvatar: {
          width: 40,
          height: 40,
          borderRadius: 20,
          backgroundColor: '#FFF',
          justifyContent: 'center',
          alignItems: 'center',
     },
     activityContent: {
          flex: 1,
     },
     activityAuthor: {
          color: '#FFF',
          fontWeight: 'bold',
          fontSize: 14,
     },
     activityDate: {
          color: 'rgba(255,255,255,0.6)',
          fontSize: 12,
          marginBottom: 4,
     },
     activityDescription: {
          color: '#FFF',
          fontSize: 14,
          lineHeight: 18,
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
          marginBottom: 20,
     },
     mediaItem: {
          marginRight: 10,
     },
     mediaImage: {
          width: 120,
          height: 120,
          borderRadius: 10,
     },
});