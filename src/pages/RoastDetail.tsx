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
  Trash2,
  Calendar,
  Thermometer,
  Clock,
  User,
  TrendingDown,
} from "lucide-react";
import { Roast } from "../types/roast";
import { deleteRoast } from "../services/roastService";

interface RoastDetailProps {
  roast: Roast;
  onBack: () => void;
}

export default function RoastDetail({ roast, onBack }: RoastDetailProps) {
  const toast = useToast();

  const formatDate = (timestamp: unknown) => {
    if (!timestamp) return "No registrado";
    const ts = timestamp as { toDate?: () => Date };
    if (ts.toDate) return ts.toDate().toLocaleString();
    const d = new Date(timestamp as string | number | Date);
    return isNaN(d.getTime()) ? "No registrado" : d.toLocaleString();
  };

  const getRoastLevelColor = (level: string) => {
    switch (level) {
      case "Claro":
        return "yellow";
      case "Medio":
        return "orange";
      case "Medio-Oscuro":
        return "red";
      case "Oscuro":
        return "purple";
      default:
        return "gray";
    }
  };

  const handleDelete = async () => {
    if (
      !confirm(
        "¿Eliminar este registro de tostado? Esta acción no se puede deshacer."
      )
    )
      return;
    try {
      await deleteRoast(roast.id!);
      toast({ title: "Tostado eliminado", status: "info" });
      onBack();
    } catch {
      toast({ title: "Error al eliminar", status: "error" });
    }
  };

  const isBlend = roast.ingredients.length > 1;

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
            Detalle de Tostado
          </Heading>
        </Flex>
        <Button
          leftIcon={<Trash2 size={16} />}
          size="sm"
          variant="outline"
          colorScheme="red"
          onClick={handleDelete}
        >
          Eliminar
        </Button>
      </Flex>

      {/* Card */}
      <Box
        bg="white"
        borderRadius="xl"
        shadow="md"
        p={{ base: 4, md: 8 }}
        maxW="800px"
      >
        {/* Type and Level */}
        <Flex justify="space-between" align="start" mb={4} wrap="wrap" gap={3}>
          <VStack align="start" spacing={1}>
            <Text
              fontWeight="bold"
              fontSize={{ base: "xl", md: "2xl" }}
              color="var(--color-expresso)"
            >
              {isBlend
                ? `Blend (${roast.ingredients.length} granos)`
                : roast.ingredients[0]?.beanName || "Tostado"}
            </Text>
            <HStack>
              <Calendar size={14} color="gray" />
              <Text fontSize="sm" color="gray.500">
                {formatDate(roast.roastedAt)}
              </Text>
            </HStack>
          </VStack>
          <Badge
            colorScheme={getRoastLevelColor(roast.roastLevel)}
            fontSize="md"
            px={3}
            py={1}
            borderRadius="md"
          >
            {roast.roastLevel}
          </Badge>
        </Flex>

        <Divider mb={6} />

        {/* Ingredients */}
        <Heading size="sm" mb={3} color="var(--color-expresso)">
          Granos Utilizados
        </Heading>
        <Box bg="gray.50" p={4} borderRadius="md" mb={6}>
          {roast.ingredients.map((ing, idx) => {
            const pct =
              roast.inputWeightGrams > 0
                ? Math.round(
                    (ing.gramsUsed / roast.inputWeightGrams) * 100
                  )
                : 0;
            return (
              <Flex
                key={idx}
                justify="space-between"
                align="center"
                py={2}
                borderBottomWidth={
                  idx < roast.ingredients.length - 1 ? 1 : 0
                }
                borderColor="gray.200"
              >
                <Text fontWeight="medium">{ing.beanName}</Text>
                <HStack>
                  <Badge colorScheme="blue">
                    {ing.gramsUsed.toLocaleString()}g
                  </Badge>
                  {isBlend && (
                    <Text fontSize="xs" color="gray.500">
                      ({pct}%)
                    </Text>
                  )}
                </HStack>
              </Flex>
            );
          })}
        </Box>

        {/* Weight Stats */}
        <SimpleGrid columns={{ base: 1, sm: 3 }} spacing={4} mb={6}>
          <Box textAlign="center" bg="green.50" p={4} borderRadius="md">
            <Text fontSize="xs" color="gray.500" textTransform="uppercase">
              Entrada
            </Text>
            <Text
              fontWeight="bold"
              fontSize="xl"
              color="var(--color-expresso)"
            >
              {roast.inputWeightGrams.toLocaleString()}g
            </Text>
          </Box>
          <Box textAlign="center" bg="orange.50" p={4} borderRadius="md">
            <Text fontSize="xs" color="gray.500" textTransform="uppercase">
              Salida
            </Text>
            <Text fontWeight="bold" fontSize="xl" color="var(--color-warm-roast)">
              {roast.outputWeightGrams.toLocaleString()}g
            </Text>
          </Box>
          <Box textAlign="center" bg="red.50" p={4} borderRadius="md">
            <HStack justify="center" mb={1}>
              <TrendingDown size={14} />
              <Text fontSize="xs" color="gray.500" textTransform="uppercase">
                Pérdida
              </Text>
            </HStack>
            <Text
              fontWeight="bold"
              fontSize="xl"
              color={roast.lossPercentage > 20 ? "red.500" : "gray.700"}
            >
              {roast.lossPercentage}%
            </Text>
          </Box>
        </SimpleGrid>

        <Divider mb={6} />

        {/* Roast Parameters */}
        <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={5} mb={6}>
          {roast.durationMinutes != null && roast.durationMinutes > 0 && (
            <Box>
              <HStack mb={1}>
                <Clock size={14} color="var(--color-warm-roast)" />
                <Text
                  fontSize="xs"
                  color="gray.500"
                  textTransform="uppercase"
                >
                  Duración
                </Text>
              </HStack>
              <Text fontWeight="medium" fontSize="lg">
                {roast.durationMinutes} min
              </Text>
            </Box>
          )}
          {roast.temperatureCelsius != null &&
            roast.temperatureCelsius > 0 && (
              <Box>
                <HStack mb={1}>
                  <Thermometer size={14} color="var(--color-warm-roast)" />
                  <Text
                    fontSize="xs"
                    color="gray.500"
                    textTransform="uppercase"
                  >
                    Temperatura
                  </Text>
                </HStack>
                <Text fontWeight="medium" fontSize="lg">
                  {roast.temperatureCelsius}°C
                </Text>
              </Box>
            )}
          {roast.roasterName && (
            <Box>
              <HStack mb={1}>
                <User size={14} color="var(--color-warm-roast)" />
                <Text
                  fontSize="xs"
                  color="gray.500"
                  textTransform="uppercase"
                >
                  Tostador
                </Text>
              </HStack>
              <Text fontWeight="medium" fontSize="lg">
                {roast.roasterName}
              </Text>
            </Box>
          )}
        </SimpleGrid>

        {/* Notes */}
        {roast.notes && (
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
              <Text fontStyle="italic">{roast.notes}</Text>
            </Box>
          </>
        )}

        {/* Timestamps */}
        <Divider mb={4} />
        <VStack align="start" spacing={2}>
          <HStack>
            <Calendar size={14} color="var(--color-warm-roast)" />
            <Text fontSize="sm" color="gray.600">
              <strong>Registrado:</strong> {formatDate(roast.createdAt)}
            </Text>
          </HStack>
        </VStack>
      </Box>
    </Box>
  );
}
