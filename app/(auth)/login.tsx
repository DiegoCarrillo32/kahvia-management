import { View, Text, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { useState } from 'react';

export default function LoginScreen() {
  const { signInWithGoogle } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    try {
      setLoading(true);
      await signInWithGoogle();
    } catch (e) {
      console.error(e);
      // Let AuthContext handle errors or show an alert
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 items-center justify-center bg-white-cream p-6">
      <View className="items-center mb-10 mt-10">
        {/* Replace with your logo from assets/images/LOGOS if available */}
        <View className="h-32 w-32 bg-expresso rounded-full items-center justify-center shadow-lg">
           <Text className="font-titan text-white-cream text-3xl">Ka.</Text>
        </View>
        <Text className="font-titan text-expresso text-4xl mt-6 text-center">Kahvia</Text>
        <Text className="font-gotham text-warm-roast text-lg mt-2 text-center">Management Platform</Text>
      </View>

      <View className="w-full">
        <TouchableOpacity
            onPress={handleLogin}
            disabled={loading}
            className={`w-full bg-coffee-seed py-4 rounded-xl flex-row justify-center items-center shadow-md ${loading ? 'opacity-70' : ''}`}
        >
            {loading ? (
                <ActivityIndicator color="#fff5e1" size="small" className="mr-2" />
            ) : null}
            <Text className="font-gotham-bold text-white-cream text-lg text-center">
                Sign In with Google
            </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
