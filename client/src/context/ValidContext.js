import { createContext, useEffect, useReducer } from "react";


export const ValidContext = createContext();

export const validReducer = (state, action) =>{
    switch (action.type){
        case 'VALIDATE':
            return { valid: action.payload }
        case 'INVALIDATE':
            return { valid: null }
        case 'LOGOUT':
            return { valid: null }
        default:
            return state
    }
}

export const ValidContextProvider = ({ children }) => {

    const valid = JSON.parse(localStorage.getItem('validToken'))

    const [state, validator] = useReducer(validReducer, {
        valid: valid
    })

    useEffect(() =>{

        if(valid){
            validator({type: 'VALIDATE', payload: valid })
        }

    }, [])

    return (
        <ValidContext.Provider value={{...state, validator}}>
            { children }
        </ValidContext.Provider>
    )
}