import { ValidContext } from "../context/ValidContext";
import { useContext } from "react";

export const useValidContext = () => {
    const context = useContext(ValidContext)

    if (!context){
        throw Error('useValidContext must be inside an ValidContextProvider')
    }
    
    return context
} 