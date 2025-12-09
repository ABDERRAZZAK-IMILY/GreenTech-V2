import React from 'react';
import { View, Text, ScrollView, StyleSheet, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

export default function LeaderboardScreen() {
  const leaderboard = [
    { id: 1, name: 'Mohammed Alaoui', points: 1580, rank: 1, avatar: '👨' },
    { id: 2, name: 'Fatima Bennani', points: 1420, rank: 2, avatar: '👩' },
    { id: 3, name: 'Sarah El Amrani', points: 1250, rank: 3, avatar: '👩' },
    { id: 4, name: 'Youssef Idrissi', points: 1180, rank: 4, avatar: '👨' },
    { id: 5, name: 'Amina Tazi', points: 1050, rank: 5, avatar: '👩' },
    { id: 6, name: 'Karim Fassi', points: 980, rank: 6, avatar: '👨' },
    { id: 7, name: 'Nadia Berrada', points: 920, rank: 7, avatar: '👩' },
    { id: 8, name: 'Omar Cherkaoui', points: 850, rank: 8, avatar: '👨' },
  ];

  const topThree = leaderboard.slice(0, 3);
  const others = leaderboard.slice(3);

  const getRankColor = (rank) => {
    if (rank === 1) return ['#f39c12', '#f5b041'];
    if (rank === 2) return ['#95a5a6', '#bdc3c7'];
    if (rank === 3) return ['#cd7f32', '#d4925a'];
    return ['#2a9d6f', '#3eb489'];
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Podium */}
      <View style={styles.podiumContainer}>
        <View style={styles.podiumRow}>
          {/* 2nd Place */}
          <View style={styles.podiumItem}>
            <LinearGradient
              colors={getRankColor(2)}
              style={styles.podiumAvatar}
            >
              <Text style={styles.avatarText}>{topThree[1]?.avatar}</Text>
            </LinearGradient>
            <View style={[styles.podiumRank, styles.podiumRankSecond]}>
              <Ionicons name="trophy" size={16} color="#95a5a6" />
              <Text style={styles.podiumRankText}>2</Text>
            </View>
            <Text style={styles.podiumName}>{topThree[1]?.name}</Text>
            <Text style={styles.podiumPoints}>{topThree[1]?.points} pts</Text>
            <View style={[styles.podiumBar, styles.podiumBarSecond]} />
          </View>

          {/* 1st Place */}
          <View style={[styles.podiumItem, styles.podiumFirst]}>
            <LinearGradient
              colors={getRankColor(1)}
              style={[styles.podiumAvatar, styles.podiumAvatarFirst]}
            >
              <Text style={styles.avatarText}>{topThree[0]?.avatar}</Text>
              <View style={styles.crownBadge}>
                <Ionicons name="trophy" size={20} color="#fff" />
              </View>
            </LinearGradient>
            <View style={[styles.podiumRank, styles.podiumRankFirst]}>
              <Ionicons name="trophy" size={18} color="#f39c12" />
              <Text style={styles.podiumRankText}>1</Text>
            </View>
            <Text style={[styles.podiumName, styles.podiumNameFirst]}>
              {topThree[0]?.name}
            </Text>
            <Text style={[styles.podiumPoints, styles.podiumPointsFirst]}>
              {topThree[0]?.points} pts
            </Text>
            <View style={[styles.podiumBar, styles.podiumBarFirst]} />
          </View>

          {/* 3rd Place */}
          <View style={styles.podiumItem}>
            <LinearGradient
              colors={getRankColor(3)}
              style={styles.podiumAvatar}
            >
              <Text style={styles.avatarText}>{topThree[2]?.avatar}</Text>
            </LinearGradient>
            <View style={[styles.podiumRank, styles.podiumRankThird]}>
              <Ionicons name="trophy" size={16} color="#cd7f32" />
              <Text style={styles.podiumRankText}>3</Text>
            </View>
            <Text style={styles.podiumName}>{topThree[2]?.name}</Text>
            <Text style={styles.podiumPoints}>{topThree[2]?.points} pts</Text>
            <View style={[styles.podiumBar, styles.podiumBarThird]} />
          </View>
        </View>
      </View>

      {/* Rest of Leaderboard */}
      <View style={styles.listContainer}>
        <Text style={styles.sectionTitle}>Classement</Text>
        {others.map((user) => (
          <View key={user.id} style={styles.userCard}>
            <View style={styles.rankBadge}>
              <Text style={styles.rankNumber}>{user.rank}</Text>
            </View>

            <View style={styles.avatarContainer}>
              <Text style={styles.avatarEmoji}>{user.avatar}</Text>
            </View>

            <View style={styles.userInfo}>
              <Text style={styles.userName}>{user.name}</Text>
              <View style={styles.pointsContainer}>
                <Ionicons name="star" size={14} color="#f39c12" />
                <Text style={styles.userPoints}>{user.points} points</Text>
              </View>
            </View>

            <Ionicons name="chevron-forward" size={20} color="rgba(255,255,255,0.3)" />
          </View>
        ))}
      </View>

      <View style={{ height: 20 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1e272e',
  },
  podiumContainer: {
    padding: 20,
    paddingTop: 40,
  },
  podiumRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-end',
    gap: 12,
  },
  podiumItem: {
    flex: 1,
    alignItems: 'center',
  },
  podiumFirst: {
    marginTop: -20,
  },
  podiumAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    position: 'relative',
  },
  podiumAvatarFirst: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  avatarText: {
    fontSize: 32,
  },
  crownBadge: {
    position: 'absolute',
    top: -8,
    backgroundColor: '#f39c12',
    borderRadius: 12,
    padding: 4,
  },
  podiumRank: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 8,
  },
  podiumRankFirst: {
    backgroundColor: 'rgba(243, 156, 18, 0.2)',
  },
  podiumRankSecond: {
    backgroundColor: 'rgba(149, 165, 166, 0.2)',
  },
  podiumRankThird: {
    backgroundColor: 'rgba(205, 127, 50, 0.2)',
  },
  podiumRankText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
  },
  podiumName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 4,
  },
  podiumNameFirst: {
    fontSize: 14,
  },
  podiumPoints: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.7)',
    marginBottom: 12,
  },
  podiumPointsFirst: {
    fontSize: 13,
    fontWeight: '600',
  },
  podiumBar: {
    width: '100%',
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  podiumBarFirst: {
    height: 100,
    backgroundColor: 'rgba(243, 156, 18, 0.3)',
  },
  podiumBarSecond: {
    height: 70,
    backgroundColor: 'rgba(149, 165, 166, 0.3)',
  },
  podiumBarThird: {
    height: 50,
    backgroundColor: 'rgba(205, 127, 50, 0.3)',
  },
  listContainer: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 16,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  rankBadge: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: 'rgba(42, 157, 111, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  rankNumber: {
    fontSize: 14,
    fontWeight: '700',
    color: '#2a9d6f',
  },
  avatarContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarEmoji: {
    fontSize: 24,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  pointsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  userPoints: {
    fontSize: 13,
    color: '#f39c12',
    fontWeight: '600',
  },
});
