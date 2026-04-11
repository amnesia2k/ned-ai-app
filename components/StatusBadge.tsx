import React from "react";
import { Text, View } from "react-native";

import type { DocumentStatus } from "@/modules/contracts";

type BadgeStatus = DocumentStatus;

const STATUS_STYLES: Record<
  BadgeStatus,
  { container: string; text: string }
> = {
  UPLOADED: {
    container: "bg-slate-100",
    text: "text-slate-700",
  },
  PROCESSING: {
    container: "bg-amber-100",
    text: "text-amber-800",
  },
  READY: {
    container: "bg-emerald-100",
    text: "text-emerald-800",
  },
  FAILED: {
    container: "bg-rose-100",
    text: "text-rose-800",
  },
};

export function StatusBadge({ status }: { status: BadgeStatus }) {
  const style = STATUS_STYLES[status];

  return (
    <View className={`rounded-full px-2.5 py-1 ${style.container}`}>
      <Text className={`text-xs font-semibold ${style.text}`}>{status}</Text>
    </View>
  );
}
