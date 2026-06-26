import { useEffect,useState } from "react";


const Dev = () => {

const [users,setUsers] = useState(null)

useEffect(() => {
    const fetchUsers = async() => {
         const response = await fetch("/api/auth")
         const json = await response.json()

         console.log(json)

         if (response.ok) {
            setUsers(json)
            console.log(json)
         }
    }

    fetchUsers()
},[])

    return (

        <div className = "dev">
            <h1>HELLOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOO developers!!!</h1>
            {users && users.map((user) => (
            <h1 id = {user._id}>{user.username}</h1>
            ))}
        </div>
      );
}
 
export default Dev ;