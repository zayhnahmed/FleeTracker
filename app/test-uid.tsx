import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { getCurrentUser } from '../services/auth.service';

export default function TestUID() {
  useEffect(() => {
    const user = getCurrentUser();
    if (user) {
      console.log('=====================================');
      console.log('🔑 USER UID:', user.uid);
      console.log('📧 EMAIL:', user.email);
      console.log('=====================================');
    }
  }, []);

  const user = getCurrentUser();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>User UID Test</Text>
      {user ? (
        <>
          <Text style={styles.label}>Email:</Text>
          <Text style={styles.value} selectable>{user.email}</Text>
          
          <Text style={styles.label}>UID (tap to select):</Text>
          <Text style={styles.value} selectable>{user.uid}</Text>
          
          <Text style={styles.hint}>
            💡 Check console for copy-paste friendly format
          </Text>
        </>
      ) : (
        <Text style={styles.notLoggedIn}>Not logged in</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#2D2D2D',
  },
  title: {
    fontSize: 24,
    color: '#F5F5F5',
    marginBottom: 30,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  label: {
    fontSize: 14,
    color: '#B8B8B8',
    marginTop: 20,
    marginBottom: 5,
  },
  value: {
    fontSize: 16,
    color: '#F6D13A',
    fontWeight: 'bold',
    padding: 10,
    backgroundColor: '#383838',
    borderRadius: 8,
  },
  notLoggedIn: {
    fontSize: 16,
    color: '#F5F5F5',
    textAlign: 'center',
  },
  hint: {
    fontSize: 12,
    color: '#8A8A8A',
    marginTop: 30,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});