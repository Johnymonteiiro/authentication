//// função para pessoas não logadas

import {
  GetServerSideProps,
  GetServerSidePropsContext,
  GetServerSidePropsResult,
} from "next";
import { destroyCookie, parseCookies } from "nookies";
import { AuthTokenError } from "../service/Error/AuthTokenErros";
import decode from "jwt-decode";
import { validateUserPermissions } from "./validateUserPermissions";

type WithSSRAuthOptions = {
  permissions: string[],
  roles: string[]
}

export function withSSRAuth<P>(fn: GetServerSideProps<P>, options?: WithSSRAuthOptions) {
  return async (
    ctx: GetServerSidePropsContext
  ): Promise<GetServerSidePropsResult<P>> => {
    //verificar se existe o cookie e direciona-lompara a pagina dashboard
    const cookies = parseCookies(ctx);
    const token = cookies["nextAuth.token"]

    if (!token) {
      return {
        redirect: {
          destination: "/",
          permanent: false,
        },
      };
    }

     //verificar se o usuário tem a permição:

   if(options){
      //decodificando o token para obter as info dentro dele:
      const user = decode<WithSSRAuthOptions>(token)
      const { permissions, roles } = <WithSSRAuthOptions>options
      console.log(user)
      
      const userHasValidPermissions = validateUserPermissions({
        user,permissions,roles
      })
     
      //caso o usuário não tem permissões para acessar uma pagina
      if(!userHasValidPermissions) {
        return {
        redirect:{
          destination:'/dashboard',
          permanent:false
        }
      }
     }
   }

    //se não retorna a função original:

    try {
      return await fn(ctx);
    } catch (error) {
      
      destroyCookie(ctx, "nextAuth.token");
      destroyCookie(ctx, "nextAuth.refreshToken");

      return {
        redirect: {
          destination: "/",
          permanent: false,
        },
      };
    }
  };
}
