import { Href, router, useSegments } from "expo-router";
import {
  BookOpen,
  CalendarDays,
  FolderOpen,
  LogOut,
  MessageSquare,
  MoreVertical,
  Plus,
  User,
} from "lucide-react-native";
import React, { useEffect } from "react";
import {
  Dimensions,
  Keyboard,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

import { useUIStore } from "@/hooks/useUIStore";
import { groupDateLabel } from "@/lib/history";
import { useAuthStore } from "@/modules/auth/useAuthStore";
import { useChatStore } from "@/modules/chat/useChatStore";

import { useSafeAreaInsets } from "react-native-safe-area-context";

const STUDY_TOOLS = [
  {
    key: "chat",
    label: "Chat",
    href: "/(app)" as Href,
    icon: MessageSquare,
    segment: "(app)",
  },
  {
    key: "knowledge-vault",
    label: "Knowledge Vault",
    href: "/(app)/knowledge-vault" as Href,
    icon: FolderOpen,
    segment: "knowledge-vault",
  },
  {
    key: "timetable",
    label: "Timetable",
    href: "/(app)/timetable" as Href,
    icon: CalendarDays,
    segment: "timetable",
  },
  {
    key: "profile",
    label: "Profile & Settings",
    href: "/(app)/profile" as Href,
    icon: User,
    segment: "profile",
  },
] as const;

const { width } = Dimensions.get("window");
const SIDEBAR_WIDTH = width * 0.8;

export function Sidebar() {
  const insets = useSafeAreaInsets();
  const { isSidebarOpen, setSidebarOpen } = useUIStore();
  const threads = useChatStore((state) => state.threads);
  const activeThreadId = useChatStore((state) => state.activeThreadId);
  const selectThread = useChatStore((state) => state.selectThread);
  const startFreshChat = useChatStore((state) => state.startFreshChat);
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const segments = useSegments();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const translateX = useSharedValue(-SIDEBAR_WIDTH);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (isSidebarOpen) {
      Keyboard.dismiss();
      translateX.value = withTiming(0, { duration: 300 });
      opacity.value = withTiming(1, { duration: 300 });
    } else {
      translateX.value = withTiming(-SIDEBAR_WIDTH, { duration: 300 });
      opacity.value = withTiming(0, { duration: 300 });
    }
  }, [isSidebarOpen, opacity, translateX]);

  const sidebarStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const overlayStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const groupedThreads = {
    Today: threads.filter(
      (thread) => groupDateLabel(thread.lastMessageAt) === "Today",
    ),
    Yesterday: threads.filter(
      (thread) => groupDateLabel(thread.lastMessageAt) === "Yesterday",
    ),
    "Previous 7 Days": threads.filter(
      (thread) => groupDateLabel(thread.lastMessageAt) === "Previous 7 Days",
    ),
    Older: threads.filter(
      (thread) => groupDateLabel(thread.lastMessageAt) === "Older",
    ),
  };

  function handleClose() {
    setSidebarOpen(false);
    setIsMenuOpen(false);
  }

  function handleLogout() {
    logout();
    handleClose();
    router.replace("/(auth)/login");
  }

  function handleSelectRecentThread(threadId: string) {
    router.replace("/(app)");
    void selectThread(threadId);
    handleClose();
  }

  const activeSegment = segments[segments.length - 1] ?? "(app)";
  const displayName = user?.fullName || user?.email || "NedAI User";
  const initials = displayName.slice(0, 1).toUpperCase();

  return (
    <View
      style={StyleSheet.absoluteFill}
      pointerEvents={isSidebarOpen ? "auto" : "none"}
    >
      <Animated.View style={[styles.overlay, overlayStyle]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={handleClose} />
      </Animated.View>

      <Animated.View
        style={[
          styles.sidebar,
          sidebarStyle,
          {
            top: insets.top,
            bottom: insets.bottom,
          },
        ]}
      >
        <View className="flex-1 bg-white py-4">
          <View className="mb-6 px-4">
            <TouchableOpacity
              activeOpacity={0.8}
              className="flex-row items-center justify-center rounded-xl bg-blue-600 py-3.5 shadow-sm"
              onPress={() => {
                startFreshChat();
                router.replace("/(app)");
                handleClose();
              }}
            >
              <Plus size={20} color="white" strokeWidth={3} />
              <Text className="ml-2 text-base font-bold text-white">
                New Chat
              </Text>
            </TouchableOpacity>
          </View>

          <View className="px-4 pb-4">
            <Text className="mb-3 text-xs font-bold uppercase tracking-widest text-slate-400">
              Study Tools
            </Text>
            {STUDY_TOOLS.map((item) => {
              const Icon = item.icon;
              const isActive = activeSegment === item.segment;

              return (
                <TouchableOpacity
                  key={item.key}
                  activeOpacity={0.7}
                  className={`mb-1 flex-row items-center rounded-xl p-3 ${isActive ? "bg-blue-50" : ""}`}
                  onPress={() => {
                    router.replace(item.href);
                    handleClose();
                  }}
                >
                  <Icon
                    size={18}
                    color={isActive ? "#2563EB" : "#64748B"}
                    strokeWidth={2}
                  />
                  <Text
                    className={`ml-3 text-sm ${isActive ? "font-semibold text-blue-700" : "text-slate-700"}`}
                  >
                    {item.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <ScrollView className="flex-1 px-4">
            <Text className="mb-3 text-xs font-bold uppercase tracking-widest text-slate-400">
              Recent Chats
            </Text>
            {(["Today", "Yesterday", "Previous 7 Days", "Older"] as const).map(
              (label) =>
                groupedThreads[label].length > 0 ? (
                  <View key={label}>
                    <Text className="mb-3 text-xs font-bold uppercase tracking-widest text-slate-400">
                      {label}
                    </Text>
                    {groupedThreads[label].map((thread) => (
                      <HistoryItem
                        key={thread.id}
                        title={thread.title}
                        active={thread.id === activeThreadId}
                        onPress={() => {
                          handleSelectRecentThread(thread.id);
                        }}
                      />
                    ))}
                    <View className="h-6" />
                  </View>
                ) : null,
            )}

            {threads.length === 0 ? (
              <Text className="text-sm leading-6 text-slate-400">
                Your conversation history will appear here after the first
                message.
              </Text>
            ) : null}
          </ScrollView>

          <View className="flex-row items-center justify-between border-t border-slate-100 p-4">
            <View className="flex-1 flex-row items-center">
              <View className="mr-3 h-10 w-10 items-center justify-center rounded-full bg-orange-100">
                <Text className="text-sm font-bold text-orange-700">
                  {initials}
                </Text>
              </View>
              <View className="flex-1">
                <Text className="text-sm font-bold text-slate-900">
                  {displayName}
                </Text>
                <Text className="text-xs text-slate-400" numberOfLines={1}>
                  {user?.email ?? "No active session"}
                </Text>
              </View>
            </View>
            <View className="relative">
              <TouchableOpacity
                activeOpacity={0.7}
                className="ml-2 p-2"
                onPress={() => setIsMenuOpen(!isMenuOpen)}
              >
                <MoreVertical size={20} color="#94A3B8" strokeWidth={2} />
              </TouchableOpacity>

              {isMenuOpen && (
                <View 
                  className="absolute bottom-12 right-0 w-40 rounded-xl bg-white border border-slate-100 shadow-xl overflow-hidden"
                  style={{ zIndex: 50 }}
                >
                  <TouchableOpacity
                    className="flex-row items-center p-3 active:bg-slate-50 border-b border-slate-50"
                    onPress={() => {
                      handleClose();
                      router.push("/(app)/profile" as Href);
                    }}
                  >
                    <User size={18} color="#64748B" className="mr-3" />
                    <Text className="text-sm font-medium text-slate-700">Profile & Settings</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    className="flex-row items-center p-3 active:bg-slate-50"
                    onPress={handleLogout}
                  >
                    <LogOut size={18} color="#EF4444" className="mr-3" />
                    <Text className="text-sm font-medium text-red-500">Log Out</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>
        </View>
      </Animated.View>
    </View>
  );
}

function HistoryItem({
  title,
  active = false,
  onPress,
}: {
  title: string;
  active?: boolean;
  onPress?: () => void;
}) {
  return (
    <TouchableOpacity
      activeOpacity={0.7}
      className={`mb-1 flex-row items-center rounded-xl p-3 ${active ? "bg-slate-50" : ""}`}
      onPress={onPress}
    >
      <BookOpen
        size={18}
        color={active ? "#374151" : "#94A3B8"}
        strokeWidth={2}
      />
      <Text
        className={`ml-3 flex-1 text-sm ${active ? "font-medium text-slate-900" : "text-slate-600"}`}
        numberOfLines={1}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  sidebar: {
    position: "absolute",
    left: 0,
    width: SIDEBAR_WIDTH,
    backgroundColor: "white",
    shadowColor: "#000",
    shadowOffset: { width: 4, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 10,
  },
});
