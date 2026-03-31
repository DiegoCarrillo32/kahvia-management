import { useState } from "react";
import {
  Box,
  Button,
  Flex,
  Heading,
  Input,
  Textarea,
  SimpleGrid,
  FormControl,
  FormLabel,
  useToast,
  IconButton,
} from "@chakra-ui/react";
import { ArrowLeft } from "lucide-react";
import { useAddCoffeeBean, useUpdateCoffeeBean } from "../hooks/useInventory";
import { CoffeeBean } from "../types/inventory";

interface BeanFormProps {
  onClose: () => void;
  onSaved: () => void;
  editBean?: CoffeeBean;
}

export default function BeanForm({ onClose, onSaved, editBean }: BeanFormProps) {
  const toast = useToast();
  const [submitting, setSubmitting] = useState(false);
  const isEditing = !!editBean;

  const { mutateAsync: addMutation } = useAddCoffeeBean();
  const { mutateAsync: updateMutation } = useUpdateCoffeeBean();

  const [form, setForm] = useState({
    name: editBean?.name || "",
    origin: editBean?.origin || "",
    roastProfile: editBean?.roastProfile || "",
    amountGrams: editBean?.amountGrams || 0,
    costPerKg: editBean?.costPerKg || 0,
    boughtAt: editBean?.boughtAt || "",
    notes: editBean?.notes || "",
    avgDensity: editBean?.avgDensity || 0,
    avgHumidity: editBean?.avgHumidity || 0,
  });

  const update = (field: string, value: string | number) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.name || !form.origin) {
      toast({
        title: "Completa nombre y origen",
        status: "warning",
        duration: 2500,
      });
      return;
    }

    setSubmitting(true);
    try {
      if (isEditing && editBean?.id) {
        await updateMutation({ id: editBean.id, data: form });
        toast({ title: "Grano actualizado", status: "success" });
      } else {
        await addMutation(form);
        toast({ title: "Grano agregado", status: "success" });
      }
      onSaved();
    } catch {
      toast({
        title: isEditing ? "Error al actualizar" : "Error al agregar",
        status: "error",
      });
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
          {isEditing ? "Editar Grano" : "Nuevo Grano de Café"}
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
              Nombre / Variedad
            </FormLabel>
            <Input
              placeholder="Ej. Caturra Rojo"
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
            />
          </FormControl>

          <FormControl isRequired>
            <FormLabel fontSize="sm" color="gray.600">
              Origen
            </FormLabel>
            <Input
              placeholder="Ej. Tarrazú, Costa Rica"
              value={form.origin}
              onChange={(e) => update("origin", e.target.value)}
            />
          </FormControl>

          <FormControl>
            <FormLabel fontSize="sm" color="gray.600">
              Perfil de Tueste
            </FormLabel>
            <Input
              placeholder="Ej. Medio-Alto"
              value={form.roastProfile}
              onChange={(e) => update("roastProfile", e.target.value)}
            />
          </FormControl>

          <FormControl>
            <FormLabel fontSize="sm" color="gray.600">
              Cantidad (Gramos)
            </FormLabel>
            <Input
              type="number"
              placeholder="0"
              value={form.amountGrams || ""}
              onChange={(e) =>
                update("amountGrams", parseInt(e.target.value) || 0)
              }
            />
          </FormControl>

          <FormControl>
            <FormLabel fontSize="sm" color="gray.600">
              Costo por Kg (₡)
            </FormLabel>
            <Input
              type="number"
              placeholder="0"
              value={form.costPerKg || ""}
              onChange={(e) =>
                update("costPerKg", parseInt(e.target.value) || 0)
              }
            />
          </FormControl>

          <FormControl>
            <FormLabel fontSize="sm" color="gray.600">
              Fecha de Compra
            </FormLabel>
            <Input
              type="date"
              value={form.boughtAt}
              onChange={(e) => update("boughtAt", e.target.value)}
            />
          </FormControl>

          <FormControl>
            <FormLabel fontSize="sm" color="gray.600">
              Densidad Promedio (g/L)
            </FormLabel>
            <Input
              type="number"
              step="0.1"
              placeholder="Ej. 680"
              value={form.avgDensity || ""}
              onChange={(e) =>
                update("avgDensity", parseFloat(e.target.value) || 0)
              }
            />
          </FormControl>

          <FormControl>
            <FormLabel fontSize="sm" color="gray.600">
              Humedad Promedio (%)
            </FormLabel>
            <Input
              type="number"
              step="0.1"
              placeholder="Ej. 11.5"
              value={form.avgHumidity || ""}
              onChange={(e) =>
                update("avgHumidity", parseFloat(e.target.value) || 0)
              }
            />
          </FormControl>
        </SimpleGrid>

        <FormControl mb={6}>
          <FormLabel fontSize="sm" color="gray.600">
            Notas
          </FormLabel>
          <Textarea
            placeholder="Notas sobre el grano, calidad, observaciones..."
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
            {isEditing ? "Guardar Cambios" : "Agregar Grano"}
          </Button>
          <Button variant="outline" onClick={onClose} flex={1}>
            Cancelar
          </Button>
        </Flex>
      </Box>
    </Box>
  );
}
