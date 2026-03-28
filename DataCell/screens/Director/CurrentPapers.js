import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const CurrentPapers = () => {
  return (
    <View style={styles.container}>
      <Text>Current Papers Screen</Text>
    </View>
  );
};

export default CurrentPapers;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});