import React, { useState, useEffect } from 'react';
import { 
    View, Text, StyleSheet, ScrollView, Image, 
    TouchableOpacity, Dimensions, StatusBar, Platform, 
    ActivityIndicator, Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

// ⭐️ 개선: 외부 파일에서 SERVER_URL과 fetchChatList를 가져옵니다.
import { fetchChatList as apiFetchChatList, SERVER_URL } from '../../services/api';
import BottomTabBar from '../../components/BottomTabBar'; 

const { width } = Dimensions.get('window');
const itemWidth = (width - 64) / 3; 

const MY_USER_ID = 1; // 현재 사용자 ID (인증 후 실제 ID로 교체 필요)

export default function ChatListScreen({ navigation }) {
    const [matches, setMatches] = useState([]);
    const [loading, setLoading] = useState(true);

    // ⭐️ 데이터 페칭 함수
    useEffect(() => {
        loadChatData();
    }, []);

    const loadChatData = async () => {
        setLoading(true);
        try {
            const data = await apiFetchChatList(MY_USER_ID); 
            
            console.log('📝 [CHATLIST] 로드된 매칭/대화 수:', data.length);
            setMatches(data);

        } catch (error) {
            console.error('❌ [CHATLIST] 데이터 로드 실패:', error);
            Alert.alert("오류", "채팅 목록을 불러오는데 실패했습니다. 서버 상태를 확인해주세요.");
            setMatches([]);
        } finally {
            setLoading(false);
        }
    };


    // 데이터 필터링 (isNew 속성 사용)
    const newMatches = matches.filter(m => m.isNew);
    const conversations = matches.filter(m => !m.isNew);

    // 하단 탭 스타일 설정
    const activeRouteName = 'ChatList';
    const getTabColor = (routeName) => (routeName === activeRouteName ? '#000000' : '#9ca3af');
    const getTabWeight = (routeName) => (routeName === activeRouteName ? '700' : '500');

    // ⭐️ 수정된 채팅방 이동 함수 (상대방 ID 계산 로직 추가)
    const navigateToChat = (match) => {
        // 1. 상대방 ID 계산: chat_rooms 스키마에 따라 MY_USER_ID가 아닌 다른 ID를 찾습니다.
        const otherUserId = (match.user_id_1 && match.user_id_1 !== MY_USER_ID) 
            ? match.user_id_1 
            : match.user_id_2;

        // 2. Chat 화면으로 필요한 모든 정보를 전달합니다.
        navigation.navigate('Chat', { 
            matchData: match, 
            roomId: match.room_id, // DB 스키마에 따라 room_id 사용
            otherUserId: otherUserId // ⭐️ ChatScreen이 AI API 호출 시 사용함
        });
    };

    // 로딩 상태 처리
    if (loading) {
        return (
            <View style={styles.container}>
                <View style={styles.center}>
                    <ActivityIndicator size="large" color="#ec4899" />
                    <Text style={styles.loadingText}>매칭 정보를 불러오는 중...</Text>
                </View>
                <BottomTabBar navigation={navigation} getTabColor={getTabColor} getTabWeight={getTabWeight} />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

            {/* 2. Header (화면 제목) */}
            <View style={styles.header}>
                <Text style={styles.mainTitle}>채팅</Text>
                <View style={styles.matchCountPill}>
                    <Ionicons name="heart" size={14} color="#ec4899" />
                    <Text style={styles.matchCountText}>{matches.length}명</Text>
                </View>
            </View>

            <ScrollView
                style={styles.content}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 100 }}
            >

                {/* 3. New Matches Section (Grid) - 상단에 배치 */}
                {newMatches.length > 0 && (
                <View style={styles.section}>
                <View style={styles.sectionHeader}>
                <Ionicons name="sparkles" size={18} color="#a855f7" />
                <Text style={styles.sectionTitle}>새로운 매칭</Text>
                <View style={styles.newBadge}>
                    <Text style={styles.newBadgeText}>{newMatches.length}</Text>
                </View>
                </View>

                <View style={styles.gridContainer}>
                {newMatches.map((match) => (
                    <TouchableOpacity
                    key={match.id} // key prop 수정 완료!
                    style={styles.gridItem(itemWidth)}
                    activeOpacity={0.8}
                    onPress={() => navigateToChat(match)}
                    >
                    <View style={styles.imageWrapper}>
                    <Image source={{ uri: match.image }} style={styles.gridImage} />
                    {/* Gradient Overlay */}
                    <LinearGradient
                    colors={['transparent', 'rgba(0,0,0,0.6)']}
                    style={StyleSheet.absoluteFill}
                    />
                    
                    {/* New Badge */}
                    <LinearGradient
                    colors={['#ec4899', '#9333ea']}
                    start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                    style={styles.newLabel}
                    >
                    <Text style={styles.newLabelText}>NEW</Text>
                    </LinearGradient>

                    {/* Style Score */}
                    <View style={styles.scoreBadge}>
                    <Ionicons name="sparkles" size={10} color="#fff" />
                    <Text style={styles.scoreText}>{match.styleScore}%</Text>
                    </View>

                    {/* Info */}
                    <View style={styles.gridInfo}>
                    <Text style={styles.gridName} numberOfLines={1}>{match.name}, {match.age}</Text>
                    <Text style={styles.gridTime}>{match.timeAgo || '새 매칭'}</Text>
                    </View>
                    </View>
                    </TouchableOpacity>
                ))}
                </View>
                </View>
                )}

                {/* 4. Conversations Section (List) */}
                {conversations.length > 0 && (
                <View style={styles.section}>
                <Text style={[styles.sectionTitle, { marginLeft: 0, marginBottom: 16 }]}>대화 목록</Text>
                
                <View style={styles.listContainer}>
                {conversations.map((match) => (
                    <TouchableOpacity
                    key={match.id} // key prop 수정 완료!
                    style={styles.listItem}
                    onPress={() => navigateToChat(match)}
                    >
                    <View style={styles.avatarContainer}>
                    <Image source={{ uri: match.image }} style={styles.avatar} />
                    <LinearGradient
                    colors={['#ec4899', '#9333ea']}
                    style={styles.messageIconBadge}
                    >
                    <Ionicons name="chatbubble" size={10} color="#fff" />
                    </LinearGradient>
                    </View>

                    <View style={styles.listContent}>
                    <View style={styles.listHeader}>
                    <Text style={styles.listName}>{match.name}, {match.age}</Text>
                    <View style={styles.listScoreBadge}>
                        <Ionicons name="sparkles" size={10} color="#9333ea" />
                        <Text style={styles.listScoreText}>{match.styleScore}%</Text>
                    </View>
                    </View>
                    {match.lastMessage && (
                    <Text style={styles.lastMessage} numberOfLines={1}>
                        {match.lastMessage}
                    </Text>
                    )}
                    </View>

                    <Text style={styles.listTime}>{match.timeAgo}</Text>
                    </TouchableOpacity>
                ))}
                </View>
                </View>
                )}

                {/* Empty State */}
                {matches.length === 0 && !loading && (
                <View style={styles.emptyState}>
                <Ionicons name="heart-dislike-outline" size={48} color="#d1d5db" />
                <Text style={styles.emptyTitle}>아직 매칭이 없습니다</Text>
                <Text style={styles.emptySubtitle}>프로필을 탐색하고 마음에 드는 사람을 찾아보세요</Text>
                <TouchableOpacity
                style={styles.exploreButton}
                onPress={() => navigation.navigate('Explore')}
                >
                <LinearGradient
                colors={['#ec4899', '#9333ea']}
                style={styles.exploreGradient}
                >
                    <Text style={styles.exploreButtonText}>탐색하기</Text>
                </LinearGradient>
                </TouchableOpacity>
                </View>
                )}
            </ScrollView>

            {/* 5. Bottom Tab Bar */}
            <BottomTabBar navigation={navigation} getTabColor={getTabColor} getTabWeight={getTabWeight} />
        </View>
    );
}

// ----------------------------------------------------
// ⚠️ 주의: BottomTabBar와 Styles는 별도 파일로 분리하는 것이 좋습니다.
// ----------------------------------------------------

const styles = StyleSheet.create({
container: {
flex: 1,
backgroundColor: '#ffffff',
},
center: { 
flex: 1, 
justifyContent: 'center', 
alignItems: 'center',
backgroundColor: '#f9fafb',
},
loadingText: {
marginTop: 10,
fontSize: 16,
color: '#666',
},
// Header Style
header: {
flexDirection: 'row',
justifyContent: 'space-between',
alignItems: 'center',
paddingHorizontal: 16,
paddingTop: Platform.OS === 'ios' ? 50 : 30,
paddingBottom: 12,
borderBottomWidth: 1,
borderBottomColor: '#f3f4f6',
backgroundColor: '#ffffff',
},
mainTitle: {
fontSize: 28,
fontWeight: '800',
color: '#1f2937',
},
matchCountPill: {
flexDirection: 'row',
alignItems: 'center',
backgroundColor: '#fee2e2',
borderRadius: 20,
paddingHorizontal: 10,
paddingVertical: 5,
},
matchCountText: {
fontSize: 14,
fontWeight: '600',
color: '#ef4444',
marginLeft: 4,
},
content: {
flex: 1,
backgroundColor: '#f9fafb',
},

// Section Styles
section: {
paddingHorizontal: 16,
paddingVertical: 16,
},
sectionHeader: {
flexDirection: 'row',
alignItems: 'center',
marginBottom: 12,
},
sectionTitle: {
fontSize: 18,
fontWeight: '700',
color: '#1f2937',
marginLeft: 8,
},
newBadge: {
backgroundColor: '#f9a8d4',
borderRadius: 10,
paddingHorizontal: 8,
paddingVertical: 2,
marginLeft: 8,
},
newBadgeText: {
color: '#fff',
fontSize: 12,
fontWeight: 'bold',
},

// Grid Styles (New Matches)
gridContainer: {
flexDirection: 'row',
flexWrap: 'wrap',
justifyContent: 'space-between',
gap: 16,
},
gridItem: (width) => ({ // 너비를 인자로 받는 함수로 수정
width: width,
height: width * 1.3, // 세로로 길게
marginBottom: 8,
borderRadius: 12,
overflow: 'hidden',
elevation: 3,
backgroundColor: '#fff',
}),
imageWrapper: {
flex: 1,
position: 'relative',
},
gridImage: {
...StyleSheet.absoluteFillObject,
width: '100%',
height: '100%',
resizeMode: 'cover',
},
newLabel: {
position: 'absolute',
top: 8,
left: 8,
borderRadius: 4,
paddingHorizontal: 6,
paddingVertical: 2,
zIndex: 10,
},
newLabelText: {
color: '#fff',
fontSize: 10,
fontWeight: '900',
},
scoreBadge: {
position: 'absolute',
top: 8,
right: 8,
backgroundColor: 'rgba(255,255,255,0.9)',
borderRadius: 12,
paddingHorizontal: 6,
paddingVertical: 3,
flexDirection: 'row',
alignItems: 'center',
zIndex: 10,
},
scoreText: {
color: '#9333ea',
fontSize: 10,
fontWeight: 'bold',
marginLeft: 2,
},
gridInfo: {
position: 'absolute',
bottom: 0,
left: 0,
right: 0,
padding: 8,
zIndex: 5,
},
gridName: {
color: '#fff',
fontSize: 14,
fontWeight: '700',
},
gridTime: {
color: '#e5e7eb',
fontSize: 10,
marginTop: 2,
},

// List Styles (Conversations)
listContainer: {
backgroundColor: '#ffffff',
borderRadius: 12,
overflow: 'hidden',
borderWidth: 1,
borderColor: '#e5e7eb',
},
listItem: {
flexDirection: 'row',
alignItems: 'center',
padding: 12,
borderBottomWidth: 1,
borderBottomColor: '#f3f4f6',
},
avatarContainer: {
position: 'relative',
},
avatar: {
width: 56,
height: 56,
borderRadius: 28,
resizeMode: 'cover',
},
messageIconBadge: {
position: 'absolute',
bottom: 0,
right: 0,
width: 18,
height: 18,
borderRadius: 9,
alignItems: 'center',
justifyContent: 'center',
borderWidth: 2,
borderColor: '#fff',
},
listContent: {
flex: 1,
marginLeft: 12,
},
listHeader: {
flexDirection: 'row',
alignItems: 'center',
marginBottom: 4,
},
listName: {
fontSize: 16,
fontWeight: '600',
color: '#1f2937',
marginRight: 8,
},
listScoreBadge: {
flexDirection: 'row',
alignItems: 'center',
backgroundColor: '#f5f3ff',
borderRadius: 10,
paddingHorizontal: 6,
paddingVertical: 2,
},
listScoreText: {
fontSize: 10,
color: '#9333ea',
fontWeight: 'bold',
marginLeft: 2,
},
lastMessage: {
fontSize: 13,
color: '#6b7280',
},
listTime: {
fontSize: 12,
color: '#9ca3af',
},

// Empty State
emptyState: {
flex: 1,
alignItems: 'center',
justifyContent: 'center',
marginTop: 50,
padding: 20,
},
emptyTitle: {
fontSize: 20,
fontWeight: 'bold',
color: '#333',
marginTop: 16,
},
emptySubtitle: {
fontSize: 14,
color: '#999',
marginTop: 8,
textAlign: 'center',
},
exploreButton: {
marginTop: 24,
borderRadius: 25,
overflow: 'hidden',
elevation: 5,
},
exploreGradient: {
paddingVertical: 12,
paddingHorizontal: 30,
alignItems: 'center',
justifyContent: 'center',
},
exploreButtonText: {
color: '#fff',
fontSize: 16,
fontWeight: 'bold',
},

// Bottom Tab Bar
bottomBar: {
flexDirection: 'row',
backgroundColor: '#ffffff',
borderTopWidth: 1,
borderTopColor: '#f3f4f6',
paddingTop: 12,
paddingBottom: Platform.OS === 'ios' ? 32 : 10,
paddingHorizontal: 8,
position: 'absolute',
bottom: 0,
left: 0,
right: 0,
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
paddingVertical: 4,
},
tabText: {
fontSize: 11,
marginTop: 4,
},
});