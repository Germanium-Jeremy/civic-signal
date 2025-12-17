import { MainColors } from "@/constants/theme";
import { useStylesGlobal } from "@/hooks/use-styles-global";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import MapComponent from "@/components/MapComponent";
import IssueDetailsModal from "@/components/IssueDetailsModal";
import MapLegend from "@/components/MapLegend";
import { IssueService } from "@/services/apis/issueServices";

interface Issue {
    id: string;
    title: string;
    status: string;
    priority: string;
    location: string;
    coordinates: { lat: number; lng: number };
    reportedAt: string;
    category: string;
    description: string;
    trackingNumber?: string;
}

export default function MapScreen() {
     const mainStyles = useStylesGlobal()
     const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null)
     const [modalVisible, setModalVisible] = useState(false)
     const [isUpvoting, setIsUpvoting] = useState(false)
     const [showLegend, setShowLegend] = useState(false)

     const handleMarkerPress = (issue: Issue) => {
          setSelectedIssue(issue);
          setModalVisible(true);
     };

     const closeModal = () => {
          setModalVisible(false);
          setSelectedIssue(null);
     };

     const handleUpvote = async (issueId: string) => {
          try {
               setIsUpvoting(true);
               const result = await IssueService.upvoteIssue(issueId);
               if (result.success) {
                    // You could show a success message or update the UI
                    console.log('Issue upvoted successfully');
               } else {
                    console.error('Failed to upvote issue:', result.error);
               }
          } catch (error) {
               console.error('Error upvoting issue:', error);
          } finally {
               setIsUpvoting(false);
          }
     };

     const SearchBar = () => {
          return (
               <View style={[styles.searchBar]}>
                    <TextInput placeholder="Search Location" placeholderTextColor={MainColors["Neutral Gray"]} style={[styles.searchInput]} />
                    <Ionicons name="search" color={MainColors["Neutral Gray"]} size={30} />
               </View>
          )
     }

     const handlePressOutside = () => {
          if (showLegend) setShowLegend(false);
     };

     return (
          <Pressable style={{ flex: 1 }} onPress={handlePressOutside}>
               <View style={[mainStyles.pages]}>
                    <SearchBar />
                    
                    <View style={styles.mapContainer}>
                         <MapComponent onIssuePress={handleMarkerPress} />
                         <MapLegend visible={showLegend} onToggle={() => setShowLegend(!showLegend)} />
                    </View>
                    
                    <IssueDetailsModal
                         visible={modalVisible}
                         issue={selectedIssue}
                         onClose={closeModal}
                         onUpvote={handleUpvote}
                         isUpvoting={isUpvoting}
                    />
               </View>
          </Pressable>
     )
}

const styles = StyleSheet.create({
     searchBar: {
          borderRadius: 50,
          width: '100%',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: MainColors["Light Gray"],
          paddingHorizontal: 20,
     },
     searchInput: {
          color: MainColors["Neutral Gray"],
          fontSize: 16,
          fontFamily: 'EBGaramond',
          width: '90%'
     },
     mapContainer: {
          flex: 1,
          marginTop: 10,
          borderRadius: 20,
          overflow: 'hidden',
          position: 'relative',
     },
})