import React, { useRef } from 'react';
import { View, Text, StyleSheet, Pressable, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { MainColors } from '@/constants/theme';

interface MapLegendProps {
  visible?: boolean;
  onToggle?: () => void;
}

const statusColors = {
  submitted: "#EB3223",
  acknowledged: "#F29D38", 
  pending: "#FFFD54",
  resolved: "#75F94C"
};

const MapLegend: React.FC<MapLegendProps> = ({ visible = false, onToggle }) => {
  const animation = useRef(new Animated.Value(0)).current;

  const toggleLegend = () => {
    if (visible) {
      Animated.timing(animation, { 
        toValue: 0, 
        duration: 300, 
        useNativeDriver: false 
      }).start(() => onToggle?.());
    } else {
      onToggle?.();
      Animated.timing(animation, { 
        toValue: 1, 
        duration: 300, 
        useNativeDriver: false 
      }).start();
    }
  };

  const legendOpacity = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1]
  });

  const legendHeight = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 180]
  });

  return (
    <View style={styles.container}>
      <Pressable style={styles.toggleButton} onPress={toggleLegend}>
        <Ionicons name="key" color={MainColors["Main Background"]} size={24} />
      </Pressable>

      {visible && (
        <Animated.View 
          style={[
            styles.legendContent, 
            { 
              opacity: legendOpacity,
              height: legendHeight
            }
          ]}
        >
          <Text style={styles.legendTitle}>Issue Status</Text>
          
          <View style={styles.legendItem}>
            <Ionicons 
              name="alert-circle" 
              color={statusColors.submitted} 
              size={20} 
            />
            <Text style={styles.legendText}>Submitted</Text>
          </View>

          <View style={styles.legendItem}>
            <Ionicons 
              name="alert-circle" 
              color={statusColors.acknowledged} 
              size={20} 
            />
            <Text style={styles.legendText}>Acknowledged</Text>
          </View>

          <View style={styles.legendItem}>
            <Ionicons 
              name="time" 
              color={statusColors.pending} 
              size={20} 
            />
            <Text style={styles.legendText}>Pending</Text>
          </View>

          <View style={styles.legendItem}>
            <Ionicons 
              name="checkmark-circle" 
              color={statusColors.resolved} 
              size={20} 
            />
            <Text style={styles.legendText}>Resolved</Text>
          </View>
        </Animated.View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 80,
    right: 10,
    alignItems: 'flex-end',
  },
  toggleButton: {
    backgroundColor: MainColors["Almost Black"],
    padding: 10,
    borderRadius: 25,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  legendContent: {
    backgroundColor: MainColors["Almost Black"],
    padding: 15,
    borderRadius: 10,
    marginTop: 10,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    overflow: 'hidden',
  },
  legendTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: MainColors["Main Background"],
    marginBottom: 10,
    fontFamily: 'EBGaramond',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  legendText: {
    fontSize: 12,
    color: MainColors["Main Background"],
    marginLeft: 8,
    fontFamily: 'EBGaramond',
  },
});

export default MapLegend;
