import { useEffect, useState, useMemo } from 'react';
import { Box, Flex, Heading, Text, SimpleGrid, Icon, Spinner } from '@chakra-ui/react';
import { getOrders } from '../services/orderService';
import { Order } from '../types/order';
import { TrendingUp, Package, Coffee, DollarSign } from 'lucide-react';

export default function Metrics() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAllOrders = async () => {
      try {
        const data = await getOrders(); // fetches all orders
        setOrders(data);
      } catch (error) {
        console.error("Error fetching max orders", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAllOrders();
  }, []);

  const metrics = useMemo(() => {
    let totalRevenue = 0;
    const sizeStats: Record<string, number> = { '250g': 0, '500g': 0, '1kg': 0 };
    const productStats: Record<string, number> = {};

    orders.forEach(order => {
      if (order.paid) totalRevenue += Number(order.orderPrice) || 0;
      
      // Compute size stats
      if (order.amount) {
        sizeStats[order.amount] = (sizeStats[order.amount] || 0) + 1;
      }

      // Compute product stats
      const productName = `${order.coffeeStyle} - ${order.amount}`;
      productStats[productName] = (productStats[productName] || 0) + 1;
    });

    const mostSoldSize = Object.keys(sizeStats).reduce((a, b) => sizeStats[a] > sizeStats[b] ? a : b, 'Ninguno');
    const mostSoldProduct = Object.keys(productStats).reduce((a, b) => productStats[a] > productStats[b] ? a : b, 'Ninguno');

    return { totalRevenue, sizeStats, mostSoldSize, mostSoldProduct };
  }, [orders]);

  if (loading) {
    return (
      <Flex p={8} justify="center" align="center" minH="50vh">
        <Spinner size="xl" color="var(--color-warm-roast)" />
      </Flex>
    );
  }

  return (
    <Box p={8} bg="var(--color-white-pergamino)" minH="100vh">
      <Heading as="h1" color="var(--color-expresso)" fontFamily="heading" mb={8}>
        Métricas de Ventas
      </Heading>

      <SimpleGrid columns={{ base: 1, md: 2, xl: 4 }} spacing={6} mb={8}>
        <MetricCard 
          title="Ingresos Totales" 
          val={`₡${metrics.totalRevenue.toLocaleString()}`} 
          icon={DollarSign} 
        />
        <MetricCard 
          title="Total Órdenes" 
          val={orders.length.toString()} 
          icon={Package} 
        />
        <MetricCard 
          title="Tamaño Más Vendido" 
          val={metrics.mostSoldSize} 
          icon={TrendingUp} 
          subval={`${metrics.sizeStats[metrics.mostSoldSize] || 0} órdenes`}
        />
        <MetricCard 
          title="Producto Estrella" 
          val={metrics.mostSoldProduct} 
          icon={Coffee} 
        />
      </SimpleGrid>

      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={8}>
        <Box bg="white" p={6} borderRadius="xl" shadow="sm" borderWidth={1} borderColor="gray.100">
          <Heading size="md" mb={6} color="var(--color-expresso)">Ventas por Tamaño</Heading>
          {Object.entries(metrics.sizeStats).map(([size, count]) => {
            if (count === 0) return null;
            const max = Math.max(...Object.values(metrics.sizeStats));
            const width = max > 0 ? (count / max) * 100 : 0;
            return (
              <Box key={size} mb={4}>
                <Flex justify="space-between" mb={1}>
                  <Text fontWeight="medium" color="gray.700">{size}</Text>
                  <Text color="gray.500">{count} vendidos</Text>
                </Flex>
                <Box bg="gray.100" h="8px" borderRadius="full" w="100%">
                  <Box bg="var(--color-warm-roast)" h="100%" borderRadius="full" w={`${width}%`} transition="all 0.5s ease-out" />
                </Box>
              </Box>
            );
          })}
        </Box>
      </SimpleGrid>
    </Box>
  );
}

interface MetricCardProps {
  title: string;
  val: string | number;
  icon: React.ElementType;
  subval?: string;
}

const MetricCard = ({ title, val, icon, subval }: MetricCardProps) => (
  <Box bg="white" p={6} borderRadius="xl" shadow="sm" borderWidth={1} borderColor="gray.100">
    <Flex justify="space-between" align="center" mb={4}>
      <Text color="gray.500" fontSize="sm" fontWeight="medium" textTransform="uppercase">{title}</Text>
      <Icon as={icon} color="var(--color-coffee-fruit)" size={20} />
    </Flex>
    <Text fontSize="3xl" fontWeight="bold" color="var(--color-expresso)" fontFamily="heading">
      {val}
    </Text>
    {subval && <Text fontSize="xs" color="gray.400" mt={1}>{subval}</Text>}
  </Box>
);
