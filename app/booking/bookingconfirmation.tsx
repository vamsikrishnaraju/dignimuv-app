import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { ambulanceOptions } from '../common/commondata';

type BookingConfirmationParams = {
  pickupAddress: string;
  dropoffAddress: string;
  ambulanceType: string;
  bookingTime: string;
  healthDescription: string;
};

type AmbulanceDetails = {
  type: string;
  title: string;
  description: string;
  price: number;
  time: string;
  features: string[];
  icon: string;
};

interface Location {
    address: string
    latitude: number
    longitude: number
  }
  
  interface BookingData {
    name: string
    phone: string
    email: string
    health_condition: string
    pickup_location: Location | null
    drop_location: Location | null
    from_date: string
    channel: string
  }

export default function BookingConfirmation() {
  const params = useLocalSearchParams<BookingConfirmationParams>();
  const [ambulanceDetails, setAmbulanceDetails] = React.useState<AmbulanceDetails | null>(null);
  const [pickupLocation, setPickupLocation] = React.useState<Location | null>(null);
  const [dropoffLocation, setDropoffLocation] = React.useState<Location | null>(null);

  useEffect(() => {
    // Find matching ambulance details
    const details = ambulanceOptions.find(opt => opt.type === params.ambulanceType);
    if (details) {
      setAmbulanceDetails(details);
    }
  }, [params.ambulanceType]);
    useEffect(() => {
    // Get detailed location info for pickup and dropoff
    const fetchLocations = async () => {
      if (params.pickupAddress) {
        const pickup = await getLocationDetails(params.pickupAddress);
        setPickupLocation(pickup);
      }
      if (params.dropoffAddress) {
        const dropoff = await getLocationDetails(params.dropoffAddress);
        setDropoffLocation(dropoff);
      }
    };
    fetchLocations();
    }, [params.pickupAddress, params.dropoffAddress]);

  if (!ambulanceDetails) {
    return (
      <View className="flex-1 bg-white justify-center items-center">
        <Text>Loading...</Text>
      </View>
    );
  }

  const getLocationDetails = async (address: string): Promise<Location | null> => {
    try {
      const response = await Location.geocodeAsync(address);
      if (response && response.length > 0) {
        const { latitude, longitude } = response[0];
        const addressResponse = await Location.reverseGeocodeAsync({
          latitude,
          longitude,
        });

        if (addressResponse && addressResponse.length > 0) {
          const address = addressResponse[0];
          const parts = [];
          if (address.street) parts.push(address.street);
          if (address.city) parts.push(address.city);
          if (address.region) parts.push(address.region);
          if (address.country) parts.push(address.country);

          return {
            address: parts.join(", "),
            latitude,
            longitude,
          };
        }
      }
      return null;
    } catch (error) {
      console.log("Error getting address:", error);
      return null;
    }
  };

  const createBooking = async () => {
      const today = new Date();
      const tomorrow = new Date();
      tomorrow.setDate(today.getDate() + 1); 
      const bookingData: BookingData = {
          name: '',
          phone: '988989878',
          email: 'test@diginiMuv.com',
          pickup_location: pickupLocation,
          drop_location: dropoffLocation,
          health_condition: params.healthDescription || '',
          from_date: params.bookingTime || '',
          channel: 'APP'
      }
      console.log(bookingData)
      try {
          const response = await fetch("http://10.0.2.2:8000/api/bookings", {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
          },
          body: JSON.stringify(bookingData),
          })
          console.log("response " , response)
          if (response.ok) {
              const data = await response.json()

          } else {
          console.error('Failed to send OTP, but you can still enter OTP for testing')
          }
          } catch (error) {
              console.log(error)
              console.error('Error sending OTP, but you can still enter OTP for testing')
          } finally {
          }
        }
              
  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center px-4 pt-12 pb-4 bg-white border-b border-gray-200">
        <TouchableOpacity onPress={() => router.back()} className="mr-4">
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text className="text-xl font-semibold">Booking Details</Text>
      </View>

      <ScrollView className="flex-1 px-4">
        {/* Trip Details */}
        <View className="mt-4 border border-gray-300 rounded-2xl p-2">
          <Text className="text-2xl font-bold mb-4">Trip Details</Text>
          <View className="bg-white rounded-2xl p-2 shadow-sm">
            <View className="flex-row items-start mb-4">
              <View className="w-2 h-2 rounded-full bg-green-500 mt-2 mr-2" />
              <View className="flex-1">
                <Text className="text-gray-600">Pickup</Text>
                <Text className="text-base font-medium">{pickupLocation?.address || params.pickupAddress}</Text>
              </View>
            </View>
            <View className="flex-row items-start">
              <View className="w-2 h-2 rounded-full bg-red-500 mt-2 mr-2" />
              <View className="flex-1">
                <Text className="text-gray-600">Destination</Text>
                <Text className="text-base font-medium">{dropoffLocation?.address || params.dropoffAddress}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Ambulance Details */}
        <View className="mt-6 border border-gray-300 rounded-2xl p-2">
          <Text className="text-2xl font-bold mb-4">Ambulance Details</Text>
          <View className="bg-white rounded-2xl p-4 shadow-sm flex-row justify-between items-center">
            <View className="flex-row items-center">
              <Ionicons name="medical" size={24} className="text-gray-600 mr-3" />
              <View>
                <Text className="text-lg font-semibold">{ambulanceDetails.title}</Text>
                <Text className="text-gray-600">{ambulanceDetails.description}</Text>
              </View>
            </View>
            <Text className="text-xl font-bold">₹{ambulanceDetails.price}</Text>
          </View>
        </View>

        {/* Schedule */}
        <View className="mt-6 border border-gray-300 rounded-2xl p-2">
          <Text className="text-2xl font-bold mb-4">Schedule</Text>
          <View className="bg-white rounded-2xl p-4 shadow-sm">
            <View className="flex-row justify-between items-center mb-2">
              <Text className="text-gray-600">Booking Time</Text>
              <Text className="font-medium">{params.bookingTime}</Text>
            </View>
            <View className="flex-row justify-between items-center">
              <Text className="text-gray-600">ETA</Text>
              <Text className="font-medium">{params.bookingTime}</Text>
            </View>
          </View>
        </View>

        {/* Payment Summary */}
        <View className="mt-6 mb-24 border border-gray-300 rounded-2xl p-2">
          <Text className="text-2xl font-bold mb-4">Payment Summary</Text>
          <View className="bg-white rounded-2xl p-4 shadow-sm">
            <View className="flex-row justify-between items-center mb-2">
              <Text className="text-gray-600">Base fare</Text>
              <Text className="font-medium">₹{ambulanceDetails.price}</Text>
            </View>
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-gray-600">Service charge</Text>
              <Text className="font-medium">₹50</Text>
            </View>
            <View className="flex-row justify-between items-center pt-4 border-t border-gray-200">
              <Text className="text-lg font-bold">Total</Text>
              <Text className="text-lg font-bold">₹{Number(ambulanceDetails.price) + 50}</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Confirm Button */}
      <View className="absolute bottom-5 left-0 right-0 p-4 bg-white border-t border-gray-200">
        <TouchableOpacity 
          className="bg-blue-600 py-4 rounded-xl"
          onPress={createBooking}
        >
          <Text className="text-white text-center font-semibold text-lg">
            Confirm & Book Ambulance
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}