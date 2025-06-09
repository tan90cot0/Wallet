import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'react-native';

// Import screens
import SplashScreen from '../screens/SplashScreen';
import WalletScreen from '../screens/WalletScreen';
import AddCardScreen from '../screens/AddCardScreen';
import GenerateCardScreen from '../screens/GenerateCardScreen';

// Import theme
import { colors } from '../constants/colors';

// Create stack navigator
const Stack = createNativeStackNavigator();

// Navigation service for outside-component navigation
export const navigationRef = React.createRef();

export function navigate(name, params) {
  navigationRef.current?.navigate(name, params);
}

const AppNavigator = () => {
  return (
    <NavigationContainer ref={navigationRef}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
      <Stack.Navigator
        initialRouteName="Wallet" // Changed from Splash to Wallet for testing
        screenOptions={{
          headerStyle: {
            backgroundColor: colors.primary,
          },
          headerTintColor: colors.white,
          headerTitleStyle: {
            fontFamily: 'Montserrat-Bold',
          },
          headerShadowVisible: false,
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen 
          name="Splash" 
          component={SplashScreen} 
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="Wallet" 
          component={WalletScreen} 
          options={{ 
            title: 'Wallet',
            headerTitleAlign: 'center'
          }}
        />
        <Stack.Screen 
          name="AddCard" 
          component={AddCardScreen} 
          options={{ 
            title: 'Add New Card',
            headerTitleAlign: 'center'
          }}
        />
        <Stack.Screen 
          name="GenerateCard" 
          component={GenerateCardScreen} 
          options={{ 
            title: 'View Card',
            headerTitleAlign: 'center'
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;