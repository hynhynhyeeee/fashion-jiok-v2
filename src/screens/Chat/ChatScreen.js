import React, { useState, useEffect } from 'react';
import {
View, Text, TextInput, TouchableOpacity, FlatList, Image,
KeyboardAvoidingView, Platform, ActivityIndicator, StyleSheet // ⭐️ StyleSheet 추가
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, Send, Sparkles, Image as ImageIcon, Smile, MapPin } from 'lucide-react-native';
import { useRoute } from '@react-navigation/native';

import { getAiSuggestions } from '../../services/api';

export default function ChatScreen({ navigation, route }) {
// ⭐️ route.params에서 matchData와 roomId를 안전하게 가져옴
const { matchData: initialMatchData, roomId: initialRoomId } = route.params || {};
  
 // 파라미터가 없을 경우를 대비한 Mock Data (ChatList에서 클릭할 때 파라미터가 없을 수 있음)
const matchData = initialMatchData || {
 userId: "opponentUserId_Test",
 name: "지우",
 age: 26,
 image: "https://images.unsplash.com/photo-1696435552024-5fc45acf98c4",
 styleScore: 92
};

const [currentRoomId, setCurrentRoomId] = useState(initialRoomId); // ⭐️ roomId 상태 관리

// [기존 코드 유지]
const [messages, setMessages] = useState([]);
const [inputText, setInputText] = useState('');
const [aiSuggestions, setAiSuggestions] = useState([]);
const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
const [showAISuggestions, setShowAISuggestions] = useState(true);

// ⭐️ 1번: 위치 추천 상태 추가
const [locationState, setLocationState] = useState({
 selectedArea: null,
 placeSuggestions: [],
 isLoadingPlaces: false,
 currentPage: 1
});
const [showLocationModal, setShowLocationModal] = useState(false);
const [showPlaceSuggestions, setShowPlaceSuggestions] = useState(false);
const [areaInput, setAreaInput] = useState('');

// 처음 화면 로드 시 자동 추천
useEffect(() => {
 // ⭐️roomId가 있을 때만 메시지를 로드하는 로직을 추가해야 함 (현재는 목업이므로 일단 유지)
 console.log(`[CHAT] 채팅방 ID: ${currentRoomId}. 상대방: ${matchData.name}`);
 fetchOpeningSuggestions();
 
 // TODO: 실제 DB에서 채팅 메시지를 불러오는 로직 (roomId 사용) 추가 필요
}, [currentRoomId]);

const fetchOpeningSuggestions = async () => {
 setIsLoadingSuggestions(true);
 setShowAISuggestions(true);

 const context = {
 otherUserId: matchData.userId,
 chatHistory: messages.length === 0 ? [] : messages.map(msg => ({
  role: msg.sender === 'user' ? 'user' : 'model',
  text: msg.text
 }))
 };

 // getAiSuggestions API 호출 (주변 환경에 따라 실패할 수 있음)
 try {
 const suggestions = await getAiSuggestions(context);
 setAiSuggestions(suggestions);
 } catch (error) {
 console.error("AI 추천 로드 실패:", error);
 setAiSuggestions(["날씨가 좋네요!", "취미가 무엇인가요?"]); // 안전한 기본값
 }
 
 setIsLoadingSuggestions(false);
};

const handleSend = (text) => {
 const messageText = text || inputText;
 if (!messageText.trim()) return;

 const newMessage = {
 id: messages.length + 1,
 text: messageText,
 sender: 'user',
 timestamp: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })
 };

 setMessages([...messages, newMessage]);
 setInputText('');
 setShowAISuggestions(false);
 
 // TODO: 실제 DB에 메시지를 저장하는 로직 (currentRoomId 사용) 추가 필요
};

const renderMessage = ({ item }) => (
 <View style={{
 flexDirection: 'row',
 marginBottom: 16,
 justifyContent: item.sender === 'user' ? 'flex-end' : 'flex-start'
 }}>
 <View style={{
  maxWidth: '75%',
  alignItems: item.sender === 'user' ? 'flex-end' : 'flex-start'
 }}>
  {item.sender === 'user' ? (
  <LinearGradient
   colors={['#ec4899', '#9333ea']}
   style={{ borderRadius: 16, paddingHorizontal: 16, paddingVertical: 12 }}
  >
   <Text style={{ color: '#ffffff', fontSize: 14 }}>{item.text}</Text>
  </LinearGradient>
  ) : (
  <View style={{
   backgroundColor: '#ffffff',
   borderWidth: 1,
   borderColor: '#e5e7eb',
   borderRadius: 16,
   paddingHorizontal: 16,
   paddingVertical: 12
  }}>
   <Text style={{ color: '#111827', fontSize: 14 }}>{item.text}</Text>
  </View>
  )}
  <Text style={{
  color: '#9ca3af',
  fontSize: 12,
  marginTop: 4,
  textAlign: item.sender === 'user' ? 'right' : 'left'
  }}>
  {item.timestamp}
  </Text>
 </View>
 </View>
);

const renderAISuggestions = () => {
 if (!showAISuggestions) return null;

 if (isLoadingSuggestions) {
 return (
  <View style={{
  backgroundColor: '#faf5ff',
  borderWidth: 1,
  borderColor: '#e9d5ff',
  borderRadius: 16,
  padding: 16,
  marginTop: 16,
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: 100
  }}>
  <ActivityIndicator color="#a855f7" />
  <Text style={{ color: '#7c3aed', fontSize: 14, marginTop: 8 }}>
   AI가 대화를 제안 중입니다...
  </Text>
  </View>
 );
 }

 if (aiSuggestions.length === 0) {
 return null;
 }

 return (
 <View style={{
  backgroundColor: '#faf5ff',
  borderWidth: 1,
  borderColor: '#e9d5ff',
  borderRadius: 16,
  padding: 16,
  marginTop: 16
 }}>
  {/* ⭐️ 닫기 버튼 추가 */}
  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
   <Sparkles color="#a855f7" size={16} />
   <Text style={{ color: '#6b21a8', fontSize: 14 }}>AI 대화 제안</Text>
  </View>
  <TouchableOpacity
   onPress={() => setShowAISuggestions(false)}
   style={{ padding: 4 }}
  >
   <Text style={{ color: '#a855f7', fontSize: 18, fontWeight: '300' }}>✕</Text>
  </TouchableOpacity>
  </View>

  {aiSuggestions.map((suggestion, idx) => (
  <TouchableOpacity
   key={idx}
   onPress={() => setInputText(suggestion)}
   style={{
   backgroundColor: '#ffffff',
   borderWidth: 1,
   borderColor: '#e9d5ff',
   borderRadius: 8,
   paddingHorizontal: 12,
   paddingVertical: 8,
   marginBottom: 8
   }}
   activeOpacity={0.7}
  >
   <Text style={{ color: '#374151', fontSize: 14 }}>{suggestion}</Text>
  </TouchableOpacity>
  ))}
  <TouchableOpacity
  onPress={fetchOpeningSuggestions}
  style={{ marginTop: 4, alignSelf: 'center' }}
  activeOpacity={0.7}
  >
  <Text style={{ color: '#a855f7', fontSize: 12 }}>🔄 다시 추천받기</Text>
  </TouchableOpacity>
 </View>
 );
};

// ⭐️ 4번: renderPlaceSuggestions UI 함수 추가
const renderPlaceSuggestions = () => {
 if (!showPlaceSuggestions) return null;

 if (locationState.isLoadingPlaces) {
 return (
  <View style={{
  backgroundColor: '#fef3c7',
  borderWidth: 1,
  borderColor: '#fcd34d',
  borderRadius: 16,
  padding: 16,
  marginTop: 16,
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: 100
  }}>
  <ActivityIndicator color="#d97706" />
  <Text style={{ color: '#d97706', fontSize: 14, marginTop: 8 }}>
   🗺️ AI가 데이트 장소를 찾는 중...
  </Text>
  </View>
 );
 }

 if (locationState.placeSuggestions.length === 0) {
 return null;
 }

 return (
 <View style={{
  backgroundColor: '#fef3c7',
  borderWidth: 1,
  borderColor: '#fcd34d',
  borderRadius: 16,
  padding: 16,
  marginTop: 16
 }}>
  {/* 헤더 */}
  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
   <Text style={{ color: '#92400e', fontSize: 14, fontWeight: '600' }}>
   📍 {locationState.selectedArea} 추천 장소
   </Text>
  </View>
  <TouchableOpacity
   onPress={() => setShowPlaceSuggestions(false)}
   style={{ padding: 4 }}
  >
   <Text style={{ color: '#d97706', fontSize: 18 }}>✕</Text>
  </TouchableOpacity>
  </View>

  {/* 장소 카드 */}
  {locationState.placeSuggestions.map((place, idx) => (
  <View
   key={idx}
   style={{
   backgroundColor: '#ffffff',
   borderWidth: 1,
   borderColor: '#fcd34d',
   borderRadius: 8,
   padding: 12,
   marginBottom: 8
   }}
  >
   <Text style={{ color: '#d97706', fontSize: 13, fontWeight: '600' }}>
   {idx + 1}. {place.placeName}
   </Text>
   <Text style={{ color: '#78350f', fontSize: 11, marginTop: 4 }}>
   {place.category}
   </Text>
   <Text style={{ color: '#92400e', fontSize: 10, marginTop: 2 }}>
   📞 {place.phone || '번호 없음'}
   </Text>
  </View>
  ))}

  {/* 새로고침 버튼 */}
  <TouchableOpacity
  onPress={() => {
   // handleRefreshPlaces() - 나중에 5번 단계에서 연결
  }}
  style={{ marginTop: 8, alignSelf: 'center' }}
  activeOpacity={0.7}
  >
  <Text style={{ color: '#d97706', fontSize: 12, fontWeight: '600' }}>
   🔄 다른 장소 추천받기
  </Text>
  </TouchableOpacity>
 </View>
 );
};

return (
 <KeyboardAvoidingView
 behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
 style={{ flex: 1, backgroundColor: '#ffffff' }}
 >
 {/* Header */}
 <View style={{
  backgroundColor: '#ffffff',
  borderBottomWidth: 1,
  borderBottomColor: '#e5e7eb',
  padding: 16,
  paddingTop: 48
 }}>
  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
  <TouchableOpacity onPress={() => navigation.goBack()}>
   <ArrowLeft color="#000000" size={24} />
  </TouchableOpacity>
  
  <Image
   source={{ uri: matchData.image }}
   style={{ width: 40, height: 40, borderRadius: 20 }}
  />
  
  <View style={{ flex: 1 }}>
   <Text style={{ color: '#111827', fontWeight: '500', fontSize: 16 }}>
   {matchData.name}, {matchData.age}
   </Text>
   <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
   <Sparkles color="#a855f7" size={12} />
   <Text style={{ color: '#a855f7', fontSize: 12 }}>
    {matchData.styleScore}% 스타일 매칭
   </Text>
   </View>
  </View>
  </View>
 </View>

 {/* Messages */}
 <FlatList
  data={messages}
  renderItem={renderMessage}
  keyExtractor={item => item.id.toString()}
  style={{ flex: 1, backgroundColor: '#f9fafb' }}
  contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 16 }}
  ListFooterComponent={
  <View>
   {renderAISuggestions()}
   {renderPlaceSuggestions()}
  </View>
  }
 />

 {/* Input */}
 <View style={{
  backgroundColor: '#ffffff',
  borderTopWidth: 1,
  borderTopColor: '#e5e7eb',
  padding: 16
 }}>
  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
  <TouchableOpacity>
   <ImageIcon color="#9ca3af" size={24} />
  </TouchableOpacity>
  
  <View style={{
   flex: 1,
   backgroundColor: '#f3f4f6',
   borderWidth: 1,
   borderColor: '#e5e7eb',
   borderRadius: 20,
   flexDirection: 'row',
   alignItems: 'center',
   paddingHorizontal: 16
  }}>
   <TextInput
   value={inputText}
   onChangeText={setInputText}
   placeholder="메시지를 입력하세요..."
   placeholderTextColor="#9ca3af"
   style={{ flex: 1, paddingVertical: 8, color: '#111827' }}
   />
   <TouchableOpacity>
   <Smile color="#9ca3af" size={20} />
   </TouchableOpacity>
  </View>
  
  <TouchableOpacity
   onPress={() => handleSend()}
   disabled={!inputText.trim()}
   activeOpacity={0.8}
  >
   <LinearGradient
   colors={inputText.trim() ? ['#ec4899', '#9333ea'] : ['#e5e7eb', '#e5e7eb']}
   style={{
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center'
   }}
   >
   <Send color="white" size={20} />
   </LinearGradient>
  </TouchableOpacity>
  </View>

  {/* ⭐️ 2번: 버튼 배치 수정 - 두 버튼이 나란히 표시 */}
  {messages.length > 0 && (
  <View style={{ marginTop: 8, flexDirection: 'row', gap: 12 }}>
   {/* 대화 제안 버튼 */}
   {!showAISuggestions && (
   <TouchableOpacity
    onPress={() => setShowAISuggestions(true)}
    style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}
   >
    <Sparkles color="#a855f7" size={12} />
    <Text style={{ color: '#a855f7', fontSize: 12 }}>AI 대화 제안</Text>
   </TouchableOpacity>
   )}

   {/* 장소 추천 버튼 */}
   {!showPlaceSuggestions && (
   <TouchableOpacity
    onPress={() => setShowLocationModal(true)}
    style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}
   >
    <MapPin color="#d97706" size={12} />
    <Text style={{ color: '#d97706', fontSize: 12 }}>AI 장소 추천</Text>
   </TouchableOpacity>
   )}
  </View>
  )}
 </View>
 </KeyboardAvoidingView>
);
}

// ⭐️ ReferenceError 방지를 위해 빈 styles 객체를 추가했습니다.
const styles = StyleSheet.create({});