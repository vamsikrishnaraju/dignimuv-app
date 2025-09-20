import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from 'expo-image-picker';
import { router } from "expo-router";
import React, { useState } from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";

export default function ProfileScreen() {
  const [profileImage, setProfileImage] = useState<string | null>(null);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled && result.assets[0].uri) {
      setProfileImage(result.assets[0].uri);
    }
  };

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View className="bg-blue-600 pt-12 pb-6 px-4 rounded-b-[20px] flex-row items-center h-[12%]">
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text className="text-white text-2xl font-semibold ml-4">Profile</Text>
      </View>

      {/* Profile Image Section */}
      <View className="flex-1, px-4">
      <View className="items-center justify-center mt-6 border rounded-2xl pt-6 border-gray-300 pb-6">
        <View className="relative">
          <Image
            source={profileImage ? { uri: profileImage } : require('../../assets/images/default-avatar.jpeg')}
            className="w-24 h-24 rounded-full"
          />
          <TouchableOpacity 
            onPress={pickImage}
            className="absolute bottom-0 right-0 bg-blue-600 rounded-full p-2"
          >
            <Ionicons name="camera" size={20} color="white" />
          </TouchableOpacity>
        </View>
        <Text className="text-xl font-bold mt-4">John Doe</Text>
        <Text className="text-gray-500">Member since 2024</Text>
      </View>

      {/* Personal Information */}
      <View className="px-4 mt-8 gap-4 border border-gray-300 rounded-2xl p-4">
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-2xl font-bold">Personal Information</Text>
          <TouchableOpacity className="flex-row items-center" onPress={() => router.push('/profile/edit')}>
            <Ionicons name="pencil-outline" size={20} color="#000" />
            <Text className="text-black font-bold text-semibold pl-2">Edit</Text>
          </TouchableOpacity>
        </View>

        <View className="space-y-4 gap-4">
          <View>
            <Text className="text-gray-500 mb-1">Full Name</Text>
            <Text className="text-gray-900 text-lg">John Doe</Text>
          </View>

          <View>
            <Text className="text-gray-500 mb-1">Phone Number</Text>
            <Text className="text-gray-900 text-lg">+1 (555) 123-4567</Text>
          </View>

          <View>
            <Text className="text-gray-500 mb-1">Email</Text>
            <Text className="text-gray-900 text-lg">john.doe@email.com</Text>
          </View>
        </View>
      </View>
      </View>
    </View>
  );
}