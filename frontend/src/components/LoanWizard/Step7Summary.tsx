import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../../constants/colors';
import { Button } from '../Button';

export function Step7Summary({ wizardState, updateState, borrowers, onCreateLoan, loading }: any) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Step 7: Summary & Confirmation</Text>
      <Text style={styles.subtitle}>Component coming soon...</Text>
      <Button 
        title={loading ? "Creating..." : "Create Loan"} 
        onPress={onCreateLoan}
        loading={loading}
        style={{ marginTop: 24 }}
      />
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
