import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";

export default function TabLayout() {
  return (
 
  <Tabs screenOptions={{headerShown : false}}>
    <Tabs.Screen name="home" options={{headerShown : false, title : "Home" 
  ,tabBarIcon : ({color, size}) => (
    <Ionicons name="home" color={color} size={size} />
  )
    }}></Tabs.Screen>
    <Tabs.Screen name="menu" options={{headerShown : false, title : "Menu", 
      tabBarIcon : ({color, size}) => (
        <Ionicons name="menu" color={color} size={size} />
      )
    }}></Tabs.Screen>
  </Tabs>
  );
}
