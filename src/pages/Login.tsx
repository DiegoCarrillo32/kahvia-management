import React, { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../lib/firebase";
import { useAuth } from "../lib/auth";
import { Navigate, useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Flex,
  Input,
  Text,
  VStack,
  useToast,
} from "@chakra-ui/react";

import { Coffee } from "lucide-react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  if (user) {
    return <Navigate to="/" replace />;
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/");
    } catch (error) {
      console.log(error);

      toast({
        title: "Error de autenticación",
        description:
          error instanceof Error ? error.message : "Error desconocido",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Flex minH="100vh" align="center" justify="center" bg="var(--color-bg)">
      <Box
        p={8}
        maxWidth="400px"
        borderWidth={1}
        borderRadius={8}
        boxShadow="lg"
        bg="white"
        w="full"
      >
        <VStack spacing={6} as="form" onSubmit={handleLogin}>
          <Flex direction="column" align="center">
            <Coffee size={48} color="var(--color-expresso)" />
            <Text
              fontSize="2xl"
              fontFamily="heading"
              color="var(--color-expresso)"
              mt={4}
            >
              Kahvia Admin
            </Text>
          </Flex>

          <Input
            placeholder="Correo electrónico"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            bg="gray.50"
            borderColor="gray.300"
            _focus={{ borderColor: "var(--color-warm-roast)" }}
          />
          <Input
            placeholder="Contraseña"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            bg="gray.50"
            borderColor="gray.300"
            _focus={{ borderColor: "var(--color-warm-roast)" }}
          />

          <Button
            type="submit"
            isLoading={loading}
            width="full"
            bg="var(--color-warm-roast)"
            color="white"
            _hover={{ bg: "var(--color-expresso)" }}
            fontFamily="heading"
          >
            Entrar
          </Button>
        </VStack>
      </Box>
    </Flex>
  );
}
