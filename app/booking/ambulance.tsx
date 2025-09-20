import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { ambulanceOptions } from "../common/commondata";



interface ChooseAmbulanceProps {
    onBooking: (ambulanceType: string | null) => void
}

export default function ChooseAmbulance({ onBooking }: ChooseAmbulanceProps) {
  const router = useRouter();
  const [selectedAmbulance, setSelectedAmbulance] = React.useState<string | null>(null);

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center px-4 pt-6 pb-2 bg-white">
       
        <Text className="text-lg font-semibold text-gray-900">Choose Ambulance</Text>
      </View>

      <ScrollView className="flex-1 px-2">
        {ambulanceOptions.map((option, idx) => (
          <TouchableOpacity key={idx} className={`bg-white rounded-xl shadow border border-gray-200 p-4 mb-4 flex-row justify-between items-center
        ${selectedAmbulance === option.type ? 'border-blue-700 bg-blue-100' : ''}`}
          onPress={() => {setSelectedAmbulance(option.type)}}>
            <View className="flex-1">
              <View className="flex-row items-center mb-1">
                <Ionicons name={option.icon} size={22} color="#222" className="mr-2" />
                <Text className="text-base font-semibold">{option.title}</Text>
              </View>
              <Text className="text-xs text-gray-500 mb-2">{option.description}</Text>
              <View className="flex-row flex-wrap gap-2 mb-2">
                {option.features.map((feature, i) => (
                  <Text key={i} className="bg-gray-100 px-2 py-1 rounded text-xs mr-2 mb-1">{feature}</Text>
                ))}
              </View>
            </View>
            <View className="items-end">
              <Text className="text-base font-bold">₹{option.price}</Text>
              <View className="flex-row items-center mt-1">
                <Ionicons name="time-outline" size={16} color="#888" />
                <Text className="text-xs text-gray-500 ml-1">{option.time}</Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Book Now Button */}
      <View className="absolute bottom-0 left-0 right-0 px-4 pb-4 gap-6">
        <TouchableOpacity className="bg-blue-600 py-4 rounded-xl w-full shadow-lg" onPress={() => onBooking(selectedAmbulance)}>
          <Text className="text-white text-center font-semibold text-lg">
            Book Now
          </Text>
        </TouchableOpacity>
      </View>
    </View> 
  );
}