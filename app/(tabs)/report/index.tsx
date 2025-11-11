import InputElement from "@/components/InputElement";
import MainButton from "@/components/MainButton";
import { useStylesGlobal } from "@/hooks/use-styles-global";
import { IssueService } from "@/services/apis/issueServices";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import * as Location from 'expo-location'
import { MainColors } from "@/constants/theme";

export default function ReportScreen() {
     const mainStyles = useStylesGlobal()
     const navigate = useRouter()

     const [categories, setCategories] = useState<any[]>([]);
     const [selectedCategory, setSelectedCategory] = useState<any>(null);
     const [title, setTitle] = useState("");
     const [description, setDescription] = useState("");
     const [location, setLocation] = useState<any>(null);
     const [loadingCategories, setLoadingCategories] = useState(true);
     const [loadingLocation, setLoadingLocation] = useState(false);
     const [showCategoryModal, setShowCategoryModal] = useState(false);

     useEffect(() => {
          fetchCategories();
          getLocation();
     }, []);

     const fetchCategories = async () => {
          const result = await IssueService.getCategories();
          if (result.success) {
               setCategories(result.data.data.categories);
          } else {
               Alert.alert("Error", "Failed to load issue categories");
          }
          setLoadingCategories(false);
     };

     const getLocation = async () => {
          try {
               setLoadingLocation(true);
               
               // Request location permission
               let { status } = await Location.requestForegroundPermissionsAsync();
               if (status !== 'granted') {
                    Alert.alert('Permission Denied', 'Location permission is required to report issues. You can enter location manually.');
                    setLoadingLocation(false);
                    return;
               }

               // Get current location
               let currentLocation = await Location.getCurrentPositionAsync({});
               
               // Reverse geocode to get address
               let address = await Location.reverseGeocodeAsync({
                    latitude: currentLocation.coords.latitude,
                    longitude: currentLocation.coords.longitude,
               });

               if (address.length > 0) {
                    const addr = address[0];
                    setLocation({
                         latitude: currentLocation.coords.latitude,
                         longitude: currentLocation.coords.longitude,
                         address: `${addr.street || ''} ${addr.name || ''}`.trim(),
                         district: addr.city || addr.region || 'Unknown',
                         sector: addr.district || addr.subregion || 'Unknown',
                    });
               }
          } catch (error) {
               console.error('Error getting location:', error);
               Alert.alert("Location Error", "Could not get your location. Please enter manually.");
          } finally {
               setLoadingLocation(false);
          }
     };

     const handleCategorySelect = (category: any) => {
          setSelectedCategory(category);
          setShowCategoryModal(false);
     };

     const handleContinue = () => {
          // Validation
          if (!selectedCategory) {
               Alert.alert("Error", "Please select an issue category");
               return;
          }

          if (!title.trim()) {
               Alert.alert("Error", "Please enter an issue title");
               return;
          }

          if (!description.trim()) {
               Alert.alert("Error", "Please enter an issue description");
               return;
          }

          if (!location) {
               Alert.alert("Location Required", "Location is required to report an issue. Please enable location or enter manually."
               );
               return;
          }

          // Navigate to media attachment screen with data
          navigate.push({
               pathname: "/(tabs)/report/media",
               params: {
                    category: selectedCategory.id,
                    title: title.trim(),
                    description: description.trim(),
                    location: JSON.stringify(location),
               }
          });
     };

     const CategoryModal = () => (
          <Modal visible={showCategoryModal} animationType="slide" transparent={true} onRequestClose={() => setShowCategoryModal(false)}>
               <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                         <Text style={[mainStyles.authTitles, { marginBottom: 20 }]}>Select Issue Category</Text>

                         <ScrollView style={styles.categoryList}>
                              {categories.map((category) => (
                                   <Pressable key={category.id} style={[styles.categoryItem, selectedCategory?.id === category.id && styles.categoryItemSelected]}
                                        onPress={() => handleCategorySelect(category)}
                                   >
                                        <View>
                                             <Text style={[mainStyles.normalText, { fontWeight: '600', fontSize: 16 }]}>
                                                  {category.icon} {category.name}
                                             </Text>
                                             <Text style={[mainStyles.normalText, { fontSize: 12, color: '#666', marginTop: 5 }]}>
                                                  {category.description}
                                             </Text>
                                             <Text style={[mainStyles.normalText, { fontSize: 11, color: '#999', marginTop: 3 }]}>
                                                  Est. response: {category.estimatedResponseTime}
                                             </Text>
                                        </View>
                                   </Pressable>
                              ))}
                         </ScrollView>

                         <Pressable style={styles.closeModalButton} onPress={() => setShowCategoryModal(false)}>
                              <Text style={{ color: MainColors["Main Background"], fontWeight: '600' }}>Cancel</Text>
                         </Pressable>
                    </View>
               </View>
          </Modal>
     );

     if (loadingCategories) {
          return (
               <View style={[mainStyles.pages, { justifyContent: 'center', alignItems: 'center' }]}>
                    <ActivityIndicator size="large" color={MainColors["Primary Blue"]} />
                    <Text style={[mainStyles.normalText, { marginTop: 20 }]}>Loading categories...</Text>
               </View>
          );
     }

     return (
          <ScrollView style={[mainStyles.pages]}>
               <View style={{ gap: 30, justifyContent: "center", paddingVertical: 20 }}>
                    <Text style={[mainStyles.authTitles]}>Report a Civic Issue</Text>

                    <View style={{ gap: 10 }}>
                         {/* Category Selection */}
                         <Pressable style={styles.categorySelector} onPress={() => setShowCategoryModal(true)}>
                              <Text style={[mainStyles.normalText, { color: selectedCategory ? "#000" : "#999" }]}>
                                   {selectedCategory ? `${selectedCategory.icon} ${selectedCategory.name}` : "Select Issue Category *"}
                              </Text>
                         </Pressable>

                         {/* Title */}
                         <InputElement placeholder="Issue Title *" text={title} onChange={setTitle} />

                         {/* Description */}
                         <InputElement isTextArea placeholder="Describe the issue in detail *" text={description} onChange={setDescription} />

                         {/* Location Info */}
                         <View style={styles.locationInfo}>
                              <Text style={[mainStyles.normalText, { fontWeight: "600" }]}>📍 Location</Text>
                              {loadingLocation ? (
                                   <ActivityIndicator size="small" color={MainColors["Primary Blue"]} />
                              ) : location ? (
                                   <View style={{ marginTop: 5 }}>
                                        <Text style={[mainStyles.normalText, { fontSize: 12 }]}>{location.address}</Text>
                                        <Text style={[mainStyles.normalText, { fontSize: 11, color: "#666" }]}>{location.district}, {location.sector}</Text>
                                   </View>
                              ) : (
                                   <Text style={[mainStyles.normalText, { fontSize: 12, color: "#999" }]}>Location not available</Text>
                              )}
                              <Pressable onPress={getLocation} style={{ marginTop: 10 }}>
                                   <Text style={[mainStyles.normalText, { color: MainColors["Primary Blue"], fontSize: 12 }]}>
                                        {location ? "Update Location" : "Get Location"}
                                   </Text>
                              </Pressable>
                         </View>
                    </View>

                    <Text style={[mainStyles.normalText, { fontSize: 12, color: "#666", textAlign: "center" }]}>* Required fields</Text>

                    <MainButton isDark isFullWidth title="Continue to Add Photos" toDo={handleContinue} />
               </View>

               <CategoryModal />
          </ScrollView>
     );
}

const styles = StyleSheet.create({
     categorySelector: {
          borderWidth: 1,
          borderColor: "#DDD",
          borderRadius: 10,
          paddingVertical: 15,
          paddingHorizontal: 15,
          backgroundColor: MainColors["Main Background"],
     },
     locationInfo: {
          borderWidth: 1,
          borderColor: "#DDD",
          borderRadius: 10,
          paddingVertical: 15,
          paddingHorizontal: 15,
          backgroundColor: MainColors["Light Gray"],
     },
     modalContainer: {
          flex: 1,
          // justifyContent: "flex-end",
          backgroundColor: "rgba(0,0,0,0.5)",
     },
     modalContent: {
          backgroundColor: MainColors["Main Background"],
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          padding: 20,
          maxHeight: "80%",
     },
     categoryList: {
          maxHeight: 400,
     },
     categoryItem: {
          backgroundColor: MainColors["Light Gray"],
          borderRadius: 10,
          padding: 15,
          marginVertical: 5,
          borderWidth: 2,
          borderColor: "transparent",
     },
     categoryItemSelected: {
          borderColor: MainColors["Accent Green"],
          backgroundColor: "#E8F5E9",
     },
     closeModalButton: {
          backgroundColor: MainColors["Almost Black"],
          paddingVertical: 15,
          borderRadius: 10,
          alignItems: "center",
          marginTop: 15,
     },
});