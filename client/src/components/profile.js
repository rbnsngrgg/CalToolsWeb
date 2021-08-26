import React, { useCallback, useContext, useEffect } from "react"
import { UserContext } from "../context/UserContext"

const ProfileComponent = (props) => {
    const [userContext, setUserContext] = useContext(UserContext);

    useEffect(() => {
        // fetch only when user details are not present
        if (!userContext.details) {
            props.fetchUserDetails()
        }
        // eslint-disable-next-line
        }, [userContext.details, props.fetchUserDetails])   
        
    return (
        <div className="flex justify-center items-center">
            <div className="container flex-row justify-start my-4 border-4 rounded-sm w-2/3 border-gray-400 bg-gray-100">
                <h1 className="text-lg my-4">{userContext.details && `${userContext.details.firstName} ${userContext.details.lastName}`}</h1>
            </div>
        </div>
    )
}

export default ProfileComponent;