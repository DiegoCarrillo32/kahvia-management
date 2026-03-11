import { View, Text, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Plus, Coffee, LogOut } from 'lucide-react-native';
import { firestore } from '../../lib/firebase';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { Order } from '../../lib/orders';

export default function OrdersScreen() {
  const router = useRouter();
  const { signOut } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
     const q = query(collection(firestore, 'orders'), orderBy('createdAt', 'desc'));
     const subscriber = onSnapshot(q, querySnapshot => {
            const fetchedOrders = querySnapshot.docs.map(doc => ({
                 id: doc.id,
                 ...doc.data()
            })) as Order[];
            setOrders(fetchedOrders);
            setLoading(false);
        }, error => {
            console.error("Failed to fetch orders realtime", error);
            setLoading(false);
        });

     return () => subscriber();
  }, []);

  const renderItem = ({ item }: {item: any}) => (
    <TouchableOpacity 
        className="bg-white p-4 mb-3 rounded-xl shadow-sm border border-[#e1d5c1]"
        onPress={() => router.push(`/order/${item.id}`)}
    >
      <View className="flex-row justify-between items-center mb-2">
        <Text className="font-gotham-bold text-expresso text-lg">{item.clientName}</Text>
        <View className={`px-2 py-1 rounded-md ${item.status === 'pending' ? 'bg-orange-200' : 'bg-green-200'}`}>
            <Text className="font-gotham text-xs text-expresso uppercase">{item.status}</Text>
        </View>
      </View>
      <View className="flex-row items-center">
        <Coffee size={16} color="#7a1318" />
        <Text className="font-gotham text-warm-roast ml-2">{item.coffeeStyle} - {item.amount}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View className="flex-1 bg-white-cream p-4">
      <View className="flex-row justify-between items-center mb-6 mt-4">
          <Text className="font-titan text-expresso text-2xl">Recent Orders</Text>
          <TouchableOpacity onPress={signOut} className="p-2">
              <LogOut size={24} color="#b92323" />
          </TouchableOpacity>
      </View>
      
      {loading ? (
        <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color="#410505" />
        </View>
      ) : (
          <FlatList
            data={orders}
            renderItem={renderItem}
            keyExtractor={item => item.id!}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={() => (
                <Text className="text-center font-gotham text-warm-roast mt-10">No orders yet. Add one!</Text>
            )}
          />
      )}

      <TouchableOpacity
        className="absolute bottom-6 right-6 w-14 h-14 bg-expresso rounded-full items-center justify-center shadow-lg"
        onPress={() => router.push('/order/add-order')}
      >
        <Plus color="#fff5e1" size={28} />
      </TouchableOpacity>
    </View>
  );
}
