import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";

export default function BookingsScreen() {
  const router = useRouter();
  const [bookings, setBookings] = useState<any[]>([])

  const apiUrl = "http://127.0.0.1:8000"
  const getBookings = async () => {
    try {
        const response = await fetch("http://10.0.2.2:8000/api/bookings/by-phone", {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ "phone": "988989878", "channel": "app"}),
        })
        console.log("response " , response.status)
        if (response.ok) {
            console.log("in success")
          const data = await response.json()
          setBookings(data)
        } else {
          console.error('Failed to send OTP, but you can still enter OTP for testing')
        }
      } catch (error) {
        console.log(error)
        console.error('Error sending OTP, but you can still enter OTP for testing')
      } finally {
        //setIsLoading(false)
      }
  }

  useEffect(() => {
    getBookings()
    console.log(bookings)
  }, [])

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white px-4 py-6 border-b border-gray-200">
        <View className="flex-row items-center justify-between">
          <View className="flex-1">
            <Text className="text-2xl font-bold text-gray-900">Bookings</Text>
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
          {bookings.map((item) => (
            <TouchableOpacity
              key={item.id}
              onPress={item.onPress}
              className="bg-white rounded-xl p-4 shadow-sm border border-gray-100"
            >
              <View className="flex-row items-center">
                <View className="flex-1">
                  <Text className="text-lg font-semibold text-gray-900">
                    {item.pickup_location.address} 
                  </Text>
                  <Text className="text-sm text-gray-600 mt-1">
                    Pickup Date: {item.from_date}
                  </Text>
                  <Text className="text-sm text-gray-600 mt-1">
                    Dropoff Date: {item.to_date} 
                  </Text>
                  <Text className="text-sm text-gray-600 mt-1">
                    status: {item.status}
                  </Text>
                </View>
                <View className="w-6 h-6 items-center justify-center">
                  <Text className="text-gray-400 text-lg">›</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
