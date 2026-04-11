import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import React, { useState } from "react";
import { Platform, Pressable, Text, View } from "react-native";

interface DatePickerFieldProps {
  label: string;
  value: string; // Expected in YYYY-MM-DD format
  onChange: (value: string) => void;
  placeholder?: string;
}

export function DatePickerField({
  label,
  value,
  onChange,
  placeholder = "Select date",
}: DatePickerFieldProps) {
  const [show, setShow] = useState(false);

  // Parse YYYY-MM-DD to Date object
  const dateValue = value ? new Date(value) : new Date();

  const handleDateChange = (
    event: DateTimePickerEvent,
    selectedDate?: Date,
  ) => {
    // Hide picker on Android after selection or on iOS if it's not the spinner
    if (Platform.OS === "android" || event.type === "set") {
      setShow(false);
    }

    if (event.type === "set" && selectedDate) {
      const year = selectedDate.getFullYear();
      const month = String(selectedDate.getMonth() + 1).padStart(2, "0");
      const day = String(selectedDate.getDate()).padStart(2, "0");
      const formattedDate = `${year}-${month}-${day}`;
      onChange(formattedDate);
    } else if (event.type === "dismissed") {
      setShow(false);
    }
  };

  const displayValue = value || placeholder;

  return (
    <View className="mb-5">
      <Text className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-500">
        {label}
      </Text>
      <Pressable
        onPress={() => setShow(true)}
        className="min-h-[56px] flex-row items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 active:bg-slate-100"
      >
        <Text
          className={`text-base ${value ? "text-slate-900" : "text-slate-400"}`}
        >
          {displayValue}
        </Text>
      </Pressable>

      {show && (
        <DateTimePicker
          value={isNaN(dateValue.getTime()) ? new Date() : dateValue}
          mode="date"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={handleDateChange}
          maximumDate={new Date()} // Date of birth cannot be in the future
        />
      )}
    </View>
  );
}
