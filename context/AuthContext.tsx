import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';

type AuthContextType = {
  phoneNumber: string | null;
  setPhoneNumber: (phone: string | null) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [phoneNumber, setPhone] = useState<string | null>(null);

  useEffect(() => {
    // Load phone number from storage on app start
    loadPhoneNumber();
  }, []);

  const loadPhoneNumber = async () => {
    try {
      const storedPhone = await AsyncStorage.getItem('phoneNumber');
      if (storedPhone) {
        setPhone(storedPhone);
      }
    } catch (error) {
      console.error('Error loading phone number:', error);
    }
  };

  const setPhoneNumber = async (phone: string | null) => {
    try {
      if (phone) {
        await AsyncStorage.setItem('phoneNumber', phone);
      } else {
        await AsyncStorage.removeItem('phoneNumber');
      }
      setPhone(phone);
    } catch (error) {
      console.error('Error saving phone number:', error);
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem('phoneNumber');
      setPhone(null);
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ phoneNumber, setPhoneNumber, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}