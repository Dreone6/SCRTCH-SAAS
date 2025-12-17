import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../../constants/colors';

export function Step6MessagePreview({ wizardState, updateState, borrowers }: any) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Step 6: Message Preview</Text>
      <Text style={styles.subtitle}>Component coming soon...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.prosperlyNavy,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.gray[600],
  },
});
