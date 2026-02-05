import { MainColors } from "@/constants/theme";
import { UserDataInterface } from "@/constants/UserInterface";
import { useStylesGlobal } from "@/hooks/use-styles-global";
import { AuthService } from "@/services/apis/authServices";
import { IssueService } from "@/services/apis/issueServices";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
} from "react-native";
import { useUser } from "../_layout";

interface UserStats {
  total: number;
  submitted: number;
  acknowledged: number;
  pending: number;
  resolved: number;
}

const tabs = [
  { key: "submitted", label: "Submitted" },
  { key: "acknowledged", label: "Acknowledged" },
  { key: "pending", label: "Pending" },
  { key: "resolved", label: "Resolved" },
];

export default function ProfileScreen() {
  const mainStyles = useStylesGlobal();
  const { user } = useUser();
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(false);
  const [loadingLogout, setLoadingLogout] = useState(false);
  const navigate = useRouter();

  useEffect(() => {
    const fetchUserStats = async () => {
      setLoadingStats(true);
      try {
        const statsResult = await IssueService.getMyStats();
        if (statsResult.success && statsResult.data) {
          setUserStats({
            total: statsResult.data.total,
            submitted: statsResult.data.submitted,
            acknowledged: statsResult.data.acknowledged || 0,
            pending: statsResult.data.inProgress,
            resolved: statsResult.data.resolved,
          });
        }
      } catch (error) {
        console.error("Error fetching user stats:", error);
      } finally {
        setLoadingStats(false);
      }
    };

    if (user) {
      fetchUserStats();
    }
  }, [user]);

  const handleLogout = async () => {
    Alert.alert("Logout", "Choose logout option:", [
      {
        text: "Logout All Devices",
        onPress: async () => {
          setLoadingLogout(true);
          try {
            const result = await AuthService.logout(true);
            if (result.success || !result.success) {
              // Navigate even if API fails
              navigate.replace("/(auth)/signin");
            }
          } catch (error) {
            console.error("Logout error:", error);
            navigate.replace("/(auth)/signin"); // Still navigate on error
          } finally {
            setLoadingLogout(false);
          }
        },
        style: "destructive",
      },
      {
        text: "Logout Current Device",
        onPress: async () => {
          setLoadingLogout(true);
          try {
            const result = await AuthService.logout(false);
            if (result.success || !result.success) {
              // Navigate even if API fails
              navigate.replace("/(auth)/signin");
            }
          } catch (error) {
            console.error("Logout error:", error);
            navigate.replace("/(auth)/signin"); // Still navigate on error
          } finally {
            setLoadingLogout(false);
          }
        },
        style: "default",
      },
      {
        text: "Cancel",
        onPress: () => console.log("Logout cancelled"),
        style: "cancel",
      },
    ]);
  };

  const TabSelection = () => {
    if (loadingStats) {
      return (
        <View style={[styles.loadingContainer]}>
          <ActivityIndicator size="small" color={MainColors["Primary Blue"]} />
          <Text
            style={[
              mainStyles.normalText,
              { color: MainColors["Neutral Gray"], marginLeft: 10 },
            ]}
          >
            Loading stats...
          </Text>
        </View>
      );
    }

    return (
      <FlatList
        showsHorizontalScrollIndicator={false}
        horizontal
        data={tabs}
        renderItem={(tab) => {
          const count = userStats?.[tab.item.key as keyof UserStats] || 0;
          return (
            <View style={[styles.tab]}>
              <Text
                style={[
                  mainStyles.normalText,
                  { color: MainColors["Almost Black"], fontWeight: 500 },
                ]}
              >
                {tab.item.label}
              </Text>
              <Text
                style={[
                  mainStyles.normalText,
                  {
                    color: MainColors["Almost Black"],
                    fontWeight: 500,
                    fontSize: 30,
                  },
                ]}
              >
                {count}
              </Text>
            </View>
          );
        }}
      />
    );
  };

  const profileImageUrl = user?.profileImage
    ? `${user.profileImage}?timestamp=${Date.now()}` // Cache-busting
    : "https://example.com/placeholder.png"; // Placeholder image

  return (
    <View style={[mainStyles.pages, { gap: 30 }]}>
      <View style={[styles.profile]}>
        <Image
          source={{ uri: profileImageUrl }}
          resizeMode="cover"
          style={[styles.profileImage]}
        />
        <Text style={[mainStyles.normalText, styles.name]}>
          {user?.fullName}
        </Text>
        <Text style={[mainStyles.normalText, styles.role]}>
          {user?.role}
        </Text>
      </View>

      <TabSelection />

      <View style={[styles.options]}>
        <View style={[styles.option, { borderBottomWidth: 1 }]}>
          <Text style={[mainStyles.normalText]}>Check for Updates</Text>
          <Ionicons name="chevron-forward" size={20} />
        </View>
        <Pressable
          style={[styles.option, { borderBottomWidth: 1 }]}
          onPress={() =>
            navigate.push({ pathname: "/(tabs)/profile/edit" as any })
          }
        >
          <Text style={[mainStyles.normalText]}>Edit Profile</Text>
          <Ionicons name="chevron-forward" size={20} />
        </Pressable>
        <View style={[styles.option, { borderBottomWidth: 1 }]}>
          <Text style={[mainStyles.normalText]}>Terms and Conditions</Text>
          <Ionicons name="chevron-forward" size={20} />
        </View>
        <View style={[styles.option, { borderBottomWidth: 1 }]}>
          <Text style={[mainStyles.normalText]}>Privacy Policies</Text>
          <Ionicons name="chevron-forward" size={20} />
        </View>
        <Pressable
          style={[styles.option]}
          onPress={handleLogout}
          disabled={loadingLogout}
        >
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            {loadingLogout ? (
              <ActivityIndicator size="small" color={MainColors["Error red"]} />
            ) : (
              <Text
                style={[
                  mainStyles.normalText,
                  { color: MainColors["Error red"] },
                ]}
              >
                Logout
              </Text>
            )}
          </View>
          <Ionicons
            name="chevron-forward"
            size={20}
            color={MainColors["Error red"]}
          />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  profile: {
    justifyContent: "center",
    alignItems: "center",
  },
  profileImage: {
    width: 150,
    height: 150,
    borderRadius: 500,
  },
  name: {
    fontSize: 22,
    fontWeight: 500,
  },
  role: {
    color: MainColors["Neutral Gray"],
  },
  tab: {
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
    justifyContent: "space-evenly",
    alignItems: "center",
    backgroundColor: MainColors["Light Gray"],
    marginHorizontal: 5,
  },
  options: {
    borderRadius: 20,
    backgroundColor: MainColors["Light Gray"],
    paddingHorizontal: 20,
    paddingVertical: 10,
    gap: 10,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderColor: MainColors["Almost Black"],
    paddingVertical: 5,
  },
  loadingContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 20,
  },
});
