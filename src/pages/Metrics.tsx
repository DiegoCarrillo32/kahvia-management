import React, { useMemo, useState } from 'react';
import { 
  Box, 
  Flex, 
  Heading, 
  Text, 
  SimpleGrid, 
  Icon, 
  Spinner, 
  Select, 
  HStack,
  Badge
} from '@chakra-ui/react';
import { TrendingUp, TrendingDown, Package, Coffee, DollarSign, Calendar } from 'lucide-react';
import { useOrders } from '../hooks/useOrders';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from 'recharts';

const currentSystemDate = new Date();

const MONTHS = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
];

export default function Metrics() {
  const { data: orders = [], isLoading: loading } = useOrders();

  const [selectedMonth, setSelectedMonth] = useState<number>(currentSystemDate.getMonth());
  const [selectedYear, setSelectedYear] = useState<number>(currentSystemDate.getFullYear());

  const parseFirebaseDate = (timestamp: unknown): Date | null => {
    if (!timestamp) return null;
    const ts = timestamp as { toDate?: () => Date };
    if (ts.toDate) return ts.toDate();
    const d = new Date(timestamp as string | number | Date);
    return isNaN(d.getTime()) ? null : d;
  };

  const getMetricsForPeriod = React.useCallback((month: number, year: number) => {
    let totalRevenue = 0;
    const sizeStats: Record<string, number> = {};
    const productStats: Record<string, number> = {};
    let orderCount = 0;

    orders.forEach(order => {
      const date = parseFirebaseDate(order.createdAt);
      if (!date) return;
      
      if (date.getMonth() === month && date.getFullYear() === year) {
        orderCount++;
        if (order.paid) totalRevenue += Number(order.orderPrice) || 0;
        
        // Compute size stats
        if (order.amount) {
          sizeStats[order.amount] = (sizeStats[order.amount] || 0) + 1;
        }

        // Compute product stats (Style + Amount)
        const productName = `${order.coffeeStyle} - ${order.amount}`;
        productStats[productName] = (productStats[productName] || 0) + 1;
      }
    });

    const mostSoldSize = Object.keys(sizeStats).length 
      ? Object.keys(sizeStats).reduce((a, b) => sizeStats[a] > sizeStats[b] ? a : b)
      : 'Ninguno';

    const mostSoldProduct = Object.keys(productStats).length
      ? Object.keys(productStats).reduce((a, b) => productStats[a] > productStats[b] ? a : b)
      : 'Ninguno';

    // Build array for Recharts
    const topSellersData = Object.entries(productStats)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5); // Top 5

    return { 
      totalRevenue, 
      orderCount, 
      sizeStats, 
      mostSoldSize, 
      mostSoldProduct,
      topSellersData
    };
  }, [orders]);

  const metrics = useMemo(() => {
    const current = getMetricsForPeriod(selectedMonth, selectedYear);
    
    // Calculate previous month
    const prevMonth = selectedMonth === 0 ? 11 : selectedMonth - 1;
    const prevYear = selectedMonth === 0 ? selectedYear - 1 : selectedYear;
    const previous = getMetricsForPeriod(prevMonth, prevYear);

    // Calculate Growth
    const revenueGrowth = previous.totalRevenue > 0 
      ? ((current.totalRevenue - previous.totalRevenue) / previous.totalRevenue) * 100 
      : (current.totalRevenue > 0 ? 100 : 0);
      
    const ordersGrowth = previous.orderCount > 0 
      ? ((current.orderCount - previous.orderCount) / previous.orderCount) * 100 
      : (current.orderCount > 0 ? 100 : 0);

    return {
      ...current,
      revenueGrowth,
      ordersGrowth
    };
  }, [selectedMonth, selectedYear, getMetricsForPeriod]);

  // Generate Year dropdown options
  const years = useMemo(() => {
    const y = new Set<number>();
    y.add(currentSystemDate.getFullYear());
    orders.forEach(o => {
      const d = parseFirebaseDate(o.createdAt);
      if (d) y.add(d.getFullYear());
    });
    return Array.from(y).sort((a, b) => b - a);
  }, [orders]);

  if (loading) {
    return (
      <Flex p={8} justify="center" align="center" minH="50vh">
        <Spinner size="xl" color="var(--color-warm-roast)" />
      </Flex>
    );
  }

  // Recharts custom colors
  const COLORS = ['#410505', '#7a1318', '#b92323', '#d9534f', '#f0ad4e'];

  return (
    <Box p={{ base: 4, md: 8 }} pb={{ base: 24, md: 8 }} bg="var(--color-white-pergamino)" minH="100vh">
      <Flex justify="space-between" align="center" mb={8} wrap="wrap" gap={4}>
        <Heading as="h1" size={{ base: "md", md: "lg" }} color="var(--color-expresso)" fontFamily="heading">
          Métricas de Ventas
        </Heading>
        
        <HStack spacing={3} bg="white" p={2} borderRadius="md" shadow="sm">
          <Icon as={Calendar} color="gray.500" size={18} />
          <Select 
            size="sm" 
            w="120px" 
            value={selectedMonth} 
            onChange={(e) => setSelectedMonth(Number(e.target.value))}
          >
            {MONTHS.map((m, i) => (
              <option key={i} value={i}>{m}</option>
            ))}
          </Select>
          <Select 
            size="sm" 
            w="100px" 
            value={selectedYear} 
            onChange={(e) => setSelectedYear(Number(e.target.value))}
          >
            {years.map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </Select>
        </HStack>
      </Flex>

      <SimpleGrid columns={{ base: 1, md: 2, xl: 4 }} spacing={6} mb={8}>
        <MetricCard 
          title="Ingresos Totales (Mes)" 
          val={`₡${metrics.totalRevenue.toLocaleString()}`} 
          icon={DollarSign} 
          growth={metrics.revenueGrowth}
        />
        <MetricCard 
          title="Órdenes (Mes)" 
          val={metrics.orderCount.toString()} 
          icon={Package} 
          growth={metrics.ordersGrowth}
        />
        <MetricCard 
          title="Tamaño Dominante" 
          val={metrics.mostSoldSize} 
          icon={TrendingUp} 
          subval={`${metrics.sizeStats[metrics.mostSoldSize] || 0} unidades`}
        />
        <MetricCard 
          title="Producto Estrella" 
          val={metrics.mostSoldProduct} 
          icon={Coffee} 
        />
      </SimpleGrid>

      <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={8}>
        {/* Top Sellers Chart */}
        <Box bg="white" p={6} borderRadius="xl" shadow="sm" borderWidth={1} borderColor="gray.100">
          <Heading size="md" mb={6} color="var(--color-expresso)">Top 5 Productos (Mes)</Heading>
          {metrics.topSellersData.length === 0 ? (
             <Text color="gray.500" textAlign="center" py={10}>No hay ventas este mes.</Text>
          ) : (
             <Box h="300px" w="100%">
               <ResponsiveContainer width="100%" height="100%">
                 <BarChart data={metrics.topSellersData} layout="vertical" margin={{ top: 5, right: 30, left: 60, bottom: 5 }}>
                   <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                   <XAxis type="number" />
                   <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 12 }} />
                   <Tooltip cursor={{ fill: 'transparent' }} />
                   <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                     {metrics.topSellersData.map((_, index) => (
                       <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                     ))}
                   </Bar>
                 </BarChart>
               </ResponsiveContainer>
             </Box>
          )}
        </Box>

        {/* Existing Size breakdown but filtered by Month! */}
        <Box bg="white" p={6} borderRadius="xl" shadow="sm" borderWidth={1} borderColor="gray.100">
          <Heading size="md" mb={6} color="var(--color-expresso)">Ventas por Tamaño</Heading>
          {Object.keys(metrics.sizeStats).length === 0 ? (
             <Text color="gray.500" textAlign="center" py={10}>No hay ventas este mes.</Text>
          ) : (
            Object.entries(metrics.sizeStats).map(([size, count]) => {
              if (count === 0) return null;
              const max = Math.max(...Object.values(metrics.sizeStats));
              const width = max > 0 ? (count / max) * 100 : 0;
              return (
                <Box key={size} mb={5}>
                  <Flex justify="space-between" mb={1}>
                    <Text fontWeight="medium" color="gray.700">{size}</Text>
                    <Text color="gray.500">{count} vendidos</Text>
                  </Flex>
                  <Box bg="gray.100" h="10px" borderRadius="full" w="100%">
                    <Box bg="var(--color-warm-roast)" h="100%" borderRadius="full" w={`${width}%`} transition="all 0.5s ease-out" />
                  </Box>
                </Box>
              );
            })
          )}
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
  growth?: number;
}

const MetricCard = ({ title, val, icon, subval, growth }: MetricCardProps) => (
  <Box bg="white" p={6} borderRadius="xl" shadow="sm" borderWidth={1} borderColor="gray.100">
    <Flex justify="space-between" align="center" mb={4}>
      <Text color="gray.500" fontSize="sm" fontWeight="medium" textTransform="uppercase">{title}</Text>
      <Icon as={icon} color="var(--color-coffee-fruit)" size={20} />
    </Flex>
    <Text fontSize="3xl" fontWeight="bold" color="var(--color-expresso)" fontFamily="heading">
      {val}
    </Text>
    
    {growth !== undefined && (
      <HStack mt={2} fontSize="sm">
        <Badge 
          colorScheme={growth >= 0 ? 'green' : 'red'} 
          display="flex" 
          alignItems="center"
          px={1.5}
        >
          <Icon as={growth >= 0 ? TrendingUp : TrendingDown} size={10} mr={1} />
          {Math.abs(growth).toFixed(1)}%
        </Badge>
        <Text color="gray.400" fontSize="xs">vs mes anterior</Text>
      </HStack>
    )}

    {subval && <Text fontSize="xs" color="gray.400" mt={2}>{subval}</Text>}
  </Box>
);
