import { View, Text, ScrollView, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { createOrder, CoffeeStyle, CoffeeAmount } from '../../lib/orders';
import MapView, { Marker } from 'react-native-maps';

export default function AddOrderScreen() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    
    const [clientName, setClientName] = useState('');
    const [clientPhone, setClientPhone] = useState('');
    const [deliveryAddress, setDeliveryAddress] = useState('');
    const [orderPrice, setOrderPrice] = useState('');
    const [coffeeStyle, setCoffeeStyle] = useState<CoffeeStyle>('medium');
    const [amount, setAmount] = useState<CoffeeAmount>('250g');
    const [notes, setNotes] = useState('');
    const [location, setLocation] = useState<{latitude: number; longitude: number} | null>(null);

    const handleSave = async () => {
        if(!clientName || !clientPhone || !deliveryAddress || !orderPrice) {
            alert("Please fill all required fields");
            return;
        }

        if(!location) {
            alert("Please tap the map to definitively select the exact delivery location.");
            return;
        }

        try {
            setLoading(true);
            await createOrder({
                clientName,
                clientPhone,
                deliveryAddress,
                locationCoords: location,
                orderPrice: Number(orderPrice),
                coffeeStyle,
                amount,
                notes
            });
            router.back();
        } catch(e) {
            console.error(e);
            alert("Failed to save order");
        } finally {
            setLoading(false);
        }
    }

    return (
        <ScrollView className="flex-1 bg-white-cream p-4">
           <View className="mb-6 mt-4 flex-row items-center">
             <TouchableOpacity onPress={() => router.back()} className="mr-4">
                 <Text className="text-expresso font-gotham">Back</Text>
             </TouchableOpacity>
             <Text className="font-titan text-expresso text-2xl">New Order</Text>
           </View>

           <View className="bg-white p-4 rounded-xl shadow-sm border border-[#e1d5c1]">
                {/* Basic Fields */}
                <Text className="font-gotham-bold text-expresso mb-2">Client Name *</Text>
                <TextInput 
                    className="border border-gray-300 rounded-lg p-3 mb-4 font-gotham text-warm-roast" 
                    value={clientName} onChangeText={setClientName} placeholder="Jane Doe"
                />

                <Text className="font-gotham-bold text-expresso mb-2">Phone *</Text>
                <TextInput 
                    className="border border-gray-300 rounded-lg p-3 mb-4 font-gotham text-warm-roast" 
                    value={clientPhone} onChangeText={setClientPhone} placeholder="+123456789" keyboardType="phone-pad"
                />

                <Text className="font-gotham-bold text-expresso mb-2">Delivery Address *</Text>
                <TextInput 
                    className="border border-gray-300 rounded-lg p-3 mb-4 font-gotham text-warm-roast" 
                    value={deliveryAddress} onChangeText={setDeliveryAddress} placeholder="123 Coffee St"
                />

                <Text className="font-gotham-bold text-expresso mb-2">Price *</Text>
                <TextInput 
                    className="border border-gray-300 rounded-lg p-3 mb-4 font-gotham text-warm-roast" 
                    value={orderPrice} onChangeText={setOrderPrice} placeholder="15.00" keyboardType="numeric"
                />

                <Text className="font-gotham-bold text-expresso mb-2">Exact Location (Tap Map) *</Text>
                <View className="h-48 rounded-lg overflow-hidden mb-6 border border-gray-300">
                     <MapView
                         style={{ flex: 1 }}
                         initialRegion={{
                             latitude: 19.4326, // Default CDMX
                             longitude: -99.1332,
                             latitudeDelta: 0.0922,
                             longitudeDelta: 0.0421,
                         }}
                         onPress={(e) => setLocation(e.nativeEvent.coordinate)}
                     >
                         {location && <Marker coordinate={location} pinColor="#b92323" />}
                     </MapView>
                </View>

                {/* Style Selection - simplified via basic pill buttons */}
                <Text className="font-gotham-bold text-expresso mb-2 mt-2">Roast Style</Text>
                <View className="flex-row mb-4">
                    {['light', 'medium', 'dark'].map((style) => (
                        <TouchableOpacity 
                            key={style}
                            onPress={() => setCoffeeStyle(style as CoffeeStyle)}
                            className={`flex-1 p-3 rounded-lg mr-2 items-center ${coffeeStyle === style ? 'bg-coffee-seed' : 'bg-gray-200'}`}
                        >
                            <Text className={`font-gotham ${coffeeStyle === style ? 'text-white' : 'text-expresso'}`}>{style}</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Amount Selection */}
                 <Text className="font-gotham-bold text-expresso mb-2 mt-2">Amount</Text>
                 <View className="flex-row mb-4">
                    {['250g', '500g', '1kg'].map((amt) => (
                        <TouchableOpacity 
                            key={amt}
                            onPress={() => setAmount(amt as CoffeeAmount)}
                            className={`flex-1 p-3 rounded-lg mr-2 items-center ${amount === amt ? 'bg-coffee-seed' : 'bg-gray-200'}`}
                        >
                            <Text className={`font-gotham ${amount === amt ? 'text-white' : 'text-expresso'}`}>{amt}</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Notes */}
                <Text className="font-gotham-bold text-expresso mb-2 mt-2">Notes</Text>
                <TextInput 
                    className="border border-gray-300 rounded-lg p-3 mb-6 font-gotham text-warm-roast h-24" 
                    value={notes} onChangeText={setNotes} placeholder="Ground for french press..." multiline
                    textAlignVertical="top"
                />
                
                <TouchableOpacity
                    onPress={handleSave}
                    disabled={loading}
                    className={`w-full bg-expresso py-4 rounded-xl flex-row justify-center items-center shadow-md ${loading ? 'opacity-70' : ''}`}
                >   
                    {loading && <ActivityIndicator color="#fff5e1" size="small" className="mr-2" />}
                    <Text className="font-gotham-bold text-white-cream text-lg text-center">
                        Save Order
                    </Text>
                </TouchableOpacity>

            </View>
            <View className="h-20" />
        </ScrollView>
    );
}
