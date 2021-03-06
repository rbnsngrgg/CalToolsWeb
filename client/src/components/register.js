import React, { useContext, useState } from "react"
import { UserContext } from "../context/UserContext"

const Register = () => {
    const [isSubmitting, setIsSubmitting] = useState(false)
    // eslint-disable-next-line
    const [error, setError] = useState("")
    const [firstName, setFirstName] = useState("")
    const [lastName, setLastName] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    // eslint-disable-next-line
    const [userContext, setUserContext] = useContext(UserContext)
    const endpoint = process.env.REACT_APP_API_ENDPOINT;

    const formSubmitHandler = e => {
      e.preventDefault()
      setIsSubmitting(true)
      setError("")
      const genericErrorMessage = "Something went wrong! Please try again later."
      fetch(endpoint + "users/signup", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firstName, lastName, email: email, password }),
      })
        .then(async response => {
          setIsSubmitting(false)
          if (!response.ok) {
            if (response.status === 400) {
              setError("Please fill all the fields correctly!")
            } else if (response.status === 401) {
              setError("Invalid email and password combination.")
            } else if (response.status === 500) {
              console.log(response)
              const data = await response.json()
              if (data.message) setError(data.message || genericErrorMessage)
            } else {
              setError(genericErrorMessage)
            }
          } else {
            const data = await response.json()
            setUserContext(oldValues => {
              return { ...oldValues, token: data.token }
            })
          }
        })
        .catch(error => {
          setIsSubmitting(false)
          setError(genericErrorMessage)
        })
    }
  return (
    <>
      <form className="auth-form" onSubmit={formSubmitHandler}>
          <input
            id="firstName"
            placeholder="First Name"
            onChange={e => setFirstName(e.target.value)}
            value={firstName}
          />
          <input
            id="lastName"
            placeholder="Last Name"
            onChange={e => setLastName(e.target.value)}
            value={lastName}
          />
          <input
            id="email"
            type="email"
            placeholder="Email"
            onChange={e => setEmail(e.target.value)}
            value={email}
          />
          <input
            id="password"
            placeholder="Password"
            type="password"
            onChange={e => setPassword(e.target.value)}
            value={password}
          />
        <button intent="primary" text="Register" type="submit" disabled={isSubmitting}>
            {`${isSubmitting ? "Registering" : "Register"}`}
        </button>
      </form>
    </>
  )
}
export default Register