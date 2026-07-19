import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../src/contexts/AuthContext';
import { AuthService } from '../../src/services/auth.service';
import { StorageService } from '../../src/services/storage.service';
import { Avatar } from '../../src/components/Avatar';
import { Card } from '../../src/components/Card';
import { Button } from '../../src/components/Button';
import { Colors } from '../../src/constants/colors';
import { Typography } from '../../src/constants/typography';

export default function ProfileScreen() {
  const { user, signOut, refreshUser } = useAuth();
  const router = useRouter();
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const handleAvatarChange = async () => {
    try {
      setUploadingAvatar(true);
      const imageUri = await StorageService.pickImage();

      if (imageUri && user) {
        const avatarUrl = await StorageService.uploadAvatar(user.id, imageUri);
        await AuthService.updateProfile(user.id, { avatar_url: avatarUrl });
        await refreshUser();
        Alert.alert('Success', 'Profile picture updated!');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to upload image');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut();
              router.replace('/(auth)/login');
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to sign out');
            }
          },
        },
      ]
    );
  };

  if (!user) return null;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Profile</Text>

        {/* Profile Header */}
        <Card style={styles.profileCard}>
          <Avatar
            imageUrl={user.avatar_url}
            name={user.name}
            size={100}
            onPress={handleAvatarChange}
            showEditIcon={true}
          />
          {uploadingAvatar && <Text style={styles.uploadingText}>Uploading...</Text>}
          <Text style={styles.userName}>{user.name}</Text>
          <Text style={styles.userEmail}>{user.email}</Text>
        </Card>

        {/* Account Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>

          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuItemLeft}>
              <Ionicons name="person-outline" size={24} color={Colors.prosperlyBlue} />
              <Text style={styles.menuItemText}>Edit Profile</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={Colors.gray[400]} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuItemLeft}>
              <Ionicons name="lock-closed-outline" size={24} color={Colors.prosperlyBlue} />
              <Text style={styles.menuItemText}>Change Password</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={Colors.gray[400]} />
          </TouchableOpacity>
        </View>

        {/* Preferences Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferences</Text>

          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuItemLeft}>
              <Ionicons name="notifications-outline" size={24} color={Colors.prosperlyBlue} />
              <Text style={styles.menuItemText}>Notifications</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={Colors.gray[400]} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuItemLeft}>
              <Ionicons name="shield-outline" size={24} color={Colors.prosperlyBlue} />
              <Text style={styles.menuItemText}>Privacy</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={Colors.gray[400]} />
          </TouchableOpacity>
        </View>

        {/* Scrtch Section (added: Circle, Signature, Upgrade) */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Scrtch</Text>

          <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/circle')}>
            <View style={styles.menuItemLeft}>
              <Ionicons name="people-outline" size={24} color={Colors.prosperlyBlue} />
              <Text style={styles.menuItemText}>My Circle</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={Colors.gray[400]} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/signature' as any)}>
            <View style={styles.menuItemLeft}>
              <Ionicons name="create-outline" size={24} color={Colors.prosperlyBlue} />
              <Text style={styles.menuItemText}>My Signature</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={Colors.gray[400]} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/paywall' as any)}>
            <View style={styles.menuItemLeft}>
              <Ionicons name="sparkles-outline" size={24} color={Colors.prosperlyBlue} />
              <Text style={styles.menuItemText}>Upgrade to Pro</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={Colors.gray[400]} />
          </TouchableOpacity>
        </View>

        {/* Support Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Support</Text>

          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuItemLeft}>
              <Ionicons name="help-circle-outline" size={24} color={Colors.prosperlyBlue} />
              <Text style={styles.menuItemText}>Help & Support</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={Colors.gray[400]} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuItemLeft}>
              <Ionicons name="document-text-outline" size={24} color={Colors.prosperlyBlue} />
              <Text style={styles.menuItemText}>Terms & Privacy</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={Colors.gray[400]} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuItemLeft}>
              <Ionicons name="information-circle-outline" size={24} color={Colors.prosperlyBlue} />
              <Text style={styles.menuItemText}>About</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={Colors.gray[400]} />
          </TouchableOpacity>
        </View>

        {/* Sign Out */}
        <Button
          title="Sign Out"
          onPress={handleSignOut}
          variant="danger"
          style={styles.signOutButton}
        />

        <Text style={styles.versionText}>Version 1.0.0</Text>
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
    marginBottom: 24,
  },
  profileCard: {
    alignItems: 'center',
    padding: 32,
    marginBottom: 24,
  },
  uploadingText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.prosperlyBlue,
    marginTop: 8,
  },
  userName: {
    fontSize: Typography.fontSize['2xl'],
    fontWeight: Typography.fontWeight.bold,
    color: Colors.prosperlyNavy,
    marginTop: 16,
  },
  userEmail: {
    fontSize: Typography.fontSize.base,
    color: Colors.gray[600],
    marginTop: 4,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.gray[500],
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.white,
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuItemText: {
    fontSize: Typography.fontSize.base,
    color: Colors.prosperlyNavy,
    marginLeft: 12,
    fontWeight: Typography.fontWeight.medium,
  },
  signOutButton: {
    marginTop: 16,
    marginBottom: 24,
  },
  versionText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.gray[500],
    textAlign: 'center',
    marginBottom: 24,
  },
});
