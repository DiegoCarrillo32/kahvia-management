import { useCallback, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
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
  ChevronRight,
} from "lucide-react";
import {
  getOrders,
  markOrderAsRoasted,
  markOrderAsDelivered,
} from "../services/orderService";
import { getRoastsByOrder } from "../services/roastService";
import { Order, OrderStatus } from "../types/order";
import { Roast } from "../types/roast";
import CreateOrder from "./CreateOrder";
import OrderDetail from "./OrderDetail";
import RoastForm from "./RoastForm";
import RoastDetail from "./RoastDetail";

type ViewMode = "list" | "create" | "detail" | "edit" | "roast" | "roastDetail";

export default function Dashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "">("");
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orderRoasts, setOrderRoasts] = useState<Roast[]>([]);
  const [selectedRoast, setSelectedRoast] = useState<Roast | null>(null);
  const toast = useToast();
  const location = useLocation();
  const navigate = useNavigate();

  // Handle cross-page navigation (e.g., from Roasts page clicking an order)
  useEffect(() => {
    const state = location.state as { orderId?: string } | null;
    if (state?.orderId) {
      // Clear the state so refreshing doesn't re-trigger
      navigate('/', { replace: true, state: {} });
      // Find and open the order
      getOrders().then((data) => {
        const order = data.find((o) => o.id === state.orderId);
        if (order) {
          setSelectedOrder(order);
          setViewMode("detail");
        }
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getOrders(statusFilter || undefined);
      setOrders(data);
      // If viewing a detail, refresh the selected order data
      if (selectedOrder) {
        const updated = data.find((o) => o.id === selectedOrder.id);
        if (updated) setSelectedOrder(updated);
        else {
          // Order was deleted
          setSelectedOrder(null);
          setViewMode("list");
        }
      }
    } catch {
      toast({ title: "Error cargando órdenes", status: "error" });
    } finally {
      setLoading(false);
    }
  }, [statusFilter, toast, selectedOrder]);

  const fetchOrderRoasts = useCallback(async (orderId: string) => {
    try {
      const data = await getRoastsByOrder(orderId);
      setOrderRoasts(data);
    } catch {
      // silently fail, roasts are supplementary
      setOrderRoasts([]);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  useEffect(() => {
    if (selectedOrder?.id && (viewMode === "detail")) {
      fetchOrderRoasts(selectedOrder.id);
    }
  }, [selectedOrder, viewMode, fetchOrderRoasts]);

  const handleStatusChange = async (
    id: string,
    newStatus: "Tostado" | "Entregado",
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
      "_blank",
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
    if (!timestamp) return "—";
    const ts = timestamp as { toDate?: () => Date };
    return ts.toDate
      ? ts.toDate().toLocaleDateString()
      : new Date(timestamp as string | number | Date).toLocaleDateString();
  };

  // --- VIEW MODES ---

  if (viewMode === "create") {
    return (
      <CreateOrder
        onClose={() => setViewMode("list")}
        onCreated={() => {
          setViewMode("list");
          fetchOrders();
        }}
      />
    );
  }

  if (viewMode === "edit" && selectedOrder) {
    return (
      <CreateOrder
        editOrder={selectedOrder}
        onClose={() => setViewMode("detail")}
        onCreated={() => {
          setViewMode("list");
          fetchOrders();
        }}
      />
    );
  }

  if (viewMode === "detail" && selectedOrder) {
    return (
      <OrderDetail
        order={selectedOrder}
        onBack={() => {
          setSelectedOrder(null);
          setOrderRoasts([]);
          setViewMode("list");
          fetchOrders();
        }}
        onEdit={() => setViewMode("edit")}
        onRefresh={() => {
          fetchOrders();
          if (selectedOrder?.id) fetchOrderRoasts(selectedOrder.id);
        }}
        roasts={orderRoasts}
        onCreateRoast={() => setViewMode("roast")}
        onViewRoast={(roast) => {
          setSelectedRoast(roast);
          setViewMode("roastDetail");
        }}
      />
    );
  }

  if (viewMode === "roastDetail" && selectedRoast) {
    return (
      <RoastDetail
        roast={selectedRoast}
        onBack={() => {
          setSelectedRoast(null);
          setViewMode("detail");
        }}
        onViewOrder={(orderId) => {
          // Already on this page, just find the order
          const order = orders.find((o) => o.id === orderId);
          if (order) {
            setSelectedOrder(order);
            setSelectedRoast(null);
            setViewMode("detail");
          }
        }}
      />
    );
  }

  if (viewMode === "roast" && selectedOrder) {
    return (
      <RoastForm
        onClose={() => setViewMode("detail")}
        onCreated={() => {
          setViewMode("detail");
          if (selectedOrder?.id) fetchOrderRoasts(selectedOrder.id);
        }}
        preSelectedOrderId={selectedOrder.id}
      />
    );
  }

  // --- LIST VIEW ---
  return (
    <Box
      p={{ base: 4, md: 8 }}
      pb={{ base: 24, md: 8 }}
      bg="var(--color-white-pergamino)"
      minH="100vh"
    >
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
            onClick={() => setViewMode("create")}
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
            onClick={() => setViewMode("create")}
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
              p={{ base: 4, md: 5 }}
              borderRadius="xl"
              shadow="md"
              borderWidth={1}
              borderColor="gray.100"
              transition="all 0.2s"
              _hover={{ shadow: "lg", transform: "translateY(-2px)" }}
              cursor="pointer"
              onClick={() => {
                setSelectedOrder(order);
                setViewMode("detail");
              }}
            >
              <Flex justify="space-between" align="start" mb={3}>
                <VStack align="start" spacing={1}>
                  <Text
                    fontWeight="bold"
                    fontSize={{ base: "md", md: "lg" }}
                    color="var(--color-expresso)"
                  >
                    {order.clientName}
                  </Text>
                  <HStack color="gray.500" fontSize="xs">
                    <Icon as={MapPin} boxSize={3} />
                    <Text isTruncated maxW={{ base: "140px", md: "180px" }}>
                      {order.deliveryAddress}
                    </Text>
                  </HStack>
                </VStack>
                <Flex align="center" gap={2}>
                  <Badge
                    colorScheme={getStatusColor(order.status)}
                    fontSize="xs"
                    px={2}
                    py={1}
                    borderRadius="md"
                  >
                    {order.status}
                  </Badge>
                  <ChevronRight size={16} color="gray" />
                </Flex>
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
                    ₡{order.orderPrice.toLocaleString()}
                  </Text>
                </Box>
                <Box>
                  <Text
                    fontSize="xs"
                    color="gray.500"
                    textTransform="uppercase"
                  >
                    Pedido
                  </Text>
                  <HStack spacing={1}>
                    <Icon as={Calendar} boxSize={3} />
                    <Text fontSize="xs">{formatDate(order.createdAt)}</Text>
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
                    {order.paid ? "✓ Pagado" : "Pendiente"}
                  </Text>
                </Box>
              </SimpleGrid>

              {/* Action buttons — stop propagation so card click doesn't fire */}
              <Flex
                gap={{ base: 2, md: 2 }}
                mt="auto"
                pt={2}
                direction={{ base: "column", sm: "row" }}
                onClick={(e) => e.stopPropagation()}
              >
                <Button
                  flex={1}
                  leftIcon={<MessageCircle size={14} />}
                  colorScheme="whatsapp"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    openWhatsApp(order.clientPhone, order.clientName)
                  }
                  padding={2}
                  iconSpacing={3}
                >
                  WhatsApp
                </Button>

                {order.status === "Pendiente" && (
                  <Button
                    flex={1}
                    leftIcon={<Coffee size={14} />}
                    bg="var(--color-warm-roast)"
                    color="white"
                    _hover={{ bg: "var(--color-expresso)" }}
                    size="sm"
                    padding={2}
                    onClick={() => handleStatusChange(order.id!, "Tostado")}
                    iconSpacing={3}
                  >
                    Tostar
                  </Button>
                )}

                {order.status === "Tostado" && (
                  <Button
                    flex={1}
                    leftIcon={<Truck size={14} />}
                    colorScheme="blue"
                    size="sm"
                    padding={2}
                    onClick={() => handleStatusChange(order.id!, "Entregado")}
                    iconSpacing={3}
                  >
                    Entregar
                  </Button>
                )}

                {order.status === "Entregado" && (
                  <Button
                    flex={1}
                    leftIcon={<CheckCircle size={14} />}
                    colorScheme="green"
                    variant="ghost"
                    size="sm"
                    isDisabled
                    padding={2}
                    iconSpacing={3}
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
