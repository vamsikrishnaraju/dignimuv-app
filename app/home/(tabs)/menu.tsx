import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, Text, TouchableOpacity, View } from "react-native";

const menuItems = [
  { 
    icon: "person-outline", 
    title: "Profile", 
    route: "/profile" 
  },
  { 
    icon: "document-text-outline", 
    title: "Booking history", 
    route: "/booking/bookings" 
  },
  { 
    icon: "settings-outline", 
    title: "Payments & settings", 
    route: "/account/manage" 
  },
  { 
    icon: "gift-outline", 
    title: "Refer & earn", 
    route: "/refer" 
  },
  { 
    icon: "share-social-outline", 
    title: "Share app", 
    route: "/share" 
  },
  { 
    icon: "information-circle-outline", 
    title: "About us", 
    route: "/profile/aboutus" 
  },
  { 
    icon: "help-circle-outline", 
    title: "Need help", 
    route: "/help" 
  },
    { 
    icon: "log-out-outline", 
    title: "Log out", 
    route: "/login" 
  },
];

export default function HomePage() {
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
      {/* Header */}
      <View className="bg-blue-600 pt-10 px-4 rounded-b-[20px] h-[12%] flex-row items-center">
        <Text className="text-white text-3xl font-bold ml-4">Account</Text>
      </View>

      {/* Menu Items */}
      <ScrollView className="flex-1 px-4 pt-10">
        <View className="bg-white rounded-2xl shadow-sm border border-gray-100 gap-3">
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={item.title}
              onPress={() => router.push(item.route)}
              className={`flex-row items-center px-4 py-4 ${
                index !== menuItems.length - 1 ? "border-b border-gray-100" : ""
              }`}
            >
              <Ionicons name={item.icon as any} size={24} color="#666" />
              <Text className="flex-1 text-base text-xl text-semibold ml-3">{item.title}</Text>
              <Ionicons name="chevron-forward" size={20} color="#999" />
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}


