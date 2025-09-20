import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";
import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { Image, KeyboardAvoidingView, Platform, Text, TouchableOpacity, View } from "react-native";
import MapView, { Region } from "react-native-maps";

export default function HomePage() {
  const router = useRouter();
  const mapRef = useRef<MapView | null>(null);
  const [mapRegion, setMapRegion] = useState<Region>({
    latitude: 37.78825,
    longitude: -122.4324,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  });
  const [currentAddress, setCurrentAddress] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === "granted") {
          const current = await Location.getCurrentPositionAsync({});
          const { latitude, longitude } = current.coords;
          
          setMapRegion({
            latitude,
            longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          });
          
          
          // Get address for current location
          try {
            const addressResponse = await Location.reverseGeocodeAsync({
              latitude,
              longitude,
            });
            
            if (addressResponse && addressResponse.length > 0) {
              const address = addressResponse[0];
              if (address) {
                const parts = [];
                if (address.street) parts.push(address.street);
                if (address.city) parts.push(address.city);
                if (address.region) parts.push(address.region);
                if (address.country) parts.push(address.country);
                
                if (parts.length > 0) {
                  setCurrentAddress(parts.join(", "));
                  // Set current address for header (just street and city)
                  const headerParts = [];
                  if (address.street) headerParts.push(address.street);
                  if (address.city) headerParts.push(address.city);
                  setCurrentAddress(headerParts.join(", "));
                }
              }
            }
          } catch (error) {
            console.log("Error getting address:", error);
            setCurrentAddress("Location unavailable");
          }
        } else {
          //setLocationStatus("Permission denied");
        }
      } catch (error) {
        //setLocationStatus("Error: " + (error as Error).message);
      }
    })();
  }, []);

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-white"
      behavior={Platform.select({ ios: "padding", android: undefined })}
    >
      <View className="h-[15%] bg-blue-700 rounded-b-[20px]">
        <View className="items-center px-5 py-12 justify-between gap-2">
          <View className="w-full">
            <Text className="text-white text-3xl font-bold">DigniMuv</Text>
          </View>
          <View className="w-full flex-row gap-2">
            <Ionicons name="location" color="white" size={20}></Ionicons>
            <Text className="text-white text-medium">{currentAddress}</Text>
          </View>
        </View>
      </View>
      <View className="flex-1 px-5 py-20">
        <View className="justify-start border 
        border-gray-300 rounded-xl overflow-hidden mb-4 px-5 pb-10 gap-4 ">
          <Image
            source={require("../../../assets/images/ambulance.png")}
            className="w-[300px] h-[200px] self-center object-cover mt-10 mb-5"
            //resizeMode="contain"
          />
          {/* Image is now at the top */}
          <TouchableOpacity
            activeOpacity={0.8}
            className="bg-blue-600 py-4 px-6 rounded-xl w-full"
            onPress={() => router.push("/booking")  }
          >
            <Text className="text-white text-center text-base semi-bold font-medium">Book Your Ambulance</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}


