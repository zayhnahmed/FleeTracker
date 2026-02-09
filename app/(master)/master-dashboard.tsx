/**
 * Master Dashboard
 * Vehicle fleet overview with filtering, management, and request handling
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  SafeAreaView,
  RefreshControl,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Header } from '../../components/shared/Header';
import { FilterChips } from '../../components/shared/FilterChips';
import { VehicleCard } from '../../components/master/VehicleCard';
import { LoadingSpinner } from '../../components/shared/LoadingSpinner';
import { RequestApprovalModal } from '../../components/master/RequestApprovalModal';
import { subscribeToVehicles } from '../../services/vehicle.service';
import { getCurrentUser, signOut } from '../../services/auth.service';
import { Vehicle, VehicleState, DashboardStats, VehicleRequest, RequestStatus } from '../../types';
import { ROUTES, VEHICLE_STATUS_LABELS } from '../../constants/app.constants';
import {
  subscribeToVehicleRequests,
  approveVehicleRequest,
  rejectVehicleRequest,
} from '../../services/assignment.service';
import { assignVehicle } from '../../services/vehicle.service';
import { colors, spacing, radius, textStyles, shadows } from '../../themes';

export default function MasterDashboard() {
  const router = useRouter();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [filteredVehicles, setFilteredVehicles] = useState<Vehicle[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<VehicleState | 'ALL'>('ALL');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState<DashboardStats>({
    totalVehicles: 0,
    available: 0,
    assigned: 0,
    inTransit: 0,
    returning: 0,
  });

  // Vehicle requests state
  const [requests, setRequests] = useState<VehicleRequest[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<VehicleRequest | null>(null);
  const [requestModalVisible, setRequestModalVisible] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const [showRequestsList, setShowRequestsList] = useState(false);

  const filterOptions = [
    { label: 'All', value: 'ALL' as const },
    { label: VEHICLE_STATUS_LABELS[VehicleState.AVAILABLE], value: VehicleState.AVAILABLE },
    { label: VEHICLE_STATUS_LABELS[VehicleState.ASSIGNED], value: VehicleState.ASSIGNED },
    { label: VEHICLE_STATUS_LABELS[VehicleState.IN_TRANSIT], value: VehicleState.IN_TRANSIT },
    { label: VEHICLE_STATUS_LABELS[VehicleState.RETURNING], value: VehicleState.RETURNING },
  ];

  useEffect(() => {
    const user = getCurrentUser();
    if (!user) {
      router.replace(ROUTES.LOGIN);
      return;
    }

    const unsubscribe = subscribeToVehicles((vehiclesData) => {
      setVehicles(vehiclesData);
      calculateStats(vehiclesData);
      setLoading(false);
      setRefreshing(false);
    });

    return () => unsubscribe();
  }, []);

  // Subscribe to vehicle requests
  useEffect(() => {
    const unsubscribe = subscribeToVehicleRequests((requestsData) => {
      setRequests(requestsData);
      const pending = requestsData.filter(r => r.status === RequestStatus.PENDING).length;
      setPendingCount(pending);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (selectedFilter === 'ALL') {
      setFilteredVehicles(vehicles);
    } else {
      setFilteredVehicles(vehicles.filter((v) => v.status === selectedFilter));
    }
  }, [selectedFilter, vehicles]);

  const calculateStats = (vehiclesData: Vehicle[]) => {
    const newStats: DashboardStats = {
      totalVehicles: vehiclesData.length,
      available: 0,
      assigned: 0,
      inTransit: 0,
      returning: 0,
    };

    vehiclesData.forEach((vehicle) => {
      if (vehicle.status === VehicleState.AVAILABLE) newStats.available++;
      else if (vehicle.status === VehicleState.ASSIGNED) newStats.assigned++;
      else if (vehicle.status === VehicleState.IN_TRANSIT) newStats.inTransit++;
      else if (vehicle.status === VehicleState.RETURNING) newStats.returning++;
    });

    setStats(newStats);
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      router.replace(ROUTES.LOGIN);
    } catch (error) {
      Alert.alert('Error', 'Failed to sign out');
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
  };

  const handleViewRequests = () => {
    if (requests.length > 0) {
      const pendingRequests = requests.filter(r => r.status === RequestStatus.PENDING);
      if (pendingRequests.length > 0) {
        setSelectedRequest(pendingRequests[0]);
        setRequestModalVisible(true);
      } else {
        // Show first request if no pending
        setSelectedRequest(requests[0]);
        setRequestModalVisible(true);
      }
    }
  };

  const handleApproveRequest = async (
    requestId: string,
    vehicleId: string,
    driverId: string,
    driverName: string,
    destination: string
  ) => {
    const user = getCurrentUser();
    if (!user) return;

    try {
      // First assign the vehicle
      await assignVehicle(vehicleId, driverId, driverName, destination);
      
      // Then mark request as approved
      await approveVehicleRequest(requestId, user.uid);
      
      Alert.alert('Success', `Vehicle ${vehicleId} assigned to ${driverName}`);
    } catch (error) {
      console.error('Error approving request:', error);
      throw error;
    }
  };

  const handleRejectRequest = async (requestId: string) => {
    const user = getCurrentUser();
    if (!user) return;

    try {
      await rejectVehicleRequest(requestId, user.uid);
    } catch (error) {
      console.error('Error rejecting request:', error);
      throw error;
    }
  };

  const handleNextRequest = () => {
    if (!selectedRequest) return;
    
    const currentIndex = requests.findIndex(r => r.id === selectedRequest.id);
    if (currentIndex < requests.length - 1) {
      setSelectedRequest(requests[currentIndex + 1]);
    } else if (requests.length > 0) {
      setSelectedRequest(requests[0]); // Loop back to first
    }
  };

  const handlePreviousRequest = () => {
    if (!selectedRequest) return;
    
    const currentIndex = requests.findIndex(r => r.id === selectedRequest.id);
    if (currentIndex > 0) {
      setSelectedRequest(requests[currentIndex - 1]);
    } else if (requests.length > 0) {
      setSelectedRequest(requests[requests.length - 1]); // Loop to last
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading fleet data..." />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <Header
        title="Fleet Overview"
        subtitle={`${stats.totalVehicles} vehicles${pendingCount > 0 ? ` • ${pendingCount} pending` : ''}`}
        rightAction={{
          label: pendingCount > 0 ? `Requests (${pendingCount})` : 'Sign Out',
          onPress: pendingCount > 0 ? handleViewRequests : handleSignOut,
        }}
      />

      {/* Show requests banner if there are pending requests */}
      {pendingCount > 0 && (
        <TouchableOpacity
          style={styles.requestsBanner}
          onPress={handleViewRequests}
          activeOpacity={0.7}
        >
          <View style={styles.requestsBannerContent}>
            <View style={styles.requestsIconContainer}>
              <Text style={styles.requestsIcon}>📋</Text>
            </View>
            <View style={styles.requestsTextContainer}>
              <Text style={styles.requestsBannerTitle}>
                {pendingCount} Pending Request{pendingCount > 1 ? 's' : ''}
              </Text>
              <Text style={styles.requestsBannerSubtitle}>
                Tap to review driver vehicle requests
              </Text>
            </View>
            <Text style={styles.requestsChevron}>›</Text>
          </View>
        </TouchableOpacity>
      )}

      <View style={styles.statsContainer}>
        <View style={styles.statsRow}>
          <StatCard
            label="Available"
            value={stats.available}
            color={colors.status.available}
          />
          <StatCard
            label="Assigned"
            value={stats.assigned}
            color={colors.status.assigned}
          />
        </View>
        <View style={styles.statsRow}>
          <StatCard
            label="In Transit"
            value={stats.inTransit}
            color={colors.status.inTransit}
          />
          <StatCard
            label="Returning"
            value={stats.returning}
            color={colors.status.returning}
          />
        </View>
      </View>

      <FilterChips
        options={filterOptions}
        selectedValue={selectedFilter}
        onSelect={setSelectedFilter}
      />

      <FlatList
        data={filteredVehicles}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <VehicleCard vehicle={item} />}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>No Vehicles Found</Text>
            <Text style={styles.emptyText}>
              {selectedFilter === 'ALL'
                ? 'No vehicles in the fleet yet.'
                : `No vehicles with status "${VEHICLE_STATUS_LABELS[selectedFilter as VehicleState]}".`}
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

      {/* Request Approval Modal */}
      <RequestApprovalModal
        visible={requestModalVisible}
        onClose={() => {
          setRequestModalVisible(false);
          setSelectedRequest(null);
        }}
        request={selectedRequest}
        onApprove={handleApproveRequest}
        onReject={handleRejectRequest}
      />

      {/* Quick Sign Out Button (when no pending requests) */}
      {pendingCount === 0 && (
        <View style={styles.signOutContainer}>
          <TouchableOpacity
            style={styles.signOutButton}
            onPress={handleSignOut}
            activeOpacity={0.7}
          >
            <Text style={styles.signOutText}>Sign Out</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

interface StatCardProps {
  label: string;
  value: number;
  color: string;
}

const StatCard: React.FC<StatCardProps> = ({ label, value, color }) => {
  return (
    <View style={styles.statCard}>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  requestsBanner: {
    backgroundColor: colors.primary,
    marginHorizontal: spacing.md,
    marginVertical: spacing.sm,
    borderRadius: radius.md,
    ...shadows.md,
  },
  requestsBannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
  },
  requestsIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: `${colors.background}20`,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  requestsIcon: {
    fontSize: 20,
  },
  requestsTextContainer: {
    flex: 1,
  },
  requestsBannerTitle: {
    ...textStyles.body,
    color: colors.background,
    fontWeight: '700',
    marginBottom: 2,
  },
  requestsBannerSubtitle: {
    ...textStyles.bodySmall,
    color: colors.background,
    opacity: 0.9,
  },
  requestsChevron: {
    fontSize: 28,
    color: colors.background,
    fontWeight: '300',
  },
  statsContainer: {
    padding: spacing.md,
    gap: spacing.sm,
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    alignItems: 'center',
    ...shadows.sm,
  },
  statValue: {
    ...textStyles.h1,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  statLabel: {
    ...textStyles.bodySmall,
    color: colors.textSecondary,
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
  signOutContainer: {
    position: 'absolute',
    bottom: spacing.lg,
    right: spacing.lg,
  },
  signOutButton: {
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: radius.full,
    ...shadows.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  signOutText: {
    ...textStyles.body,
    color: colors.textSecondary,
    fontWeight: '600',
  },
});