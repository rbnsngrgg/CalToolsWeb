import React, { useCallback, useContext, useEffect } from "react"
import { UserContext } from "../context/UserContext"

const profile = () => {
    const [userContext, setUserContext] = useContext(UserContext);

    return (
        <div>
            <h1>User profile</h1>
        </div>
    )
}

export default profile;