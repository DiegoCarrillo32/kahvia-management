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
  Trash2,
  Calendar,
  Thermometer,
  Clock,
  User,
  TrendingDown,
  ChevronRight,
  Share2,
} from "lucide-react";
import { useRoast, useDeleteRoast } from "../hooks/useRoasts";

export default function RoastDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const toast = useToast();

  const { data: roast, isLoading } = useRoast(id || "");
  const deleteMutation = useDeleteRoast();

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
    if (!roast) return;
    if (
      !confirm(
        "¿Eliminar este registro de tostado? Esta acción no se puede deshacer."
      )
    )
      return;
    try {
      await deleteMutation.mutateAsync(roast.id!);
      toast({ title: "Tostado eliminado", status: "info" });
      navigate("/roasts");
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

  if (!roast) {
    return (
      <Center minH="100vh" flexDirection="column" gap={4} bg="var(--color-white-pergamino)">
        <Text color="var(--color-expresso)" fontSize="lg">
          El tostado no existe o ha sido eliminado
        </Text>
        <Button onClick={() => navigate("/roasts")} colorScheme="blue">
          Volver a Tostados
        </Button>
      </Center>
    );
  }

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
            onClick={() => navigate("/roasts")}
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
        <HStack spacing={2}>
          <IconButton
            aria-label="Compartir"
            icon={<Share2 size={16} />}
            size="sm"
            variant="ghost"
            onClick={handleShare}
          />
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

        {/* Associated Order */}
        {roast.orderClientName && (
          <>
            <Divider mb={4} />
            <Heading size="sm" mb={3} color="var(--color-expresso)">
              Orden Asociada
            </Heading>
            <Box
              bg="blue.50"
              p={4}
              borderRadius="md"
              mb={6}
              borderWidth={1}
              borderColor="blue.200"
              cursor={roast.orderId ? "pointer" : "default"}
              transition="all 0.2s"
              _hover={roast.orderId ? { shadow: "md", borderColor: "blue.400" } : {}}
              onClick={() => roast.orderId && navigate(`/order/${roast.orderId}`)}
            >
              <Flex justify="space-between" align="center">
                <Text fontWeight="medium" color="var(--color-expresso)">
                  {roast.orderClientName}
                </Text>
                {roast.orderId && (
                  <ChevronRight size={16} color="gray" />
                )}
              </Flex>
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
