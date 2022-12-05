//Definir se o usuário pode ou não acessar uma pagina
//A pagina só será acessivél se o usuário tem permissão


import { setupAPIClient } from "../service/api";
import { withSSRAuth } from "../utils/withSSRAuth";


export default function Metrics(){

  return(
    <>
      <h1>You can see the Metrics of this page</h1>
    </>
  )
}

//o token traz informações do usuário
//o primeiro parametro recebe a rota da paigna e o segundo recebe as permissões do user
export const getServerSideProps = withSSRAuth( async (ctx) =>{
  //1 parm:
  const apiClient = setupAPIClient(ctx);
  const response = await apiClient.get('/me')
 
  return {
    props:{}
  }
},{//2 parm:
  permissions:['metrics.list'],
  roles:[],
})