import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import CompetitionDetailsScreen from '../screens/CompetitionDetailsScreen';

const Stack = createNativeStackNavigator();

export default function RootNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen
          name="CompetitionDetails"
          component={CompetitionDetailsScreen}
          initialParams={{ competitionId: '6ab42011fb1f883fa9b63a33' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
