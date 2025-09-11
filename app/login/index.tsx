import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Image, KeyboardAvoidingView, Platform, Text, TextInput, TouchableOpacity, View } from "react-native";

export default function Login() {
  const router = useRouter();
  const [phoneNumber, setPhoneNumber] = useState("");

  const onContinue = () => {
    const normalized = phoneNumber.replace(/\D/g, "");
    if (normalized.length < 8) return; // simple client guard
    router.push({ pathname: "/login/otp", params: { phone: normalized } });
  };

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-white"
      behavior={Platform.select({ ios: "padding", android: undefined })}
    >
      <View className="flex-1 items-center justify-center px-6 gap-8">
        <Image
          source={require("../../assets/images/digniMuv_logo.png")}
          className="w-40 h-40"
          resizeMode="contain"
        />

        <View className="w-full gap-3">
          <Text className="text-2xl font-semibold text-gray-900 text-center">Welcome</Text>
          <Text className="text-gray-500 text-center">Enter your phone number to continue</Text>
        </View>

        <View className="w-full gap-4">
          <View className="flex-row items-center border border-gray-300 rounded-xl px-4 py-3 bg-white">
            <Text className="text-gray-700 mr-2">+91</Text>
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
            className="bg-blue-600 py-4 rounded-xl disabled:opacity-50"
            disabled={phoneNumber.replace(/\D/g, "").length < 8}
          >
            <Text className="text-white text-center text-base font-medium">Continue</Text>
          </TouchableOpacity>
        </View>

        <Text className="text-xs text-gray-400">By continuing, you agree to our Terms and Privacy Policy.</Text>
      </View>
    </KeyboardAvoidingView>
  );
}


