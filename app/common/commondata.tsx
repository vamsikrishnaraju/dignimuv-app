
export const ambulanceOptions = [
  {
    type: "Basic",
    title: "Basic Ambulance",
    description: "Standard medical transport",
    price: 500,
    time: "8-12 min",
    features: ["Basic life support", "Trained paramedic", "Oxygen support"],
    icon: "car-outline",
  },
  {
    type: "Advanced",
    title: "Advanced Life Support",
    description: "Advanced medical equipment",
    price: 800,
    time: "10-15 min",
    features: ["Advanced life support", "Cardiac monitor", "Defibrillator", "IV fluids"],
    icon: "heart-outline",
  },
  {
    type: "Critical",
    title: "Critical Care",
    description: "ICU level care on wheels",
    price: 1200,
    time: "5-8 min",
    features: ["Ventilator support", "Cardiac monitor", "Trained doctor", "Full ICU setup"],
    icon: "heart",
  },
];

 export interface Location {
    address: string
    latitude: number
    longitude: number
  }

export type LatLng = { latitude: number; longitude: number };