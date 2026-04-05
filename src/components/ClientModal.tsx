import React, { useState, useEffect } from "react";
import {
  Drawer,
  DrawerBody,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  Button,
  FormControl,
  FormLabel,
  Input,
  VStack,
  useToast,
  Box,
  Text,
  Badge,
  HStack,
  Flex,
  Divider,
} from "@chakra-ui/react";
import { Client } from "../types/client";
import { useCreateClient, useUpdateClient, useDeleteClient } from "../hooks/useClients";
import { useOrdersByClient } from "../hooks/useOrders";
import { Coffee, MapPin, Calendar } from "lucide-react";

interface ClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  client?: Client | null;
}

export default function ClientModal({ isOpen, onClose, client }: ClientModalProps) {
  const isEditing = !!client;
  const [form, setForm] = useState({
    name: "",
    phoneNumber: "",
    deliveryDirection: "",
  });

  const { mutateAsync: createClient, isPending: creating } = useCreateClient();
  const { mutateAsync: updateClient, isPending: updating } = useUpdateClient();
  const { mutateAsync: deleteClient, isPending: deleting } = useDeleteClient();
  const { data: pastOrders = [], isLoading: loadingOrders } = useOrdersByClient(client?.id || "");
  const toast = useToast();

  useEffect(() => {
    if (client) {
      setForm({
        name: client.name,
        phoneNumber: client.phoneNumber,
        deliveryDirection: client.deliveryDirection,
      });
    } else {
      setForm({ name: "", phoneNumber: "", deliveryDirection: "" });
    }
  }, [client, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isEditing && client?.id) {
        await updateClient({ clientId: client.id, data: form });
        toast({ title: "Cliente actualizado", status: "success" });
      } else {
        await createClient(form);
        toast({ title: "Cliente creado exitosamente", status: "success" });
      }
      onClose();
    } catch {
      toast({ title: "Hubo un error", status: "error" });
    }
  };

  const handleDelete = async () => {
    if (client?.id && window.confirm("¿Seguro que deseas eliminar este cliente?")) {
      try {
        await deleteClient(client.id);
        toast({ title: "Cliente eliminado", status: "success" });
        onClose();
      } catch {
        toast({ title: "No se pudo eliminar el cliente", status: "error" });
      }
    }
  };

  const formatDate = (timestamp: unknown) => {
    if (!timestamp) return "—";
    const ts = timestamp as { toDate?: () => Date };
    return ts.toDate
      ? ts.toDate().toLocaleDateString()
      : new Date(timestamp as string | number | Date).toLocaleDateString();
  };

  return (
    <Drawer isOpen={isOpen} placement="right" onClose={onClose} size="md">
      <DrawerOverlay />
      <DrawerContent bg="var(--color-white-pergamino)">
        <DrawerCloseButton />
        <DrawerHeader color="var(--color-expresso)" fontFamily="heading">
          {isEditing ? "Detalle de Cliente" : "Nuevo Cliente"}
        </DrawerHeader>

        <DrawerBody>
          <VStack spacing={4} as="form" id="client-form" onSubmit={handleSubmit}>
            <FormControl isRequired>
              <FormLabel>Nombre o Empresa</FormLabel>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                bg="white"
              />
            </FormControl>
            <FormControl isRequired>
              <FormLabel>Teléfono</FormLabel>
              <Input
                value={form.phoneNumber}
                onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })}
                bg="white"
              />
            </FormControl>
            <FormControl isRequired>
              <FormLabel>Dirección principal</FormLabel>
              <Input
                value={form.deliveryDirection}
                onChange={(e) => setForm({ ...form, deliveryDirection: e.target.value })}
                bg="white"
              />
            </FormControl>
          </VStack>

          {isEditing && (
            <Box mt={10}>
              <Text fontSize="lg" fontWeight="bold" color="var(--color-expresso)" mb={4}>
                Historial de Órdenes
              </Text>
              <Divider mb={4} />
              
              {loadingOrders ? (
                <Text color="gray.500">Cargando órdenes...</Text>
              ) : pastOrders.length === 0 ? (
                <Text color="gray.500">No hay órdenes para este cliente.</Text>
              ) : (
                <VStack spacing={3} align="stretch" maxH="300px" overflowY="auto" pr={2}>
                  {pastOrders.map((order) => (
                    <Box key={order.id} bg="white" p={3} borderRadius="md" shadow="sm" borderWidth={1}>
                      <Flex justify="space-between" mb={2}>
                        <HStack>
                          <Coffee size={16} color="var(--color-expresso)" />
                          <Text fontWeight="bold" fontSize="sm">{order.coffeeStyle} - {order.amount}</Text>
                        </HStack>
                        <Badge colorScheme={order.status === 'Entregado' ? 'green' : 'yellow'}>{order.status}</Badge>
                      </Flex>
                      <Flex justify="space-between" fontSize="xs" color="gray.500">
                        <HStack>
                          <Calendar size={12} />
                          <Text>{formatDate(order.createdAt)}</Text>
                        </HStack>
                        <Text fontWeight="bold" color="var(--color-coffee-fruit)">₡{order.orderPrice.toLocaleString()}</Text>
                      </Flex>
                      {order.deliveryAddress !== client.deliveryDirection && (
                         <HStack fontSize="xs" color="gray.400" mt={1}>
                           <MapPin size={12} />
                           <Text isTruncated>{order.deliveryAddress}</Text>
                         </HStack>
                      )}
                    </Box>
                  ))}
                </VStack>
              )}
            </Box>
          )}
        </DrawerBody>

        <DrawerFooter>
          {isEditing && (
            <Button variant="ghost" colorScheme="red" mr="auto" onClick={handleDelete} isLoading={deleting}>
              Eliminar
            </Button>
          )}
          <Button variant="outline" mr={3} onClick={onClose}>
            Cancelar
          </Button>
          <Button
            bg="var(--color-warm-roast)"
            color="white"
            _hover={{ bg: "var(--color-expresso)" }}
            type="submit"
            form="client-form"
            isLoading={creating || updating}
          >
            Guardar
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
