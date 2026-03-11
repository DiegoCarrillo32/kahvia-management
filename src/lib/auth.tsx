import React, { createContext, useContext, useEffect, useState } from "react";
import { User, onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "./firebase";
import { useToast } from "@chakra-ui/react";

const ALLOWED_EMAIL = import.meta.env.VITE_ALLOWED_EMAIL || "admin@kahvia.com";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  logout: async () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser && currentUser.email !== ALLOWED_EMAIL) {
        // Automatically sign out if it's not the allowed email
        signOut(auth).then(() => {
          setUser(null);
          setLoading(false);
          toast({
            title: "Error de autenticación",
            description: "Unauthorized access. This email is not allowed.",
            status: "error",
            duration: 3000,
            isClosable: true,
          });
        });
      } else {
        setUser(currentUser);
        setLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  const logout = () => signOut(auth);

  if (loading) {
    return (
      <div className="min-h-screen bg-white-pergamino flex items-center justify-center">
        <div className="text-expresso font-heading text-xl animate-pulse">
          Cargando...
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
