import { useCallback, useEffect, useState } from "react";
import {
  Box,
  Flex,
  Heading,
  Text,
  Badge,
  Button,
  SimpleGrid,
  HStack,
  useToast,
  Divider,
} from "@chakra-ui/react";
import {
  Plus,
  Flame,
  ChevronRight,
  Calendar,
  TrendingDown,
} from "lucide-react";
import { getRoasts } from "../services/roastService";
import { Roast } from "../types/roast";
import RoastForm from "./RoastForm";
import RoastDetail from "./RoastDetail";

type ViewMode = "list" | "create" | "detail";

export default function Roasts() {
  const [roasts, setRoasts] = useState<Roast[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [selectedRoast, setSelectedRoast] = useState<Roast | null>(null);
  const toast = useToast();

  const fetchRoasts = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getRoasts();
      setRoasts(data);
    } catch {
      toast({ title: "Error cargando tostados", status: "error" });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchRoasts();
  }, [fetchRoasts]);

  const formatDate = (timestamp: unknown) => {
    if (!timestamp) return "—";
    const ts = timestamp as { toDate?: () => Date };
    if (ts.toDate) return ts.toDate().toLocaleDateString();
    const d = new Date(timestamp as string | number | Date);
    return isNaN(d.getTime()) ? "—" : d.toLocaleDateString();
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

  // --- VIEW MODES ---

  if (viewMode === "create") {
    return (
      <RoastForm
        onClose={() => setViewMode("list")}
        onCreated={() => {
          setViewMode("list");
          fetchRoasts();
        }}
      />
    );
  }

  if (viewMode === "detail" && selectedRoast) {
    return (
      <RoastDetail
        roast={selectedRoast}
        onBack={() => {
          setSelectedRoast(null);
          setViewMode("list");
          fetchRoasts();
        }}
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
          Registro de Tostados
        </Heading>
        <Button
          leftIcon={<Plus size={16} />}
          bg="var(--color-warm-roast)"
          color="white"
          _hover={{ bg: "var(--color-expresso)" }}
          size="sm"
          onClick={() => setViewMode("create")}
          w={{ base: "100%", sm: "auto" }}
        >
          Nuevo Tostado
        </Button>
      </Flex>

      {loading ? (
        <Text color="var(--color-expresso)">Cargando tostados...</Text>
      ) : roasts.length === 0 ? (
        <Flex
          direction="column"
          align="center"
          justify="center"
          p={{ base: 8, md: 12 }}
          bg="white"
          borderRadius="lg"
          shadow="sm"
        >
          <Flame size={48} color="var(--color-warm-roast)" opacity={0.5} />
          <Text mt={4} color="gray.500" fontSize="lg">
            No hay tostados registrados
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
            Registrar primer tostado
          </Button>
        </Flex>
      ) : (
        <SimpleGrid columns={{ base: 1, md: 2, xl: 3 }} spacing={4}>
          {roasts.map((roast) => {
            const isBlend = roast.ingredients.length > 1;
            const title = isBlend
              ? `Blend (${roast.ingredients.length} granos)`
              : roast.ingredients[0]?.beanName || "Tostado";

            return (
              <Box
                key={roast.id}
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
                  setSelectedRoast(roast);
                  setViewMode("detail");
                }}
              >
                <Flex justify="space-between" align="start" mb={2}>
                  <Box>
                    <Text
                      fontWeight="bold"
                      fontSize={{ base: "md", md: "lg" }}
                      color="var(--color-expresso)"
                    >
                      {title}
                    </Text>
                    <HStack fontSize="xs" color="gray.500" mt={1}>
                      <Calendar size={12} />
                      <Text>{formatDate(roast.roastedAt)}</Text>
                    </HStack>
                  </Box>
                  <Flex align="center" gap={2}>
                    <Badge
                      colorScheme={getRoastLevelColor(roast.roastLevel)}
                      fontSize="xs"
                    >
                      {roast.roastLevel}
                    </Badge>
                    <ChevronRight size={16} color="gray" />
                  </Flex>
                </Flex>

                <Divider my={2} />

                <SimpleGrid columns={3} spacing={2}>
                  <Box>
                    <Text
                      fontSize="xs"
                      color="gray.500"
                      textTransform="uppercase"
                    >
                      Entrada
                    </Text>
                    <Text fontWeight="medium" fontSize="sm">
                      {roast.inputWeightGrams.toLocaleString()}g
                    </Text>
                  </Box>
                  <Box>
                    <Text
                      fontSize="xs"
                      color="gray.500"
                      textTransform="uppercase"
                    >
                      Salida
                    </Text>
                    <Text
                      fontWeight="medium"
                      fontSize="sm"
                      color="var(--color-warm-roast)"
                    >
                      {roast.outputWeightGrams.toLocaleString()}g
                    </Text>
                  </Box>
                  <Box>
                    <HStack spacing={1}>
                      <TrendingDown size={10} />
                      <Text
                        fontSize="xs"
                        color="gray.500"
                        textTransform="uppercase"
                      >
                        Pérdida
                      </Text>
                    </HStack>
                    <Text
                      fontWeight="bold"
                      fontSize="sm"
                      color={
                        roast.lossPercentage > 20 ? "red.500" : "gray.700"
                      }
                    >
                      {roast.lossPercentage}%
                    </Text>
                  </Box>
                </SimpleGrid>

                {/* Ingredients preview */}
                {isBlend && (
                  <HStack mt={2} flexWrap="wrap" gap={1}>
                    {roast.ingredients.map((ing, idx) => (
                      <Badge key={idx} variant="subtle" fontSize="xs">
                        {ing.beanName}
                      </Badge>
                    ))}
                  </HStack>
                )}
              </Box>
            );
          })}
        </SimpleGrid>
      )}
    </Box>
  );
}
