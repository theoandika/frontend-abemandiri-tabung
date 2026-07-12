import { useLocalStorage } from "react-use";
import { createContext, ReactNode, useContext } from "react";
import { LOCAL_STORAGE_KEYS as LS_KEYS } from "@/constants";
import { User } from "@/types/types";

type UserContextType = {
  user?: User;
  setUser: (user: User) => void;
  token?: string
  setToken: (token: string) => void;
  clearAuth: () => void
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export default function UserProvider ({ children }: { children: ReactNode }) {
  const [user, setUser] = useLocalStorage<User>(LS_KEYS.user);
  const [token, setToken] = useLocalStorage<string>(LS_KEYS.token);

  const clearAuth = () => {
    window.localStorage.removeItem(LS_KEYS.token);
    window.localStorage.removeItem(LS_KEYS.user);
  }

  return (
    <UserContext.Provider
      value={{
        user,
        setUser,
        token,
        setToken,
        clearAuth
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export const useUserContext = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUserContext must be used within a UserProvider");
  }
  return context;
};