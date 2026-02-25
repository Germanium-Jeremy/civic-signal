import InputElement from "@/components/InputElement";
import MainButton from "@/components/MainButton";
import { useStylesGlobal } from "@/hooks/use-styles-global";
import { IssueService } from "@/services/apis/issueServices";
import { getDeviceInfo } from "@/services/apis/issueServices";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Platform,
} from "react-native";
import * as Location from "expo-location";
import { MainColors } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";

export default function ReportScreen() {
  const mainStyles = useStylesGlobal();
  const navigate = useRouter();

  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<any>(null);
  const [selectedPriority, setSelectedPriority] = useState("");
  const priorities = ["High", "Medium", "Low"];
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showPriorityModal, setShowPriorityModal] = useState(false);
  const [lodingSubmit, setLoadingSubmit] = useState(false);

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
      if (status !== "granted") {
        Alert.alert(
          "Permission Denied",
          "Location permission is required to report issues. You can enter location manually.",
        );
        setLoadingLocation(false);
        return;
      }

      // Get current location
      let currentLocation = await Location.getCurrentPositionAsync({});
      console.log(currentLocation);

      setLocation({
        coords: currentLocation.coords,
        timestamp: currentLocation.timestamp,
      });
    } catch (error) {
      console.error("Error getting location:", error);
    } finally {
      setLoadingLocation(false);
    }
  };

  const handleCategorySelect = (category: any) => {
    setSelectedCategory(category);
    setShowCategoryModal(false);
  };

  const handlePrioritySelect = (priority: string) => {
    setSelectedPriority(priority);
    setShowPriorityModal(false);
  };

  const handleContinue = async () => {
    // Validation
    if (!selectedCategory) {
      Alert.alert("Missing value", "Please select an issue category");
      return;
    }

    if (!selectedPriority.trim()) {
      Alert.alert("Missing value", "Please enter an issue Priority");
      return;
    }

    if (!description.trim()) {
      Alert.alert("Missing value", "Please enter an issue description");
      return;
    }

    try {
      setLoadingSubmit(true);
      const payload: any = {
        category: selectedCategory.id,
        description: description.trim(),
        priority: selectedPriority.trim(),
        deviceInfo: getDeviceInfo(), // Add deviceInfo to the payload
      };

      if (location?.coords?.latitude && location?.coords?.longitude) {
        payload.location = {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        };
      }

      const res = await IssueService.createIssue(payload);
      setLoadingSubmit(false);
      if (res.success && res.data?.data?.issue?._id) {
        const issueId = res.data.data.issue._id;
        navigate.push({
          pathname: "/(tabs)/report/media",
          params: { issueId },
        });
      } else {
        Alert.alert("Error", res.error || "Failed to create issue.");
        console.warn("Failed to submit issue: ", res.error);
      }
    } catch (error: any) {
      Alert.alert("Error", error?.message || "Failed to create issue.");
      console.warn("Failed to submit issue: ", error);
      setLoadingSubmit(false);
    }
  };

  const CategoryModal = () => (
    <Modal
      visible={showCategoryModal}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setShowCategoryModal(false)}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={[mainStyles.authTitles, { marginBottom: 20 }]}>
            Select Issue Category
          </Text>

          <ScrollView style={styles.categoryList}>
            {categories.map((category) => (
              <Pressable
                key={category.id}
                style={[
                  styles.categoryItem,
                  selectedCategory?.id === category.id &&
                    styles.categoryItemSelected,
                ]}
                onPress={() => handleCategorySelect(category)}
              >
                <View>
                  <Text
                    style={[
                      mainStyles.normalText,
                      { fontWeight: "600", fontSize: 16 },
                    ]}
                  >
                    {category.icon} {category.name}
                  </Text>
                  <Text
                    style={[
                      mainStyles.normalText,
                      { fontSize: 12, color: "#666", marginTop: 5 },
                    ]}
                  >
                    {category.description}
                  </Text>
                  <Text
                    style={[
                      mainStyles.normalText,
                      { fontSize: 11, color: "#999", marginTop: 3 },
                    ]}
                  >
                    Est. response: {category.estimatedResponseTime}
                  </Text>
                </View>
              </Pressable>
            ))}
          </ScrollView>

          <Pressable
            style={styles.closeModalButton}
            onPress={() => setShowCategoryModal(false)}
          >
            <Text
              style={{
                color: MainColors["Main Background"],
                fontWeight: "600",
              }}
            >
              Cancel
            </Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );

  if (loadingCategories) {
    return (
      <View
        style={[
          mainStyles.pages,
          { justifyContent: "center", alignItems: "center" },
        ]}
      >
        <ActivityIndicator size="large" color={MainColors["Primary Blue"]} />
        <Text style={[mainStyles.normalText, { marginTop: 20 }]}>
          Loading categories...
        </Text>
      </View>
    );
  }

  const PriorityModal = () => (
    <Modal
      visible={showPriorityModal}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setShowPriorityModal(false)}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={[mainStyles.authTitles, { marginBottom: 20 }]}>
            Select Issue Priority
          </Text>

          <ScrollView style={styles.categoryList}>
            {priorities.map((priority) => (
              <Pressable
                key={priority}
                style={[
                  styles.categoryItem,
                  selectedPriority === priority && styles.categoryItemSelected,
                ]}
                onPress={() => handlePrioritySelect(priority)}
              >
                <Text
                  style={[
                    mainStyles.normalText,
                    { fontSize: 12, color: "#666", marginTop: 5 },
                  ]}
                >
                  {priority}
                </Text>
              </Pressable>
            ))}
          </ScrollView>

          <Pressable
            style={styles.closeModalButton}
            onPress={() => setShowPriorityModal(false)}
          >
            <Text
              style={{
                color: MainColors["Main Background"],
                fontWeight: "600",
              }}
            >
              Cancel
            </Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );

  if (loadingCategories) {
    return (
      <View
        style={[
          mainStyles.pages,
          { justifyContent: "center", alignItems: "center" },
        ]}
      >
        <ActivityIndicator size="large" color={MainColors["Primary Blue"]} />
        <Text style={[mainStyles.normalText, { marginTop: 20 }]}>
          Loading categories...
        </Text>
      </View>
    );
  }

  return (
    <ScrollView style={[mainStyles.pages]}>
      <View style={{ gap: 30, justifyContent: "center", paddingVertical: 20 }}>
        <Text style={[mainStyles.authTitles]}>Report a Civic Issue</Text>

        <View style={{ gap: 10 }}>
          {/* Category Selection */}
          <Pressable
            style={styles.categorySelector}
            onPress={() => setShowCategoryModal(true)}
          >
            <Text
              style={[
                mainStyles.normalText,
                { color: selectedCategory ? "#000" : "#999" },
              ]}
            >
              {selectedCategory
                ? `${selectedCategory.icon} ${selectedCategory.name}`
                : "Select Issue Category *"}
            </Text>
          </Pressable>

          {/* Priority Selection */}
          <Pressable
            style={styles.categorySelector}
            onPress={() => setShowPriorityModal(true)}
          >
            <Text
              style={[
                mainStyles.normalText,
                { color: selectedPriority ? "#000" : "#999" },
              ]}
            >
              {selectedPriority
                ? `${selectedPriority}`
                : "Select Issue Priority *"}
            </Text>
          </Pressable>

          {/* Description */}
          <InputElement
            isTextArea
            placeholder="Describe the issue in detail *"
            text={description}
            onChange={setDescription}
          />

          {/* Captured Location Display */}
          <View style={styles.locationCaptureBox}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 5 }}>
              <Ionicons name="location" size={18} color={MainColors["Almost Black"]} />
              <Text style={{ fontWeight: '600', fontSize: 14 }}>Captured Location</Text>
            </View>
            
            {loadingLocation ? (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <ActivityIndicator size="small" color={MainColors["Almost Black"]} />
                <Text style={{ fontSize: 13, color: '#666' }}>Fetching your location...</Text>
              </View>
            ) : location ? (
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <Text style={{ fontSize: 13, color: MainColors["Accent Green"], fontWeight: '500' }}>
                  {location.coords.latitude.toFixed(6)}, {location.coords.longitude.toFixed(6)}
                </Text>
                <Pressable onPress={getLocation}>
                  <Text style={{ fontSize: 12, color: MainColors["Primary Blue"], fontWeight: '600' }}>Refresh</Text>
                </Pressable>
              </View>
            ) : (
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <Text style={{ fontSize: 13, color: MainColors["Error red"] }}>Location not captured</Text>
                <Pressable onPress={getLocation}>
                  <Text style={{ fontSize: 12, color: MainColors["Primary Blue"], fontWeight: '600' }}>Try Again</Text>
                </Pressable>
              </View>
            )}
          </View>
        </View>

        <Text
          style={[
            mainStyles.normalText,
            { fontSize: 12, color: "#666", textAlign: "center" },
          ]}
        >
          * Required fields
        </Text>

        {lodingSubmit ? (
          <ActivityIndicator color={MainColors["Almost Black"]} />
        ) : (
          <MainButton
            isDark
            isFullWidth
            title="Continue to Add Photos"
            toDo={handleContinue}
          />
        )}
      </View>

      <CategoryModal />
      <PriorityModal />
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
    justifyContent: "center",
  },
  modalContent: {
    backgroundColor: MainColors["Main Background"],
    borderRadius: 20,
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
  locationCaptureBox: {
    backgroundColor: MainColors["Light Gray"],
    padding: 15,
    borderRadius: 12,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#EEE',
  },
  closeModalButton: {
    backgroundColor: MainColors["Almost Black"],
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 15,
  },
});
