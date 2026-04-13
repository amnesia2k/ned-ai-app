import DateTimePicker, {
  type DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { router } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";

import { AppShell } from "@/components/AppShell";
import { useAuthStore } from "@/modules/auth/useAuthStore";
import { useChatStore } from "@/modules/chat/useChatStore";
import type { TimetableActivity, Weekday } from "@/modules/contracts";
import { useTimetableStore } from "@/modules/timetable/useTimetableStore";

const weekdays: Weekday[] = [
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
  "SUNDAY",
];

function formatTime(value: Date) {
  const hours = `${value.getHours()}`.padStart(2, "0");
  const minutes = `${value.getMinutes()}`.padStart(2, "0");
  return `${hours}:${minutes}`;
}

function parseTime(value: string) {
  const [hours, minutes] = value.split(":").map(Number);
  const date = new Date();
  date.setHours(hours || 0, minutes || 0, 0, 0);
  return date;
}

function labelForWeekday(day: Weekday) {
  return `${day.slice(0, 1)}${day.slice(1).toLowerCase()}`;
}

export default function TimetableScreen() {
  const token = useAuthStore((state) => state.accessToken);
  const startFreshChat = useChatStore((state) => state.startFreshChat);
  const activities = useTimetableStore((state) => state.activities);
  const status = useTimetableStore((state) => state.status);
  const errorMessage = useTimetableStore((state) => state.errorMessage);
  const loadActivities = useTimetableStore((state) => state.loadActivities);
  const createActivity = useTimetableStore((state) => state.createActivity);
  const updateActivity = useTimetableStore((state) => state.updateActivity);
  const deleteActivity = useTimetableStore((state) => state.deleteActivity);
  const [editingActivityId, setEditingActivityId] = useState<string | null>(
    null,
  );
  const [name, setName] = useState("");
  const [dayOfWeek, setDayOfWeek] = useState<Weekday>("MONDAY");
  const [startTime, setStartTime] = useState("08:00");
  const [endTime, setEndTime] = useState("09:00");
  const [pickerTarget, setPickerTarget] = useState<
    "startTime" | "endTime" | null
  >(null);
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    if (token) {
      void loadActivities(token);
    }
  }, [loadActivities, token]);

  const groupedActivities = useMemo(
    () =>
      weekdays.map((day) => ({
        day,
        items: activities.filter((activity) => activity.dayOfWeek === day),
      })),
    [activities],
  );

  function resetForm() {
    setEditingActivityId(null);
    setName("");
    setDayOfWeek("MONDAY");
    setStartTime("08:00");
    setEndTime("09:00");
    setPickerTarget(null);
    setLocalError(null);
  }

  function beginEdit(activity: TimetableActivity) {
    setEditingActivityId(activity.id);
    setName(activity.name);
    setDayOfWeek(activity.dayOfWeek);
    setStartTime(activity.startTime);
    setEndTime(activity.endTime);
    setLocalError(null);
  }

  async function handleSave() {
    if (!token) {
      return;
    }

    if (!name.trim()) {
      setLocalError("Activity name is required.");
      return;
    }

    if (endTime <= startTime) {
      setLocalError("End time must be after start time.");
      return;
    }

    setLocalError(null);

    try {
      if (editingActivityId) {
        await updateActivity(token, editingActivityId, {
          name: name.trim(),
          dayOfWeek,
          startTime,
          endTime,
        });
      } else {
        await createActivity(token, {
          name: name.trim(),
          dayOfWeek,
          startTime,
          endTime,
        });
      }

      resetForm();
    } catch {}
  }

  function handleTimeChange(event: DateTimePickerEvent, selectedDate?: Date) {
    if (event.type === "dismissed" || !selectedDate || !pickerTarget) {
      setPickerTarget(null);
      return;
    }

    const nextValue = formatTime(selectedDate);

    if (pickerTarget === "startTime") {
      setStartTime(nextValue);
    } else {
      setEndTime(nextValue);
    }

    setPickerTarget(null);
  }

  return (
    <AppShell
      title="Timetable"
      onNewChat={() => {
        startFreshChat();
        router.replace("/");
      }}
    >
      <ScrollView
        className="flex-1 bg-slate-50"
        contentContainerStyle={{ padding: 16, paddingBottom: 120 }}
      >
        <View className="rounded-3xl bg-white p-5">
          <Text className="text-lg font-semibold text-slate-900">
            Weekly timetable
          </Text>
          <Text className="mt-2 text-sm leading-6 text-slate-500">
            Add and manage recurring weekly activities. NedAI will use this
            timetable as part of your chat context.
          </Text>

          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Activity Name"
            className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 px-5 py-3 text-base text-slate-900"
            style={{ paddingHorizontal: 20 }}
          />

          <Text className="mt-5 text-xs font-bold uppercase tracking-widest text-slate-400">
            Day of the week
          </Text>
          <View className="mt-3 flex-row flex-wrap">
            {weekdays.map((day) => (
              <Pressable
                key={day}
                onPress={() => setDayOfWeek(day)}
                className={`mb-2 mr-2 rounded-full px-4 py-2 ${dayOfWeek === day ? "bg-blue-600" : "bg-slate-100"}`}
              >
                <Text
                  className={`text-xs font-semibold ${dayOfWeek === day ? "text-white" : "text-slate-700"}`}
                >
                  {labelForWeekday(day)}
                </Text>
              </Pressable>
            ))}
          </View>

          <View className="mt-5 flex-row">
            <Pressable
              onPress={() => setPickerTarget("startTime")}
              className="mr-3 flex-1 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3"
            >
              <Text className="text-xs font-bold uppercase tracking-widest text-slate-400">
                Start Time
              </Text>
              <Text className="mt-2 text-base text-slate-900">{startTime}</Text>
            </Pressable>

            <Pressable
              onPress={() => setPickerTarget("endTime")}
              className="flex-1 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3"
            >
              <Text className="text-xs font-bold uppercase tracking-widest text-slate-400">
                End Time
              </Text>
              <Text className="mt-2 text-base text-slate-900">{endTime}</Text>
            </Pressable>
          </View>

          {pickerTarget ? (
            <DateTimePicker
              value={parseTime(
                pickerTarget === "startTime" ? startTime : endTime,
              )}
              mode="time"
              is24Hour
              onChange={handleTimeChange}
            />
          ) : null}

          {localError || errorMessage ? (
            <Text className="mt-4 text-sm text-rose-600">
              {localError || errorMessage}
            </Text>
          ) : null}

          <View className="mt-5 flex-row">
            <Pressable
              onPress={() => {
                void handleSave();
              }}
              className="mr-3 flex-1 items-center rounded-2xl bg-blue-600 px-4 py-4"
            >
              <Text className="text-base font-semibold text-white">
                {status === "saving"
                  ? "Saving..."
                  : editingActivityId
                    ? "Update Activity"
                    : "Add Activity"}
              </Text>
            </Pressable>
            {editingActivityId ? (
              <Pressable
                onPress={resetForm}
                className="items-center rounded-2xl bg-slate-100 px-4 py-4"
              >
                <Text className="text-base font-semibold text-slate-700">
                  Cancel
                </Text>
              </Pressable>
            ) : null}
          </View>
        </View>

        <View className="mt-6">
          {groupedActivities.map(({ day, items }) => (
            <View key={day} className="mb-5">
              <Text className="mb-3 text-xs font-bold uppercase tracking-widest text-slate-400">
                {labelForWeekday(day)}
              </Text>
              {items.length > 0 ? (
                items.map((activity) => (
                  <View
                    key={activity.id}
                    className="mb-3 rounded-2xl bg-white p-4"
                  >
                    <View className="flex-row items-start justify-between">
                      <View className="mr-3 flex-1">
                        <Text className="text-base font-semibold text-slate-900">
                          {activity.name}
                        </Text>
                        <Text className="mt-2 text-sm text-slate-500">
                          {activity.startTime} - {activity.endTime}
                        </Text>
                      </View>
                      <View className="flex-row">
                        <Pressable
                          onPress={() => beginEdit(activity)}
                          className="mr-2 rounded-full bg-slate-100 px-3 py-2"
                        >
                          <Text className="text-xs font-semibold text-slate-700">
                            Edit
                          </Text>
                        </Pressable>
                        <Pressable
                          onPress={() => {
                            if (token) {
                              void deleteActivity(token, activity.id);
                            }
                          }}
                          className="rounded-full bg-rose-100 px-3 py-2"
                        >
                          <Text className="text-xs font-semibold text-rose-700">
                            Delete
                          </Text>
                        </Pressable>
                      </View>
                    </View>
                  </View>
                ))
              ) : (
                <View className="rounded-2xl border border-dashed border-slate-200 px-4 py-5">
                  <Text className="text-sm text-slate-500">
                    No activities scheduled.
                  </Text>
                </View>
              )}
            </View>
          ))}
        </View>
      </ScrollView>
    </AppShell>
  );
}
