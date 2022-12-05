import axios, { AxiosError } from "axios";
import { GetServerSidePropsContext } from "next";
import { parseCookies, setCookie } from 'nookies';
import { signOut } from "../context/AuthContext";
import { AuthTokenError } from "./Error/AuthTokenErros";

type failedRequestTypes = {
  onSuccess: (token: string) => void;
  onFailure: (err: AxiosError) => void; 
}[]

//verifica se estamos atualizando o token ou não;
let isRefreshing = false;

let failedRequestsQueue: failedRequestTypes = [];

export function setupAPIClient (ctx:GetServerSidePropsContext| undefined = undefined) {

  //salvar todos os cookies de maneira geral.
  let cookies = parseCookies(ctx);

  const api = axios.create({
    baseURL:"http://localhost:3333",
    headers:{
      Authorization: `Bearer ${cookies['nextAuth.token']}`
    }
  })
  
  //verificar se o token já expirou:
  //As requisições devem esperar a actualização do token
  
  api.interceptors.response.use(response =>{
   return response;
  
  }, (error) => {
    if(error.response?.status === 401){
      if(error.response.data?.code === 'token.expired'){
        cookies = parseCookies(ctx);
  
        const{ 'nextAuth.refreshToken' : refreshToken } = cookies;
        const originalConfig = error.config;//traz toda a info da req do back
  
       if(!isRefreshing){
        //vai realizar a atualização do refreshToken uma unica vez não importa o numero de chamadas.
        isRefreshing= true;
  
        api.post('/refresh',{
          refreshToken,
        }).then(response =>{
          const { token } = response.data;
  
          setCookie(ctx,'nextAuth.token', token, {
            maxAge: 60*60*24*30,//30 dias -- tempo de expriração do token
            path: '/'//quais caminho vai ter acesso ao cookie, nesse caso qualquer endereço vai ter acesso
          });
          setCookie(ctx,'nextAuth.refreshToken', response.data.refreshToken,{
            maxAge: 60*60*24*30,//30 dias -- tempo de expriração do token
            path: '/'//quais caminho vai ter acesso ao cookie, nesse caso qualquer endereço vai ter acesso
          });
  
          api.defaults.headers.get['Authorization'] = `Bearer ${token}`;
  
          //Se as requisições dar certo, pegar as req falhadas e atualizar elas com o novo token atualizado:
          failedRequestsQueue.forEach(request => request.onSuccess(token))
          failedRequestsQueue = [];
          
        }).catch(err =>{
  
          failedRequestsQueue.forEach(request => request.onFailure(err))
          failedRequestsQueue= [];
  
          //verificar se o codigo está sendo executado no browser ou no servidor e retorna true ou false:
  
          if( typeof window == "undefined"){
            signOut();
          }
  
        }).finally(() => {
          isRefreshing= false;
        });
       }
  
        return new Promise((resolve,rejects)=> {
          failedRequestsQueue.push({
            onSuccess:(token:string)=>{
              originalConfig.headers['Authorization'] = `Bearer ${token}`;
  
              resolve(api(originalConfig))//fazer nova chamada a api
            },
            onFailure: (err:AxiosError)=> {
              rejects(err)
            }
          })
        })
      }else{
        //Caso o erro for 401:
        if( typeof window == "undefined"){
          signOut();
        } else {
          return Promise.reject( new AuthTokenError())
        }
      }
    }
    //tratar o erro do axios: 
    // tratar sempre esse erro no axios.
    return Promise.reject(error);
  });

  return api;
}