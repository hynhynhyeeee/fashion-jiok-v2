import React, { useState, useEffect } from 'react';
import { 
  View, Text, StyleSheet, ImageBackground, TouchableOpacity, 
  StatusBar, Platform, Alert, ActivityIndicator 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

// ⭐️ IP 주소 수정!
const SERVER_URL = 'http://172.30.1.89:3000'; 
const MY_USER_ID = 1;

export default function MatchesScreen({ navigation }) {
  const [profiles, setProfiles] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  // 탭바 스타일
  const activeRouteName = 'Matches';
  const getTabColor = (routeName) => (routeName === activeRouteName ? '#000000' : '#9ca3af');
  const getTabWeight = (routeName) => (routeName === activeRouteName ? '700' : '500');

  useEffect(() => {
    fetchProfiles();
  }, []);

  const fetchProfiles = async () => {
    try {
      const url = `${SERVER_URL}/api/users/explore?userId=${MY_USER_ID}`;
      console.log('🔗 [MATCHES] 요청 URL:', url);
      
      const response = await fetch(url);
      console.log('📊 [MATCHES] 상태 코드:', response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('📝 [MATCHES] 응답 데이터:', data.length, '명');
      
      // 배열 형태로 처리
      const profilesData = Array.isArray(data) ? data : (data.data || []);
      setProfiles(profilesData);
      setLoading(false);
    } catch (error) {
      console.error('❌ [MATCHES] 에러:', error);
      Alert.alert("오류", "프로필을 불러오는 데 실패했습니다.");
      setLoading(false);
    }
  };

  const handleLike = async () => {
    const targetUser = profiles[currentIndex];
    if (!targetUser) return nextCard();
    
    // 좋아요 API가 없으므로 일단 다음 카드로
    Alert.alert("좋아요! 💕", `${targetUser.name}님에게 좋아요를 보냈습니다.`);
    nextCard();
  };

  const nextCard = () => {
    if (currentIndex < profiles.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      Alert.alert("알림", "더 이상 추천할 프로필이 없습니다.", [
        { text: "처음부터", onPress: () => {
          setCurrentIndex(0);
          fetchProfiles();
        }},
        { text: "확인" }
      ]);
    }
  };

  const currentProfile = profiles[currentIndex];

  // 로딩 상태
  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#ec4899" />
          <Text style={styles.loadingText}>프로필을 불러오는 중...</Text>
        </View>
        <BottomTabBar navigation={navigation} getTabColor={getTabColor} getTabWeight={getTabWeight} />
      </View>
    );
  }

  // 프로필 없음
  if (!currentProfile) {
    return (
      <View style={styles.container}>
        <View style={styles.center}>
          <Ionicons name="heart-dislike-outline" size={64} color="#d1d5db" />
          <Text style={styles.emptyTitle}>추천할 프로필이 없습니다</Text>
          <Text style={styles.emptyText}>새로운 사용자들을 곧 만나보실 수 있습니다.</Text>
          <TouchableOpacity onPress={fetchProfiles} style={styles.retryButton}>
            <Text style={styles.retryText}>🔄 다시 불러오기</Text>
          </TouchableOpacity>
        </View>
        <BottomTabBar navigation={navigation} getTabColor={getTabColor} getTabWeight={getTabWeight} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      <ImageBackground 
        source={{ uri: currentProfile.image || 'https://via.placeholder.com/400x600' }} 
        style={styles.bg} 
        resizeMode="cover"
      >
        <LinearGradient colors={['rgba(0,0,0,0.3)', 'transparent', 'rgba(0,0,0,0.9)']} style={styles.gradient}>
          
          {/* 헤더 */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.navigate('MainHome')} style={styles.backButton}>
              <Ionicons name="arrow-back" size={28} color="#fff" />
            </TouchableOpacity>
            
            {/* 카드 인덱스 표시 */}
            <View style={styles.indexBadge}>
              <Text style={styles.indexText}>{currentIndex + 1} / {profiles.length}</Text>
            </View>
          </View>

          {/* 정보 영역 */}
          <View style={styles.info}>
            <View style={styles.nameRow}>
              <Text style={styles.name}>{currentProfile.name}, {currentProfile.age}</Text>
            </View>
            <Text style={styles.job}>{currentProfile.style || currentProfile.location || '스타일 정보 없음'}</Text>
            
            {/* 버튼 영역 */}
            <View style={styles.btnRow}>
              {/* 넘기기 버튼 */}
              <TouchableOpacity style={styles.passBtn} onPress={nextCard}>
                <Ionicons name="close" size={30} color="#ff4b4b" />
              </TouchableOpacity>
              
              {/* 좋아요 버튼 */}
              <TouchableOpacity style={styles.likeBtn} onPress={handleLike}>
                <LinearGradient colors={['#ec4899', '#9333ea']} style={styles.gradBtn}>
                  <Ionicons name="heart" size={40} color="#fff" />
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>

        </LinearGradient>
      </ImageBackground>

      {/* 하단 탭 바 */}
      <BottomTabBar navigation={navigation} getTabColor={getTabColor} getTabWeight={getTabWeight} />
    </View>
  );
}

// 하단 탭바 컴포넌트
const BottomTabBar = ({ navigation, getTabColor, getTabWeight }) => (
  <View style={styles.bottomBar}>
    <TouchableOpacity style={styles.tabItem} onPress={() => navigation.navigate('MainHome')}>
      <Ionicons name="home-outline" size={24} color={getTabColor('MainHome')} />
      <Text style={[styles.tabText, { color: getTabColor('MainHome'), fontWeight: getTabWeight('MainHome') }]}>홈</Text>
    </TouchableOpacity>

    <TouchableOpacity style={styles.tabItem} onPress={() => navigation.navigate('Explore')}>
      <Ionicons name="compass-outline" size={24} color={getTabColor('Explore')} />
      <Text style={[styles.tabText, { color: getTabColor('Explore'), fontWeight: getTabWeight('Explore') }]}>탐색</Text>
    </TouchableOpacity>

    <TouchableOpacity style={styles.tabItem} onPress={() => navigation.navigate('Map')}>
      <Ionicons name="map-outline" size={24} color={getTabColor('Map')} />
      <Text style={[styles.tabText, { color: getTabColor('Map'), fontWeight: getTabWeight('Map') }]}>위치</Text>
    </TouchableOpacity>

    <TouchableOpacity style={styles.tabItem} onPress={() => navigation.navigate('Matches')}>
      <Ionicons name="people" size={24} color={getTabColor('Matches')} />
      <Text style={[styles.tabText, { color: getTabColor('Matches'), fontWeight: getTabWeight('Matches') }]}>매칭</Text>
    </TouchableOpacity>

    <TouchableOpacity style={styles.tabItem} onPress={() => navigation.navigate('ChatList')}>
      <Ionicons name="chatbubbles-outline" size={24} color={getTabColor('ChatList')} />
      <Text style={[styles.tabText, { color: getTabColor('ChatList'), fontWeight: getTabWeight('ChatList') }]}>채팅</Text>
    </TouchableOpacity>

    <TouchableOpacity style={styles.tabItem} onPress={() => navigation.navigate('MyProfile')}>
      <Ionicons name="person-outline" size={24} color={getTabColor('MyProfile')} />
      <Text style={[styles.tabText, { color: getTabColor('MyProfile'), fontWeight: getTabWeight('MyProfile') }]}>나</Text>
    </TouchableOpacity>
  </View>
);

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#fff' 
  },
  center: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 20,
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
    marginTop: 10,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 20,
    padding: 12,
  },
  retryText: {
    color: '#ec4899',
    fontWeight: 'bold',
    fontSize: 16,
  },
  
  // 카드 스타일
  bg: { flex: 1 },
  gradient: { flex: 1, justifyContent: 'space-between' },
  
  // 헤더
  header: { 
    paddingTop: Platform.OS === 'ios' ? 60 : 40, 
    paddingHorizontal: 20, 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  indexBadge: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  indexText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },

  // 정보 영역
  info: { 
    padding: 24, 
    paddingBottom: 30,
  },
  nameRow: { 
    flexDirection: 'row', 
    alignItems: 'center' 
  },
  name: { 
    fontSize: 32, 
    fontWeight: '700', 
    color: '#fff' 
  },
  job: { 
    fontSize: 18, 
    color: '#ddd', 
    marginBottom: 20 
  },
  
  // 버튼 영역
  btnRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-evenly', 
    alignItems: 'center' 
  },
  passBtn: { 
    width: 60, 
    height: 60, 
    borderRadius: 30, 
    backgroundColor: '#fff', 
    justifyContent: 'center', 
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  likeBtn: { 
    width: 80, 
    height: 80, 
    borderRadius: 40, 
    overflow: 'hidden', 
    elevation: 10 
  },
  gradBtn: { 
    width: '100%', 
    height: '100%', 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  
  // 하단 탭 바
  bottomBar: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
    paddingTop: 12,
    paddingBottom: 32,
    paddingHorizontal: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 10,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  tabText: {
    fontSize: 11,
    marginTop: 4,
  },
});