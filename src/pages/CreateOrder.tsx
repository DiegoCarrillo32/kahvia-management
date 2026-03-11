import { useState } from "react";
import {
  Box,
  Button,
  Flex,
  Heading,
  Input,
  Select,
  Textarea,
  SimpleGrid,
  Switch,
  FormControl,
  FormLabel,
  useToast,
  IconButton,
} from "@chakra-ui/react";
import { ArrowLeft } from "lucide-react";
import { createOrder, updateOrder } from "../services/orderService";
import { Order, CoffeeStyle, CoffeeAmount } from "../types/order";

const COFFEE_STYLES: CoffeeStyle[] = [
  "Grano Entero",
  "Molido",
  "Espresso",
  "Prensa Francesa",
  "Filtro",
];
const COFFEE_AMOUNTS: CoffeeAmount[] = ["250g", "500g", "1kg"];

interface CreateOrderProps {
  onClose: () => void;
  onCreated: () => void;
  editOrder?: Order;
}

export default function CreateOrder({ onClose, onCreated, editOrder }: CreateOrderProps) {
  const toast = useToast();
  const [submitting, setSubmitting] = useState(false);
  const isEditing = !!editOrder;

  const [form, setForm] = useState({
    clientName: editOrder?.clientName || "",
    clientPhone: editOrder?.clientPhone || "",
    deliveryAddress: editOrder?.deliveryAddress || "",
    orderPrice: editOrder?.orderPrice || 0,
    coffeeStyle: (editOrder?.coffeeStyle || "Grano Entero") as CoffeeStyle,
    amount: (editOrder?.amount || "250g") as CoffeeAmount,
    notes: editOrder?.notes || "",
    paid: editOrder?.paid || false,
  });

  const update = (field: string, value: string | number | boolean) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.clientName || !form.clientPhone || !form.deliveryAddress) {
      toast({
        title: "Completa los campos requeridos",
        status: "warning",
        duration: 2500,
      });
      return;
    }

    setSubmitting(true);
    try {
      if (isEditing && editOrder?.id) {
        await updateOrder(editOrder.id, form);
        toast({ title: "Orden actualizada", status: "success" });
      } else {
        await createOrder(form);
        toast({ title: "Orden creada exitosamente", status: "success" });
      }
      onCreated();
    } catch {
      toast({ title: isEditing ? "Error al actualizar" : "Error al crear la orden", status: "error" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box p={{ base: 4, md: 8 }} pb={{ base: 24, md: 8 }} bg="var(--color-white-pergamino)" minH="100vh">
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
          {isEditing ? "Editar Orden" : "Nueva Orden"}
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
        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} mb={4}>
          <FormControl isRequired>
            <FormLabel fontSize="sm" color="gray.600">
              Nombre del cliente
            </FormLabel>
            <Input
              placeholder="Juan Pérez"
              value={form.clientName}
              onChange={(e) => update("clientName", e.target.value)}
            />
          </FormControl>

          <FormControl isRequired>
            <FormLabel fontSize="sm" color="gray.600">
              Teléfono (con código de país)
            </FormLabel>
            <Input
              placeholder="+52 123 456 7890"
              value={form.clientPhone}
              onChange={(e) => update("clientPhone", e.target.value)}
            />
          </FormControl>

          <FormControl isRequired gridColumn={{ md: "span 2" }}>
            <FormLabel fontSize="sm" color="gray.600">
              Dirección de entrega
            </FormLabel>
            <Input
              placeholder="Calle, número, colonia, ciudad"
              value={form.deliveryAddress}
              onChange={(e) => update("deliveryAddress", e.target.value)}
            />
          </FormControl>

          <FormControl>
            <FormLabel fontSize="sm" color="gray.600">
              Estilo de café
            </FormLabel>
            <Select
              value={form.coffeeStyle}
              onChange={(e) => update("coffeeStyle", e.target.value)}
            >
              {COFFEE_STYLES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </Select>
          </FormControl>

          <FormControl>
            <FormLabel fontSize="sm" color="gray.600">
              Cantidad
            </FormLabel>
            <Select
              value={form.amount}
              onChange={(e) => update("amount", e.target.value)}
            >
              {COFFEE_AMOUNTS.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </Select>
          </FormControl>

          <FormControl>
            <FormLabel fontSize="sm" color="gray.600">
              Precio (₡)
            </FormLabel>
            <Input
              type="number"
              placeholder="0"
              value={form.orderPrice || ""}
              onChange={(e) =>
                update("orderPrice", parseFloat(e.target.value) || 0)
              }
            />
          </FormControl>

          <FormControl display="flex" alignItems="center" pt={8}>
            <FormLabel
              htmlFor="paid-switch"
              mb="0"
              fontSize="sm"
              color="gray.600"
            >
              ¿Pagado?
            </FormLabel>
            <Switch
              id="paid-switch"
              colorScheme="green"
              isChecked={form.paid}
              onChange={(e) => update("paid", e.target.checked)}
            />
          </FormControl>
        </SimpleGrid>

        <FormControl mb={6}>
          <FormLabel fontSize="sm" color="gray.600">
            Notas
          </FormLabel>
          <Textarea
            placeholder="Instrucciones especiales, preferencias..."
            value={form.notes}
            onChange={(e) => update("notes", e.target.value)}
            rows={3}
          />
        </FormControl>

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
            {isEditing ? "Guardar Cambios" : "Crear Orden"}
          </Button>
          <Button variant="outline" onClick={onClose} flex={1}>
            Cancelar
          </Button>
        </Flex>
      </Box>
    </Box>
  );
}
