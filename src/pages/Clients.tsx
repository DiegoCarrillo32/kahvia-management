import { useState } from "react";
import {
  Box,
  Flex,
  Heading,
  Button,
  SimpleGrid,
  Text,
  useDisclosure,
  VStack,
  HStack,
  Icon,
} from "@chakra-ui/react";
import { Plus, Users, MapPin, Phone } from "lucide-react";
import { useClients } from "../hooks/useClients";
import { Client } from "../types/client";
import ClientModal from "../components/ClientModal";

export default function Clients() {
  const { data: clients = [], isLoading } = useClients();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

  const handleOpenModal = (client?: Client) => {
    setSelectedClient(client || null);
    onOpen();
  };

  const handleCloseModal = () => {
    setSelectedClient(null);
    onClose();
  };

  return (
    <Box
      p={{ base: 4, md: 8 }}
      pb={{ base: 24, md: 8 }}
      bg="var(--color-white-pergamino)"
      minH="100vh"
    >
      <Flex justify="space-between" align="center" mb={6}>
        <Heading
          as="h1"
          size={{ base: "md", md: "lg" }}
          color="var(--color-expresso)"
          fontFamily="heading"
        >
          Cartera de Clientes
        </Heading>
        <Button
          leftIcon={<Plus size={16} />}
          bg="var(--color-warm-roast)"
          color="white"
          _hover={{ bg: "var(--color-expresso)" }}
          size="sm"
          onClick={() => handleOpenModal()}
        >
          Nuevo Cliente
        </Button>
      </Flex>

      {isLoading ? (
        <Text color="var(--color-expresso)">Cargando clientes...</Text>
      ) : clients.length === 0 ? (
        <Flex
          direction="column"
          align="center"
          justify="center"
          p={{ base: 8, md: 12 }}
          bg="white"
          borderRadius="lg"
          shadow="sm"
        >
          <Users size={48} color="var(--color-warm-roast)" opacity={0.5} />
          <Text mt={4} color="gray.500" fontSize="lg">
            No tienes clientes registrados aún
          </Text>
        </Flex>
      ) : (
        <SimpleGrid columns={{ base: 1, md: 2, xl: 3 }} spacing={4}>
          {clients.map((client) => (
            <Box
              key={client.id}
              bg="white"
              p={{ base: 4, md: 5 }}
              borderRadius="xl"
              shadow="md"
              borderWidth={1}
              borderColor="gray.100"
              transition="all 0.2s"
              _hover={{ shadow: "lg", transform: "translateY(-2px)" }}
              cursor="pointer"
              onClick={() => handleOpenModal(client)}
            >
              <VStack align="start" spacing={3}>
                <Flex w="full" justify="space-between" align="center">
                  <Text
                    fontWeight="bold"
                    fontSize={{ base: "md", md: "lg" }}
                    color="var(--color-expresso)"
                    isTruncated
                  >
                    {client.name}
                  </Text>
                </Flex>

                <VStack align="start" spacing={1} color="gray.500" fontSize="sm">
                  <HStack>
                    <Icon as={Phone} boxSize={3.5} />
                    <Text>{client.phoneNumber}</Text>
                  </HStack>
                  <HStack>
                    <Icon as={MapPin} boxSize={3.5} />
                    <Text isTruncated maxW={{ base: "200px", md: "250px" }}>
                      {client.deliveryDirection}
                    </Text>
                  </HStack>
                </VStack>
              </VStack>
            </Box>
          ))}
        </SimpleGrid>
      )}

      {isOpen && (
        <ClientModal
          isOpen={isOpen}
          onClose={handleCloseModal}
          client={selectedClient}
        />
      )}
    </Box>
  );
}
