import { Tabs } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import { Redirect } from 'expo-router';
import { Text, View } from 'react-native';
import { Home, BarChart2 } from 'lucide-react-native';

export default function TabsLayout() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-white-cream">
        <Text className="font-gotham text-expresso">Loading...</Text>
      </View>
    );
  }

  // if (!user) {
  //   return <Redirect href="/(auth)/login" />;
  // }

  return (
     <Tabs
        screenOptions={{
            tabBarActiveTintColor: '#7a1318', 
            tabBarInactiveTintColor: '#410505',
            tabBarStyle: {
                backgroundColor: '#fff5e1',
                borderTopWidth: 0,
                elevation: 0,
                shadowOpacity: 0.1,
            },
            headerStyle: {
                backgroundColor: '#fff5e1',
                elevation: 0,
                shadowOpacity: 0,
            },
            headerTitleStyle: {
                fontFamily: 'TitanOne',
                color: '#410505'
            },
            tabBarLabelStyle: {
                fontFamily: 'Gotham',
            }
        }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Orders',
          tabBarIcon: ({ color, size }) => <Home color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="analytics"
        options={{
          title: 'Analytics',
          tabBarIcon: ({ color, size }) => <BarChart2 color={color} size={size} />,
        }}
      />
    </Tabs>
  );
}
