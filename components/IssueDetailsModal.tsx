import React from 'react';
import { View, Text, StyleSheet, Modal, Pressable, ScrollView, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { MainColors } from '@/constants/theme';
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

interface IssueDetailsModalProps {
  visible: boolean;
  issue: Issue | null;
  onClose: () => void;
  onUpvote?: (issueId: string) => void;
  isUpvoting?: boolean;
}

const statusColors = {
  submitted: "#EB3223",
  acknowledged: "#F29D38", 
  pending: "#FFFD54",
  resolved: "#75F94C"
};

const statusIcons = {
  submitted: "alert-circle",
  acknowledged: "alert-circle",
  pending: "time",
  resolved: "checkmark-circle"
};

const priorityColors = {
  low: "#4CAF50",
  medium: "#FF9800", 
  high: "#FF5722",
  urgent: "#9C27B0"
};

const IssueDetailsModal: React.FC<IssueDetailsModalProps> = ({
  visible,
  issue,
  onClose,
  onUpvote,
  isUpvoting = false
}) => {
  if (!issue) return null;

  const getStatusIcon = (status: string): keyof typeof Ionicons.glyphMap => {
    const iconMap: Record<string, keyof typeof Ionicons.glyphMap> = {
      submitted: "alert-circle",
      acknowledged: "alert-circle",
      pending: "time",
      resolved: "checkmark-circle"
    };
    return iconMap[status] || "help-circle";
  };

  const getStatusColor = (status: string) => {
    return statusColors[status as keyof typeof statusColors] || "#999999";
  };

  const getPriorityColor = (priority: string) => {
    return priorityColors[priority as keyof typeof priorityColors] || "#999999";
  };

  const handleUpvote = () => {
    if (onUpvote && !isUpvoting) {
      onUpvote(issue.id);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color={MainColors["Main Background"]} />
          </Pressable>
          <Text style={styles.headerTitle}>Issue Details</Text>
          <View style={styles.headerSpacer} />
        </View>

        {/* Content */}
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Title */}
          <Text style={styles.title}>{issue.title}</Text>

          {/* Status and Priority */}
          <View style={styles.statusContainer}>
            <View style={styles.statusItem}>
              <Ionicons 
                name={getStatusIcon(issue.status)} 
                size={20} 
                color={getStatusColor(issue.status)} 
              />
              <Text style={[styles.statusText, { color: getStatusColor(issue.status) }]}>
                {issue.status.charAt(0).toUpperCase() + issue.status.slice(1)}
              </Text>
            </View>
            <View style={styles.statusItem}>
              <View style={[styles.priorityDot, { backgroundColor: getPriorityColor(issue.priority) }]} />
              <Text style={[styles.statusText, { color: getPriorityColor(issue.priority) }]}>
                {issue.priority.charAt(0).toUpperCase() + issue.priority.slice(1)} Priority
              </Text>
            </View>
          </View>

          {/* Category */}
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Category:</Text>
            <Text style={styles.infoValue}>{issue.category}</Text>
          </View>

          {/* Tracking Number */}
          {issue.trackingNumber && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Tracking #:</Text>
              <Text style={styles.infoValue}>{issue.trackingNumber}</Text>
            </View>
          )}

          {/* Location */}
          <View style={styles.locationContainer}>
            <Ionicons name="location" size={20} color={MainColors["Primary Blue"]} />
            <View style={styles.locationInfo}>
              <Text style={styles.locationText}>{issue.location}</Text>
              <Text style={styles.coordinatesText}>
                {issue.coordinates.lat.toFixed(6)}, {issue.coordinates.lng.toFixed(6)}
              </Text>
            </View>
          </View>

          {/* Description */}
          <View style={styles.descriptionContainer}>
            <Text style={styles.descriptionLabel}>Description:</Text>
            <Text style={styles.descriptionText}>{issue.description}</Text>
          </View>

          {/* Reported Date */}
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Reported:</Text>
            <Text style={styles.infoValue}>{formatDate(issue.reportedAt)}</Text>
          </View>

          {/* Action Button */}
          <View style={styles.actionContainer}>
            <Pressable style={styles.upvoteButton} onPress={handleUpvote}>
              {isUpvoting ? (
                <ActivityIndicator size="small" color={MainColors["Main Background"]} />
              ) : (
                <>
                  <Ionicons name="thumbs-up-outline" size={20} color={MainColors["Main Background"]} />
                  <Text style={styles.upvoteButtonText}>Upvote Issue</Text>
                </>
              )}
            </Pressable>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: MainColors["Main Background"],
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: MainColors["Light Gray"],
  },
  closeButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: MainColors["Main Background"],
    fontFamily: 'EBGaramond',
  },
  headerSpacer: {
    width: 34,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: MainColors["Main Background"],
    marginBottom: 20,
    fontFamily: 'EBGaramond',
  },
  statusContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: MainColors["Light Gray"],
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 6,
    fontFamily: 'EBGaramond',
  },
  priorityDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginLeft: 6,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: MainColors["Light Gray"],
  },
  infoLabel: {
    fontSize: 16,
    color: MainColors["Neutral Gray"],
    fontFamily: 'EBGaramond',
  },
  infoValue: {
    fontSize: 16,
    color: MainColors["Main Background"],
    fontWeight: '500',
    fontFamily: 'EBGaramond',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: MainColors["Light Gray"],
  },
  locationInfo: {
    flex: 1,
    marginLeft: 10,
  },
  locationText: {
    fontSize: 16,
    color: MainColors["Main Background"],
    fontWeight: '500',
    fontFamily: 'EBGaramond',
  },
  coordinatesText: {
    fontSize: 12,
    color: MainColors["Neutral Gray"],
    marginTop: 4,
    fontFamily: 'EBGaramond',
  },
  descriptionContainer: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: MainColors["Light Gray"],
  },
  descriptionLabel: {
    fontSize: 16,
    color: MainColors["Neutral Gray"],
    marginBottom: 8,
    fontFamily: 'EBGaramond',
  },
  descriptionText: {
    fontSize: 16,
    color: MainColors["Main Background"],
    lineHeight: 24,
    fontFamily: 'EBGaramond',
  },
  actionContainer: {
    paddingVertical: 30,
    alignItems: 'center',
  },
  upvoteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: MainColors["Primary Blue"],
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
  },
  upvoteButtonText: {
    color: MainColors["Main Background"],
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
    fontFamily: 'EBGaramond',
  },
});

export default IssueDetailsModal;
