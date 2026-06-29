import { useState } from "react";
import { useAuthContext } from "./useAuthContext";

export const useLogin = () => {

    const [error,setError] = useState(null)
    const [isLoading, setIsLoading] = useState(null)
    const { dispatch } = useAuthContext()

    const login = async (username, password) => {
        setError(null)
        setIsLoading(true)

        const response = await fetch('https://genomeidp-back-end-tis4.onrender.com/api/auth/login', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({username,password})   
        
        })
        const json = await response.json()

        if (!response.ok) {
            setIsLoading(false)
            setError(json.error)
            return false; // Return false to indicate failure
        }
        if (response.ok) {
            // save the user to local storage jwt and username 

            localStorage.setItem("user", JSON.stringify(json))

            //update auth context 

            dispatch({type:'LOGIN', payload: json})

            setIsLoading(false)

            return true; // Return true to indicate success
        }
        
    }

    return{login, isLoading, error}
}

