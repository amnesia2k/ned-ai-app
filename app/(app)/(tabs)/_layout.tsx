import {
  CalendarDays,
  FolderOpen,
  MessageSquareText,
  UserRound,
} from "lucide-react-native";
import { Tabs } from "expo-router";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

type TabIconProps = {
  focused: boolean;
  color: string;
  label: string;
  icon: React.ComponentType<{
    size?: number;
    color?: string;
    strokeWidth?: number;
  }>;
};

function TabIcon({ focused, color, label, icon: Icon }: TabIconProps) {
  return (
    <View style={[styles.tabChip, focused && styles.tabChipActive]}>
      <Icon size={18} color={color} strokeWidth={2.2} />
      <Text style={[styles.tabLabel, { color }]}>{label}</Text>
    </View>
  );
}

export default function AppTabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        sceneStyle: { backgroundColor: "#F8FAFC" },
        tabBarShowLabel: false,
        tabBarHideOnKeyboard: true,
        tabBarActiveTintColor: "#1D4ED8",
        tabBarInactiveTintColor: "#64748B",
        tabBarStyle: styles.tabBar,
        tabBarItemStyle: styles.tabBarItem,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Chat",
          tabBarIcon: ({ focused, color }) => (
            <TabIcon
              focused={focused}
              color={color}
              label="Chat"
              icon={MessageSquareText}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="knowledge-vault"
        options={{
          title: "Vault",
          tabBarIcon: ({ focused, color }) => (
            <TabIcon
              focused={focused}
              color={color}
              label="Vault"
              icon={FolderOpen}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="timetable"
        options={{
          title: "Schedule",
          tabBarIcon: ({ focused, color }) => (
            <TabIcon
              focused={focused}
              color={color}
              label="Schedule"
              icon={CalendarDays}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ focused, color }) => (
            <TabIcon
              focused={focused}
              color={color}
              label="Profile"
              icon={UserRound}
            />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    height: 64,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
    paddingTop: 10,
    paddingBottom: 4,
    elevation: 0,
    shadowColor: "transparent",
  },
  tabBarItem: {
    marginHorizontal: 0,
  },
  tabChip: {
    minWidth: 70,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  tabChipActive: {
    backgroundColor: "#EFF6FF",
  },
  tabLabel: {
    fontSize: 12,
    fontWeight: "700",
  },
});
