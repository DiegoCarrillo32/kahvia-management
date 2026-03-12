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
  Package,
  Calendar,
  Pencil,
  Trash2,
  Droplets,
  Weight,
} from "lucide-react";
import { CoffeeBean } from "../types/inventory";
import { deleteCoffeeBean } from "../services/inventoryService";

interface BeanDetailProps {
  bean: CoffeeBean;
  onBack: () => void;
  onEdit: () => void;
  onRefresh: () => void;
}

export default function BeanDetail({
  bean,
  onBack,
  onEdit,
}: BeanDetailProps) {
  const toast = useToast();

  const formatDate = (timestamp: unknown) => {
    if (!timestamp) return "No registrado";
    const ts = timestamp as { toDate?: () => Date };
    return ts.toDate
      ? ts.toDate().toLocaleString()
      : new Date(timestamp as string | number | Date).toLocaleString();
  };

  const handleDelete = async () => {
    if (
      !confirm(
        "¿Estás seguro de que deseas eliminar este grano? Esta acción no se puede deshacer."
      )
    )
      return;
    try {
      await deleteCoffeeBean(bean.id!);
      toast({ title: "Grano eliminado", status: "info" });
      onBack();
    } catch {
      toast({ title: "Error al eliminar", status: "error" });
    }
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
            {bean.name}
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
        {/* Basic Info */}
        <Flex justify="space-between" align="start" mb={6} wrap="wrap" gap={3}>
          <VStack align="start" spacing={1}>
            <Text
              fontWeight="bold"
              fontSize={{ base: "xl", md: "2xl" }}
              color="var(--color-expresso)"
            >
              {bean.name}
            </Text>
            <Text color="gray.500">{bean.origin}</Text>
            <Badge
              colorScheme="orange"
              fontSize="sm"
              px={2}
              py={1}
              borderRadius="md"
            >
              {bean.roastProfile || "Sin perfil"}
            </Badge>
          </VStack>
          <VStack align="end" spacing={1}>
            <Text
              fontWeight="bold"
              fontSize="2xl"
              color={bean.amountGrams < 1000 ? "red.500" : "var(--color-expresso)"}
            >
              {bean.amountGrams.toLocaleString()}g
            </Text>
            {bean.amountGrams < 1000 && (
              <Badge colorScheme="red" fontSize="xs">
                Inventario bajo
              </Badge>
            )}
          </VStack>
        </Flex>

        <Divider mb={6} />

        {/* Details */}
        <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={5} mb={6}>
          <Box>
            <Text fontSize="xs" color="gray.500" textTransform="uppercase" mb={1}>
              Costo por Kg
            </Text>
            <Text fontWeight="medium" fontSize="lg" color="var(--color-coffee-fruit)">
              {bean.costPerKg ? `₡${bean.costPerKg.toLocaleString()}` : "No registrado"}
            </Text>
          </Box>
          <Box>
            <Text fontSize="xs" color="gray.500" textTransform="uppercase" mb={1}>
              Fecha de Compra
            </Text>
            <HStack>
              <Calendar size={14} color="gray" />
              <Text fontWeight="medium">
                {bean.boughtAt || "No registrada"}
              </Text>
            </HStack>
          </Box>
          <Box>
            <HStack mb={1}>
              <Weight size={14} color="var(--color-warm-roast)" />
              <Text fontSize="xs" color="gray.500" textTransform="uppercase">
                Densidad Promedio
              </Text>
            </HStack>
            <Text fontWeight="medium" fontSize="lg">
              {bean.avgDensity ? `${bean.avgDensity} g/L` : "No registrada"}
            </Text>
          </Box>
          <Box>
            <HStack mb={1}>
              <Droplets size={14} color="var(--color-warm-roast)" />
              <Text fontSize="xs" color="gray.500" textTransform="uppercase">
                Humedad Promedio
              </Text>
            </HStack>
            <Text fontWeight="medium" fontSize="lg">
              {bean.avgHumidity ? `${bean.avgHumidity}%` : "No registrada"}
            </Text>
          </Box>
        </SimpleGrid>

        {/* Notes */}
        {bean.notes && (
          <>
            <Divider mb={4} />
            <Box bg="gray.50" p={4} borderRadius="md" mb={6}>
              <Text fontSize="xs" color="gray.500" textTransform="uppercase" mb={2}>
                Notas
              </Text>
              <Text fontStyle="italic">{bean.notes}</Text>
            </Box>
          </>
        )}

        {/* Timestamps */}
        <Divider mb={4} />
        <Heading size="sm" mb={3} color="var(--color-expresso)">
          Registro
        </Heading>
        <VStack align="start" spacing={2}>
          <HStack>
            <Calendar size={14} color="var(--color-warm-roast)" />
            <Text fontSize="sm" color="gray.600">
              <strong>Registrado:</strong> {formatDate(bean.createdAt)}
            </Text>
          </HStack>
          <HStack>
            <Package size={14} color="var(--color-warm-roast)" />
            <Text fontSize="sm" color="gray.600">
              <strong>Última actualización:</strong> {formatDate(bean.updatedAt)}
            </Text>
          </HStack>
        </VStack>
      </Box>
    </Box>
  );
}
