import { useRouter } from "expo-router";
import React from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";

export default function MenuScreen() {
  const router = useRouter();

  const menuItems = [
    {
      id: "profile",
      title: "Profile",
      subtitle: "View and edit your profile",
      icon: "👤",
      onPress: () => {
        // Navigate to profile page
        console.log("Navigate to profile");
      },
    },
    {
      id: "bookings",
      title: "My Bookings",
      subtitle: "View your ride history",
      icon: "🚗",
      onPress: () => {
        router.push("/booking/bookings")
      },
    },
    {
      id: "logout",
      title: "Logout",
      subtitle: "Sign out of your account",
      icon: "🚪",
      onPress: () => {
        // Handle logout
        router.replace("/login");
      },
    },
  ];

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white px-4 py-6 border-b border-gray-200">
        <View className="flex-row items-center justify-between">
          <View className="flex-1">
            <Text className="text-2xl font-bold text-gray-900">Menu</Text>
            <Text className="text-sm text-gray-600 mt-1">+91 87122 72022</Text>
          </View>
          <TouchableOpacity 
            onPress={() => router.back()}
            className="p-2"
          >
            <Text className="text-2xl">✕</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Menu Items */}
      <ScrollView className="flex-1 px-4 py-6">
        <View className="space-y-4">
          {menuItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              onPress={item.onPress}
              className="bg-white rounded-xl p-4 shadow-sm border border-gray-100"
            >
              <View className="flex-row items-center">
                <View className="w-12 h-12 bg-blue-100 rounded-full items-center justify-center mr-4">
                  <Text className="text-2xl">{item.icon}</Text>
                </View>
                <View className="flex-1">
                  <Text className="text-lg font-semibold text-gray-900">
                    {item.title}
                  </Text>
                  <Text className="text-sm text-gray-600 mt-1">
                    {item.subtitle}
                  </Text>
                </View>
                <View className="w-6 h-6 items-center justify-center">
                  <Text className="text-gray-400 text-lg">›</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* App Info */}
        <View className="mt-8 bg-white rounded-xl p-4 border border-gray-100">
          <Text className="text-center text-sm text-gray-500">
            DigniMuv App
          </Text>
          <Text className="text-center text-xs text-gray-400 mt-1">
            Version 1.0.0
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}
