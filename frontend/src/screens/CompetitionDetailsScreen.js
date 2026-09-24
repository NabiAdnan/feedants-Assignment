import React, { useCallback, useEffect, useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  ActivityIndicator,
  RefreshControl,
  Alert,
  StyleSheet,
  Linking,
  TouchableOpacity,
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';

import HeaderBar from '../components/HeaderBar';
import CompetitionSummaryCard from '../components/CompetitionSummaryCard';
import JudgeCard from '../components/JudgeCard';
import CountdownBanner from '../components/CountdownBanner';
import ImportantDatesCard from '../components/ImportantDatesCard';
import PreviousWinnersRow from '../components/PreviousWinnersRow';
import InfoTabs from '../components/InfoTabs';
import RewardsCard from '../components/RewardsCard';
import PrizeMoneyInfoCard from '../components/PrizeMoneyInfoCard';
import ReferralCard from '../components/ReferralCard';
import HearFromUsersCard from '../components/HearFromUsersCard';
import AdBannerCard from '../components/AdBannerCard';
import PrimaryActionBar from '../components/PrimaryActionBar';
import BottomNavBar from '../components/BottomNavBar';
import AuthModal from '../components/AuthModal';

import {
  fetchCompetition,
  listCompetitions,
  registerForCompetition,
  uploadSubmission,
} from '../api/competitionApi';
import { useAuth } from '../context/AuthContext';
import { colors } from '../theme/colors';

const DEFAULT_COMPETITION_ID = '6ab42011fb1f883fa9b63a33';

export default function CompetitionDetailsScreen({ navigation, route }) {
  const initialId = route?.params?.competitionId || DEFAULT_COMPETITION_ID;
  const [targetId, setTargetId] = useState(initialId);
  const { isAuthenticated, user, logout } = useAuth();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);
  const [serverOffsetMs, setServerOffsetMs] = useState(0);

  const [authModalVisible, setAuthModalVisible] = useState(false);
  const [pendingAction, setPendingAction] = useState(false);

  const load = useCallback(async (idToFetch = targetId) => {
    try {
      setError(null);
      let res;
      try {
        res = await fetchCompetition(idToFetch);
      } catch (e) {
        // Fallback: If target ID returns 404, discover active competition dynamically
        const list = await listCompetitions();
        if (list?.items?.length > 0) {
          const fallbackId = list.items[0]._id || list.items[0].id;
          setTargetId(fallbackId);
          res = await fetchCompetition(fallbackId);
        } else {
          throw e;
        }
      }
      setData(res);
      setServerOffsetMs(new Date(res.serverTime).getTime() - Date.now());
    } catch (e) {
      setError(e.message || 'Unable to load competition details');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [targetId]);

  useEffect(() => {
    load();
  }, [load, isAuthenticated]);

  const onRefresh = () => {
    setRefreshing(true);
    load();
  };

  const handleHeaderAuthPress = () => {
    if (isAuthenticated) {
      Alert.alert(
        'Logged In',
        `Signed in as ${user?.name || user?.email}`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Sign Out',
            style: 'destructive',
            onPress: async () => {
              await logout();
              load();
              Alert.alert('Signed Out', 'You have been signed out successfully.');
            },
          },
        ]
      );
    } else {
      setAuthModalVisible(true);
    }
  };

  const executeRegistration = async () => {
    if (!data) return;
    try {
      setActionLoading(true);
      await registerForCompetition(targetId, { amountPaid: data.competition.entryFee });
      Alert.alert('Registered Successfully!', "You have registered for the competition. Good luck!");
      await load();
    } catch (e) {
      Alert.alert('Registration Failed', e.message || 'Could not complete registration');
    } finally {
      setActionLoading(false);
    }
  };

  const handlePrimaryAction = async () => {
    if (!data) return;
    const { type } = data.viewState.primaryAction;

    if (!isAuthenticated) {
      if (type === 'REGISTER') {
        setPendingAction(true);
        setAuthModalVisible(true);
        return;
      }
      setAuthModalVisible(true);
      return;
    }

    try {
      setActionLoading(true);

      if (type === 'REGISTER') {
        await executeRegistration();
        return;
      } else if (type === 'SUBMIT' || type === 'RESUBMIT') {
        const picked = await DocumentPicker.getDocumentAsync({
          type: ['video/mp4', 'video/quicktime', 'image/jpeg', 'image/png'],
          copyToCacheDirectory: true,
        });
        if (picked.canceled) {
          setActionLoading(false);
          return;
        }
        const file = picked.assets ? picked.assets[0] : picked;
        await uploadSubmission(targetId, file);
        Alert.alert('Submission Uploaded!', 'Your entry has been successfully submitted.');
      } else if (type === 'VIEW_RESULT') {
        Alert.alert('Results', 'Results are currently available.');
        return;
      }

      await load();
    } catch (e) {
      Alert.alert('Action Failed', e.message || 'An error occurred during submission');
    } finally {
      setActionLoading(false);
    }
  };

  const handleAuthSuccess = async () => {
    await load();
    if (pendingAction) {
      setPendingAction(false);
      await executeRegistration();
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </SafeAreaView>
    );
  }

  if (error || !data) {
    return (
      <SafeAreaView style={styles.center}>
        <Text style={styles.errorText}>{error || 'Unable to load competition'}</Text>
        <TouchableOpacity style={styles.retryBtn} onPress={() => { setLoading(true); load(); }}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const { competition, viewState, submission } = data;
  const referralLink = user?.referralCode
    ? `https://feedants.com/r/${user.referralCode}`
    : 'https://feedants.com/r/referral123';

  return (
    <SafeAreaView style={styles.screen}>
      <HeaderBar
        onBack={() => navigation?.goBack?.()}
        language="ENG"
        onToggleLanguage={() => {}}
        user={user}
        onAuthPress={handleHeaderAuthPress}
      />

      <ScrollView
        contentContainerStyle={{ paddingBottom: 16 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <CompetitionSummaryCard competition={competition} viewState={viewState} />
        <JudgeCard judge={competition.judge} onPlayIntro={(url) => Linking.openURL(url)} />

        <CountdownBanner
          countdownTarget={viewState.countdownTarget}
          serverNowOffsetMs={serverOffsetMs}
          onExpire={load}
        />

        <ImportantDatesCard competition={competition} />
        <PreviousWinnersRow winners={competition.previousWinners} />
        <InfoTabs competition={competition} />
        <RewardsCard rewards={competition.rewards} disclaimer={competition.disclaimer} />

        {/* Prize Money Info & Refund Policy Card */}
        <PrizeMoneyInfoCard
          videoUrl={competition.prizeMoneyInfoVideoUrl}
          refundPolicyUrl={competition.refundPolicyUrl}
        />

        {submission ? (
          <View style={styles.submissionNote}>
            <Text style={styles.submissionText}>
              Last submitted: {new Date(submission.submittedAt).toLocaleString()} · {submission.status}
            </Text>
          </View>
        ) : null}

        {/* Referral Card */}
        <ReferralCard
          referralLink={referralLink}
          earnAmount={competition.referralEarnAmount || 10}
        />

        {/* Hear From Our Users */}
        <HearFromUsersCard />

        {/* Ad Banner */}
        <AdBannerCard />
      </ScrollView>

      {/* Primary Sticky Action Bar */}
      <PrimaryActionBar
        action={viewState.primaryAction}
        loading={actionLoading}
        onPress={handlePrimaryAction}
        isRegistered={viewState.isRegistered}
      />

      {/* Bottom 5-Tab Navigation Bar */}
      <BottomNavBar
        onOpenAuth={() => setAuthModalVisible(true)}
        onStateChange={load}
      />

      {/* Login / Sign Up Auth Modal */}
      <AuthModal
        visible={authModalVisible}
        onClose={() => { setAuthModalVisible(false); setPendingAction(false); }}
        onSuccess={handleAuthSuccess}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background },
  errorText: { color: colors.danger, fontSize: 14, paddingHorizontal: 24, textAlign: 'center' },
  retryBtn: { marginTop: 12, backgroundColor: colors.primary, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8 },
  retryText: { color: '#fff', fontWeight: '700' },
  submissionNote: { marginHorizontal: 16, marginTop: 12 },
  submissionText: { fontSize: 11, color: colors.textMuted },
});
