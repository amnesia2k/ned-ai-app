import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";

import { DatePickerField } from "@/components/DatePickerField";
import { useAuthStore } from "@/modules/auth/useAuthStore";

function Field({
  label,
  value,
  onChangeText,
  placeholder,
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
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
        className="min-h-[56px] rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 text-base text-slate-900"
      />
    </View>
  );
}

export default function OnboardingScreen() {
  const user = useAuthStore((state) => state.user);
  const updateProfile = useAuthStore((state) => state.updateProfile);
  const status = useAuthStore((state) => state.status);
  const errorMessage = useAuthStore((state) => state.errorMessage);
  const clearError = useAuthStore((state) => state.clearError);
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

    setFullName(user.fullName ?? "");
    setInstitution(user.institution ?? "");
    setMatricNumber(user.matricNumber ?? "");
    setStudentAcademicLevel(user.studentAcademicLevel ?? "");
    setDateOfBirth(user.dateOfBirth ?? "");
    setLecturerHighestQualification(user.lecturerHighestQualification ?? "");
    setLecturerCurrentAcademicStage(user.lecturerCurrentAcademicStage ?? "");
  }, [user]);

  async function handleContinue() {
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
      router.replace("/(app)");
    } catch {}
  }

  return (
    <ScrollView
      className="flex-1 bg-white"
      contentContainerStyle={{ padding: 24, paddingBottom: 40 }}
    >
      <View className="mt-16 rounded-3xl bg-slate-900 p-6">
        <Text className="text-2xl font-bold text-white">
          Complete your profile
        </Text>
        <Text className="mt-3 text-sm leading-6 text-slate-300">
          Finish your academic profile before entering the main NedAI workspace.
        </Text>
      </View>

      <View className="mt-6">
        <Field
          label="Name"
          value={fullName}
          onChangeText={setFullName}
          placeholder="Your full name"
        />
        <Field
          label="University Name"
          value={institution}
          onChangeText={setInstitution}
          placeholder="Mountain Top University"
        />

        {user?.role === "STUDENT" ? (
          <>
            <Field
              label="Academic Level"
              value={studentAcademicLevel}
              onChangeText={setStudentAcademicLevel}
              placeholder="400 Level"
            />
            <Field
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
            <Field
              label="Highest Qualification"
              value={lecturerHighestQualification}
              onChangeText={setLecturerHighestQualification}
              placeholder="BSc Computer Science"
            />
            <Field
              label="Current Academic Stage"
              value={lecturerCurrentAcademicStage}
              onChangeText={setLecturerCurrentAcademicStage}
              placeholder="Masters Level"
            />
          </>
        )}
      </View>

      {localError || errorMessage ? (
        <Text className="mt-4 text-sm text-rose-600">
          {localError || errorMessage}
        </Text>
      ) : null}

      <Pressable
        onPress={() => {
          void handleContinue();
        }}
        className="mt-6 items-center rounded-2xl bg-blue-600 px-4 py-4"
      >
        <Text className="text-base font-semibold text-white">
          {status === "loading" ? "Saving..." : "Continue to NedAI"}
        </Text>
      </Pressable>
    </ScrollView>
  );
}
