import React, { useCallback, useContext, useEffect } from "react"
import { UserContext } from "../context/UserContext"

const Home = () => {
    const [userContext, setUserContext] = useContext(UserContext)

    const fetchUserDetails = useCallback(() => {
      fetch(process.env.REACT_APP_API_ENDPOINT + "users/me", {
        method: "GET",
        credentials: "include",
        // Pass authentication token as bearer token in header
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userContext.token}`,
        },
      }).then(async response => {
        if (response.ok) {
          const data = await response.json()
          setUserContext(oldValues => {
            return { ...oldValues, details: data }
          })
        } else {
          if (response.status === 401) {
            // Edge case: when the token has expired.
            // This could happen if the refreshToken calls have failed due to network error or
            // User has had the tab open from previous day and tries to click on the Fetch button
            window.location.reload()
          } else {
            setUserContext(oldValues => {
              return { ...oldValues, details: null }
            })
          }
        }
      })
    }, [setUserContext, userContext.token])

    useEffect(() => {
      // fetch only when user details are not present
      if (!userContext.details) {
        fetchUserDetails()
      }
    }, [userContext.details, fetchUserDetails])    

    return (
          <div className="user-details">
            <div>
              <p>
                Welcome&nbsp;
              </p>
            </div>
            <h1>User details</h1>
            <h2>{userContext.details ? userContext.details.firstName : ""}</h2>
            <h2>Due items summary</h2>
            <h2>Current Organization</h2>
            <hr/>
            <div className="user-actions">
            </div>
          </div>
      )
}

export default Home