import { registerRootComponent } from 'expo';
import React from 'react';
import AppNavigator from './navigation/AppNavigator';

function App() {
  return <AppNavigator />;
}

export default registerRootComponent(App); 