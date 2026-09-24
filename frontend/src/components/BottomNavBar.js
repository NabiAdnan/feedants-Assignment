import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Alert,
  Platform,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { colors, spacing, radius } from '../theme/colors';

export default function BottomNavBar({ onOpenAuth, onStateChange }) {
  const { user, isAuthenticated, logout } = useAuth();
  const [profileModalVisible, setProfileModalVisible] = useState(false);
  const [activeTab, setActiveTab] = useState('Competitions');

  const handleTabPress = (tabName) => {
    setActiveTab(tabName);
    if (tabName === 'Profile') {
      if (isAuthenticated) {
        setProfileModalVisible(true);
      } else {
        onOpenAuth?.();
      }
    } else if (tabName !== 'Competitions') {
      Alert.alert(tabName, `${tabName} section is active.`);
    }
  };

  const handleSignOut = async () => {
    try {
      await logout();
      setProfileModalVisible(false);
      onStateChange?.();
      Alert.alert('Signed Out', 'You have been signed out successfully.');
    } catch (e) {
      Alert.alert('Sign Out Failed', e.message);
    }
  };

  return (
    <>
      <View style={styles.navBar}>
        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => handleTabPress('Home')}
        >
          <Text style={[styles.tabIcon, activeTab === 'Home' && styles.tabIconActive]}>🏠</Text>
          <Text style={[styles.tabLabel, activeTab === 'Home' && styles.tabLabelActive]}>Home</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => handleTabPress('Explore')}
        >
          <Text style={[styles.tabIcon, activeTab === 'Explore' && styles.tabIconActive]}>🔍</Text>
          <Text style={[styles.tabLabel, activeTab === 'Explore' && styles.tabLabelActive]}>Explore</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.centerPlusItem}
          onPress={() => handleTabPress('Create')}
        >
          <View style={styles.plusCircle}>
            <Text style={styles.plusText}>+</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => handleTabPress('Competitions')}
        >
          <Text style={[styles.tabIcon, activeTab === 'Competitions' && styles.tabIconActive]}>🏆</Text>
          <Text style={[styles.tabLabel, activeTab === 'Competitions' && styles.tabLabelActive]}>
            Competitions
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => handleTabPress('Profile')}
        >
          <Text style={[styles.tabIcon, activeTab === 'Profile' && styles.tabIconActive]}>👤</Text>
          <Text style={[styles.tabLabel, activeTab === 'Profile' && styles.tabLabelActive]}>
            {user ? user.name.split(' ')[0] : 'Profile'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Profile & Sign Out Modal */}
      <Modal
        visible={profileModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setProfileModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>My Account</Text>
              <TouchableOpacity onPress={() => setProfileModalVisible(false)}>
                <Text style={styles.modalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>

            {user ? (
              <View style={styles.profileDetails}>
                <View style={styles.avatarCircle}>
                  <Text style={styles.avatarInitial}>{user.name ? user.name[0].toUpperCase() : 'U'}</Text>
                </View>
                <Text style={styles.userName}>{user.name}</Text>
                <Text style={styles.userEmail}>{user.email}</Text>

                {user.referralCode ? (
                  <View style={styles.referralBadge}>
                    <Text style={styles.referralText}>Referral Code: {user.referralCode}</Text>
                  </View>
                ) : null}
              </View>
            ) : null}

            <TouchableOpacity style={styles.signOutBtn} onPress={handleSignOut}>
              <Text style={styles.signOutText}>Sign Out</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  navBar: {
    flexDirection: 'row',
    height: 56,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 8,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabIcon: {
    fontSize: 16,
    color: '#8B96A1',
  },
  tabIconActive: {
    color: colors.primary,
  },
  tabLabel: {
    fontSize: 10,
    color: '#8B96A1',
    fontWeight: '600',
    marginTop: 2,
  },
  tabLabelActive: {
    color: colors.primary,
    fontWeight: '800',
  },
  centerPlusItem: {
    alignItems: 'center',
    justifyContent: 'center',
    top: -8,
  },
  plusCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  plusText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '400',
    lineHeight: 28,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    padding: spacing.lg,
    paddingBottom: Platform.OS === 'ios' ? 40 : spacing.lg,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  modalCloseText: {
    fontSize: 18,
    color: colors.textSecondary,
    fontWeight: '700',
  },
  profileDetails: {
    alignItems: 'center',
    marginVertical: spacing.md,
  },
  avatarCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.mint,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  avatarInitial: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.primary,
  },
  userName: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  userEmail: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  referralBadge: {
    marginTop: spacing.sm,
    backgroundColor: colors.mint,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.pill,
  },
  referralText: {
    fontSize: 11,
    color: colors.primary,
    fontWeight: '700',
  },
  signOutBtn: {
    backgroundColor: colors.danger,
    borderRadius: radius.md,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: spacing.md,
  },
  signOutText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 15,
  },
});
