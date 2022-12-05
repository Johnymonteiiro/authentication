import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import Router from "next/router";
import { parseCookies, setCookie, destroyCookie } from "nookies";
import { api } from "../service/apiClient";

type User =
  | {
      email: string;
      permissions: string[];
      roles: string[];
    }
  | undefined;

type SignInCredentials = {
  email: string;
  password: string;
};

type AuthProviderProps = {
  children: ReactNode;
};

type AuthContextData = {
  signIn: (credentials: SignInCredentials) => Promise<void>;
  signOut: () => void;
  user: User;
  isAuthenticated: boolean;
};

export const AuthContext = createContext({} as AuthContextData);

//lidando com multiplas abas abertas criando um chanel:
//evitando que o user esteja logado em uma aba e deslogada ao mesmo tempo em outra na mesma rede.
let authChannel: BroadcastChannel;

export function signOut() {
  destroyCookie(undefined, "nextAuth.token");
  destroyCookie(undefined, "nextAuth.refreshToken");

  //ouvindo o evento do channel
  authChannel.postMessage("signOut");
  Router.push("/");
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User>();
  const isAuthenticated = !!user; //verifica se está authenticado ou não

  useEffect(() => {
    //configurando o logout das abas em simultaneo
    authChannel = new BroadcastChannel("auth");

    // authChannel.onmessage = (message) =>{
    //   switch (message.data){
    //     case 'signOut':
    //       signOut();
    //       break;
    //       default:
    //        break;
    //   }

    //   console.log(message)
    // }
  }, []);

  useEffect(() => {
    const { "nextAuth.token": token } = parseCookies(); //retorna os cookies salvos

    if (token) {
      api
        .get("/me")
        .then((response) => {
          const { email, permissions, roles } = response.data;
          setUser({ email, permissions, roles });
        })
        //caso o token do usuário não seja valido ou qualquer erro, redirecionar para a pagina home:
        .catch(() => {
          signOut();
        });
    }
  }, []);

  const signIn = async ({ email, password }: SignInCredentials) => {
    try {
      const response = await api.post("sessions", {
        email,
        password,
      });

      const { token, refreshToken, permissions, roles } = response.data;

      setCookie(undefined, "nextAuth.token", token, {
        maxAge: 60 * 60 * 24 * 30, //30 dias -- tempo de expriração do token
        path: "/", //quais caminho vai ter acesso ao cookie, nesse caso qualquer endereço vai ter acesso
      });
      setCookie(undefined, "nextAuth.refreshToken", refreshToken, {
        maxAge: 60 * 60 * 24 * 30, //30 dias -- tempo de expriração do token
        path: "/", //quais caminho vai ter acesso ao cookie, nesse caso qualquer endereço vai ter acesso
      });

      setUser({
        email,
        permissions,
        roles,
      });

      api.defaults.headers.get["Authorization"] = `Bearer ${token}`;

      Router.push("/dashboard");
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <AuthContext.Provider value={{ signIn, isAuthenticated, user, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  return context;
}
