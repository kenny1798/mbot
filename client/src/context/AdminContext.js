import { createContext, useEffect, useReducer } from "react";


export const AdminContext = createContext();

export const adminReducer = (state, action) =>{
    switch (action.type){
        case 'AUTHENTICATE':
            return { admin: action.payload }
        case 'UNAUTHENTICATE':
            return { admin: null }
        default:
            return state
    }
}

export const AdminContextProvider = ({ children }) => {

    const admin = JSON.parse(localStorage.getItem('adminToken'));

    const [state, adminValid] = useReducer(adminReducer, {
        admin: admin
    })

    useEffect(() =>{

        if(admin){
            adminValid({type: 'LOGIN', payload: admin })
        }

    }, [])

    return (
        <AdminContext.Provider value={{...state, adminValid}}>
            { children }
        </AdminContext.Provider>
    )
}