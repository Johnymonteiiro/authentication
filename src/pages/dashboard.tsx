import { useEffect } from "react"
import { Can } from "../components/Can";
import { useAuth } from "../context/AuthContext"
import { useCan } from "../hooks/useCan";
import { setupAPIClient } from "../service/api";
import { api } from "../service/apiClient";
import { withSSRAuth } from "../utils/withSSRAuth";

export default function Dashboard(){

  const { user, signOut } = useAuth()

  useEffect(()=>{
    api.get('/me').then(response => console.log(response))
    .catch(error =>{
      console.log(error)
    })
    
  },[]);
  
  return(
    <>
      <h1>Welcome to my new Chanel</h1>
      <p>{user?.email}</p>

      <button onClick={signOut}>Sign Out</button>

      <Can permissions={['metrics.list']} roles={[]}>
        <div>Métricas</div>
      </Can>
    </>
  )
}

export const getServerSideProps = withSSRAuth( async (ctx) =>{
  
  const apiClient = setupAPIClient(ctx);
  const response = await apiClient.get('/me')
 
  return {
    props:{}
  }
})