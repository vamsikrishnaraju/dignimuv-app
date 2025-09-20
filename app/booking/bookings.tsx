import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";

export default function BookingsScreen() {
  const router = useRouter();
  const [bookings, setBookings] = useState<any[]>([])

  type Booking = {
  id: string;
  from_date: string;
  pickup_location: {
    address: string;
  };
  drop_location: {
    address: string;
  };
  time: string;
  status: 'completed' | 'cancelled' | 'pending';
  amount: number;
};


  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  const formatTime = (timeString: string) => {
    return new Date(timeString).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };


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
    <View className="flex-1 bg-white">
      {/* Header */}
      <View className="bg-blue-600 pt-12 pb-6 px-4 rounded-b-[20px] flex-row items-center h-[12%]">
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text className="text-white text-2xl font-semibold ml-4">Booking History</Text>
      </View>

       <ScrollView className="flex-1 px-4 pt-4">
        {bookings.map((booking) => (
          <TouchableOpacity
            key={booking.id}
            onPress={() => router.push(`/booking/${booking.id}`)}
            className="bg-white rounded-xl p-4 mb-4 border border-gray-100"
          >
            <View className="flex-row items-center justify-between mb-2">
              <Text className="text-base font-medium">
                {formatDate(booking.from_date)}
              </Text>
              <View className={`px-2 py-1 rounded-full ${
                booking.status === 'completed' ? 'bg-green-100' : 
                booking.status === 'cancelled' ? 'bg-red-100' : 'bg-yellow-100'
              }`}>
                <Text className={`text-xs ${
                  booking.status === 'completed' ? 'text-green-600' : 
                  booking.status === 'cancelled' ? 'text-red-600' : 'text-yellow-600'
                }`}>
                  {booking.status}
                </Text>
              </View>
            </View>

            <View className="space-y-2">
              <View className="flex-row items-center">
                <Ionicons name="location" size={16} color="#22C55E" />
                <Text className="text-gray-600 ml-2">From</Text>
                <Text className="text-gray-900 ml-2">{booking.pickup_location.address}</Text>
              </View>

              <View className="flex-row items-center">
                <Ionicons name="location" size={16} color="#EF4444" />
                <Text className="text-gray-600 ml-2">To</Text>
                <Text className="text-gray-900 ml-2">{booking.drop_location.address}</Text>
              </View>

              <View className="flex-row items-center justify-between mt-2">
                <View className="flex-row items-center">
                  <Ionicons name="time-outline" size={16} color="#666" />
                  <Text className="text-gray-600 ml-2">{formatTime(booking.time)}</Text>
                </View>
                <Text className="text-blue-600 font-bold">₹{booking.amount.toFixed(2)}</Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}

        <TouchableOpacity 
          className="py-4 mb-6"
          onPress={() => router.push('/booking/all')}
        >
          <Text className="text-center text-blue-600 font-medium">
            View All Bookings
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}
