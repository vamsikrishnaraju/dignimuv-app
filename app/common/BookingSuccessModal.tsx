import { Ionicons } from "@expo/vector-icons";
import React, { useEffect } from "react";
import { Modal, Text, View } from "react-native";

type BookingSuccessModalProps = {
  visible: boolean;
  bookingId: string;
  onClose?: () => void;
};

export default function BookingSuccessModal({
  visible,
  bookingId,
  onClose,
}: BookingSuccessModalProps) {
  useEffect(() => {
    if (visible && onClose) {
      const timer = setTimeout(() => {
        onClose();
      }, 10000); // 10 seconds

      return () => clearTimeout(timer);
    }
  }, [visible, onClose]);

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View className="flex-1 bg-black/50 justify-center items-center px-6">
        <View className="bg-white w-full rounded-2xl p-6">
          {/* Timer Circle */}
          <View className="items-center mb-4">
            <View className="w-20 h-20 rounded-full bg-orange-100 items-center justify-center">
              <Ionicons name="checkmark" size={48} color="#22C55E" />
            </View>
          </View>

          {/* Status Text */}
          <Text className="text-gray-600 text-center text-bold text-xl mb-6">
            Booking Id: {bookingId}
          </Text>
          <Text className="text-gray-600 text-center text-bold text-xl mb-6">
            Your ambulance booking was successful!
          </Text>
        </View>
      </View>
    </Modal>
  );
}