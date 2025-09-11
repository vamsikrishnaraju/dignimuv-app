import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useMemo, useRef, useState } from "react";
import { Text, TextInput, TouchableOpacity, View } from "react-native";

export default function OtpScreen() {
  const router = useRouter();
  const { phone } = useLocalSearchParams<{ phone?: string }>();
  const [otp, setOtp] = useState("\n\n\n\n".replace(/\n/g, ""));
  
  // Refs for each input field
  const inputRefs = useRef<TextInput[]>([]);

  const maskedPhone = useMemo(() => {
    if (!phone) return "";
    return phone.replace(/\d(?=\d{2})/g, "*");
  }, [phone]);

  const onVerify = () => {
    if (otp.length === 4) {
      router.replace("/booking");
    }
  };

  const handleOtpChange = (text: string, index: number) => {
    // Only allow numbers
    const numericText = text.replace(/[^0-9]/g, "");
    
    // Update OTP state
    const newOtp = otp.substring(0, index) + numericText + otp.substring(index + 1);
    setOtp(newOtp);
    
    // Move to next input if digit entered
    if (numericText && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }
    
    // Move to previous input if backspace and current field is empty
    if (!numericText && index > 0 && otp[index] === "") {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    // Handle backspace
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  return (
    <View className="flex-1 bg-white items-center justify-center px-6 gap-8">
      <View className="gap-2 items-center">
        <Text className="text-2xl font-semibold text-gray-900">Enter OTP</Text>
        <Text className="text-gray-500">Sent to +91 {maskedPhone}</Text>
      </View>

      <View className="flex-row gap-3">
        {[0, 1, 2, 3].map((i) => (
          <TextInput
            key={i}
            ref={(ref) => {
              if (ref) inputRefs.current[i] = ref;
            }}
            className="w-14 h-14 border border-gray-300 rounded-xl text-center text-xl"
            keyboardType="number-pad"
            maxLength={1}
            value={otp[i] || ""}
            onChangeText={(text) => handleOtpChange(text, i)}
            onKeyPress={(e) => handleKeyPress(e, i)}
            onFocus={() => {
              // Select all text when focused
              if (otp[i]) {
                inputRefs.current[i]?.setSelection(0, 1);
              }
            }}
          />
        ))}
      </View>

      <TouchableOpacity
        onPress={onVerify}
        activeOpacity={0.8}
        className="bg-blue-600 py-4 px-6 rounded-xl w-full"
        disabled={otp.length !== 4 || /[^0-9]/.test(otp)}
      >
        <Text className="text-white text-center text-base font-medium">Verify</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.back()}>
        <Text className="text-blue-600">Edit phone number</Text>
      </TouchableOpacity>
    </View>
  );
}


