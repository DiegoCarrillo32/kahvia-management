import { useCallback, useEffect, useState } from "react";
import {
  Box,
  Flex,
  Heading,
  Text,
  Button,
  SimpleGrid,
  Input,
  HStack,
  useToast,
  VStack,
  Divider,
} from "@chakra-ui/react";
import { Plus, Package, Edit2, Trash2, Save, X, DollarSign } from "lucide-react";
import {
  getInventory,
  addCoffeeBean,
  updateCoffeeBeanAmount,
  deleteCoffeeBean,
} from "../services/inventoryService";
import { CoffeeBean } from "../types/inventory";

export default function Inventory() {
  const [beans, setBeans] = useState<CoffeeBean[]>([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  const [isAdding, setIsAdding] = useState(false);
  const [newBean, setNewBean] = useState({
    name: "",
    origin: "",
    roastProfile: "",
    amountGrams: 0,
    costPerKg: 0,
  });

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editAmount, setEditAmount] = useState<number>(0);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getInventory();
      setBeans(data);
    } catch {
      toast({ title: "Error cargando inventario", status: "error" });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleAdd = async () => {
    if (!newBean.name || !newBean.origin) {
      toast({ title: "Completa los campos", status: "warning" });
      return;
    }
    try {
      await addCoffeeBean(newBean);
      toast({ title: "Café agregado", status: "success" });
      setIsAdding(false);
      setNewBean({ name: "", origin: "", roastProfile: "", amountGrams: 0, costPerKg: 0 });
      fetchData();
    } catch {
      toast({ title: "Error al agregar", status: "error" });
    }
  };

  const handleSaveEdit = async (id: string) => {
    try {
      await updateCoffeeBeanAmount(id, editAmount);
      toast({ title: "Inventario actualizado", status: "success" });
      setEditingId(null);
      fetchData();
    } catch {
      toast({ title: "Error al actualizar", status: "error" });
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("¿Seguro que deseas eliminar este tipo de grano?")) {
      try {
        await deleteCoffeeBean(id);
        toast({ title: "Grano eliminado", status: "info" });
        fetchData();
      } catch {
        toast({ title: "Error", status: "error" });
      }
    }
  };

  return (
    <Box p={{ base: 4, md: 8 }} pb={{ base: 24, md: 8 }} bg="var(--color-white-pergamino)" minH="100vh">
      <Flex justify="space-between" align="center" mb={6} wrap="wrap" gap={3} direction={{ base: "column", sm: "row" }}>
        <Heading as="h1" size={{ base: "md", md: "lg" }} color="var(--color-expresso)" fontFamily="heading">
          Inventario de Granos
        </Heading>
        <Button
          leftIcon={<Plus size={18} />}
          bg="var(--color-warm-roast)"
          color="white"
          _hover={{ bg: "var(--color-expresso)" }}
          onClick={() => setIsAdding(!isAdding)}
          w={{ base: "100%", sm: "auto" }}
          size={{ base: "md", md: "md" }}
        >
          {isAdding ? "Cancelar" : "Agregar Grano"}
        </Button>
      </Flex>

      {isAdding && (
        <Box
          bg="white"
          p={6}
          borderRadius="xl"
          shadow="md"
          mb={8}
          borderWidth={1}
          borderColor="var(--color-warm-roast)"
        >
          <Heading size="md" mb={4} color="var(--color-expresso)">
            Nuevo Grano de Café
          </Heading>
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} mb={4}>
            <Box>
              <Text fontSize="sm" color="gray.600" mb={1}>
                Nombre / Variedad
              </Text>
              <Input
                placeholder="Ej. Caturra Rojo"
                value={newBean.name}
                onChange={(e) =>
                  setNewBean({ ...newBean, name: e.target.value })
                }
              />
            </Box>
            <Box>
              <Text fontSize="sm" color="gray.600" mb={1}>
                Origen
              </Text>
              <Input
                placeholder="Ej. Veracruz"
                value={newBean.origin}
                onChange={(e) =>
                  setNewBean({ ...newBean, origin: e.target.value })
                }
              />
            </Box>
            <Box>
              <Text fontSize="sm" color="gray.600" mb={1}>
                Perfil de Tueste
              </Text>
              <Input
                placeholder="Ej. Medio-Alto"
                value={newBean.roastProfile}
                onChange={(e) =>
                  setNewBean({ ...newBean, roastProfile: e.target.value })
                }
              />
            </Box>
            <Box>
              <Text fontSize="sm" color="gray.600" mb={1}>
                Cantidad Inicial (Gramos)
              </Text>
              <Input
                type="number"
                placeholder="0"
                value={newBean.amountGrams || ""}
                onChange={(e) =>
                  setNewBean({
                    ...newBean,
                    amountGrams: parseInt(e.target.value) || 0,
                  })
                }
              />
            </Box>
            <Box>
              <Text fontSize="sm" color="gray.600" mb={1}>
                Costo por Kg (₡)
              </Text>
              <Input
                type="number"
                placeholder="0"
                value={newBean.costPerKg || ""}
                onChange={(e) =>
                  setNewBean({
                    ...newBean,
                    costPerKg: parseInt(e.target.value) || 0,
                  })
                }
              />
            </Box>
          </SimpleGrid>
          <Flex gap={3} direction={{ base: "column", sm: "row" }}>
            <Button colorScheme="whatsapp" onClick={handleAdd} size="lg" w={{ base: "100%", sm: "auto" }}>
              Guardar Grano
            </Button>
            <Button variant="outline" onClick={() => setIsAdding(false)} size="lg" w={{ base: "100%", sm: "auto" }}>
              Cancelar
            </Button>
          </Flex>
        </Box>
      )}

      {loading ? (
        <Text color="var(--color-expresso)">Cargando inventario...</Text>
      ) : beans.length === 0 ? (
        <Flex
          direction="column"
          align="center"
          justify="center"
          p={12}
          bg="white"
          borderRadius="lg"
          shadow="sm"
        >
          <Package size={48} color="var(--color-warm-roast)" opacity={0.5} />
          <Text mt={4} color="gray.500" fontSize="lg">
            No hay granos en inventario
          </Text>
        </Flex>
      ) : (
        <SimpleGrid columns={{ base: 1, md: 2, xl: 3 }} spacing={6}>
          {beans.map((bean) => (
            <Box
              key={bean.id}
              bg="white"
              p={6}
              borderRadius="xl"
              shadow="sm"
              borderWidth={1}
              borderColor="gray.200"
            >
              <Flex justify="space-between" align="start" mb={2}>
                <VStack align="start" spacing={0}>
                  <Text
                    fontWeight="bold"
                    fontSize="xl"
                    color="var(--color-expresso)"
                  >
                    {bean.name}
                  </Text>
                  <Text fontSize="sm" color="gray.500">
                    {bean.origin} • {bean.roastProfile}
                  </Text>
                  {bean.costPerKg != null && bean.costPerKg > 0 && (
                    <HStack spacing={1} mt={1}>
                      <DollarSign size={12} color="var(--color-coffee-fruit)" />
                      <Text fontSize="xs" color="var(--color-coffee-fruit)" fontWeight="medium">
                        ₡{bean.costPerKg.toLocaleString()}/kg
                      </Text>
                    </HStack>
                  )}
                </VStack>
                <Button
                  size="xs"
                  colorScheme="red"
                  variant="ghost"
                  onClick={() => handleDelete(bean.id!)}
                >
                  <Trash2 size={16} />
                </Button>
              </Flex>

              <Divider my={4} />

              <Flex align="center" justify="space-between" wrap="wrap">
                <HStack>
                  <Package size={20} color="var(--color-coffee-fruit)" />
                  <Text color="gray.600" fontSize="sm">
                    Cantidad actual:
                  </Text>
                </HStack>

                {editingId === bean.id ? (
                  <HStack w={{ base: "100%", sm: "180px" }} mt={{ base: 2, sm: 0 }}>
                    <Input
                      size="md"
                      type="number"
                      value={editAmount}
                      onChange={(e) =>
                        setEditAmount(parseInt(e.target.value) || 0)
                      }
                      autoFocus
                    />
                    <Button
                      size="md"
                      colorScheme="blue"
                      px={3}
                      minW="44px"
                      onClick={() => handleSaveEdit(bean.id!)}
                    >
                      <Save size={18} />
                    </Button>
                    <Button
                      size="md"
                      variant="ghost"
                      px={3}
                      minW="44px"
                      onClick={() => setEditingId(null)}
                    >
                      <X size={18} />
                    </Button>
                  </HStack>
                ) : (
                  <HStack>
                    <Text
                      fontWeight="bold"
                      fontSize="lg"
                      color={
                        bean.amountGrams < 1000
                          ? "red.500"
                          : "var(--color-expresso)"
                      }
                    >
                      {bean.amountGrams.toLocaleString()}g
                    </Text>
                    <Button
                      size="xs"
                      variant="ghost"
                      onClick={() => {
                        setEditingId(bean.id!);
                        setEditAmount(bean.amountGrams);
                      }}
                    >
                      <Edit2 size={14} />
                    </Button>
                  </HStack>
                )}
              </Flex>
              {bean.amountGrams < 1000 && editingId !== bean.id && (
                <Text fontSize="xs" color="red.500" mt={2} textAlign="right">
                  Inv. bajo (≤ 1kg)
                </Text>
              )}
            </Box>
          ))}
        </SimpleGrid>
      )}
    </Box>
  );
}
