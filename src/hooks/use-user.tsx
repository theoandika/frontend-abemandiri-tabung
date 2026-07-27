import { useLocalStorage } from "react-use";
import { createContext, ReactNode, useContext } from "react";
import { LOCAL_STORAGE_KEYS as LS_KEYS } from "@/constants";
import { User, Viewer } from "@/types/types";

type UserContextType = {
  user?: User;
  setUser: (user: User) => void;
  token?: string
  setToken: (token: string) => void;
  clearAuth: () => void,
  checkPermission: (canAccess?: Viewer[], permissions?: string[]) => void
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export default function UserProvider ({ children }: { children: ReactNode }) {
  const [user, setUser] = useLocalStorage<User>(LS_KEYS.user);
  const [token, setToken] = useLocalStorage<string>(LS_KEYS.token);

  const checkPermission = (canAccess?: Viewer[], permissions?: string[]) => {
    if (canAccess != undefined && canAccess != null && canAccess.length > 0 && user?.level != undefined) {
      if (canAccess.includes(user?.level)) {
        return true
      } else {
        return false
      }
    } else {
      if (permissions !== undefined && permissions.length > 0) {
        if (user?.role?.permissions?.map(el => el.key).some(el => permissions.includes(el)) || user?.role?.permissions?.map(el => el.key).includes("manage-all")) {
          return true
        } else {
          return false
        }
      } else {
        return true
      }
    }
  }

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
        clearAuth,
        checkPermission
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