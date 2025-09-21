import { useAuth } from "@/context/AuthContext";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { KeyboardAvoidingView, Platform, Text, TextInput, TouchableOpacity, View } from "react-native";
export default function Login() {
  const router = useRouter();
  const [phoneNumber, setPhoneNumber] = useState("");
  const { setPhoneNumber: setAuthPhoneNumber } = useAuth();

  const onContinue = () => {

    const normalized = phoneNumber.replace(/\D/g, "");
    if (normalized.length < 8) return; // simple client guard
    setAuthPhoneNumber(normalized);
    router.push({ pathname: "/login/otp", params: { phone: normalized } });
  };

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-blue-800"
      behavior={Platform.select({ ios: "padding", android: undefined })}
    >
      <View className="flex-1 items-center justify-center px-6 gap-5">
       {/* <Image
          source={require("../../assets/images/digniMuv_logo.png")}
          className="w-40 h-40"
          resizeMode="contain"
        /> */}
        <Text className="text-5xl font-bold text-white mb-4 tracking-wide">DigniMuv</Text>

        <View className="w-full gap-4">
          <Text className="text-2xl font-semibold text-white text-center">Health Care in just</Text>
          <Text className="text-3xl font-semibold text-white text-center">8 minutes</Text>
        </View>

        <View className="w-full gap-4">
          <View className="flex-row items-center border border-gray-300 rounded-xl px-4 py-3 bg-white">
            <Text className="text-gray-700 mr-4">+91</Text>
            <TextInput
              keyboardType="phone-pad"
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              placeholder="Phone number"
              className="flex-1 text-base text-gray-900"
              placeholderTextColor="#9CA3AF"
              maxLength={15}
            />
          </View>

          <TouchableOpacity
            onPress={onContinue}
            activeOpacity={0.8}
            className="bg-white py-4 rounded-xl disabled:opacity-787120"
            disabled={phoneNumber.replace(/\D/g, "").length < 8}
          >
            <Text className="text-blue-600 text-center text-2xl font-semibold">Continue</Text>
          </TouchableOpacity>
        </View>

        <Text className="text-xs text-white">By continuing, you agree to our Terms and Privacy Policy.</Text>
      </View>
    </KeyboardAvoidingView>
  );
}


