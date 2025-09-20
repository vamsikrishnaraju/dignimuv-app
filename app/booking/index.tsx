import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from '@react-native-community/datetimepicker';
import * as Location from "expo-location";
import { router } from "expo-router"; // Change this line
import React, { useEffect, useRef, useState } from "react";
import { KeyboardAvoidingView, Modal, Platform, Text, TextInput, TouchableOpacity, View } from "react-native";
import MapView, { Marker, Region } from "react-native-maps";
import { LatLng } from "../common/commondata";
import ChooseAmbulance from "./ambulance";

type SearchResult = { description: string; place_id: string; location?: LatLng };
type RoutePoint = { latitude: number; longitude: number };

export default function BookingScreen() {
  const mapRef = useRef<MapView | null>(null);
  const [mapRegion, setMapRegion] = useState<Region>({
    latitude: 37.78825,
    longitude: -122.4324,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  });

  const [pickup, setPickup] = useState<LatLng | null>(null);
  const [dropoff, setDropoff] = useState<LatLng | null>(null);

  const [pickupAddress, setPickupAddress] = useState("");
  const [dropoffAddress, setDropoffAddress] = useState("");
  
  // Schedule states
  const [rideMode, setRideMode] = useState<"now" | "schedule">("now");
  const [scheduledDate, setScheduledDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [toDate, setToDate] = useState<Date | null>(null);
  const [showFromTimePicker, setShowFromTimePicker] = useState(false);
  const [fromTime, setFromTime] = useState(new Date());
  
  // Autocomplete states
  const [pickupSearch, setPickupSearch] = useState("");
  const [currentAddress, setCurrentAddress] = useState("");
  const [pickupSuggestions, setPickupSuggestions] = useState<SearchResult[]>([]);
  const [healthCondition, setHealthCondition] = useState('');
  
  // Modal state
  const [showMapModal, setShowMapModal] = useState(false);
  const [mapModalType, setMapModalType] = useState<"pickup" | "dropoff" | null>(null);
  const [tempLocation, setTempLocation] = useState<LatLng | null>(null);
  const [showAmbulanceOptions, setShowAmbulanceOptions] = useState(false);
  


  // Search for locations
  const searchLocations = async (query: string): Promise<SearchResult[]> => {
    if (!query || query.length < 3) return [];
    
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(query)}&key=AIzaSyDrEWRzmwe2Vmhb1d99lk88xgHcRHIFHG8&types=geocode`
      );
      const data = await response.json();
      
      if (data.predictions) {
        return data.predictions.map((pred: any) => ({
          description: pred.description,
          place_id: pred.place_id,
        }));
      }
    } catch (error) {
      console.log("Search error:", error);
    }
    
    return [];
  };

  // Get place details
  const getPlaceDetails = async (placeId: string): Promise<LatLng | null> => {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=geometry&key=AIzaSyDrEWRzmwe2Vmhb1d99lk88xgHcRHIFHG8`
      );
      const data = await response.json();
      
      if (data.result?.geometry?.location) {
        return {
          latitude: data.result.geometry.location.lat,
          longitude: data.result.geometry.location.lng,
        };
      }
    } catch (error) {
      console.log("Place details error:", error);
    }
    
    return null;
  };



  // Get route between pickup and dropoff
  const getRoute = async (origin: LatLng, destination: LatLng) => {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/directions/json?origin=${origin.latitude},${origin.longitude}&destination=${destination.latitude},${destination.longitude}&key=AIzaSyDrEWRzmwe2Vmhb1d99lk88xgHcRHIFHG8`
      );
      const data = await response.json();
      
      if (data.routes && data.routes.length > 0) {
        const route = data.routes[0];
        const points = route.overview_polyline.points;
        
        // Decode the polyline points
        const coordinates = decodePolyline(points);
        //setRouteCoordinates(coordinates);
        
        // Fit map to show entire route
        if (coordinates.length > 0) {
          const bounds = getBounds(coordinates);
          mapRef.current?.fitToCoordinates(coordinates, {
            edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
            animated: true,
          });
        }
      }
    } catch (error) {
      console.log("Route error:", error);
    }
  };

  // Decode Google's polyline format
  const decodePolyline = (encoded: string): RoutePoint[] => {
    const poly = [];
    let index = 0, len = encoded.length;
    let lat = 0, lng = 0;

    while (index < len) {
      let shift = 0, result = 0;

      do {
        let b = encoded.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (result >= 0x20);

      let dlat = ((result & 1) ? ~(result >> 1) : (result >> 1));
      lat += dlat;

      shift = 0;
      result = 0;

      do {
        let b = encoded.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (result >= 0x20);

      let dlng = ((result & 1) ? ~(result >> 1) : (result >> 1));
      lng += dlng;

      poly.push({ latitude: lat / 1E5, longitude: lng / 1E5 });
    }

    return poly;
  };

  // Get bounds for route fitting
  const getBounds = (coordinates: RoutePoint[]) => {
    let minLat = coordinates[0].latitude;
    let maxLat = coordinates[0].latitude;
    let minLng = coordinates[0].longitude;
    let maxLng = coordinates[0].longitude;

    coordinates.forEach(coord => {
      minLat = Math.min(minLat, coord.latitude);
      maxLat = Math.max(maxLat, coord.latitude);
      minLng = Math.min(minLng, coord.longitude);
      maxLng = Math.max(maxLng, coord.longitude);
    });

    return { minLat, maxLat, minLng, maxLng };
  };

  // Handle date selection
  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setScheduledDate(selectedDate);
    }
  };

  // Handle time selection
  const handleTimeChange = (event: any, selectedTime?: Date) => {
    setShowTimePicker(false);
    if (selectedTime) {
      const newDate = new Date(scheduledDate);
      newDate.setHours(selectedTime.getHours());
      newDate.setMinutes(selectedTime.getMinutes());
      setScheduledDate(newDate);
    }
  };

  // Format date for display
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Format time for display
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };



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
          
          setPickup({ latitude, longitude });
          
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
                  setPickupAddress(parts.join(", "));
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

  const setCurrentLocationAsPickup = async () => {
    try {
      const current = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = current.coords;
      setPickup({ latitude, longitude });
      
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
              setPickupAddress(parts.join(", "));
            }
          }
        }
      } catch (error) {
        console.log("Error getting address:", error);
        setPickupAddress("Current Location");
      }
    } catch (error) {
      console.log("Error getting current location:", error);
    }
  };

  const onRegionChange = (region: Region) => {
    setMapRegion(region);
    const center = { latitude: region.latitude, longitude: region.longitude };
    
    // Update pickup location when map is moved
    setPickup(center);
    
    // Get address for the new location
    (async () => {
      try {
        const addressResponse = await Location.reverseGeocodeAsync({
          latitude: region.latitude,
          longitude: region.longitude,
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
              setPickupAddress(parts.join(", "));
            }
          }
        }
      } catch (error) {
        console.log("Error getting address:", error);
      }
    })();
  };

  const onBooking = (ambulanceType: string | null) => {
    setShowAmbulanceOptions(false);
    router.push({
    pathname: "/booking/bookingconfirmation",
    params: {
      pickupAddress,
      dropoffAddress,
      ambulanceType: ambulanceType || 'Not specified',
      bookingTime: rideMode === "now" ? "Now" : formatDateTime(scheduledDate, fromTime),
      healthCondition
    }
  });
  }
  
  // Add after formatTime function
const formatDateTime = (date: Date, time: Date) => {
  const combinedDate = new Date(date);
  combinedDate.setHours(time.getHours());
  combinedDate.setMinutes(time.getMinutes());
  
  return combinedDate.toLocaleString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
};

  // Listen for selected location from map-select screen
  useEffect(() => {
    // You can use expo-router's useLocalSearchParams or a global state/store for this
    // Example with expo-router:
    // const params = useLocalSearchParams();
    // if (params.type === "pickup" && params.address && params.latitude && params.longitude) {
    //   setPickupAddress(params.address);
    //   setPickup({ latitude: Number(params.latitude), longitude: Number(params.longitude) });
    // }
    // if (params.type === "dropoff" && params.address && params.latitude && params.longitude) {
    //   setDropoffAddress(params.address);
    //   setDropoff({ latitude: Number(params.latitude), longitude: Number(params.longitude) });
    // }
  }, [/* params change */]);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1  mt-12"
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
    >
      {/* Header */}
      <View className="flex-row items-center px-4 pt-6 pb-2">
        <TouchableOpacity onPress={() => router.back()} className="mr-2">
          <Ionicons name="arrow-back" size={24} color="#222" />
        </TouchableOpacity>
        <Text className="text-lg font-semibold text-gray-900">Book Ambulance</Text>
      </View>

      {/* Booking Card */}
      <View className="flex-1 px-4 pt-4 pb-24">
        <View className="bg-white rounded-2xl shadow-md p-4">
          {/* Pickup */}
          <View className="flex-row items-center mb-4">
            <View className="w-3 h-3 bg-green-500 rounded-full mr-2" />
            <Text className="text-sm font-medium text-gray-700 flex-1">Pickup location</Text>
          </View>
          <TouchableOpacity onPress={() => { setMapModalType("pickup"); setShowMapModal(true); }}>
            <TextInput
              placeholder="Select pickup address"
              value={pickupAddress}
              editable={false}
              className="h-12 border border-gray-300 rounded-xl px-4 bg-white mb-2"
            />
          </TouchableOpacity>

          {/* Dropoff */}
          <View className="flex-row items-center mb-4 mt-4">
            <View className="w-3 h-3 bg-red-500 rounded-full mr-2" />
            <Text className="text-sm font-medium text-gray-700 flex-1">Where to?</Text>
          </View>
          <TouchableOpacity onPress={() => { setMapModalType("dropoff"); setShowMapModal(true); }}>
            <TextInput
              placeholder="Select dropoff address"
              value={dropoffAddress}
              editable={false}
              className="h-12 border border-gray-300 rounded-xl px-4 bg-white mb-2"
            />
          </TouchableOpacity>
          {/* Health Condition */}
          <View className="mb-4">
            <Text className="text-sm font-medium text-gray-700 mb-2">Health Condition</Text>
            <TextInput
              placeholder="Describe any health conditions"
              value={healthCondition}
              onChangeText={setHealthCondition}
              className="h-32 border border-gray-300 rounded-xl px-4 bg-white"
              numberOfLines={5}
            />
          </View>
          {/* Ride Now / Schedule */}
          <View className="flex-row bg-gray-100 rounded-xl p-1 mt-4 mb-4">
            <TouchableOpacity
              activeOpacity={0.8}
              className={`py-3 px-6 rounded-xl flex-1 flex-row items-center gap-4 ${rideMode === "now" ? "bg-blue-600" : "bg-gray-200"}`}
              onPress={() => setRideMode("now")}
            >
              <Ionicons name="time" color="white" size={20}></Ionicons>
              <Text className={`text-base font-medium ${rideMode === "now" ? "text-white" : "text-gray-700"}`}>
                Now
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              activeOpacity={0.8}
              className={`py-3 px-6 rounded-xl flex-1 flex-row items-center gap-4 ${rideMode === "schedule" ? "bg-blue-600" : "bg-gray-200"}`}
              onPress={() => setRideMode("schedule")}
            >
              <Ionicons name="calendar" color="white" size={20}></Ionicons>
              <Text className={`text-base font-medium ${rideMode === "schedule" ? "text-white" : "text-gray-700"}`}>
                Schedule
              </Text>
            </TouchableOpacity>
          </View>

          {/* Schedule Date/Time */}
          { rideMode === "schedule" && (
            <View className="gap-3 mb-4">
              <View className="flex-row gap-2">
                {/* From Date */}
                <View className="flex-1">
                  <Text className="text-xs text-gray-700 mb-2">From Date</Text>
                  <TouchableOpacity
                    onPress={() => setShowDatePicker(true)}
                    className="h-12 border border-gray-400 rounded-xl px-4 bg-white justify-center"
                  >
                    <Text className="text-gray-800">{formatDate(scheduledDate)}</Text>
                  </TouchableOpacity>
                  {showDatePicker && (
                    <DateTimePicker
                      value={scheduledDate}
                      mode="date"
                      onChange={handleDateChange}
                      minimumDate={new Date()}
                    />
                  )}
                </View>

                {/* From Time */}
                <View className="flex-1">
                  <Text className="text-xs text-gray-700 mb-2">From Time</Text>
                  <TouchableOpacity
                    onPress={() => setShowFromTimePicker(true)}
                    className="h-12 border border-gray-400 rounded-xl px-4 bg-white justify-center"
                  >
                    <Text className="text-gray-800">{formatTime(fromTime)}</Text>
                  </TouchableOpacity>
                  {showFromTimePicker && (
                    <DateTimePicker
                      value={fromTime}
                      mode="time"
                      onChange={(event, selectedTime) => {
                        setShowFromTimePicker(false);
                        if (selectedTime) {
                          setFromTime(selectedTime);
                        }
                      }}
                    />
                  )}
                </View>
              </View>
            </View>
          )}
                  <TouchableOpacity
                    activeOpacity={0.8}
                    className="bg-blue-600 py-4 px-6 mt-7 rounded-xl w-full"
                    onPress={() => setShowAmbulanceOptions(true)}
                  >
                    <Text className="text-white text-center text-base semi-bold font-medium">
                      Continue
                    </Text>
                  </TouchableOpacity>
        </View>
      </View>
      

      <Modal visible={showMapModal} animationType="slide">
        <View className="flex-1 bg-white">
          <View className="p-4 flex-row items-center justify-between">
            <Text className="text-lg font-semibold">
              {mapModalType === "pickup" ? "Select Pickup Location" : "Select Dropoff Location"}
            </Text>
            <TouchableOpacity onPress={() => setShowMapModal(false)}>
              <Ionicons name="close" size={28} color="#222" />
            </TouchableOpacity>
          </View>
          <View className="px-4 pb-2">
            <TextInput
              placeholder="Search location"
              value={pickupSearch}
              onChangeText={async (text) => {
                setPickupSearch(text);
                if (text.length >= 3) {
                  const results = await searchLocations(text);
                  setPickupSuggestions(results);
                } else {
                  setPickupSuggestions([]);
                }
              }}
              className="h-12 border border-gray-300 rounded-xl px-4 bg-white"
            />
            {pickupSuggestions.length > 0 && (
              <View className="bg-white rounded-xl shadow mt-2 max-h-40">
                {pickupSuggestions.map((item) => (
                  <TouchableOpacity
                    key={item.place_id}
                    className="p-3 border-b border-gray-200"
                    onPress={async () => {
                      setPickupSearch(item.description);
                      setPickupSuggestions([]);
                      const location = await getPlaceDetails(item.place_id);
                      if (location) {
                        setTempLocation(location);
                        // Optionally, animate map to location:
                        mapRef.current?.animateToRegion({
                          ...location,
                          latitudeDelta: 0.01,
                          longitudeDelta: 0.01,
                        });
                      }
                    }}
                  >
                    <Text>{item.description}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
          <MapView
            ref={mapRef}
            style={{ flex: 1 }}
            initialRegion={mapRegion}
            region={tempLocation ? { ...tempLocation, latitudeDelta: 0.01, longitudeDelta: 0.01 } : mapRegion}
            onPress={e => setTempLocation(e.nativeEvent.coordinate)}
          >
            {tempLocation && <Marker coordinate={tempLocation} />}
          </MapView>
          <View className="p-4">
            <TouchableOpacity
              className="bg-blue-600 py-3 rounded-xl"
              disabled={!tempLocation}
              onPress={async () => {
                if (tempLocation) {
                  let address = "";
                  try {
                    const addressResponse = await Location.reverseGeocodeAsync(tempLocation);
                    
                    if (addressResponse && addressResponse.length > 0) {
                      const addr = addressResponse[0];
                      //address = [addr.street, addr.city, addr.region, addr.country].filter(Boolean).join(", ");
                      address = addr.formattedAddress || [addr.street, addr.city, addr.region, addr.country].filter(Boolean).join(", ");
                    }
                  } catch (error) {}
                  if (mapModalType === "pickup") {

                    setPickup(tempLocation);
                    setPickupAddress(address || `Lat: ${tempLocation.latitude}, Lng: ${tempLocation.longitude}`);
                  } else {
                    setDropoff(tempLocation);
                    setDropoffAddress(address || `Lat: ${tempLocation.latitude}, Lng: ${tempLocation.longitude}`);
                  }
                  setShowMapModal(false);
                  setTempLocation(null);
                  setPickupSearch("");
                  setPickupSuggestions([]);
                }
              }}
            >
              <Text className="text-white text-center font-semibold text-lg">
                Confirm Location
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
<Modal 
  visible={showAmbulanceOptions} 
  animationType="slide" 
  transparent={true}
  onRequestClose={() => setShowAmbulanceOptions(false)}
>
  <TouchableOpacity 
    activeOpacity={1} 
    onPress={() => setShowAmbulanceOptions(false)}
    className="flex-1 bg-black/50 justify-end"
  >
    <TouchableOpacity 
      activeOpacity={1}
      onPress={e => e.stopPropagation()} 
      className="bg-white rounded-t-3xl h-[75%]"
    >
      <View className="w-16 h-1 bg-gray-300 rounded-full mx-auto mt-2 mb-4" />
      <ChooseAmbulance onBooking={onBooking}/>
    </TouchableOpacity>
  </TouchableOpacity>
</Modal>
      
    </KeyboardAvoidingView>
  );
}

