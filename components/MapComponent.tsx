import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, Dimensions, ActivityIndicator, Text } from 'react-native';
import MapView, { Marker, Callout } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import { MainColors } from '@/constants/theme';
import { IssueService } from '@/services/apis/issueServices';
import { formatDate } from '@/services/apis/functions';

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

interface MapComponentProps {
  onIssuePress?: (issue: Issue) => void;
  initialRegion?: {
    latitude: number;
    longitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
  };
}

const statusColors = {
  submitted: "#EB3223",
  acknowledged: "#F29D38", 
  pending: "#FFFD54",
  resolved: "#75F94C"
};

const priorityColors = {
  low: "#4CAF50",
  medium: "#FF9800", 
  high: "#FF5722",
  urgent: "#9C27B0"
};

const { width, height } = Dimensions.get('window');

const MapComponent: React.FC<MapComponentProps> = ({ 
  onIssuePress, 
  initialRegion = {
    latitude: -1.9499,
    longitude: 30.0588,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  }
}) => {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchIssues = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await IssueService.getAllPublicIssues(1, 100);
      
      if (response.success && response.data?.success) {
        const transformedIssues = response.data.data.issues.map((issue: any) => ({
          id: issue._id,
          title: issue.title,
          status: issue.status,
          priority: issue.priority?.toLowerCase() || 'medium',
          location: issue.location?.address || 'Unknown Location',
          coordinates: issue.location?.type === 'Point' 
            ? { 
                lat: issue.location.coordinates[1], 
                lng: issue.location.coordinates[0] 
              }
            : { lat: -1.94995, lng: 30.05885 }, // Default Kigali coordinates
          reportedAt: issue.submittedAt || issue.createdAt || new Date().toISOString(),
          category: issue.category,
          description: issue.description || '',
          trackingNumber: issue.trackingNumber
        }));
        
        setIssues(transformedIssues);
      } else {
        setError(response.error || 'Failed to load issues');
      }
    } catch (err) {
      setError('Failed to load issues');
      console.error('Error fetching issues:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchIssues();
  }, [fetchIssues]);

  const getMarkerColor = (issue: Issue) => {
    return statusColors[issue.status as keyof typeof statusColors] || '#999999';
  };

  const renderMarker = (issue: Issue) => {
    const markerColor = getMarkerColor(issue);
    
    return (
      <Marker
        key={issue.id}
        coordinate={{
          latitude: issue.coordinates.lat,
          longitude: issue.coordinates.lng
        }}
        pinColor={markerColor}
        onPress={() => onIssuePress?.(issue)}
      >
        <Callout>
          <View style={styles.callout}>
            <Text style={styles.calloutTitle}>{issue.title}</Text>
            <Text style={styles.calloutCategory}>{issue.category}</Text>
            <Text style={styles.calloutLocation}>{issue.location}</Text>
            <Text style={styles.calloutStatus}>Status: {issue.status}</Text>
            <Text style={styles.calloutPriority}>Priority: {issue.priority}</Text>
            {issue.trackingNumber && (
              <Text style={styles.calloutTracking}>#{issue.trackingNumber}</Text>
            )}
            <Text style={styles.calloutDate}>
              {formatDate(issue.reportedAt)}
            </Text>
          </View>
        </Callout>
      </Marker>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={MainColors["Primary Blue"]} />
        <Text style={styles.loadingText}>Loading issues...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle" size={48} color={MainColors["Error red"]} />
        <Text style={styles.errorText}>{error}</Text>
        <Text style={styles.retryText} onPress={fetchIssues}>Tap to retry</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={initialRegion}
        showsUserLocation
        showsMyLocationButton
        showsCompass
        showsScale
        showsBuildings
        showsIndoors
      >
        {issues.map(renderMarker)}
      </MapView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    borderRadius: 20,
    overflow: 'hidden',
  },
  map: {
    width: '100%',
    height: '100%',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: MainColors["Light Gray"],
    borderRadius: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: MainColors["Neutral Gray"],
    fontFamily: 'EBGaramond',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: MainColors["Light Gray"],
    borderRadius: 20,
    padding: 20,
  },
  errorText: {
    marginTop: 10,
    fontSize: 16,
    color: MainColors["Error red"],
    textAlign: 'center',
    fontFamily: 'EBGaramond',
  },
  retryText: {
    marginTop: 10,
    fontSize: 14,
    color: MainColors["Primary Blue"],
    textDecorationLine: 'underline',
    fontFamily: 'EBGaramond',
  },
  callout: {
    width: 200,
    padding: 10,
    backgroundColor: 'white',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  calloutTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
    fontFamily: 'EBGaramond',
  },
  calloutCategory: {
    fontSize: 12,
    color: MainColors["Primary Blue"],
    marginBottom: 2,
    fontFamily: 'EBGaramond',
  },
  calloutLocation: {
    fontSize: 11,
    color: '#666',
    marginBottom: 2,
    fontFamily: 'EBGaramond',
  },
  calloutStatus: {
    fontSize: 11,
    color: '#666',
    marginBottom: 2,
    fontFamily: 'EBGaramond',
  },
  calloutPriority: {
    fontSize: 11,
    color: '#666',
    marginBottom: 2,
    fontFamily: 'EBGaramond',
  },
  calloutTracking: {
    fontSize: 10,
    color: MainColors["Primary Blue"],
    fontWeight: 'bold',
    marginBottom: 2,
    fontFamily: 'EBGaramond',
  },
  calloutDate: {
    fontSize: 10,
    color: '#999',
    fontFamily: 'EBGaramond',
  },
});

export default MapComponent;
