import { useCallback, useEffect, useState } from "react";
import {
  Box,
  Flex,
  Heading,
  Text,
  Button,
  SimpleGrid,
  HStack,
  useToast,
  VStack,
  Divider,
  Badge,
} from "@chakra-ui/react";
import { Plus, Package, ChevronRight } from "lucide-react";
import { getInventory } from "../services/inventoryService";
import { CoffeeBean } from "../types/inventory";
import BeanDetail from "./BeanDetail";
import BeanForm from "./BeanForm";

type ViewMode = "list" | "create" | "detail" | "edit";

export default function Inventory() {
  const [beans, setBeans] = useState<CoffeeBean[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [selectedBean, setSelectedBean] = useState<CoffeeBean | null>(null);
  const toast = useToast();

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getInventory();
      setBeans(data);
      // Refresh selected bean data if viewing detail
      if (selectedBean) {
        const updated = data.find((b) => b.id === selectedBean.id);
        if (updated) setSelectedBean(updated);
        else {
          setSelectedBean(null);
          setViewMode("list");
        }
      }
    } catch {
      toast({ title: "Error cargando inventario", status: "error" });
    } finally {
      setLoading(false);
    }
  }, [toast, selectedBean]);

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --- VIEW MODES ---

  if (viewMode === "create") {
    return (
      <BeanForm
        onClose={() => setViewMode("list")}
        onSaved={() => {
          setViewMode("list");
          fetchData();
        }}
      />
    );
  }

  if (viewMode === "edit" && selectedBean) {
    return (
      <BeanForm
        editBean={selectedBean}
        onClose={() => setViewMode("detail")}
        onSaved={() => {
          setViewMode("list");
          fetchData();
        }}
      />
    );
  }

  if (viewMode === "detail" && selectedBean) {
    return (
      <BeanDetail
        bean={selectedBean}
        onBack={() => {
          setSelectedBean(null);
          setViewMode("list");
          fetchData();
        }}
        onEdit={() => setViewMode("edit")}
        onRefresh={fetchData}
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
          Inventario de Granos
        </Heading>
        <Button
          leftIcon={<Plus size={18} />}
          bg="var(--color-warm-roast)"
          color="white"
          _hover={{ bg: "var(--color-expresso)" }}
          onClick={() => setViewMode("create")}
          w={{ base: "100%", sm: "auto" }}
        >
          Agregar Grano
        </Button>
      </Flex>

      {loading ? (
        <Text color="var(--color-expresso)">Cargando inventario...</Text>
      ) : beans.length === 0 ? (
        <Flex
          direction="column"
          align="center"
          justify="center"
          p={{ base: 8, md: 12 }}
          bg="white"
          borderRadius="lg"
          shadow="sm"
        >
          <Package size={48} color="var(--color-warm-roast)" opacity={0.5} />
          <Text mt={4} color="gray.500" fontSize="lg">
            No hay granos en inventario
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
            Agregar primer grano
          </Button>
        </Flex>
      ) : (
        <SimpleGrid columns={{ base: 1, md: 2, xl: 3 }} spacing={4}>
          {beans.map((bean) => (
            <Box
              key={bean.id}
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
                setSelectedBean(bean);
                setViewMode("detail");
              }}
            >
              <Flex justify="space-between" align="start" mb={2}>
                <VStack align="start" spacing={0}>
                  <Text
                    fontWeight="bold"
                    fontSize={{ base: "md", md: "lg" }}
                    color="var(--color-expresso)"
                  >
                    {bean.name}
                  </Text>
                  <Text fontSize="sm" color="gray.500">
                    {bean.origin} • {bean.roastProfile}
                  </Text>
                </VStack>
                <Flex align="center" gap={1}>
                  {bean.amountGrams < 1000 && (
                    <Badge colorScheme="red" fontSize="xs">
                      Bajo
                    </Badge>
                  )}
                  <ChevronRight size={16} color="gray" />
                </Flex>
              </Flex>

              <Divider my={2} />

              <SimpleGrid columns={2} spacing={2}>
                <Box>
                  <Text fontSize="xs" color="gray.500" textTransform="uppercase">
                    Cantidad
                  </Text>
                  <HStack>
                    <Package size={14} color="var(--color-coffee-fruit)" />
                    <Text
                      fontWeight="bold"
                      color={
                        bean.amountGrams < 1000
                          ? "red.500"
                          : "var(--color-expresso)"
                      }
                    >
                      {bean.amountGrams.toLocaleString()}g
                    </Text>
                  </HStack>
                </Box>
                <Box>
                  <Text fontSize="xs" color="gray.500" textTransform="uppercase">
                    Costo/Kg
                  </Text>
                  <Text fontWeight="medium" color="var(--color-coffee-fruit)">
                    {bean.costPerKg
                      ? `₡${bean.costPerKg.toLocaleString()}`
                      : "—"}
                  </Text>
                </Box>
                {bean.avgHumidity != null && bean.avgHumidity > 0 && (
                  <Box>
                    <Text fontSize="xs" color="gray.500" textTransform="uppercase">
                      Humedad
                    </Text>
                    <Text fontWeight="medium">{bean.avgHumidity}%</Text>
                  </Box>
                )}
                {bean.avgDensity != null && bean.avgDensity > 0 && (
                  <Box>
                    <Text fontSize="xs" color="gray.500" textTransform="uppercase">
                      Densidad
                    </Text>
                    <Text fontWeight="medium">{bean.avgDensity} g/L</Text>
                  </Box>
                )}
              </SimpleGrid>
            </Box>
          ))}
        </SimpleGrid>
      )}
    </Box>
  );
}
