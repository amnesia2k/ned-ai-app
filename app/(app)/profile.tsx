import * as Updates from "expo-updates";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";

import { AppShell } from "@/components/AppShell";
import { DatePickerField } from "@/components/DatePickerField";
import { useAuthStore } from "@/modules/auth/useAuthStore";
import { useChatStore } from "@/modules/chat/useChatStore";

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <View className="mt-6 rounded-3xl bg-white p-5">
      <Text className="text-xs font-bold uppercase tracking-widest text-slate-400">
        {title}
      </Text>
      <View className="mt-4">{children}</View>
    </View>
  );
}

function TextField({
  label,
  value,
  onChangeText,
  placeholder,
  editable = true,
}: {
  label: string;
  value: string;
  onChangeText?: (value: string) => void;
  placeholder?: string;
  editable?: boolean;
}) {
  return (
    <View className="mb-5">
      <Text className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-500">
        {label}
      </Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#94a3b8"
        editable={editable}
        className={`min-h-[56px] rounded-2xl border border-slate-200 px-8 py-4 text-base ${editable ? "bg-slate-50 text-slate-900" : "bg-slate-100 text-slate-500"}`}
      />
    </View>
  );
}

export default function ProfileScreen() {
  const user = useAuthStore((state) => state.user);
  const updateProfile = useAuthStore((state) => state.updateProfile);
  const logout = useAuthStore((state) => state.logout);
  const clearError = useAuthStore((state) => state.clearError);
  const errorMessage = useAuthStore((state) => state.errorMessage);
  const status = useAuthStore((state) => state.status);
  const clearChatHistory = useChatStore((state) => state.clearChatHistory);
  const startFreshChat = useChatStore((state) => state.startFreshChat);
  const [fullName, setFullName] = useState("");
  const [institution, setInstitution] = useState("");
  const [matricNumber, setMatricNumber] = useState("");
  const [studentAcademicLevel, setStudentAcademicLevel] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [lecturerHighestQualification, setLecturerHighestQualification] =
    useState("");
  const [lecturerCurrentAcademicStage, setLecturerCurrentAcademicStage] =
    useState("");
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      return;
    }

    setFullName(user.fullName);
    setInstitution(user.institution ?? "");
    setMatricNumber(user.matricNumber ?? "");
    setStudentAcademicLevel(user.studentAcademicLevel ?? "");
    setDateOfBirth(user.dateOfBirth ?? "");
    setLecturerHighestQualification(user.lecturerHighestQualification ?? "");
    setLecturerCurrentAcademicStage(user.lecturerCurrentAcademicStage ?? "");
  }, [user]);

  async function handleSave() {
    clearError();

    if (!fullName.trim() || !institution.trim()) {
      setLocalError("Name and university name are required.");
      return;
    }

    if (user?.role === "STUDENT") {
      if (
        !studentAcademicLevel.trim() ||
        !matricNumber.trim() ||
        !dateOfBirth.trim()
      ) {
        setLocalError("Complete all required student fields.");
        return;
      }
    }

    if (user?.role === "LECTURER") {
      if (
        !lecturerHighestQualification.trim() ||
        !lecturerCurrentAcademicStage.trim()
      ) {
        setLocalError("Complete all required lecturer fields.");
        return;
      }
    }

    setLocalError(null);

    try {
      await updateProfile({
        fullName,
        institution,
        ...(user?.role === "STUDENT"
          ? {
              matricNumber,
              studentAcademicLevel,
              dateOfBirth,
            }
          : {}),
        ...(user?.role === "LECTURER"
          ? {
              lecturerHighestQualification,
              lecturerCurrentAcademicStage,
            }
          : {}),
      });
    } catch {}
  }

  function handleClearChatHistory() {
    Alert.alert(
      "Clear chat history",
      "This will permanently delete your chat history from the device and server.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear",
          style: "destructive",
          onPress: () => {
            void clearChatHistory();
          },
        },
      ],
    );
  }

  async function handleCheckForUpdates() {
    try {
      const update = await Updates.checkForUpdateAsync();
      if (update.isAvailable) {
        Alert.alert(
          "Update Available",
          "A new version of the app is available. Would you like to download and restart now?",
          [
            { text: "Later", style: "cancel" },
            {
              text: "Update Now",
              onPress: async () => {
                await Updates.fetchUpdateAsync();
                await Updates.reloadAsync();
              },
            },
          ],
        );
      } else {
        Alert.alert(
          "Up to Date",
          "You are running the latest version of NedAI.",
        );
      }
    } catch {
      Alert.alert(
        "Update Error",
        "Failed to check for updates. Please check your internet connection.",
      );
    }
  }

  const updateId = Updates.updateId?.slice(0, 8) ?? "Native Build";

  return (
    <AppShell
      title="Profile & Settings"
      onNewChat={() => {
        startFreshChat();
        router.replace("/(app)");
      }}
    >
      <ScrollView
        className="flex-1 bg-slate-50"
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
      >
        <Section title="Identity">
          <TextField
            label="Name"
            value={fullName}
            onChangeText={setFullName}
            placeholder="Your full name"
          />
          <TextField label="Email" value={user?.email ?? ""} editable={false} />
          <TextField label="Role" value={user?.role ?? ""} editable={false} />
        </Section>

        <Section title="Academic Profile">
          <TextField
            label="University Name"
            value={institution}
            onChangeText={setInstitution}
            placeholder="Mountain Top University"
          />

          {user?.role === "STUDENT" ? (
            <>
              <TextField
                label="Academic Level"
                value={studentAcademicLevel}
                onChangeText={setStudentAcademicLevel}
                placeholder="400 Level"
              />
              <TextField
                label="Matriculation Number"
                value={matricNumber}
                onChangeText={setMatricNumber}
                placeholder="MAT/2022/001"
              />
              <DatePickerField
                label="Date of Birth"
                value={dateOfBirth}
                onChange={setDateOfBirth}
                placeholder="YYYY-MM-DD"
              />
            </>
          ) : (
            <>
              <TextField
                label="Highest Qualification"
                value={lecturerHighestQualification}
                onChangeText={setLecturerHighestQualification}
                placeholder="BSc Computer Science"
              />
              <TextField
                label="Current Academic Stage"
                value={lecturerCurrentAcademicStage}
                onChangeText={setLecturerCurrentAcademicStage}
                placeholder="Masters Level"
              />
            </>
          )}
        </Section>

        <Section title="System">
          <View className="mb-3 rounded-2xl bg-white border border-slate-100 px-4 py-4 flex-row items-center justify-between">
            <View>
              <Text className="text-sm font-semibold text-slate-700">
                Update Version
              </Text>
              <Text className="text-xs text-slate-400 mt-1">
                ID: {updateId}
              </Text>
            </View>
            <Pressable
              onPress={() => {
                void handleCheckForUpdates();
              }}
              className="rounded-xl bg-blue-50 px-4 py-2"
            >
              <Text className="text-sm font-bold text-blue-600">Check</Text>
            </Pressable>
          </View>

          <Pressable
            onPress={handleClearChatHistory}
            className="mb-3 rounded-2xl bg-rose-50 px-4 py-4"
          >
            <Text className="text-base font-semibold text-rose-700">
              Clear Chat History
            </Text>
            <Text className="mt-1 text-sm leading-5 text-rose-600">
              Remove every saved conversation from this account.
            </Text>
          </Pressable>

          <Pressable
            onPress={() => {
              logout();
              router.replace("/(auth)/login");
            }}
            className="rounded-2xl bg-slate-100 px-4 py-4"
          >
            <Text className="text-base font-semibold text-slate-700">
              Log Out
            </Text>
          </Pressable>
        </Section>

        {localError || errorMessage ? (
          <Text className="mt-4 text-sm text-rose-600">
            {localError || errorMessage}
          </Text>
        ) : null}

        <Pressable
          onPress={() => {
            void handleSave();
          }}
          className="mt-6 items-center rounded-2xl bg-blue-600 px-4 py-4"
        >
          <Text className="text-base font-semibold text-white">
            {status === "loading" ? "Saving..." : "Save Profile"}
          </Text>
        </Pressable>
      </ScrollView>
    </AppShell>
  );
}
