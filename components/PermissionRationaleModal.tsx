import { FolderClosed } from "lucide-react-native";
import React from "react";
import { Modal, Pressable, Text, View } from "react-native";

interface PermissionRationaleModalProps {
  isVisible: boolean;
  onContinue: () => void;
  onNotNow: () => void;
}

export function PermissionRationaleModal({
  isVisible,
  onContinue,
  onNotNow,
}: PermissionRationaleModalProps) {
  return (
    <Modal
      transparent
      visible={isVisible}
      animationType="fade"
      onRequestClose={onNotNow}
    >
      <View className="flex-1 items-center justify-center bg-black/60 px-6">
        <View className="w-full max-w-sm overflow-hidden rounded-[32px] bg-white">
          {/* Header Icon Section */}
          <View className="items-center justify-center bg-blue-500 py-10">
            <View className="items-center justify-center rounded-2xl bg-white/20 p-4">
              <FolderClosed size={48} color="white" />
            </View>
          </View>

          {/* Content Section */}
          <View className="p-8">
            <Text className="text-center text-lg leading-7 text-slate-600">
              To upload documents, allow NedAI access to your device&apos;s
              documents and files.
            </Text>

            <View className="mt-8 flex-row justify-end space-x-6">
              <Pressable onPress={onNotNow} className="px-4 py-2">
                <Text className="text-base font-bold text-blue-600">
                  Not now
                </Text>
              </Pressable>
              <Pressable onPress={onContinue} className="px-4 py-2">
                <Text className="text-base font-bold text-blue-600">
                  Continue
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}
