import { supabase } from './supabase';
import * as ImagePicker from 'expo-image-picker';

export class StorageService {
  // Upload avatar
  static async uploadAvatar(userId: string, imageUri: string): Promise<string> {
    try {
      // Convert image URI to blob
      const response = await fetch(imageUri);
      const blob = await response.blob();
      
      // Create file name
      const fileExt = imageUri.split('.').pop();
      const fileName = `${userId}-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('user-content')
        .upload(filePath, blob, {
          contentType: `image/${fileExt}`,
          upsert: true,
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('user-content')
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error) {
      console.error('Error uploading avatar:', error);
      throw error;
    }
  }

  // Upload a base64-encoded signature PNG (from react-native-signature-canvas)
  // to the same user-content bucket used for avatars, and store the public
  // URL on the caller's profile (see StorageService.saveSignatureUrl / the
  // profiles.signature_url column added in
  // supabase-signature-and-subscription-extension.sql).
  static async uploadSignature(userId: string, base64Png: string): Promise<string> {
    const base64Data = base64Png.includes(',') ? base64Png.split(',')[1] : base64Png;
    const response = await fetch(`data:image/png;base64,${base64Data}`);
    const blob = await response.blob();

    const filePath = `signatures/${userId}-${Date.now()}.png`;

    const { error: uploadError } = await supabase.storage
      .from('user-content')
      .upload(filePath, blob, { contentType: 'image/png', upsert: true });

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage.from('user-content').getPublicUrl(filePath);
    return publicUrl;
  }

    // Pick image from device
  static async pickImage(): Promise<string | null> {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      throw new Error('Permission to access media library is required');
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      return result.assets[0].uri;
    }

    return null;
  }
}
