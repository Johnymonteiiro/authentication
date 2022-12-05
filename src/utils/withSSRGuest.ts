//// função para pessoas não logadas

import { GetServerSideProps, GetServerSidePropsContext, GetServerSidePropsResult } from "next";
import { parseCookies } from "nookies";

export function withSSRGuest<P>(fn: GetServerSideProps<P>) {
  return async (ctx: GetServerSidePropsContext):Promise<GetServerSidePropsResult<P>> => {

    //verificar se existe o cookie e direciona-lompara a pagina dashboard
    const cookies = parseCookies(ctx);

    if (cookies["nextAuth.token"]) {
      return {
        redirect: {
          destination: "/dashboard",
          permanent: false,
        },
      };
    }

    //se não retorna a função original:

    return await fn(ctx);
  };
}
