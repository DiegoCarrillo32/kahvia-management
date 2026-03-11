import {
  Box,
  Flex,
  Heading,
  Text,
  Badge,
  Button,
  SimpleGrid,
  Divider,
  HStack,
  VStack,
  IconButton,
  useToast,
} from "@chakra-ui/react";
import {
  ArrowLeft,
  MapPin,
  Phone,
  Calendar,
  Coffee,
  Truck,
  CheckCircle,
  MessageCircle,
  Pencil,
  Trash2,
  DollarSign,
} from "lucide-react";
import { Order, OrderStatus } from "../types/order";
import {
  markOrderAsRoasted,
  markOrderAsDelivered,
  deleteOrder,
} from "../services/orderService";

interface OrderDetailProps {
  order: Order;
  onBack: () => void;
  onEdit: () => void;
  onRefresh: () => void;
}

export default function OrderDetail({
  order,
  onBack,
  onEdit,
  onRefresh,
}: OrderDetailProps) {
  const toast = useToast();

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
      ? ts.toDate().toLocaleString()
      : new Date(timestamp as string | number | Date).toLocaleString();
  };

  const handleStatusChange = async (newStatus: "Tostado" | "Entregado") => {
    try {
      if (newStatus === "Tostado") await markOrderAsRoasted(order.id!);
      if (newStatus === "Entregado") await markOrderAsDelivered(order.id!);
      toast({
        title: `Orden marcada como ${newStatus}`,
        status: "success",
      });
      onRefresh();
    } catch {
      toast({ title: "Error al actualizar", status: "error" });
    }
  };

  const handleDelete = async () => {
    if (
      !confirm(
        "¿Estás seguro de que deseas eliminar esta orden? Esta acción no se puede deshacer.",
      )
    )
      return;
    try {
      await deleteOrder(order.id!);
      toast({ title: "Orden eliminada", status: "info" });
      onBack();
    } catch {
      toast({ title: "Error al eliminar", status: "error" });
    }
  };

  const openWhatsApp = () => {
    const cleanPhone = order.clientPhone.replace(/\D/g, "");
    const message = `Hola ${order.clientName}, te escribimos de Kahvia. `;
    window.open(
      `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`,
      "_blank",
    );
  };

  return (
    <Box
      p={{ base: 4, md: 8 }}
      pb={{ base: 24, md: 8 }}
      bg="var(--color-white-pergamino)"
      minH="100vh"
    >
      {/* Header */}
      <Flex align="center" justify="space-between" mb={6} wrap="wrap" gap={3}>
        <Flex align="center" gap={3}>
          <IconButton
            aria-label="Volver"
            icon={<ArrowLeft size={20} />}
            variant="ghost"
            onClick={onBack}
            color="var(--color-expresso)"
          />
          <Heading
            as="h1"
            size={{ base: "md", md: "lg" }}
            color="var(--color-expresso)"
            fontFamily="heading"
          >
            Detalle de Orden
          </Heading>
        </Flex>

        <HStack spacing={2}>
          <Button
            leftIcon={<Pencil size={16} />}
            size="sm"
            variant="outline"
            colorScheme="blue"
            onClick={onEdit}
          >
            Editar
          </Button>
          <Button
            leftIcon={<Trash2 size={16} />}
            size="sm"
            variant="outline"
            colorScheme="red"
            onClick={handleDelete}
          >
            Eliminar
          </Button>
        </HStack>
      </Flex>

      {/* Card */}
      <Box
        bg="white"
        borderRadius="xl"
        shadow="md"
        p={{ base: 4, md: 8 }}
        maxW="800px"
      >
        {/* Client and Status */}
        <Flex justify="space-between" align="start" mb={6} wrap="wrap" gap={3}>
          <VStack align="start" spacing={1}>
            <Text
              fontWeight="bold"
              fontSize={{ base: "xl", md: "2xl" }}
              color="var(--color-expresso)"
            >
              {order.clientName}
            </Text>
            <HStack color="gray.500" fontSize="sm">
              <Phone size={14} />
              <Text>{order.clientPhone}</Text>
            </HStack>
            <HStack color="gray.500" fontSize="sm">
              <MapPin size={14} />
              <Text>{order.deliveryAddress}</Text>
            </HStack>
          </VStack>
          <Badge
            colorScheme={getStatusColor(order.status)}
            fontSize="md"
            px={3}
            py={1}
            borderRadius="md"
          >
            {order.status}
          </Badge>
        </Flex>

        <Divider mb={6} />

        {/* Order Details */}
        <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={5} mb={6}>
          <Box>
            <Text
              fontSize="xs"
              color="gray.500"
              textTransform="uppercase"
              mb={1}
            >
              Estilo de Café
            </Text>
            <Text fontWeight="medium" fontSize="lg">
              {order.coffeeStyle}
            </Text>
          </Box>
          <Box>
            <Text
              fontSize="xs"
              color="gray.500"
              textTransform="uppercase"
              mb={1}
            >
              Cantidad
            </Text>
            <Text fontWeight="medium" fontSize="lg">
              {order.amount}
            </Text>
          </Box>
          <Box>
            <Text
              fontSize="xs"
              color="gray.500"
              textTransform="uppercase"
              mb={1}
            >
              Precio
            </Text>
            <HStack>
              <DollarSign size={16} color="var(--color-coffee-fruit)" />
              <Text
                fontWeight="bold"
                fontSize="lg"
                color="var(--color-coffee-fruit)"
              >
                {order.orderPrice}
              </Text>
            </HStack>
          </Box>
          <Box>
            <Text
              fontSize="xs"
              color="gray.500"
              textTransform="uppercase"
              mb={1}
            >
              Estado de Pago
            </Text>
            <Badge colorScheme={order.paid ? "green" : "red"} fontSize="sm">
              {order.paid ? "Pagado" : "Por Pagar"}
            </Badge>
          </Box>
        </SimpleGrid>

        <Divider mb={6} />

        {/* Timeline */}
        <Heading size="sm" mb={4} color="var(--color-expresso)">
          Línea de Tiempo
        </Heading>
        <VStack align="start" spacing={3} mb={6}>
          <HStack>
            <Calendar size={16} color="var(--color-warm-roast)" />
            <Text fontSize="sm" color="gray.600">
              <strong>Pedido:</strong> {formatDate(order.createdAt)}
            </Text>
          </HStack>
          <HStack>
            <Coffee
              size={16}
              color={order.roastedAt ? "var(--color-warm-roast)" : "gray"}
            />
            <Text
              fontSize="sm"
              color={order.roastedAt ? "gray.700" : "gray.400"}
            >
              <strong>Tostado:</strong> {formatDate(order.roastedAt)}
            </Text>
          </HStack>
          <HStack>
            <Truck
              size={16}
              color={order.deliveredAt ? "var(--color-warm-roast)" : "gray"}
            />
            <Text
              fontSize="sm"
              color={order.deliveredAt ? "gray.700" : "gray.400"}
            >
              <strong>Entregado:</strong> {formatDate(order.deliveredAt)}
            </Text>
          </HStack>
        </VStack>

        {/* Notes */}
        {order.notes && (
          <>
            <Divider mb={4} />
            <Box bg="gray.50" p={4} borderRadius="md" mb={6}>
              <Text
                fontSize="xs"
                color="gray.500"
                textTransform="uppercase"
                mb={2}
              >
                Notas
              </Text>
              <Text fontStyle="italic">{order.notes}</Text>
            </Box>
          </>
        )}

        {/* Actions */}
        <Divider mb={4} />
        <Flex gap={3} direction={{ base: "column", sm: "row" }}>
          <Button
            flex={1}
            leftIcon={<MessageCircle size={14} />}
            colorScheme="whatsapp"
            variant="outline"
            size="sm"
            onClick={openWhatsApp}
            padding={2}
            iconSpacing={3}
          >
            WhatsApp
          </Button>

          {order.status === "Pendiente" && (
            <Button
              flex={1}
              leftIcon={<Coffee size={18} />}
              bg="var(--color-warm-roast)"
              color="white"
              _hover={{ bg: "var(--color-expresso)" }}
              onClick={() => handleStatusChange("Tostado")}
              size={{ base: "lg", md: "md" }}
              iconSpacing={3}
              padding={2}
            >
              Marcar como Tostado
            </Button>
          )}

          {order.status === "Tostado" && (
            <Button
              flex={1}
              leftIcon={<Truck size={18} />}
              colorScheme="blue"
              onClick={() => handleStatusChange("Entregado")}
              size={{ base: "lg", md: "md" }}
              iconSpacing={3}
              padding={2}
            >
              Marcar como Entregado
            </Button>
          )}

          {order.status === "Entregado" && (
            <Button
              flex={1}
              leftIcon={<CheckCircle size={18} />}
              colorScheme="green"
              variant="ghost"
              isDisabled
              size={{ base: "lg", md: "md" }}
              iconSpacing={3}
              padding={2}
            >
              Completado
            </Button>
          )}
        </Flex>
      </Box>
    </Box>
  );
}
