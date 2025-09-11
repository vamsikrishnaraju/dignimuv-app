import DateTimePicker from '@react-native-community/datetimepicker';
import * as Location from "expo-location";
import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { FlatList, KeyboardAvoidingView, Platform, Text, TextInput, TouchableOpacity, View } from "react-native";
import MapView, { Marker, Polyline, Region } from "react-native-maps";

type LatLng = { latitude: number; longitude: number };
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
  const [locationStatus, setLocationStatus] = useState("Checking...");
  const [pickupAddress, setPickupAddress] = useState("");
  const [dropoffAddress, setDropoffAddress] = useState("");
  const [routeCoordinates, setRouteCoordinates] = useState<RoutePoint[]>([]);
  const [currentAddress, setCurrentAddress] = useState("Getting location...");
  
  // Schedule states
  const [rideMode, setRideMode] = useState<"now" | "schedule">("now");
  const [scheduledDate, setScheduledDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  
  // Autocomplete states
  const [pickupSearch, setPickupSearch] = useState("");
  const [dropoffSearch, setDropoffSearch] = useState("");
  const [pickupSuggestions, setPickupSuggestions] = useState<SearchResult[]>([]);
  const [dropoffSuggestions, setDropoffSuggestions] = useState<SearchResult[]>([]);
  const [showPickupSuggestions, setShowPickupSuggestions] = useState(false);
  const [showDropoffSuggestions, setShowDropoffSuggestions] = useState(false);
  const [healthCondition, setHealthCondition] = useState('');
  
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
    from_date: Date
    to_date: Date
    channel: string
  }


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

  // Handle pickup search
  const handlePickupSearch = async (text: string) => {
    setPickupSearch(text);
    setPickupAddress(text);
    
    if (text.length >= 3) {
      const results = await searchLocations(text);
      setPickupSuggestions(results);
      setShowPickupSuggestions(true);
    } else {
      setPickupSuggestions([]);
      setShowPickupSuggestions(false);
    }
  };

  // Handle dropoff search
  const handleDropoffSearch = async (text: string) => {
    setDropoffSearch(text);
    setDropoffAddress(text);
    
    if (text.length >= 3) {
      const results = await searchLocations(text);
      setDropoffSuggestions(results);
      setShowDropoffSuggestions(true);
    } else {
      setDropoffSuggestions([]);
      setShowDropoffSuggestions(false);
    }
  };

  // Select pickup location
  const selectPickupLocation = async (result: SearchResult) => {
    setPickupAddress(result.description);
    setPickupSearch(result.description);
    setShowPickupSuggestions(false);
    
    const location = await getPlaceDetails(result.place_id);
    console.log(location)
    if (location) {
      setPickup(location);
      // Animate map to selected location
      mapRef.current?.animateToRegion({
        ...location,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
      
      // If dropoff is also set, calculate route
      if (dropoff) {
        await getRoute(location, dropoff);
      }
    }
  };

  // Select dropoff location
  const selectDropoffLocation = async (result: SearchResult) => {
    setDropoffAddress(result.description);
    setDropoffSearch(result.description);
    setShowDropoffSuggestions(false);
    
    const location = await getPlaceDetails(result.place_id);
    if (location) {
      setDropoff(location);
      
      // If pickup is also set, calculate route
      if (pickup) {
        await getRoute(pickup, location);
      }
    }
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
        setRouteCoordinates(coordinates);
        
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


  const createBooking = async () => {
    
    const pickupLocation: Location = {
        address: pickupAddress,
        latitude: pickup?.latitude,
        longitude: pickup?.longitude
    }

    const dropOffLocation: Location = {
        address: dropoffAddress,
        latitude: dropoff?.latitude,
        longitude: dropoff?.longitude
    }
    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1); 
    const bookingData: BookingData = {
        name: '',
        phone: '988989878',
        email: 'test@diginiMuv.com',
        pickup_location: pickupLocation,
        drop_location: dropOffLocation,
        health_condition: healthCondition,
        from_date: today,
        to_date: tomorrow,
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
            setPickup(null);
            setPickupAddress('')
            setDropoff(null)
            setDropoffAddress('')
            setHealthCondition('')
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
          setLocationStatus("Location set!");
          
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
          setLocationStatus("Permission denied");
        }
      } catch (error) {
        setLocationStatus("Error: " + (error as Error).message);
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

  const router = useRouter();

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-white"
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
    >
      {/* Header */}
      <View className="bg-white px-4 py-3 border-b border-gray-200">
        <View className="flex-row items-center justify-between">
          {/* Left side - Phone number and location */}
          <View className="flex-1">
            <Text className="text-sm text-gray-600">Logged in as</Text>
            <Text className="text-base font-semibold text-gray-900">+91 87122 72022</Text>
            <View className="flex-row items-center mt-1">
              <View className="w-2 h-2 bg-green-500 rounded-full mr-2"></View>
              <Text className="text-xs text-gray-500" numberOfLines={1}>
                {currentAddress}
              </Text>
            </View>
          </View>
          
          {/* Right side - Menu icon */}
          <TouchableOpacity 
            onPress={() => router.push("/menu")}
            className="p-2"
          >
            <View className="flex-col gap-1">
              <View className="w-6 h-0.5 bg-gray-800"></View>
              <View className="w-6 h-0.5 bg-gray-800"></View>
              <View className="w-6 h-0.5 bg-gray-800"></View>
            </View>
          </TouchableOpacity>
        </View>
      </View>

      <View className="flex-1">
        <View className="h-[50%]">
          <MapView
            ref={mapRef}
            style={{ flex: 1 }}
            initialRegion={mapRegion}
            onRegionChangeComplete={onRegionChange}
            showsUserLocation={true}
            showsMyLocationButton={true}
            mapType="standard"
            provider="google"
            showsCompass={true}
            showsScale={true}
            showsTraffic={false}
            showsBuildings={true}
            showsIndoors={true}
          >
            {pickup && (
              <Marker coordinate={pickup} title="Pickup" pinColor="green" />
            )}
            {dropoff && (
              <Marker coordinate={dropoff} title="Dropoff" pinColor="red" />
            )}
            {routeCoordinates.length > 0 && (
              <Polyline
                coordinates={routeCoordinates}
                strokeWidth={5}
                strokeColor="#007bff"
              />
            )}
          </MapView>
          {/* Fallback overlay if map doesn't load */}
          <View className="absolute inset-0 bg-gray-100 justify-center items-center" style={{ display: 'none' }}>
            <Text className="text-gray-500 text-lg">Map Loading...</Text>
            <Text className="text-gray-400 text-sm mt-2">If map doesn't appear, try restarting the app</Text>
          </View>
        </View>

        <View className="flex-1 px-4 py-3 gap-3">
          <View>
            <Text className="text-xs text-gray-400 mb-2">Pickup Location</Text>
            <TextInput
              placeholder="Enter pickup address"
              value={pickupAddress}
              onChangeText={handlePickupSearch}
              className="h-12 border border-gray-300 rounded-xl px-4 bg-white"
            />
            {showPickupSuggestions && (
              <View style={{ maxHeight: 150, backgroundColor: '#fff', borderRadius: 8, marginTop: 5, borderWidth: 1, borderColor: '#e5e7eb' }}>
                <FlatList
                  data={pickupSuggestions}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      onPress={() => selectPickupLocation(item)}
                      className="p-3 border-b border-gray-200"
                    >
                      <Text>{item.description}</Text>
                    </TouchableOpacity>
                  )}
                  keyExtractor={(item) => item.place_id}
                  nestedScrollEnabled={true}
                />
              </View>
            )}
           
          </View>

          <View>
            <Text className="text-xs text-gray-400 mb-2">Dropoff Location</Text>
            <TextInput
              placeholder="Enter dropoff address"
              value={dropoffAddress}
              onChangeText={handleDropoffSearch}
              className="h-12 border border-gray-300 rounded-xl px-4 bg-white"
            />
            {showDropoffSuggestions && (
              <View style={{ maxHeight: 150, backgroundColor: '#fff', borderRadius: 8, marginTop: 5, borderWidth: 1, borderColor: '#e5e7eb' }}>
                <FlatList
                  data={dropoffSuggestions}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      onPress={() => selectDropoffLocation(item)}
                      className="p-3 border-b border-gray-200"
                    >
                      <Text>{item.description}</Text>
                    </TouchableOpacity>
                  )}
                  keyExtractor={(item) => item.place_id}
                  nestedScrollEnabled={true}
                />
              </View>
            )}
            <View>
                <Text className="text-xs text-gray-400 mb-2">Patient Information (Optional)</Text>
                <TextInput
                placeholder="Enter Patient Health Information"
                value={healthCondition}
                multiline={true}
                className="h-12 border border-gray-300 rounded-xl px-4 bg-white"
                numberOfLines={5}
                onChangeText={setHealthCondition}
                style={{height: 100}}/>
            </View>
          </View>

          <View className="flex-row bg-gray-100 rounded-xl p-1">
            <TouchableOpacity 
              onPress={() => setRideMode("now")} 
              className={`flex-1 py-3 rounded-lg ${rideMode === "now" ? "bg-white" : ""}`}
            >
              <Text className={`text-center font-medium ${rideMode === "now" ? "text-gray-900" : "text-gray-600"}`}>
                Ride now
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={() => setRideMode("schedule")} 
              className={`flex-1 py-3 rounded-lg ${rideMode === "schedule" ? "bg-white" : ""}`}
            >
              <Text className={`text-center font-medium ${rideMode === "schedule" ? "text-gray-900" : "text-gray-600"}`}>
                Schedule
              </Text>
            </TouchableOpacity>
          </View>

          {rideMode === "schedule" && (
            <View className="gap-3">
              <View>
                <Text className="text-xs text-gray-400 mb-2">Pickup Date</Text>
                <TouchableOpacity 
                  onPress={() => setShowDatePicker(true)}
                  className="h-12 border border-gray-300 rounded-xl px-4 bg-white justify-center"
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

              <View>
                <Text className="text-xs text-gray-400 mb-2">Pickup Time</Text>
                <TouchableOpacity 
                  onPress={() => setShowTimePicker(true)}
                  className="h-12 border border-gray-300 rounded-xl px-4 bg-white justify-center"
                >
                  <Text className="text-gray-800">{formatTime(scheduledDate)}</Text>
                </TouchableOpacity>
                {showTimePicker && (
                  <DateTimePicker
                    value={scheduledDate}
                    mode="time"
                    onChange={handleTimeChange}
                    minimumDate={new Date()}
                  />
                )}
              </View>
            </View>
          )}

          <TouchableOpacity className="bg-blue-600 py-4 rounded-xl" onPress={createBooking}>
            <Text className="text-white text-center font-medium">
              {rideMode === "now" ? "Book Ride Now" : `Schedule Ride for ${formatDate(scheduledDate)} at ${formatTime(scheduledDate)}`}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

