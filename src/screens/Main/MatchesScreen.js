import React, { useState, useEffect } from 'react';
import { 
View, Text, StyleSheet, ImageBackground, TouchableOpacity, 
StatusBar, Platform, Alert, ActivityIndicator, ScrollView, Image
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

// ⭐️ IP 주소 (현재 개발 환경에 맞게 설정해야 함)
const SERVER_URL = 'http://172.30.1.89:3000'; 
const MY_USER_ID = 1;

export default function MatchesScreen({ navigation }) {
const [profiles, setProfiles] = useState([]);
const [likedMeProfiles, setLikedMeProfiles] = useState([]); // 나를 찜한 사람들
const [currentIndex, setCurrentIndex] = useState(0);
const [loading, setLoading] = useState(true);

// 탭바 스타일
const activeRouteName = 'Matches';
const getTabColor = (routeName) => (routeName === activeRouteName ? '#000000' : '#9ca3af');
const getTabWeight = (routeName) => (routeName === activeRouteName ? '700' : '500');

useEffect(() => {
 fetchProfiles();
}, []);

// ⭐️ 매칭 카드 불러오기
const fetchProfiles = async () => {
 try {
 const url = `${SERVER_URL}/api/matches/cards?userId=${MY_USER_ID}`;
 console.log('🔗 [MATCHES] 요청 URL:', url);
 
 const response = await fetch(url);
 
 if (!response.ok) {
  throw new Error(`HTTP error! status: ${response.status}`);
 }
 
 const data = await response.json();
 console.log('📝 [MATCHES] 응답 데이터:', data.length, '명');
 
 const allProfiles = Array.isArray(data) ? data : [];
 
 // 나를 찜한 사람들 분리
 const liked = allProfiles.filter(p => p.type === 'liked_me');
 const others = allProfiles.filter(p => p.type !== 'liked_me');
 
 console.log(`💕 나를 찜한 사람: ${liked.length}명`);
 
 setLikedMeProfiles(liked);
 setProfiles(others);
 setLoading(false);
 } catch (error) {
 console.error('❌ [MATCHES] 프로필 불러오기 에러:', error);
 setProfiles([]);
 setLikedMeProfiles([]);
 setLoading(false);
 }
};

// ⭐️ 좋아요 보내기 (실제 매칭 API)
const handleLike = async (targetUser = null) => {
 const user = targetUser || profiles[currentIndex];
 if (!user) return;
 
 try {
 console.log(`💕 [MATCHES] 좋아요 보내기: ${MY_USER_ID} → ${user.id}`);
 
 const response = await fetch(`${SERVER_URL}/api/matches/like`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ myId: MY_USER_ID, targetId: user.id })
 });
 
 const result = await response.json();
 console.log('📝 [MATCHES] 좋아요 결과:', result);

 if (result.isMatch) {
  // 🎉 매칭 성공!
    // ⭐️ 서버에서 반환된 roomId를 추출 (백엔드에서 roomId를 반환해야 함)
  const { roomId } = result; 
  
  Alert.alert(
  "매칭 성공! 🎉", 
  `${user.name}님과 매칭되었습니다!\n지금 바로 대화를 시작해보세요.`, 
  [
   { text: "계속하기", onPress: () => {
   // 나를 찜한 사람 목록에서 클릭한 경우 해당 유저 제거
   if (targetUser) {
    setLikedMeProfiles(prev => prev.filter(p => p.id !== user.id));
   } else {
    nextCard();
   }
   }},
      // ⭐️ 수정: 채팅방 가기 로직에 try-catch 추가하여 앱 강제 종료 방지
   { 
    text: "채팅방 가기", 
    onPress: () => {
     try {
      if (roomId) {
       // matchData와 roomId를 함께 전달
       navigation.navigate('Chat', { matchData: user, roomId: roomId });
      } else {
       // 만약 roomId가 없으면 ChatList로 이동하여 사용자가 직접 찾아 들어가도록 처리
       navigation.navigate('ChatList');
      }
     } catch (e) {
      console.error("❌ [NAVIGATION] 채팅방 이동 중 심각한 오류 발생:", e);
      Alert.alert("오류", "채팅방으로 이동할 수 없습니다. 콘솔 로그를 확인하세요.");
     }
    }
   }
  ]
  );
 } else {
  // 좋아요만 보냄
  Alert.alert("좋아요! 💕", `${user.name}님에게 좋아요를 보냈습니다.`);
  if (!targetUser) nextCard();
 }
 } catch (error) {
 console.error('❌ [MATCHES] 좋아요 처리 에러:', error);
 Alert.alert("오류", "좋아요를 보내는데 실패했습니다.");
 }
};

// 나를 찜한 사람 클릭 시
const handleLikedMePress = (user) => {
 Alert.alert(
 `${user.name}님이 찜했어요! 💕`,
 `${user.name}님도 좋아요를 누르면 바로 매칭됩니다!`,
 [
  { text: "취소", style: "cancel" },
  { text: "좋아요 보내기 ❤️", onPress: () => handleLike(user) }
 ]
 );
};

// 다음 카드로
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

return (
 <View style={styles.container}>
 <StatusBar barStyle="dark-content" />
 
 {/* ⭐️ 상단: 나를 찜한 사람들 */}
 {likedMeProfiles.length > 0 && (
  <View style={styles.likedMeSection}>
  <View style={styles.likedMeHeader}>
   <Ionicons name="heart" size={20} color="#ec4899" />
   <Text style={styles.likedMeTitle}>나를 찜한 사람들</Text>
   <View style={styles.likedMeCount}>
   <Text style={styles.likedMeCountText}>{likedMeProfiles.length}</Text>
   </View>
  </View>
  
  <ScrollView 
   horizontal 
   showsHorizontalScrollIndicator={false}
   contentContainerStyle={styles.likedMeScroll}
  >
   {likedMeProfiles.map((user, index) => (
   <TouchableOpacity 
    key={`liked-${user.id}-${index}`}
    style={styles.likedMeItem}
    onPress={() => handleLikedMePress(user)}
    activeOpacity={0.8}
   >
    <View style={styles.likedMeImageWrapper}>
    <Image 
     source={{ uri: user.image || 'https://via.placeholder.com/100' }}
     style={styles.likedMeImage}
    />
    <View style={styles.likedMeHeart}>
     <Ionicons name="heart" size={12} color="#fff" />
    </View>
    </View>
    <Text style={styles.likedMeName} numberOfLines={1}>{user.name}</Text>
   </TouchableOpacity>
   ))}
  </ScrollView>
  </View>
 )}

 {/* 나를 찜한 사람이 없을 때 헤더 */}
 {likedMeProfiles.length === 0 && (
  <View style={styles.headerOnly}>
  <Text style={styles.headerTitle}>매칭</Text>
  <Text style={styles.headerSubtitle}>마음에 드는 사람에게 좋아요를 보내세요</Text>
  </View>
 )}

 {/* 메인 카드 영역 */}
 <View style={styles.cardContainer}>
  {!currentProfile ? (
  <View style={styles.emptyCard}>
   <Ionicons name="heart-dislike-outline" size={64} color="#d1d5db" />
   <Text style={styles.emptyTitle}>추천할 프로필이 없습니다</Text>
   <Text style={styles.emptyText}>새로운 사용자들을 곧 만나보실 수 있습니다.</Text>
   <TouchableOpacity onPress={fetchProfiles} style={styles.retryButton}>
   <Text style={styles.retryText}>🔄 다시 불러오기</Text>
   </TouchableOpacity>
  </View>
  ) : (
  <ImageBackground 
   source={{ uri: currentProfile.image || 'https://via.placeholder.com/400x600' }} 
   style={styles.bg} 
   resizeMode="cover"
   imageStyle={{ borderRadius: 20 }}
  >
   <LinearGradient 
   colors={['rgba(0,0,0,0.2)', 'transparent', 'rgba(0,0,0,0.8)']} 
   style={styles.gradient}
   >
   {/* 카드 인덱스 */}
   <View style={styles.cardHeader}>
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
    <TouchableOpacity style={styles.likeBtn} onPress={() => handleLike()}>
     <LinearGradient colors={['#ec4899', '#9333ea']} style={styles.gradBtn}>
     <Ionicons name="heart" size={40} color="#fff" />
     </LinearGradient>
    </TouchableOpacity>
    </View>
   </View>
   </LinearGradient>
  </ImageBackground>
  )}
 </View>

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
 backgroundColor: '#f9fafb',
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

// 헤더 (나를 찜한 사람 없을 때)
headerOnly: {
 backgroundColor: '#fff',
 paddingTop: Platform.OS === 'ios' ? 60 : 40,
 paddingBottom: 16,
 paddingHorizontal: 20,
 borderBottomWidth: 1,
 borderBottomColor: '#f3f4f6',
},
headerTitle: {
 fontSize: 24,
 fontWeight: '700',
 color: '#1f2937',
},
headerSubtitle: {
 fontSize: 14,
 color: '#6b7280',
 marginTop: 4,
},

// ⭐️ 나를 찜한 사람들 섹션
likedMeSection: {
 backgroundColor: '#fff',
 paddingTop: Platform.OS === 'ios' ? 60 : 40,
 paddingBottom: 16,
 borderBottomWidth: 1,
 borderBottomColor: '#f3f4f6',
},
likedMeHeader: {
 flexDirection: 'row',
 alignItems: 'center',
 paddingHorizontal: 20,
 marginBottom: 12,
},
likedMeTitle: {
 fontSize: 16,
 fontWeight: '700',
 color: '#1f2937',
 marginLeft: 8,
},
likedMeCount: {
 backgroundColor: '#ec4899',
 borderRadius: 12,
 paddingHorizontal: 8,
 paddingVertical: 2,
 marginLeft: 8,
},
likedMeCountText: {
 color: '#fff',
 fontSize: 12,
 fontWeight: 'bold',
},
likedMeScroll: {
 paddingHorizontal: 16,
 gap: 12,
},
likedMeItem: {
 alignItems: 'center',
 marginRight: 12,
},
likedMeImageWrapper: {
 position: 'relative',
},
likedMeImage: {
 width: 70,
 height: 70,
 borderRadius: 35,
 borderWidth: 3,
 borderColor: '#ec4899',
},
likedMeHeart: {
 position: 'absolute',
 bottom: 0,
 right: 0,
 backgroundColor: '#ec4899',
 borderRadius: 10,
 width: 20,
 height: 20,
 alignItems: 'center',
 justifyContent: 'center',
 borderWidth: 2,
 borderColor: '#fff',
},
likedMeName: {
 fontSize: 12,
 color: '#4b5563',
 marginTop: 6,
 maxWidth: 70,
 textAlign: 'center',
},

// 카드 컨테이너
cardContainer: {
 flex: 1,
 padding: 16,
},
emptyCard: {
 flex: 1,
 justifyContent: 'center',
 alignItems: 'center',
 backgroundColor: '#fff',
 borderRadius: 20,
},
emptyTitle: {
 fontSize: 20,
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
bg: { 
 flex: 1,
 borderRadius: 20,
 overflow: 'hidden',
},
gradient: { 
 flex: 1, 
 justifyContent: 'space-between',
 borderRadius: 20,
},

// 카드 헤더
cardHeader: { 
 paddingTop: 16, 
 paddingHorizontal: 16, 
 flexDirection: 'row', 
 justifyContent: 'flex-end',
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
 padding: 20,
},
nameRow: { 
 flexDirection: 'row', 
 alignItems: 'center' 
},
name: { 
 fontSize: 28, 
 fontWeight: '700', 
 color: '#fff' 
},
job: { 
 fontSize: 16, 
 color: '#e5e7eb', 
 marginBottom: 16 
},

// 버튼 영역
btnRow: { 
 flexDirection: 'row', 
 justifyContent: 'space-evenly', 
 alignItems: 'center' 
},
passBtn: { 
 width: 56, 
 height: 56, 
 borderRadius: 28, 
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
 width: 72, 
 height: 72, 
 borderRadius: 36, 
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