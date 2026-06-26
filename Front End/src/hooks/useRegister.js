import { useState } from "react";
import { useAuthContext } from "./useAuthContext";

export const useRegister = () => {

    const [error,setError] = useState(null)
    const [isLoading, setIsLoading] = useState(null)
    const { dispatch } = useAuthContext()

    const signup = async (username, password) => {
        setError(null)
        setIsLoading(true)

        const response = await fetch('/api/auth/signup', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({username,password})   
        
        })
        const json = await response.json()

        console.log("Signup response:", json);  // Check what the API is returning

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

    return{signup, isLoading, error}
}

