import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
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
  Spinner,
  Center,
} from "@chakra-ui/react";
import {
  ArrowLeft,
  Package,
  Calendar,
  Pencil,
  Trash2,
  Droplets,
  Weight,
  Flame,
  Share2,
} from "lucide-react";
import { Roast } from "../types/roast";
import { deleteCoffeeBean } from "../services/inventoryService";
import { getRoastsByBean } from "../services/roastService";
import { useCoffeeBean } from "../hooks/useInventory";
import BeanForm from "./BeanForm";
import RoastForm from "./RoastForm";

export default function BeanDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const toast = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [isRoasting, setIsRoasting] = useState(false);

  const { data: bean, isLoading } = useCoffeeBean(id || "");

  const [roastHistory, setRoastHistory] = useState<Roast[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  const fetchHistory = useCallback(async () => {
    if (!bean?.id) return;
    setLoadingHistory(true);
    try {
      const data = await getRoastsByBean(bean.id);
      setRoastHistory(data);
    } catch {
      // silently fail — history is supplementary
    } finally {
      setLoadingHistory(false);
    }
  }, [bean?.id]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);


  const formatDate = (timestamp: unknown) => {
    if (!timestamp) return "No registrado";
    const ts = timestamp as { toDate?: () => Date };
    if (ts.toDate) return ts.toDate().toLocaleString();
    const d = new Date(timestamp as string | number | Date);
    return isNaN(d.getTime()) ? "No registrado" : d.toLocaleString();
  };

  const formatShortDate = (timestamp: unknown) => {
    if (!timestamp) return "—";
    const ts = timestamp as { toDate?: () => Date };
    if (ts.toDate) return ts.toDate().toLocaleDateString();
    const d = new Date(timestamp as string | number | Date);
    return isNaN(d.getTime()) ? "—" : d.toLocaleDateString();
  };

  const handleDelete = async () => {
    if (!bean) return;
    if (
      !confirm(
        "¿Estás seguro de que deseas eliminar este grano? Esta acción no se puede deshacer."
      )
    )
      return;
    try {
      await deleteCoffeeBean(bean.id!);
      toast({ title: "Grano eliminado", status: "info" });
      navigate("/inventory");
    } catch {
      toast({ title: "Error al eliminar", status: "error" });
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast({
      title: "Enlace copiado",
      status: "success",
      duration: 2000,
    });
  };

  if (isLoading) {
    return (
      <Center minH="100vh" bg="var(--color-white-pergamino)">
        <Spinner color="var(--color-expresso)" />
      </Center>
    );
  }

  if (!bean) {
    return (
      <Center minH="100vh" flexDirection="column" gap={4} bg="var(--color-white-pergamino)">
        <Text color="var(--color-expresso)" fontSize="lg">
          El grano no existe o ha sido eliminado
        </Text>
        <Button onClick={() => navigate("/inventory")} colorScheme="blue">
          Volver al Inventario
        </Button>
      </Center>
    );
  }

  if (isEditing) {
    return (
      <BeanForm
        editBean={bean}
        onClose={() => setIsEditing(false)}
        onSaved={() => setIsEditing(false)}
      />
    );
  }

  if (isRoasting) {
    return (
      <RoastForm
        preSelectedBeanId={bean.id}
        onClose={() => setIsRoasting(false)}
        onCreated={() => setIsRoasting(false)}
      />
    );
  }

  // Calculate total grams used from this bean
  const totalUsed = roastHistory.reduce((sum, roast) => {
    const ing = roast.ingredients.find((i) => i.beanId === bean.id);
    return sum + (ing?.gramsUsed || 0);
  }, 0);

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
            onClick={() => navigate("/inventory")}
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

        <HStack spacing={2} flexWrap="wrap">
          <IconButton
            aria-label="Compartir"
            icon={<Share2 size={16} />}
            size="sm"
            variant="ghost"
            onClick={handleShare}
          />
          <Button
            leftIcon={<Flame size={16} />}
            size="sm"
            bg="var(--color-warm-roast)"
            color="white"
            _hover={{ bg: "var(--color-expresso)" }}
            onClick={() => setIsRoasting(true)}
          >
            Crear Tostado
          </Button>
          <Button
            leftIcon={<Pencil size={16} />}
            size="sm"
            variant="outline"
            colorScheme="blue"
            onClick={() => setIsEditing(true)}
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

        {/* Roast History */}
        <Divider mb={4} />
        <Flex justify="space-between" align="center" mb={3}>
          <Heading size="sm" color="var(--color-expresso)">
            Historial de Tostados
          </Heading>
          {roastHistory.length > 0 && (
            <Badge colorScheme="orange">
              {totalUsed.toLocaleString()}g tostados en total
            </Badge>
          )}
        </Flex>

        {loadingHistory ? (
          <Flex justify="center" py={4}>
            <Spinner size="sm" color="var(--color-warm-roast)" />
          </Flex>
        ) : roastHistory.length === 0 ? (
          <Box bg="gray.50" p={4} borderRadius="md" mb={6}>
            <Text fontSize="sm" color="gray.500" textAlign="center">
              Este grano no ha sido tostado aún
            </Text>
          </Box>
        ) : (
          <VStack spacing={2} mb={6} align="stretch">
            {roastHistory.map((roast) => {
              const ing = roast.ingredients.find((i) => i.beanId === bean.id);
              const isBlend = roast.ingredients.length > 1;
              return (
                <Box
                  key={roast.id}
                  bg="gray.50"
                  p={3}
                  borderRadius="md"
                  borderLeftWidth={3}
                  borderLeftColor="var(--color-warm-roast)"
                >
                  <Flex justify="space-between" align="center" wrap="wrap" gap={2}>
                    <HStack>
                      <Flame size={14} color="var(--color-warm-roast)" />
                      <Text fontSize="sm" fontWeight="medium">
                        {formatShortDate(roast.roastedAt)}
                      </Text>
                      {isBlend && (
                        <Badge fontSize="xs" variant="subtle">
                          Blend
                        </Badge>
                      )}
                    </HStack>
                    <HStack spacing={3}>
                      <Badge colorScheme="blue">
                        {ing?.gramsUsed.toLocaleString()}g usados
                      </Badge>
                      <Text fontSize="xs" color="gray.500">
                        {roast.roastLevel} • Pérdida: {roast.lossPercentage}%
                      </Text>
                    </HStack>
                  </Flex>
                </Box>
              );
            })}
          </VStack>
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
