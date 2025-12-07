import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../src/contexts/AuthContext';
import { Card } from '../../src/components/Card';
import { RatingDisplay } from '../../src/components/RatingDisplay';
import { Colors } from '../../src/constants/colors';
import { Typography } from '../../src/constants/typography';
import { calculateProsperlyRating, getRatingTips } from '../../src/utils/trustScore';

export default function RatingScreen() {
  const { user } = useAuth();

  const rating = user
    ? calculateProsperlyRating(user.total_payments, user.on_time_payments)
    : null;

  const tips = getRatingTips(rating);

  const getRatingColor = (stars?: number) => {
    if (!stars) return Colors.gray[400];
    if (stars >= 4) return Colors.prosperlyMint;
    if (stars === 3) return Colors.warning;
    return Colors.error;
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Prosperly Rating</Text>
        <Text style={styles.subtitle}>Your private payment reliability score</Text>

        {/* Rating Card */}
        <Card style={styles.ratingCard}>
          <View style={styles.ratingHeader}>
            <Ionicons name="shield-checkmark" size={32} color={getRatingColor(rating?.stars)} />
            <Text style={styles.ratingLabel}>Your Rating</Text>
          </View>

          <View style={styles.ratingDisplay}>
            <RatingDisplay rating={rating} showLabel={true} size="large" />
          </View>

          {rating && (
            <View style={styles.ratingStats}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{user?.total_payments || 0}</Text>
                <Text style={styles.statLabel}>Total Payments</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{user?.on_time_payments || 0}</Text>
                <Text style={styles.statLabel}>On-Time Payments</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{(rating.ratio * 100).toFixed(0)}%</Text>
                <Text style={styles.statLabel}>Success Rate</Text>
              </View>
            </View>
          )}
        </Card>

        {/* How It Works */}
        <Card style={styles.infoCard}>
          <View style={styles.infoHeader}>
            <Ionicons name="information-circle" size={24} color={Colors.prosperlyBlue} />
            <Text style={styles.infoTitle}>How It Works</Text>
          </View>
          <Text style={styles.infoText}>
            Your Prosperly Rating is calculated based on your payment history:
          </Text>
          <View style={styles.ratingLevels}>
            <View style={styles.ratingLevel}>
              <RatingDisplay rating={{ stars: 5, label: 'Excellent', ratio: 0.95 }} showLabel={false} size="small" />
              <Text style={styles.levelText}>≥ 90% on-time</Text>
            </View>
            <View style={styles.ratingLevel}>
              <RatingDisplay rating={{ stars: 4, label: 'Reliable', ratio: 0.80 }} showLabel={false} size="small" />
              <Text style={styles.levelText}>75-89% on-time</Text>
            </View>
            <View style={styles.ratingLevel}>
              <RatingDisplay rating={{ stars: 3, label: 'Mixed', ratio: 0.65 }} showLabel={false} size="small" />
              <Text style={styles.levelText}>60-74% on-time</Text>
            </View>
            <View style={styles.ratingLevel}>
              <RatingDisplay rating={{ stars: 2, label: 'At Risk', ratio: 0.50 }} showLabel={false} size="small" />
              <Text style={styles.levelText}>40-59% on-time</Text>
            </View>
            <View style={styles.ratingLevel}>
              <RatingDisplay rating={{ stars: 1, label: 'Unreliable', ratio: 0.30 }} showLabel={false} size="small" />
              <Text style={styles.levelText}>&lt; 40% on-time</Text>
            </View>
          </View>
        </Card>

        {/* Tips for Improvement */}
        <Card style={styles.tipsCard}>
          <View style={styles.tipsHeader}>
            <Ionicons name="bulb" size={24} color={Colors.warning} />
            <Text style={styles.tipsTitle}>Tips to Improve</Text>
          </View>
          {tips.map((tip, index) => (
            <View key={index} style={styles.tipItem}>
              <View style={styles.tipBullet}>
                <Ionicons name="checkmark-circle" size={20} color={Colors.prosperlyMint} />
              </View>
              <Text style={styles.tipText}>{tip}</Text>
            </View>
          ))}
        </Card>

        {/* Privacy Note */}
        <Card style={styles.privacyCard}>
          <Ionicons name="lock-closed" size={20} color={Colors.gray[500]} />
          <Text style={styles.privacyText}>
            Your rating is private and only visible to you. It's not shared with other users.
          </Text>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.prosperlySlate,
  },
  scrollContent: {
    padding: 24,
  },
  title: {
    fontSize: Typography.fontSize['3xl'],
    fontWeight: Typography.fontWeight.bold,
    color: Colors.prosperlyNavy,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: Typography.fontSize.base,
    color: Colors.gray[600],
    marginBottom: 24,
  },
  ratingCard: {
    padding: 24,
    marginBottom: 16,
    alignItems: 'center',
  },
  ratingHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  ratingLabel: {
    fontSize: Typography.fontSize.base,
    color: Colors.gray[600],
    marginTop: 8,
  },
  ratingDisplay: {
    marginBottom: 32,
  },
  ratingStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: Colors.gray[200],
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: Typography.fontSize['2xl'],
    fontWeight: Typography.fontWeight.bold,
    color: Colors.prosperlyNavy,
  },
  statLabel: {
    fontSize: Typography.fontSize.xs,
    color: Colors.gray[600],
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    backgroundColor: Colors.gray[200],
  },
  infoCard: {
    padding: 20,
    marginBottom: 16,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.prosperlyNavy,
    marginLeft: 8,
  },
  infoText: {
    fontSize: Typography.fontSize.base,
    color: Colors.gray[600],
    lineHeight: 24,
    marginBottom: 16,
  },
  ratingLevels: {
    gap: 12,
  },
  ratingLevel: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  levelText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.gray[600],
  },
  tipsCard: {
    padding: 20,
    marginBottom: 16,
  },
  tipsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  tipsTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.prosperlyNavy,
    marginLeft: 8,
  },
  tipItem: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  tipBullet: {
    marginRight: 12,
    marginTop: 2,
  },
  tipText: {
    flex: 1,
    fontSize: Typography.fontSize.base,
    color: Colors.gray[700],
    lineHeight: 22,
  },
  privacyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: Colors.gray[50],
  },
  privacyText: {
    flex: 1,
    fontSize: Typography.fontSize.sm,
    color: Colors.gray[600],
    marginLeft: 12,
    lineHeight: 20,
  },
});
