import { MainColors } from "@/constants/theme";
import { useStylesGlobal } from "@/hooks/use-styles-global";
import { Ionicons } from "@expo/vector-icons";
import { useRef, useState } from "react";
import MapView, { Marker } from 'react-native-maps'
import { Animated, Pressable, StyleSheet, Text, TextInput, View, Modal } from "react-native";

interface Issue {
    id: string;
    title: string;
    location: string;
    coordinates: { lat: number; lng: number };
    status: string;
    priority: string;
    reportedAt: string;
    category: string;
    description: string;
}

const mockMapIssues: Issue[] = [
     {
          id: "ISS-001",
          title: "Broken streetlight on Main Street",
          status: "reported",
          priority: "medium",
          location: "Kigali",
          coordinates: { lat: -1.92935, lng: 30.03485 },
          reportedAt: "2024-01-20T10:30:00Z",
          category: "Infrastructure",
          description: "The streetlight has been flickering and completely went out last night."
     },
];

const statusColors = {
     reported: "#EB3223",
     acknowledged: "#F29D38",
     pending: "#FFFD54",
     resolved: "#75F94C"
};


export default function MapScreen() {
     const mainStyles = useStylesGlobal()
     const [viewKeyDetails, setViewKeyDetails] = useState(false)
     const animation = useRef(new Animated.Value(0)).current
     const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null)
     const [modelVisible, setModelVisible] = useState(false)

     const toggleKeyDetails = () => {
          if (viewKeyDetails) {
               Animated.timing(animation, { toValue: 0, duration: 300, useNativeDriver: false }).start(() => setViewKeyDetails(false))
          } else {
               setViewKeyDetails(true)
               Animated.timing(animation, { toValue: 1, duration: 300, useNativeDriver: false }).start()
          }
     }

     const SearchBar = () => {
          return (
               <View style={[styles.searchBar]}>
                    <TextInput placeholder="Search Location" placeholderTextColor={MainColors["Neutral Gray"]} style={[styles.searchInput]} />
                    <Ionicons name="search" color={MainColors["Neutral Gray"]} size={30} />
               </View>
          )
     }

     const Key = () => {
          const KeyDetailsOpacity = animation.interpolate({
               inputRange: [0, 1],
               outputRange: [0, 1]
          })

          return (
               <Pressable style={[styles.keyContainer]} onPress={toggleKeyDetails}>
                    {!viewKeyDetails && <Ionicons name="key" color={MainColors["Main Background"]} size={30} />}

                    {viewKeyDetails && (
                         <Animated.View style={{ gap: 5, opacity: KeyDetailsOpacity }}>
                              <View style={{ flexDirection: 'row', gap: '10', alignItems: 'center' }}>
                                   <Ionicons name="alert-circle" color={MainColors["Error red"]} size={20} />
                                   <Text style={{ fontSize: 14, fontFamily: 'EBGaramond', fontWeight: 500, color: MainColors["Main Background"] }}>Submitted Issues</Text>
                              </View>
                              <View style={{ flexDirection: 'row', gap: '10', alignItems: 'center' }}>
                                   <Ionicons name="alert-circle" color={'orange'} size={20} />
                                   <Text style={{ fontSize: 14, fontFamily: 'EBGaramond', fontWeight: 500, color: MainColors["Main Background"] }}>Acknowledged Issues</Text>
                              </View>
                              <View style={{ flexDirection: 'row', gap: '10', alignItems: 'center' }}>
                                   <Ionicons name="alert-circle" color={'yellow'} size={20} />
                                   <Text style={{ fontSize: 14, fontFamily: 'EBGaramond', fontWeight: 500, color: MainColors["Main Background"] }}>Pending Issues</Text>
                              </View>
                              <View style={{ flexDirection: 'row', gap: '10', alignItems: 'center' }}>
                                   <Ionicons name="checkmark-circle" color={MainColors["Accent Green"]} size={20} />
                                   <Text style={{ fontSize: 14, fontFamily: 'EBGaramond', fontWeight: 500, color: MainColors["Main Background"] }}>Resolved Issues</Text>
                              </View>
                         </Animated.View>
                    )}
               </Pressable>
          )
     }
     
     const handleMarkerPress = (issue: Issue) => {
          setSelectedIssue(issue);
          setModelVisible(true);
     };

     const closeModal = () => {
          setModelVisible(false);
          setSelectedIssue(null);
     };

     const Map = () => {
          return (
               <View style={[styles.map]}>
                    <Key />

                    <MapView style={StyleSheet.absoluteFill}
                         initialRegion={{ latitude: -1.9499, longitude: 30.0588, latitudeDelta: 2, longitudeDelta: 3, }}
                         showsUserLocation showsMyLocationButton
                    >
                         {mockMapIssues.map((issue) => (
                              <Marker key={issue.id} coordinate={{ latitude: issue.coordinates.lat, longitude: issue.coordinates.lng }}
                                   pinColor={'red'} onPress={() => handleMarkerPress(issue)}
                              />
                         ))}
                    </MapView>
               </View>
          )
     }
     
     const handlePressOutside = () => {
          if (viewKeyDetails) toggleKeyDetails()
     }
     
     return (
          <Pressable style={{ flex: 1 }} onPress={handlePressOutside}>
               <View style={[mainStyles.pages]}>
                    <SearchBar />
               
                    <Map />
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
     map: {
          borderRadius: 20,
          width: '100%',
          height: '93%',
          position: 'relative',
          flex: 1,
          borderWidth: 2,
          overflow: 'hidden'
     },
     keyContainer: {
          position: 'absolute',
          backgroundColor: MainColors["Almost Black"],
          paddingVertical: 10,
          paddingHorizontal: 10,
          borderRadius: 10,
          bottom: 20,
          right: 20,
          transitionDelay: '',
          elevation: 5,
     },
})