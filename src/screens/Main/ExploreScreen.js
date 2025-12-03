import React, { useState, useEffect } from 'react';
import { 
    View, 
    Text, 
    Image, 
    TouchableOpacity, 
    StyleSheet, 
    Dimensions, 
    StatusBar,
    ScrollView,
    Platform,
    ActivityIndicator
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

// API 함수 import
import { fetchExploreUsers } from '../../services/api'; 

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2;

export default function ExploreScreen({ navigation }) {
    const [profiles, setProfiles] = useState([]); 
    const [likedProfiles, setLikedProfiles] = useState([]);
    const [loading, setLoading] = useState(true); 

    // 서버에서 데이터 가져오기
    const loadUsers = async () => {
        setLoading(true);
        try {
            const data = await fetchExploreUsers();
            setProfiles(data || []); 
        } catch (error) {
            console.error("Error loading users:", error);
            setProfiles([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadUsers(); 
    }, []);
    
    // 좋아요 토글 함수
    const toggleLike = (id) => {
        if (likedProfiles.includes(id)) {
            setLikedProfiles(likedProfiles.filter(pid => pid !== id));
        } else {
            setLikedProfiles([...likedProfiles, id]);
        }
    };

    // 새로고침 함수
    const handleRefresh = () => {
        loadUsers(); 
    };

    // 하단 탭 스타일 함수
    const activeRouteName = 'Explore';
    const getTabColor = (routeName) => (routeName === activeRouteName ? '#000000' : '#9ca3af');
    const getTabWeight = (routeName) => (routeName === activeRouteName ? '700' : '500');

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

            {/* Header */}
            <View style={styles.header}>
                <View>
                    <Text style={styles.headerTitle}>스타일 탐색</Text>
                    <Text style={styles.headerSubtitle}>취향이 맞는 패션 피플을 찾아보세요</Text>
                </View>
                <TouchableOpacity style={styles.filterButton}>
                    <Ionicons name="options-outline" size={24} color="#1a1a1a" />
                </TouchableOpacity>
            </View>

            <ScrollView 
                style={styles.content}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 100 }}
            >
                {loading ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color="#ec4899" />
                        <Text style={styles.loadingText}>새로운 프로필을 불러오는 중...</Text>
                    </View>
                ) : (
                    <>
                        {/* Grid Container */}
                        <View style={styles.gridContainer}>
                            {/* ⭐️ key 중복 해결: index 추가 */}
                            {profiles.map((profile, index) => {
                                const isLiked = likedProfiles.includes(profile.id);
                                return (
                                    <View key={`profile-${profile.id}-${index}`} style={styles.card}>
                                        {/* Image Area */}
                                        <View style={styles.imageContainer}>
                                            <Image 
                                                source={{ uri: profile.image || 'https://via.placeholder.com/300' }} 
                                                style={styles.cardImage} 
                                            />
                                            
                                            {/* Match Score Badge */}
                                            <View style={styles.matchBadge}>
                                                <Text style={styles.matchText}>{profile.styleScore || 75}%</Text>
                                            </View>

                                            {/* Like Button */}
                                            <TouchableOpacity 
                                                style={styles.likeButton}
                                                onPress={() => toggleLike(profile.id)}
                                                activeOpacity={0.9}
                                            >
                                                <Ionicons 
                                                    name={isLiked ? "heart" : "heart-outline"} 
                                                    size={20}
                                                    color={isLiked ? "#ec4899" : "#ffffff"} 
                                                />
                                            </TouchableOpacity>
                                        </View>

                                        {/* Info Area */}
                                        <View style={styles.cardInfo}>
                                            <View style={styles.nameRow}>
                                                <Text style={styles.nameText}>{profile.name}, {profile.age}</Text>
                                            </View>
                                            <View style={styles.locationRow}>
                                                <Ionicons name="location-sharp" size={12} color="#9ca3af" />
                                                <Text style={styles.locationText}>{profile.location || '서울'}</Text>
                                            </View>
                                            
                                            {/* Tags */}
                                            <View style={styles.tagsRow}>
                                                {(profile.tags || [profile.style || '패션']).map((tag, idx) => (
                                                    <View key={`tag-${index}-${idx}`} style={styles.tag}>
                                                        <Text style={styles.tagText}>#{tag}</Text>
                                                    </View>
                                                ))}
                                            </View>
                                        </View>
                                    </View>
                                );
                            })}
                        </View>
                        
                        {/* 프로필이 없을 때 메시지 */}
                        {profiles.length === 0 && (
                             <View style={styles.emptyState}>
                                <Text style={styles.emptyText}>현재 탐색할 프로필이 없습니다. 😭</Text>
                             </View>
                        )}

                        {/* Refresh Button */}
                        <TouchableOpacity 
                            style={styles.refreshButton}
                            onPress={handleRefresh}
                            activeOpacity={0.8}
                        >
                            <LinearGradient
                                colors={['#1a1a1a', '#4b5563']}
                                style={styles.refreshGradient}
                            >
                                <Ionicons name="refresh" size={18} color="#fff" style={{ marginRight: 8 }} />
                                <Text style={styles.refreshText}>새로운 친구 찾기</Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    </>
                )}
            </ScrollView>

            {/* Bottom Tab Bar */}
            <View style={styles.bottomBar}>
                <TouchableOpacity style={styles.tabItem} onPress={() => navigation.navigate('MainHome')}>
                    <Ionicons name="home" size={24} color={getTabColor('MainHome')} />
                    <Text style={[styles.tabText, { color: getTabColor('MainHome'), fontWeight: getTabWeight('MainHome') }]}>홈</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.tabItem} onPress={() => navigation.navigate('Explore')}>
                    <Ionicons name="compass" size={24} color={getTabColor('Explore')} />
                    <Text style={[styles.tabText, { color: getTabColor('Explore'), fontWeight: getTabWeight('Explore') }]}>탐색</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.tabItem} onPress={() => navigation.navigate('Map')}>
                    <Ionicons name="heart-outline" size={24} color={getTabColor('Map')} />
                    <Text style={[styles.tabText, { color: getTabColor('Map'), fontWeight: getTabWeight('Map') }]}>종알림</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.tabItem} onPress={() => navigation.navigate('Matches')}>
                    <Ionicons name="people-outline" size={24} color={getTabColor('Matches')} />
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
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#ffffff',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: Platform.OS === 'ios' ? 60 : 40,
        paddingBottom: 16,
        paddingHorizontal: 20,
        backgroundColor: '#ffffff',
        borderBottomWidth: 1,
        borderBottomColor: '#f3f4f6',
        zIndex: 10,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: '700',
        color: '#1a1a1a',
        marginBottom: 4,
    },
    headerSubtitle: {
        fontSize: 14,
        color: '#6b7280',
    },
    filterButton: {
        padding: 8,
        backgroundColor: '#f3f4f6',
        borderRadius: 12,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 100,
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        color: '#6b7280',
    },
    content: {
        flex: 1,
    },
    gridContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        paddingHorizontal: 16,
        paddingTop: 16,
        justifyContent: 'space-between',
    },
    card: {
        width: CARD_WIDTH,
        marginBottom: 20,
        backgroundColor: '#ffffff',
        borderRadius: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 3,
        borderWidth: 1,
        borderColor: '#f3f4f6',
    },
    imageContainer: {
        width: '100%',
        aspectRatio: 3/4,
        borderRadius: 16,
        overflow: 'hidden',
        position: 'relative',
    },
    cardImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    matchBadge: {
        position: 'absolute',
        top: 8,
        left: 8,
        backgroundColor: 'rgba(0,0,0,0.6)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
    },
    matchText: {
        color: '#a855f7',
        fontSize: 11,
        fontWeight: '700',
    },
    likeButton: {
        position: 'absolute',
        bottom: 8,
        right: 8,
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: 'rgba(0,0,0,0.4)',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
    },
    cardInfo: {
        padding: 12,
    },
    nameRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    nameText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1a1a1a',
    },
    locationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
        gap: 2,
    },
    locationText: {
        fontSize: 12,
        color: '#9ca3af',
    },
    tagsRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 4,
    },
    tag: {
        backgroundColor: '#f3f4f6',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
    },
    tagText: {
        fontSize: 10,
        color: '#6b7280',
        fontWeight: '500',
    },
    refreshButton: {
        marginHorizontal: 20,
        marginTop: 10,
        marginBottom: 20,
        borderRadius: 16,
        overflow: 'hidden',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 5,
    },
    refreshGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
    },
    refreshText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: '600',
    },
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
    emptyState: {
        alignItems: 'center',
        paddingVertical: 50,
    },
    emptyText: {
        fontSize: 16,
        color: '#9ca3af',
    }
});