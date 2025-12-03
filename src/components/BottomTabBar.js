// src/components/BottomTabBar.js

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const BottomTabBar = ({ navigation, getTabColor, getTabWeight }) => (
    <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.tabItem} onPress={() => navigation.navigate('MainHome')}>
            <Ionicons name="home" size={24} color={getTabColor('MainHome')} />
            <Text style={[styles.tabText, { color: getTabColor('MainHome'), fontWeight: getTabWeight('MainHome') }]}>홈</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.tabItem} onPress={() => navigation.navigate('Explore')}>
            <Ionicons name="compass-outline" size={24} color={getTabColor('Explore')} />
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
            <Ionicons name="chatbubbles" size={24} color={getTabColor('ChatList')} />
            <Text style={[styles.tabText, { color: getTabColor('ChatList'), fontWeight: getTabWeight('ChatList') }]}>채팅</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.tabItem} onPress={() => navigation.navigate('MyProfile')}>
            <Ionicons name="person-outline" size={24} color={getTabColor('MyProfile')} />
            <Text style={[styles.tabText, { color: getTabColor('MyProfile'), fontWeight: getTabWeight('MyProfile') }]}>나</Text>
        </TouchableOpacity>
    </View>
);

const styles = StyleSheet.create({
    // BottomTabBar의 스타일만 여기에 포함
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

export default BottomTabBar;