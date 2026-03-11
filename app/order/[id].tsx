import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Linking, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { getOrderById, updateOrderStatus, Order, OrderStatus } from '../../lib/orders';
import { ArrowLeft, MessageCircle, MapPin, Navigation, Clock, CheckCircle, Calendar } from 'lucide-react-native';

export default function OrderDetailScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if(id) {
            fetchOrder(id as string);
        }
    }, [id]);

    const fetchOrder = async (orderId: string) => {
        try {
            setLoading(true);
            const data = await getOrderById(orderId);
            if(data) setOrder(data);
        } catch(e) {
            console.error(e);
            Alert.alert("Error", "Could not fetch order details");
        } finally {
            setLoading(false);
        }
    }

    const handleUpdateStatus = async (newStatus: OrderStatus) => {
        if(!order?.id) return;
        try {
            await updateOrderStatus(order.id, newStatus);
            setOrder({ ...order, status: newStatus });
        } catch(e) {
            Alert.alert("Error", "Could not update status");
        }
    }

    const openWhatsApp = () => {
        if(!order?.clientPhone) return;
        let phone = order.clientPhone.replace(/\D/g, ''); // Extract numbers
        // Add international prefix if missing, assuming a default or requiring it from input.
        // For now, appending wa.me link
        let url = `whatsapp://send?phone=${phone}&text=${encodeURIComponent(`Hello ${order.clientName}, regarding your order of ${order.amount} ${order.coffeeStyle} coffee...`)}`;
        Linking.canOpenURL(url).then(supported => {
            if (supported) {
                Linking.openURL(url);
            } else {
                Alert.alert("Error", "WhatsApp is not installed on your device");
            }
        });
    }

    const openMapsNavigation = async () => {
        if(!order?.locationCoords) return;
        
        const { latitude, longitude } = order.locationCoords;
        const wazeUrl = `waze://?ll=${latitude},${longitude}&navigate=yes`;
        const googleMapsUrl = `comgooglemaps://?center=${latitude},${longitude}&q=${latitude},${longitude}`;

        try {
            const hasWaze = await Linking.canOpenURL(wazeUrl);
            if(hasWaze) {
                await Linking.openURL(wazeUrl);
                return;
            }
            const hasGmaps = await Linking.canOpenURL(googleMapsUrl);
            if(hasGmaps) {
                await Linking.openURL(googleMapsUrl);
                return;
            }

            // Fallback for native apple maps
            const appleMapsUrl = `http://maps.apple.com/?daddr=${latitude},${longitude}`;
            await Linking.openURL(appleMapsUrl);
        } catch(e) {
            Alert.alert("Error", "Could not open map applications.");
        }
    }

    const formatDate = (timestamp: any) => {
        if (!timestamp) return 'Pending';
        // Handle Firestore timestamp
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        return date.toLocaleString([], { 
            month: 'short', day: 'numeric', 
            hour: '2-digit', minute: '2-digit' 
        });
    };

    if(loading) {
         return (
            <View className="flex-1 items-center justify-center bg-white-cream">
                <ActivityIndicator size="large" color="#410505" />
            </View>
         );
    }

    if(!order) {
        return (
            <View className="flex-1 items-center justify-center bg-white-cream">
                 <Text className="font-gotham text-expresso">Order not found.</Text>
                 <TouchableOpacity onPress={() => router.back()} className="mt-4 p-4 bg-expresso rounded-md">
                     <Text className="text-white-cream font-gotham">Go Back</Text>
                 </TouchableOpacity>
            </View>
        );
    }

    return (
        <ScrollView className="flex-1 bg-white-cream">
            {/* Header */}
            <View className="bg-expresso p-6 pt-12 rounded-b-3xl shadow-md">
                <View className="flex-row items-center mb-4">
                    <TouchableOpacity onPress={() => router.back()} className="mr-4">
                        <ArrowLeft color="#fff5e1" size={24} />
                    </TouchableOpacity>
                    <Text className="font-titan text-white-cream text-2xl">Order Details</Text>
                </View>
                <Text className="font-gotham-bold text-white-cream text-3xl mb-1">{order.clientName}</Text>
                
                <View className="flex-row items-center mt-2">
                    <Text className="font-gotham text-orange-200 uppercase tracking-widest text-xs font-bold mr-2">
                        {order.status}
                    </Text>
                </View>
            </View>

            <View className="p-4">
                {/* Actions */}
                <View className="flex-row justify-between mb-6">
                    <TouchableOpacity 
                        onPress={openWhatsApp}
                        className="flex-1 bg-[#25D366] p-4 rounded-xl items-center flex-row justify-center mr-2 shadow-sm"
                    >
                        <MessageCircle color="#ffffff" size={20} />
                        <Text className="font-gotham-bold text-white ml-2">WhatsApp</Text>
                    </TouchableOpacity>

                    <TouchableOpacity 
                        onPress={openMapsNavigation}
                        className="flex-1 bg-blue-500 p-4 rounded-xl items-center flex-row justify-center ml-2 shadow-sm"
                    >
                        <Navigation color="#ffffff" size={20} />
                        <Text className="font-gotham-bold text-white ml-2">Navigate</Text>
                    </TouchableOpacity>
                </View>

                 {/* Information Card */}
                <View className="bg-white p-5 rounded-2xl shadow-sm border border-[#e1d5c1] mb-6">
                     <Text className="font-titan text-expresso text-lg mb-4 border-b border-gray-100 pb-2">Order Information</Text>
                     
                     <View className="flex-row justify-between mb-3">
                         <Text className="font-gotham text-warm-roast">Total Price</Text>
                         <Text className="font-gotham-bold text-expresso text-lg">${order.orderPrice}</Text>
                     </View>

                     <View className="flex-row justify-between mb-3">
                         <Text className="font-gotham text-warm-roast">Coffee</Text>
                         <Text className="font-gotham-bold text-expresso">{order.amount} - {order.coffeeStyle} Roast</Text>
                     </View>

                     <View className="flex-row justify-between mb-3">
                         <Text className="font-gotham text-warm-roast">Phone</Text>
                         <Text className="font-gotham-bold text-expresso">{order.clientPhone}</Text>
                     </View>

                     <View className="mt-4">
                         <Text className="font-gotham text-warm-roast mb-1">Delivery Address</Text>
                         <View className="flex-row items-start">
                             <MapPin size={16} color="#7a1318" className="mt-1 mr-2" />
                             <Text className="font-gotham-bold text-expresso flex-1">{order.deliveryAddress}</Text>
                         </View>
                     </View>

                         <View className="mt-6 border-t border-gray-100 pt-4">
                             <Text className="font-titan text-expresso text-md mb-3">Timeline Tracker</Text>
                             
                             <View className="flex-row items-center mb-2">
                                 <Calendar size={14} color="#7a1318" className="mr-2" />
                                 <Text className="font-gotham text-warm-roast w-24">Placed:</Text>
                                 <Text className="font-gotham-bold text-expresso flex-1 text-right">{formatDate(order.createdAt)}</Text>
                             </View>
                             
                             <View className="flex-row items-center mb-2">
                                 <Clock size={14} color="#e6a817" className="mr-2" />
                                 <Text className="font-gotham text-warm-roast w-24">Roasted:</Text>
                                 <Text className="font-gotham-bold text-expresso flex-1 text-right">{formatDate(order.roastedAt)}</Text>
                             </View>

                             <View className="flex-row items-center">
                                 <CheckCircle size={14} color="#16a34a" className="mr-2" />
                                 <Text className="font-gotham text-warm-roast w-24">Delivered:</Text>
                                 <Text className="font-gotham-bold text-expresso flex-1 text-right">{formatDate(order.deliveredAt)}</Text>
                             </View>
                         </View>

                     {order.notes && (
                        <View className="mt-4 bg-gray-50 p-3 rounded-lg">
                            <Text className="font-gotham-bold text-expresso mb-1">Notes:</Text>
                            <Text className="font-gotham text-warm-roast italic">{order.notes}</Text>
                        </View>
                     )}
                </View>

                {/* Status Update Options */}
                <Text className="font-titan text-expresso text-lg mb-4 ml-1">Update Status</Text>
                <View className="flex-row">
                    <TouchableOpacity 
                        onPress={() => handleUpdateStatus('roasted')}
                        disabled={order.status === 'roasted' || order.status === 'delivered'}
                        className={`flex-1 p-4 rounded-xl mr-2 flex-row justify-center items-center ${order.status !== 'pending' ? 'bg-gray-200' : 'bg-warm-roast'}`}
                    >
                       <Clock size={18} color={order.status !== 'pending' ? '#999' : '#fff'} className="mr-2" />
                       <Text className={`font-gotham-bold ${order.status !== 'pending' ? 'text-gray-500' : 'text-white'}`}>Roast</Text>
                    </TouchableOpacity>

                    <TouchableOpacity 
                         onPress={() => handleUpdateStatus('delivered')}
                         disabled={order.status === 'delivered'}
                        className={`flex-1 p-4 rounded-xl ml-2 flex-row justify-center items-center ${order.status === 'delivered' ? 'bg-gray-200' : 'bg-green-600'}`}
                    >
                        <CheckCircle size={18} color={order.status === 'delivered' ? '#999' : '#fff'} className="mr-2" />
                        <Text className={`font-gotham-bold ${order.status === 'delivered' ? 'text-gray-500' : 'text-white'}`}>Deliver</Text>
                    </TouchableOpacity>
                </View>

                <View className="h-20" />
            </View>
        </ScrollView>
    );
}
