import { ReactNode } from "react"
import { useCan } from "../hooks/useCan"


interface CanProps {
  children:ReactNode,
  permissions: string[],
  roles: string[]
}

export function Can({ permissions, children, roles}:CanProps){

  const userCanSeeComponent = useCan({ permissions,roles })

  if(!userCanSeeComponent){
    return null;
  }
  
  return(
    <>
      {children}
    </>
  )
}