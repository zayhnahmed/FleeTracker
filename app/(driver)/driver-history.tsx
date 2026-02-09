/**
 * Driver History Screen
 * Display driver's trip history
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  SafeAreaView,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Header } from '../../components/shared/Header';
import { TripCard } from '../../components/driver/TripCard';
import { LoadingSpinner } from '../../components/shared/LoadingSpinner';
import { subscribeToDriverHistory } from '../../services/driver.service';
import { getCurrentUser } from '../../services/auth.service';
import { TripHistory } from '../../types';
import { ROUTES } from '../../constants/app.constants';
import { colors, spacing, textStyles } from '../../themes';

export default function DriverHistoryScreen() {
  const router = useRouter();
  const [trips, setTrips] = useState<TripHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const user = getCurrentUser();
    if (!user) {
      router.replace(ROUTES.LOGIN);
      return;
    }

    const unsubscribe = subscribeToDriverHistory(user.uid, (tripsData) => {
      setTrips(tripsData);
      setLoading(false);
      setRefreshing(false);
    });

    return () => unsubscribe();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
  };

  if (loading) {
    return <LoadingSpinner message="Loading trip history..." />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Trip History" />

      <FlatList
        data={trips}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <TripCard trip={item} />}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>No Trip History</Text>
            <Text style={styles.emptyText}>
              Your completed trips will appear here.
            </Text>
          </View>
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary}
          />
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  listContent: {
    padding: spacing.md,
    paddingBottom: spacing.xl,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.xxxl,
    paddingHorizontal: spacing.lg,
  },
  emptyTitle: {
    ...textStyles.h2,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  emptyText: {
    ...textStyles.body,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});