import { BrowserRouter, Routes, Route, Navigate, Link, useLocation } from "react-router-dom";
import { AuthProvider, useAuth } from "./lib/auth";
import {
  Box,
  Flex,
  Button,
  IconButton,
  useDisclosure,
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  DrawerBody,
  useBreakpointValue,
} from "@chakra-ui/react";
import {
  LogOut,
  Menu,
  ClipboardList,
  Package,
  BarChart3,
  Flame,
  Network
} from "lucide-react";
import Dashboard from "./pages/Dashboard";
import Inventory from "./pages/Inventory";
import Roasts from "./pages/Roasts";
import Clients from "./pages/Clients";
import Partnerships from "./pages/Partnerships";
import Metrics from "./pages/Metrics";
import Login from "./pages/Login";
import OrderDetail from "./pages/OrderDetail";
import BeanDetail from "./pages/BeanDetail";
import RoastDetail from "./pages/RoastDetail";

const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

const MobileBottomNav = () => {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;

  return (
    <Flex
      display={{ base: "flex", md: "none" }}
      position="fixed"
      bottom={0}
      left={0}
      right={0}
      bg="var(--color-expresso)"
      zIndex={100}
      justify="space-around"
      py={2}
      px={1}
      borderTopWidth={1}
      borderColor="whiteAlpha.200"
    >
      <Link to="/">
        <Flex
          direction="column"
          align="center"
          px={3}
          py={1}
          borderRadius="md"
          bg={isActive("/") ? "whiteAlpha.200" : "transparent"}
          color="white"
          fontSize="xs"
          gap={1}
        >
          <ClipboardList size={20} />
          Órdenes
        </Flex>
      </Link>
      <Link to="/inventory">
        <Flex
          direction="column"
          align="center"
          px={3}
          py={1}
          borderRadius="md"
          bg={isActive("/inventory") ? "whiteAlpha.200" : "transparent"}
          color="white"
          fontSize="xs"
          gap={1}
        >
          <Package size={20} />
          Inventario
        </Flex>
      </Link>
      <Link to="/clients">
        <Flex
          direction="column"
          align="center"
          px={3}
          py={1}
          borderRadius="md"
          bg={isActive("/clients") ? "whiteAlpha.200" : "transparent"}
          color="white"
          fontSize="xs"
          gap={1}
        >
          <BarChart3 size={20} />
          Clientes
        </Flex>
      </Link>
      <Link to="/roasts">
        <Flex
          direction="column"
          align="center"
          px={3}
          py={1}
          borderRadius="md"
          bg={isActive("/roasts") ? "whiteAlpha.200" : "transparent"}
          color="white"
          fontSize="xs"
          gap={1}
        >
          <Flame size={20} />
          Tostados
        </Flex>
      </Link>
      <Link to="/metrics">
        <Flex
          direction="column"
          align="center"
          px={3}
          py={1}
          borderRadius="md"
          bg={isActive("/metrics") ? "whiteAlpha.200" : "transparent"}
          color="white"
          fontSize="xs"
          gap={1}
        >
          <BarChart3 size={20} />
          Métricas
        </Flex>
      </Link>
      <Link to="/partnerships">
        <Flex
          direction="column"
          align="center"
          px={3}
          py={1}
          borderRadius="md"
          bg={isActive("/partnerships") ? "whiteAlpha.200" : "transparent"}
          color="white"
          fontSize="xs"
          gap={1}
        >
          <Network size={20} />
          B2B
        </Flex>
      </Link>
    </Flex>
  );
};

const SidebarContent = ({ onClose }: { onClose?: () => void }) => {
  const { logout } = useAuth();

  return (
    <Flex direction="column" h="100%" p={6}>
      <Flex align="center" gap={3} mb={8}>
        <img
          src="/assets/images/LOGO-05.svg"
          alt="Kahvia Logo"
          style={{
            width: "40px",
            height: "40px",
            filter: "brightness(0) invert(1)",
          }}
        />
        <h1 className="font-heading text-2xl text-white-pergamino">Kahvia</h1>
      </Flex>
      <nav className="flex flex-col gap-4 flex-1">
        <Link
          to="/"
          className="hover:text-warm-roast transition-colors py-2"
          onClick={onClose}
        >
          Órdenes
        </Link>
        <Link
          to="/inventory"
          className="hover:text-warm-roast transition-colors py-2"
          onClick={onClose}
        >
          Inventario
        </Link>
        <Link
          to="/clients"
          className="hover:text-warm-roast transition-colors py-2"
          onClick={onClose}
        >
          Clientes
        </Link>
        <Link
          to="/roasts"
          className="hover:text-warm-roast transition-colors py-2"
          onClick={onClose}
        >
          Tostados
        </Link>
        <Link
          to="/metrics"
          className="hover:text-warm-roast transition-colors py-2"
          onClick={onClose}
        >
          Métricas
        </Link>
        <Link
          to="/partnerships"
          className="hover:text-warm-roast transition-colors py-2"
          onClick={onClose}
        >
          B2B
        </Link>
      </nav>
      <Button
        mt="auto"
        variant="ghost"
        colorScheme="whiteAlpha"
        color="white"
        leftIcon={<LogOut size={18} />}
        justifyContent="flex-start"
        onClick={() => {
          onClose?.();
          logout();
        }}
        _hover={{ bg: "whiteAlpha.200" }}
      >
        Cerrar sesión
      </Button>
    </Flex>
  );
};

const Layout = ({ children }: { children: React.ReactNode }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const isMobile = useBreakpointValue({ base: true, md: false });

  return (
    <Flex
      h="100vh"
      bg="var(--color-white-pergamino)"
      direction={{ base: "column", md: "row" }}
    >
      {/* Desktop Sidebar */}
      <Box
        display={{ base: "none", md: "flex" }}
        w="250px"
        minW="250px"
        bg="var(--color-expresso)"
        color="white"
        flexDirection="column"
      >
        <SidebarContent />
      </Box>

      {/* Mobile Header */}
      <Flex
        display={{ base: "flex", md: "none" }}
        bg="var(--color-expresso)"
        color="white"
        p={3}
        align="center"
        justify="space-between"
      >
        <Flex align="center" gap={2}>
          <img
            src="/assets/images/LOGO-05.svg"
            alt="Kahvia"
            style={{
              width: "28px",
              height: "28px",
              filter: "brightness(0) invert(1)",
            }}
          />
          <span className="font-heading text-lg text-white-pergamino">
            Kahvia
          </span>
        </Flex>
        <IconButton
          aria-label="Menu"
          icon={<Menu size={22} />}
          variant="ghost"
          color="white"
          _hover={{ bg: "whiteAlpha.200" }}
          onClick={onOpen}
        />
      </Flex>

      {/* Mobile Drawer */}
      {isMobile && (
        <Drawer isOpen={isOpen} placement="left" onClose={onClose}>
          <DrawerOverlay />
          <DrawerContent bg="var(--color-expresso)" color="white" maxW="280px">
            <DrawerCloseButton color="white" />
            <DrawerBody p={0}>
              <SidebarContent onClose={onClose} />
            </DrawerBody>
          </DrawerContent>
        </Drawer>
      )}

      {/* Main Content */}
      <Box flex="1" overflow="auto" pb={{ base: "70px", md: 0 }}>
        {children}
      </Box>

      {/* Mobile Bottom Nav */}
      <MobileBottomNav />
    </Flex>
  );
};

import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { queryClient } from "./lib/react-query";

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route
              path="/"
              element={
                <PrivateRoute>
                  <Layout>
                    <Dashboard />
                  </Layout>
                </PrivateRoute>
              }
            />
            <Route
              path="/inventory"
              element={
                <PrivateRoute>
                  <Layout>
                    <Inventory />
                  </Layout>
                </PrivateRoute>
              }
            />
            <Route
              path="/clients"
              element={
                <PrivateRoute>
                  <Layout>
                    <Clients />
                  </Layout>
                </PrivateRoute>
              }
            />
            <Route
              path="/roasts"
              element={
                <PrivateRoute>
                  <Layout>
                    <Roasts />
                  </Layout>
                </PrivateRoute>
              }
            />
            <Route
              path="/metrics"
              element={
                <PrivateRoute>
                  <Layout>
                    <Metrics />
                  </Layout>
                </PrivateRoute>
              }
            />
            <Route
              path="/partnerships"
              element={
                <PrivateRoute>
                  <Layout>
                    <Partnerships />
                  </Layout>
                </PrivateRoute>
              }
            />
            <Route
              path="/order/:id"
              element={
                <PrivateRoute>
                  <Layout>
                    <OrderDetail />
                  </Layout>
                </PrivateRoute>
              }
            />
            <Route
              path="/inventory/:id"
              element={
                <PrivateRoute>
                  <Layout>
                    <BeanDetail />
                  </Layout>
                </PrivateRoute>
              }
            />
            <Route
              path="/roast/:id"
              element={
                <PrivateRoute>
                  <Layout>
                    <RoastDetail />
                  </Layout>
                </PrivateRoute>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

export default App;
