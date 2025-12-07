import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/colors';
import { Typography } from '../constants/typography';
import { ProsperlyRating } from '../types';

interface RatingDisplayProps {
  rating: ProsperlyRating | null;
  showLabel?: boolean;
  size?: 'small' | 'medium' | 'large';
}

export function RatingDisplay({ rating, showLabel = true, size = 'medium' }: RatingDisplayProps) {
  const sizeMap = {
    small: 16,
    medium: 24,
    large: 32,
  };

  const iconSize = sizeMap[size];

  if (!rating) {
    return (
      <View style={styles.container}>
        <Text style={[styles.noRating, size === 'small' && styles.noRatingSmall]}>
          Not enough history yet
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.stars}>
        {[1, 2, 3, 4, 5].map(star => (
          <Ionicons
            key={star}
            name={star <= rating.stars ? 'star' : 'star-outline'}
            size={iconSize}
            color={star <= rating.stars ? '#FFB800' : Colors.gray[300]}
            style={styles.star}
          />
        ))}
      </View>
      {showLabel && (
        <Text style={[styles.label, size === 'small' && styles.labelSmall]}>
          {rating.label}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  stars: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  star: {
    marginHorizontal: 2,
  },
  label: {
    marginTop: 8,
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.medium,
    color: Colors.prosperlyNavy,
  },
  labelSmall: {
    fontSize: Typography.fontSize.sm,
    marginTop: 4,
  },
  noRating: {
    fontSize: Typography.fontSize.base,
    color: Colors.gray[500],
    textAlign: 'center',
  },
  noRatingSmall: {
    fontSize: Typography.fontSize.sm,
  },
});
