import { View, Text, ScrollView, ActivityIndicator } from 'react-native';
import { useEffect, useState } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { firestore } from '../../lib/firebase';
import { Order } from '../../lib/orders';

export default function AnalyticsScreen() {
  const [loading, setLoading] = useState(true);
  const [totalOrdersMonth, setTotalOrdersMonth] = useState(0);
  const [highestRevenue, setHighestRevenue] = useState(0);
  const [mostRoastedMonth, setMostRoastedMonth] = useState('N/A');

  useEffect(() => {
    const fetchAnalytics = async () => {
        try {
            const now = new Date();
            const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
            
            // This month's orders
            const monthQuery = query(
                collection(firestore, 'orders'),
                where('createdAt', '>=', firstDayOfMonth)
            );
            const monthSnapshot = await getDocs(monthQuery);

            setTotalOrdersMonth(monthSnapshot.size);

            // Fetch all for complex aggregations (in a real app, use Cloud Functions for this)
            const allOrdersSnapshot = await getDocs(collection(firestore, 'orders'));
            const allOrders = allOrdersSnapshot.docs.map(doc => doc.data() as Order);

            let maxRevenue = 0;
            const monthCounts: Record<string, number> = {};

            allOrders.forEach(order => {
                // Revenue tracking
                if (order.orderPrice > maxRevenue) {
                    maxRevenue = order.orderPrice;
                }

                // Month counting for roasts
                // Firebase timestamp to JS Date
                if(order.createdAt && (order as any).createdAt.toDate) {
                     const date = (order as any).createdAt.toDate();
                     const monthName = date.toLocaleString('default', { month: 'long' });
                     monthCounts[monthName] = (monthCounts[monthName] || 0) + 1;
                }
            });

            setHighestRevenue(maxRevenue);

            let topMonth = 'N/A';
            let maxRoasts = 0;
            for (const [month, count] of Object.entries(monthCounts)) {
                if(count > maxRoasts) {
                    maxRoasts = count;
                    topMonth = month;
                }
            }
            setMostRoastedMonth(topMonth);

        } catch (e) {
            console.error("Failed to load analytics", e);
        } finally {
            setLoading(false);
        }
    };

    fetchAnalytics();
  }, []);

  if(loading) {
       return (
        <View className="flex-1 items-center justify-center bg-white-cream">
            <ActivityIndicator size="large" color="#410505" />
        </View>
      );
  }

  return (
    <ScrollView className="flex-1 bg-white-cream p-4">
      <View className="mb-6 mt-4">
        <Text className="font-titan text-expresso text-2xl">Analytics</Text>
      </View>

      <View className="flex-row justify-between mb-4">
        <View className="flex-1 bg-white p-4 rounded-xl shadow-sm border border-[#e1d5c1] mr-2">
            <Text className="font-gotham text-warm-roast text-sm">Most Roasted Month</Text>
            <Text className="font-gotham-bold text-expresso text-2xl mt-1">{mostRoastedMonth}</Text>
        </View>

        <View className="flex-1 bg-white p-4 rounded-xl shadow-sm border border-[#e1d5c1] ml-2">
            <Text className="font-gotham text-warm-roast text-sm">Highest Revenue</Text>
            <Text className="font-gotham-bold text-expresso text-2xl mt-1">${highestRevenue}</Text>
        </View>
      </View>

       <View className="bg-white p-4 rounded-xl shadow-sm border border-[#e1d5c1] mt-4">
            <Text className="font-gotham-bold text-expresso text-lg mb-2">Total Orders (This Month)</Text>
            <Text className="font-gotham-light text-expresso text-4xl">{totalOrdersMonth}</Text>
        </View>
    </ScrollView>
  );
}
