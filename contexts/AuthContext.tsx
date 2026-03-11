import React, { createContext, useContext, useEffect, useState } from "react";
import {
  User,
  onAuthStateChanged,
  signOut as firebaseSignOut,
  GoogleAuthProvider,
  signInWithCredential,
} from "firebase/auth";
import * as Google from "expo-auth-session/providers/google";
import * as AuthSession from "expo-auth-session";
import { auth } from "../lib/firebase";

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  signInWithGoogle: async () => {},
  signOut: async () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize Auth Session for Google Sign In
  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    // IMPORTANT: Because you are testing in Expo Go with a Proxy, we can ONLY use the Web Client ID.
    // Supplying an iosClientId forces native Google policies which outright rejects proxy URLs.
    clientId: process.env.EXPO_PUBLIC_WEB_CLIENT_ID,
    redirectUri: AuthSession.makeRedirectUri({
      scheme: "kahviamanagement",
    }),
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (userState) => {
      setUser(userState);
      if (isLoading) setIsLoading(false);
    });
    return unsubscribe;
  }, [isLoading]);

  // Handle Google Auth Response
  useEffect(() => {
    if (response?.type === "success") {
      const { id_token } = response.params;
      const credential = GoogleAuthProvider.credential(id_token);
      signInWithCredential(auth, credential).catch((error) => {
        console.error("Firebase Web Login Error:", error);
      });
    }
  }, [response]);

  const signInWithGoogle = async () => {
    try {
      if (request) {
        await promptAsync();
      } else {
        console.warn(
          "Google Auth Request is not ready yet or is missing Client IDs. Make sure to add your webClientId and iosClientId in AuthContext.tsx",
        );
      }
    } catch (error) {
      console.error("Google Sign-In Error:", error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
    } catch (error) {
      console.error("Sign Out Error:", error);
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, isLoading, signInWithGoogle, signOut }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
