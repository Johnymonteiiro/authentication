//Validação de permissões do usuário:


type User = {
  permissions: string[],
  roles: string[],
} | undefined

type ValidateUserPermissionsParams = {
  user: User;
  permissions : string[],
  roles: string[]
}

export function validateUserPermissions ({ user, permissions, roles} : ValidateUserPermissionsParams) {
  
  if(permissions.length > 0) {
    const hasAllPermissions = permissions.every(permission =>{//se tiver todas as permissões retorna true
      return user?.permissions.includes(permission)
    });

    if(!hasAllPermissions){
      return false;
    }
  }

  if(roles.length > 0) {
    const hasAllRoles = roles.every(role =>{//se tiver todas as permissões retorna true
      return user?.roles.includes(role)
    });

    if(!hasAllRoles){
      return false;
    }
  }

  return true;

}