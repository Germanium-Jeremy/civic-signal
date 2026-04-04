import { MainColors } from "@/constants/theme";
import { useStylesGlobal } from "@/hooks/use-styles-global";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Pressable, StyleSheet, TextInput, View } from "react-native";
import MapComponent from "@/components/MapComponent";
import MapLegend from "@/components/MapLegend";
import { useRouter } from "expo-router";

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
     const navigate = useRouter()
     const [showLegend, setShowLegend] = useState(false)
     const [searchText, setSearchText] = useState("")

     const handleMarkerPress = (issue: Issue) => {
          navigate.push({ pathname: "/(tabs)/issues/details", params: { id: issue.id } });
     };

     const SearchBar = () => {
          return (
               <View style={[styles.searchBar]}>
                    <TextInput 
                         placeholder="Search Category or Title" 
                         placeholderTextColor={MainColors["Neutral Gray"]} 
                         style={[styles.searchInput]} 
                         value={searchText}
                         onChangeText={setSearchText}
                    />
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
                         <MapComponent 
                              onIssuePress={handleMarkerPress} 
                              searchText={searchText}
                         />
                         <MapLegend visible={showLegend} onToggle={() => setShowLegend(!showLegend)} />
                    </View>
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
