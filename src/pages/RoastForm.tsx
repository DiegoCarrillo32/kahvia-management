import { useState, useEffect, useCallback } from "react";
import {
  Box,
  Button,
  Flex,
  Heading,
  Input,
  Select,
  Textarea,
  SimpleGrid,
  FormControl,
  FormLabel,
  useToast,
  IconButton,
  Text,
  HStack,
  Divider,
  Badge,
} from "@chakra-ui/react";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import { useCreateRoast } from "../hooks/useRoasts";
import { getInventory } from "../services/inventoryService";
import { getOrders } from "../services/orderService";
import { CoffeeBean } from "../types/inventory";
import { RoastLevel, RoastIngredient } from "../types/roast";
import { Order } from "../types/order";

const ROAST_LEVELS: RoastLevel[] = [
  "Claro",
  "Medio",
  "Medio-Oscuro",
  "Oscuro",
];

interface RoastFormProps {
  onClose: () => void;
  onCreated: () => void;
  preSelectedBeanId?: string;
  preSelectedOrderId?: string;
}

export default function RoastForm({
  onClose,
  onCreated,
  preSelectedBeanId,
  preSelectedOrderId,
}: RoastFormProps) {
  const toast = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [beans, setBeans] = useState<CoffeeBean[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrderId, setSelectedOrderId] = useState(preSelectedOrderId || "");

  const [ingredients, setIngredients] = useState<RoastIngredient[]>([]);
  const [selectedBeanId, setSelectedBeanId] = useState("");
  const [gramsToAdd, setGramsToAdd] = useState(0);

  const [outputWeight, setOutputWeight] = useState(0);
  const [roastLevel, setRoastLevel] = useState<RoastLevel>("Medio");
  const [durationMinutes, setDurationMinutes] = useState(0);
  const [temperatureCelsius, setTemperatureCelsius] = useState(0);
  const [roasterName, setRoasterName] = useState("");
  const [notes, setNotes] = useState("");

  const fetchBeans = useCallback(async () => {
    try {
      const data = await getInventory();
      setBeans(data);
    } catch {
      toast({ title: "Error cargando granos", status: "error" });
    }
  }, [toast]);

  const fetchOrders = useCallback(async () => {
    try {
      const data = await getOrders();
      setOrders(data);
    } catch {
      toast({ title: "Error cargando órdenes", status: "error" });
    }
  }, [toast]);

  useEffect(() => {
    fetchBeans();
    fetchOrders();
  }, [fetchBeans, fetchOrders]);

  // Pre-select bean if provided
  useEffect(() => {
    if (preSelectedBeanId && beans.length > 0) {
      const bean = beans.find((b) => b.id === preSelectedBeanId);
      if (bean && !ingredients.some((i) => i.beanId === preSelectedBeanId)) {
        setSelectedBeanId(preSelectedBeanId);
      }
    }
  }, [preSelectedBeanId, beans, ingredients]);

  const inputWeight = ingredients.reduce((sum, i) => sum + i.gramsUsed, 0);
  const lossPercentage =
    inputWeight > 0
      ? Math.round(((inputWeight - outputWeight) / inputWeight) * 10000) / 100
      : 0;

  const addIngredient = () => {
    if (!selectedBeanId || gramsToAdd <= 0) {
      toast({ title: "Selecciona un grano y cantidad", status: "warning" });
      return;
    }

    const bean = beans.find((b) => b.id === selectedBeanId);
    if (!bean) return;

    const existingIdx = ingredients.findIndex(
      (i) => i.beanId === selectedBeanId
    );
    if (existingIdx >= 0) {
      // Update existing
      const updated = [...ingredients];
      updated[existingIdx].gramsUsed += gramsToAdd;
      setIngredients(updated);
    } else {
      setIngredients([
        ...ingredients,
        {
          beanId: selectedBeanId,
          beanName: bean.name,
          gramsUsed: gramsToAdd,
        },
      ]);
    }
    setGramsToAdd(0);
    setSelectedBeanId("");
  };

  const removeIngredient = (idx: number) => {
    setIngredients(ingredients.filter((_, i) => i !== idx));
  };

  const { mutateAsync: createRoastMutation } = useCreateRoast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (ingredients.length === 0) {
      toast({ title: "Agrega al menos un grano", status: "warning" });
      return;
    }
    if (outputWeight <= 0) {
      toast({ title: "Ingresa el peso de salida", status: "warning" });
      return;
    }

    // Validate stock
    for (const ing of ingredients) {
      const bean = beans.find((b) => b.id === ing.beanId);
      if (bean && ing.gramsUsed > bean.amountGrams) {
        toast({
          title: `No hay suficiente ${ing.beanName}`,
          description: `Disponible: ${bean.amountGrams}g, Requerido: ${ing.gramsUsed}g`,
          status: "error",
          duration: 4000,
        });
        return;
      }
    }

    setSubmitting(true);
    try {
      const selectedOrder = orders.find((o) => o.id === selectedOrderId);
      await createRoastMutation({
        ingredients,
        inputWeightGrams: inputWeight,
        outputWeightGrams: outputWeight,
        roastLevel,
        durationMinutes: durationMinutes || undefined,
        temperatureCelsius: temperatureCelsius || undefined,
        roasterName: roasterName || undefined,
        notes: notes || undefined,
        roastedAt: new Date(),
        orderId: selectedOrderId || undefined,
        orderClientName: selectedOrder?.clientName || undefined,
      });
      toast({ title: "Tostado registrado", status: "success" });
      onCreated();
    } catch {
      toast({ title: "Error al registrar tostado", status: "error" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box
      p={{ base: 4, md: 8 }}
      pb={{ base: 24, md: 8 }}
      bg="var(--color-white-pergamino)"
      minH="100vh"
    >
      <Flex align="center" gap={3} mb={6}>
        <IconButton
          aria-label="Volver"
          icon={<ArrowLeft size={20} />}
          variant="ghost"
          onClick={onClose}
          color="var(--color-expresso)"
        />
        <Heading
          as="h1"
          size={{ base: "md", md: "lg" }}
          color="var(--color-expresso)"
          fontFamily="heading"
        >
          Nuevo Tostado
        </Heading>
      </Flex>

      <Box
        as="form"
        onSubmit={handleSubmit}
        bg="white"
        p={{ base: 4, md: 6 }}
        borderRadius="xl"
        shadow="md"
        maxW="800px"
      >
        {/* Order Selector */}
        <Heading size="sm" mb={3} color="var(--color-expresso)">
          Orden Asociada
        </Heading>
        <FormControl mb={4}>
          <Select
            placeholder="Sin orden asociada"
            value={selectedOrderId}
            onChange={(e) => setSelectedOrderId(e.target.value)}
          >
            {orders.map((order) => (
              <option key={order.id} value={order.id}>
                {order.clientName} — {order.coffeeStyle} {order.amount}
              </option>
            ))}
          </Select>
        </FormControl>

        <Divider my={4} />

        {/* Bean Selector */}
        <Heading size="sm" mb={3} color="var(--color-expresso)">
          Granos a Tostar
        </Heading>

        <Flex gap={2} mb={3} direction={{ base: "column", sm: "row" }}>
          <Select
            flex={2}
            placeholder="Seleccionar grano..."
            value={selectedBeanId}
            onChange={(e) => setSelectedBeanId(e.target.value)}
          >
            {beans.map((bean) => (
              <option key={bean.id} value={bean.id}>
                {bean.name} — {bean.amountGrams.toLocaleString()}g disponibles
              </option>
            ))}
          </Select>
          <Input
            flex={1}
            type="number"
            placeholder="Gramos"
            value={gramsToAdd || ""}
            onChange={(e) => setGramsToAdd(parseInt(e.target.value) || 0)}
          />
          <Button
            leftIcon={<Plus size={16} />}
            colorScheme="blue"
            variant="outline"
            onClick={addIngredient}
            flexShrink={0}
          >
            Agregar
          </Button>
        </Flex>

        {/* Ingredients List */}
        {ingredients.length > 0 && (
          <Box
            bg="gray.50"
            p={3}
            borderRadius="md"
            mb={4}
          >
            {ingredients.map((ing, idx) => (
              <Flex
                key={idx}
                justify="space-between"
                align="center"
                py={2}
                borderBottomWidth={idx < ingredients.length - 1 ? 1 : 0}
                borderColor="gray.200"
              >
                <HStack>
                  <Text fontWeight="medium">{ing.beanName}</Text>
                  <Badge colorScheme="blue">{ing.gramsUsed}g</Badge>
                </HStack>
                <IconButton
                  aria-label="Eliminar"
                  icon={<Trash2 size={14} />}
                  size="xs"
                  variant="ghost"
                  colorScheme="red"
                  onClick={() => removeIngredient(idx)}
                />
              </Flex>
            ))}
            <Divider my={2} />
            <Text fontWeight="bold" color="var(--color-expresso)">
              Peso total entrada: {inputWeight.toLocaleString()}g
            </Text>
          </Box>
        )}

        <Divider my={4} />

        {/* Roast Details */}
        <Heading size="sm" mb={3} color="var(--color-expresso)">
          Detalles del Tostado
        </Heading>

        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} mb={4}>
          <FormControl isRequired>
            <FormLabel fontSize="sm" color="gray.600">
              Peso de Salida (g)
            </FormLabel>
            <Input
              type="number"
              placeholder="Peso después de tostar"
              value={outputWeight || ""}
              onChange={(e) =>
                setOutputWeight(parseInt(e.target.value) || 0)
              }
            />
            {inputWeight > 0 && outputWeight > 0 && (
              <Text
                fontSize="xs"
                mt={1}
                color={lossPercentage > 20 ? "red.500" : "green.600"}
              >
                Pérdida: {lossPercentage}%
              </Text>
            )}
          </FormControl>

          <FormControl isRequired>
            <FormLabel fontSize="sm" color="gray.600">
              Nivel de Tueste
            </FormLabel>
            <Select
              value={roastLevel}
              onChange={(e) =>
                setRoastLevel(e.target.value as RoastLevel)
              }
            >
              {ROAST_LEVELS.map((level) => (
                <option key={level} value={level}>
                  {level}
                </option>
              ))}
            </Select>
          </FormControl>

          <FormControl>
            <FormLabel fontSize="sm" color="gray.600">
              Duración (minutos)
            </FormLabel>
            <Input
              type="number"
              placeholder="Ej. 12"
              value={durationMinutes || ""}
              onChange={(e) =>
                setDurationMinutes(parseInt(e.target.value) || 0)
              }
            />
          </FormControl>

          <FormControl>
            <FormLabel fontSize="sm" color="gray.600">
              Temperatura (°C)
            </FormLabel>
            <Input
              type="number"
              placeholder="Ej. 210"
              value={temperatureCelsius || ""}
              onChange={(e) =>
                setTemperatureCelsius(parseInt(e.target.value) || 0)
              }
            />
          </FormControl>

          <FormControl gridColumn={{ md: "span 2" }}>
            <FormLabel fontSize="sm" color="gray.600">
              Tostador
            </FormLabel>
            <Input
              placeholder="Nombre de quien tostó"
              value={roasterName}
              onChange={(e) => setRoasterName(e.target.value)}
            />
          </FormControl>
        </SimpleGrid>

        <FormControl mb={6}>
          <FormLabel fontSize="sm" color="gray.600">
            Notas
          </FormLabel>
          <Textarea
            placeholder="Observaciones del tostado..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
          />
        </FormControl>

        {/* Summary */}
        {ingredients.length > 0 && outputWeight > 0 && (
          <Box
            bg="orange.50"
            p={4}
            borderRadius="md"
            mb={4}
            borderWidth={1}
            borderColor="orange.200"
          >
            <Text fontWeight="bold" color="var(--color-expresso)" mb={1}>
              Resumen del Tostado
            </Text>
            <Text fontSize="sm">
              {ingredients.length === 1
                ? `${ingredients[0].beanName}`
                : `Blend (${ingredients.length} granos)`}{" "}
              • {inputWeight}g → {outputWeight}g • Pérdida: {lossPercentage}%
              • {roastLevel}
            </Text>
          </Box>
        )}

        <Flex gap={3} direction={{ base: "column", sm: "row" }}>
          <Button
            type="submit"
            isLoading={submitting}
            bg="var(--color-warm-roast)"
            color="white"
            _hover={{ bg: "var(--color-expresso)" }}
            fontFamily="heading"
            flex={1}
          >
            Registrar Tostado
          </Button>
          <Button variant="outline" onClick={onClose} flex={1}>
            Cancelar
          </Button>
        </Flex>
      </Box>
    </Box>
  );
}
