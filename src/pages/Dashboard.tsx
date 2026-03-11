import { useCallback, useEffect, useState } from "react";
import {
  Box,
  Flex,
  Heading,
  Text,
  Badge,
  Select,
  Button,
  SimpleGrid,
  Icon,
  VStack,
  HStack,
  Divider,
  useToast,
} from "@chakra-ui/react";
import {
  Coffee,
  Truck,
  MessageCircle,
  MapPin,
  Calendar,
  CheckCircle,
  Plus,
} from "lucide-react";
import {
  getOrders,
  markOrderAsRoasted,
  markOrderAsDelivered,
} from "../services/orderService";
import { Order, OrderStatus } from "../types/order";
import CreateOrder from "./CreateOrder";

export default function Dashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "">("");
  const [showCreate, setShowCreate] = useState(false);
  const toast = useToast();

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getOrders(statusFilter || undefined);
      setOrders(data);
    } catch {
      toast({ title: "Error cargando órdenes", status: "error" });
    } finally {
      setLoading(false);
    }
  }, [statusFilter, toast]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleStatusChange = async (
    id: string,
    newStatus: "Tostado" | "Entregado"
  ) => {
    try {
      if (newStatus === "Tostado") await markOrderAsRoasted(id);
      if (newStatus === "Entregado") await markOrderAsDelivered(id);
      toast({
        title: `Orden marcada como ${newStatus}`,
        status: "success",
      });
      fetchOrders();
    } catch {
      toast({ title: "Error al actualizar", status: "error" });
    }
  };

  const openWhatsApp = (phone: string, clientName: string) => {
    const cleanPhone = phone.replace(/\D/g, "");
    const message = `Hola ${clientName}, te escribimos de Kahvia. `;
    window.open(
      `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`,
      "_blank"
    );
  };

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case "Pendiente":
        return "yellow";
      case "Tostado":
        return "orange";
      case "Entregado":
        return "green";
      default:
        return "gray";
    }
  };

  const formatDate = (timestamp: unknown) => {
    if (!timestamp) return "No registrado";
    const ts = timestamp as { toDate?: () => Date };
    return ts.toDate
      ? ts.toDate().toLocaleDateString()
      : new Date(timestamp as string | number | Date).toLocaleDateString();
  };

  if (showCreate) {
    return (
      <CreateOrder
        onClose={() => setShowCreate(false)}
        onCreated={() => {
          setShowCreate(false);
          fetchOrders();
        }}
      />
    );
  }

  return (
    <Box p={{ base: 4, md: 8 }} bg="var(--color-white-pergamino)" minH="100vh">
      {/* Header */}
      <Flex
        justify="space-between"
        align="center"
        mb={6}
        wrap="wrap"
        gap={3}
        direction={{ base: "column", sm: "row" }}
      >
        <Heading
          as="h1"
          size={{ base: "md", md: "lg" }}
          color="var(--color-expresso)"
          fontFamily="heading"
        >
          Gestión de Órdenes
        </Heading>

        <Flex gap={3} w={{ base: "100%", sm: "auto" }} wrap="wrap">
          <Select
            w={{ base: "100%", sm: "200px" }}
            bg="white"
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value as OrderStatus | "")
            }
            borderColor="gray.300"
            size="sm"
          >
            <option value="">Todas</option>
            <option value="Pendiente">Pendientes</option>
            <option value="Tostado">Tostados</option>
            <option value="Entregado">Entregados</option>
          </Select>
          <Button
            leftIcon={<Plus size={16} />}
            bg="var(--color-warm-roast)"
            color="white"
            _hover={{ bg: "var(--color-expresso)" }}
            size="sm"
            onClick={() => setShowCreate(true)}
            w={{ base: "100%", sm: "auto" }}
          >
            Nueva Orden
          </Button>
        </Flex>
      </Flex>

      {/* Content */}
      {loading ? (
        <Text color="var(--color-expresso)">Cargando órdenes...</Text>
      ) : orders.length === 0 ? (
        <Flex
          direction="column"
          align="center"
          justify="center"
          p={{ base: 8, md: 12 }}
          bg="white"
          borderRadius="lg"
          shadow="sm"
        >
          <Coffee size={48} color="var(--color-warm-roast)" opacity={0.5} />
          <Text mt={4} color="gray.500" fontSize="lg">
            No hay órdenes para mostrar
          </Text>
          <Button
            mt={4}
            leftIcon={<Plus size={16} />}
            bg="var(--color-warm-roast)"
            color="white"
            _hover={{ bg: "var(--color-expresso)" }}
            size="sm"
            onClick={() => setShowCreate(true)}
          >
            Crear primera orden
          </Button>
        </Flex>
      ) : (
        <SimpleGrid columns={{ base: 1, md: 2, xl: 3 }} spacing={4}>
          {orders.map((order) => (
            <Box
              key={order.id}
              bg="white"
              p={{ base: 4, md: 6 }}
              borderRadius="xl"
              shadow="md"
              borderWidth={1}
              borderColor="gray.100"
              transition="all 0.2s"
              _hover={{ shadow: "lg", transform: "translateY(-2px)" }}
            >
              <Flex justify="space-between" align="start" mb={3}>
                <VStack align="start" spacing={1}>
                  <Text
                    fontWeight="bold"
                    fontSize={{ base: "lg", md: "xl" }}
                    color="var(--color-expresso)"
                  >
                    {order.clientName}
                  </Text>
                  <HStack color="gray.500" fontSize="sm">
                    <Icon as={MapPin} boxSize={3} />
                    <Text isTruncated maxW={{ base: "150px", md: "200px" }}>
                      {order.deliveryAddress}
                    </Text>
                  </HStack>
                </VStack>
                <Badge
                  colorScheme={getStatusColor(order.status)}
                  fontSize="xs"
                  px={2}
                  py={1}
                  borderRadius="md"
                >
                  {order.status}
                </Badge>
              </Flex>

              <Divider my={2} />

              <SimpleGrid columns={2} spacing={2} mb={3}>
                <Box>
                  <Text
                    fontSize="xs"
                    color="gray.500"
                    textTransform="uppercase"
                  >
                    Producto
                  </Text>
                  <Text fontWeight="medium" fontSize="sm">
                    {order.coffeeStyle} - {order.amount}
                  </Text>
                </Box>
                <Box>
                  <Text
                    fontSize="xs"
                    color="gray.500"
                    textTransform="uppercase"
                  >
                    Total
                  </Text>
                  <Text fontWeight="bold" color="var(--color-coffee-fruit)">
                    ${order.orderPrice}
                  </Text>
                </Box>
                <Box>
                  <Text
                    fontSize="xs"
                    color="gray.500"
                    textTransform="uppercase"
                  >
                    Fecha Pedido
                  </Text>
                  <HStack spacing={1}>
                    <Icon as={Calendar} boxSize={3} />
                    <Text fontSize="sm">{formatDate(order.createdAt)}</Text>
                  </HStack>
                </Box>
                <Box>
                  <Text
                    fontSize="xs"
                    color="gray.500"
                    textTransform="uppercase"
                  >
                    Pago
                  </Text>
                  <Text
                    fontSize="sm"
                    color={order.paid ? "green.600" : "red.500"}
                  >
                    {order.paid ? "Pagado" : "Por Pagar"}
                  </Text>
                </Box>
              </SimpleGrid>

              {order.notes && (
                <Box bg="gray.50" p={2} borderRadius="md" mb={3}>
                  <Text fontSize="xs" color="gray.500" mb={1}>
                    NOTAS:
                  </Text>
                  <Text fontSize="sm" fontStyle="italic">
                    {order.notes}
                  </Text>
                </Box>
              )}

              <Flex
                gap={2}
                mt="auto"
                pt={2}
                direction={{ base: "column", sm: "row" }}
              >
                <Button
                  flex={1}
                  leftIcon={<MessageCircle size={16} />}
                  colorScheme="whatsapp"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    openWhatsApp(order.clientPhone, order.clientName)
                  }
                >
                  WhatsApp
                </Button>

                {order.status === "Pendiente" && (
                  <Button
                    flex={1}
                    leftIcon={<Coffee size={16} />}
                    bg="var(--color-warm-roast)"
                    color="white"
                    _hover={{ bg: "var(--color-expresso)" }}
                    size="sm"
                    onClick={() => handleStatusChange(order.id!, "Tostado")}
                  >
                    Tostar
                  </Button>
                )}

                {order.status === "Tostado" && (
                  <Button
                    flex={1}
                    leftIcon={<Truck size={16} />}
                    colorScheme="blue"
                    size="sm"
                    onClick={() => handleStatusChange(order.id!, "Entregado")}
                  >
                    Entregar
                  </Button>
                )}

                {order.status === "Entregado" && (
                  <Button
                    flex={1}
                    leftIcon={<CheckCircle size={16} />}
                    colorScheme="green"
                    variant="ghost"
                    size="sm"
                    isDisabled
                  >
                    Completado
                  </Button>
                )}
              </Flex>
            </Box>
          ))}
        </SimpleGrid>
      )}
    </Box>
  );
}
