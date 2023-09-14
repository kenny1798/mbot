import { useAuthContext } from "./useAuthContext";

export const useLogout = () => {

const {dispatch} = useAuthContext()

  const logout = () => {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("validToken");
      dispatch({type: 'LOGOUT'})
  }

  return {logout}

}