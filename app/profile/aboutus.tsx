import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";

const stats = [
  {
    value: "10,000+",
    label: "Safe Transports",
  },
  {
    value: "24/7",
    label: "Availability",
  },
  {
    value: "4.8★",
    label: "User Rating",
  },
  {
    value: "50+",
    label: "Cities Served",
  },
];

const values = [
  {
    icon: "heart-outline",
    title: "Dignity First",
    description:
      "Every patient deserves respect, comfort, and professional care during transport.",
  },
  {
    icon: "shield-checkmark-outline",
    title: "Safety & Reliability",
    description:
      "Our certified professionals ensure safe and timely medical transportation.",
  },
  {
    icon: "people-outline",
    title: "Community Focus",
    description: "We serve our community with compassion and dedication 24/7.",
  },
];

const teamStats = [
  {
    value: "150+",
    label: "Certified Staff",
  },
  {
    value: "50+",
    label: "Vehicles",
  },
  {
    value: "5",
    label: "Years Experience",
  },
];

export default function AboutUsScreen() {
  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View className="bg-blue-600 pt-12 pb-6 px-4 rounded-b-[20px] flex-row items-center h-[12%]">
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text className="text-white text-2xl font-semibold ml-4">
          About Us
        </Text>
      </View>

      <ScrollView className="flex-1 px-4">
        {/* Logo and Tagline */}
        <View className="items-center mt-8 mb-6 border rounded-2xl pt-6 border-gray-300 pb-6">
          <View className="w-20 h-20 bg-blue-600 rounded-2xl items-center justify-center mb-4">
            <Text className="text-white text-4xl font-bold">D</Text>
          </View>
          <Text className="text-2xl font-bold mb-1">DigniMuv</Text>
          <Text className="text-blue-600 text-base">Move with dignity</Text>
          {/* Description */}
          <View className="bg-white rounded-xl p-4">
            <Text className="text-gray-600 text-center leading-6">
              Founded in 2020, DigniMuv revolutionizes non-emergency medical
              transportation by putting patient dignity and comfort at the heart
              of every journey.
            </Text>
          </View>   
        </View>

        {/* Mission */}
        <View className="bg-white rounded-xl p-4 mb-6 border rounded-2xl pt-6 border-gray-300 pb-6">
          <Text className="text-xl font-bold mb-3">Our Mission</Text>
          <Text className="text-gray-600 leading-6">
            To provide safe, reliable, and dignified non-emergency medical
            transportation services that enhance the quality of life for patients
            and their families. We believe that every journey to better health
            should be comfortable, respectful, and stress-free.
          </Text>
        </View>

        {/* Stats Grid */}
        <View className="flex-row flex-wrap justify-between mb-8">
          {stats.map((stat, index) => (
            <View
              key={index}
              className="w-[48%] bg-white rounded-xl p-4 mb-4 items-center border border-gray-300"
            >
              <Text className="text-blue-600 text-2xl font-bold mb-1">
                {stat.value}
              </Text>
              <Text className="text-gray-500 text-sm">{stat.label}</Text>
            </View>
          ))}
        </View>

        {/* Our Values */}
        <View className="mb-6">
          <Text className="text-xl font-bold mb-4">Our Values</Text>
          <View className="space-y-4 gap-4">
            {values.map((value, index) => (
              <View
                key={index}
                className="bg-white rounded-xl p-4 border border-gray-300"
              >
                <View className="flex-row items-center mb-2">
                  <View className="w-8 h-8 bg-blue-100 rounded-full items-center justify-center">
                    <Ionicons name={value.icon as any} size={20} color="#1D4ED8" />
                  </View>
                  <Text className="text-lg font-semibold ml-3">
                    {value.title}
                  </Text>
                </View>
                <Text className="text-gray-600">{value.description}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Our Team */}
        <View className="mb-6 rounded-xl p-4 border border-gray-300">
          <Text className="text-xl font-bold mb-4">Our Team</Text>
          <View className="bg-white ">
            <Text className="text-gray-600 mb-4">
              Our dedicated team includes certified EMTs, paramedics, and
              compassionate drivers who are committed to providing exceptional
              care during transport.
            </Text>
            <View className="flex-row justify-between">
              {teamStats.map((stat, index) => (
                <View key={index} className="items-center">
                  <Text className="text-blue-600 text-2xl font-bold">
                    {stat.value}
                  </Text>
                  <Text className="text-gray-500 text-sm">{stat.label}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* Contact Information */}
        <View className="mb-8 rounded-xl p-4 border border-gray-300 space-y-4">
          <Text className="text-xl font-bold mb-4">Contact Information</Text>
          <View className="bg-white">
            <View className="flex-row items-center">
              <View className="w-8 h-8 bg-blue-100 rounded-full items-center justify-center">
                <Ionicons name="call-outline" size={20} color="#1D4ED8" />
              </View>
              <View className="ml-3">
                <Text className="text-sm text-gray-500">Emergency Line</Text>
                <Text className="text-base">1-800-DIGNIMUV</Text>
              </View>
            </View>

            <View className="flex-row items-center">
              <View className="w-8 h-8 bg-blue-100 rounded-full items-center justify-center">
                <Ionicons name="mail-outline" size={20} color="#1D4ED8" />
              </View>
              <View className="ml-3">
                <Text className="text-sm text-gray-500">Email</Text>
                <Text className="text-base">support@dignimuv.com</Text>
              </View>
            </View>

            <View className="flex-row items-center">
              <View className="w-8 h-8 bg-blue-100 rounded-full items-center justify-center">
                <Ionicons name="location-outline" size={20} color="#1D4ED8" />
              </View>
              <View className="ml-3">
                <Text className="text-sm text-gray-500">Headquarters</Text>
                <Text className="text-base">
                  123 Healthcare Ave, Medical City, MC 12345
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}