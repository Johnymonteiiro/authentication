import { createContext, ReactNode, useContext } from "react";

type SignInCredentials = {
  email:string;
  password:string;
}

type AuthProviderProps = {
  children:ReactNode;
};

type AuthContextData = {
  signIn(credentials: SignInCredentials): Promise<void>;
  isAuthenticated: boolean;
};

export const AuthContext = createContext({} as AuthContextData)

export function AuthProvider ({ children }: AuthProviderProps){
  const isAuthenticated = false;

  const signIn = async ({ email, password}: SignInCredentials) => {
    console.log({ email, password})
  }

  return(
    <AuthContext.Provider value={{ signIn, isAuthenticated}}>
      { children }
    </AuthContext.Provider>
  )
}

export function useAuth (){
   const context = useContext(AuthContext);

   return context;
}