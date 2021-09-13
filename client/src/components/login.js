import React, { useContext, useState } from "react";
import { UserContext } from "../context/UserContext";
import { Link } from "react-router-dom";

const Login = () => {
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState("")
    const [email, setEmail] = useState("")
    // eslint-disable-next-line
    const [userContext, setUserContext] = useContext(UserContext)
    const [password, setPassword] = useState("")

    const formSubmitHandler = e => {
        e.preventDefault()
        setIsSubmitting(true)
        setError("")
        const genericErrorMessage = "Something went wrong! Please try again later."
        fetch(process.env.REACT_APP_API_ENDPOINT + "users/login", {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: email, password }),
        })
          .then(async response => {
            setIsSubmitting(false)
            if (!response.ok) {
              if (response.status === 400) {
                setError("Please fill all the fields  ")
              } else if (response.status === 401) {
                setError("Invalid email and password combination.")
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
    
    const googleLoginHandler = () => {
      window.location.href="https://caltools.herokuapp.com/users/auth/google";
    }

    return (
      <div className=" bg-gray-300 flex justify-center items-center">
        <div className="container h-screen flex justify-center items-start">
          <div className="p-8 bg-white rounded-lg max-w-6xl pb-10 mt-20">
            <div className="flex justify-center mb-4"> <img alt="CalTools logo" src="https://caltools.herokuapp.com/images/CalToolsIcon.png" width="70"/> </div>
            <form className="auth-form" onSubmit={formSubmitHandler}>
              <input id="email" type="email" value={email} className="h-12 rounded w-full border px-3 focus:text-black focus:border-blue-100" placeholder="Email" onChange={e => setEmail(e.target.value)}/>
              <input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} className="h-12 mt-3 rounded w-full border px-3 focus:text-black focus:border-blue-100" placeholder="Password"/>
              {error !== "" && <label className="text-red-500	">{error}</label> }
              <div className="flex justify-end items-center mt-2"><Link to="/register" className="text-gray-400 hover:text-gray-600">Register</Link></div>
              <div className="flex justify-end items-center mt-2"><a className="text-gray-400 hover:text-gray-600">Forgot password?</a> </div>
              <button intent="primary" type="submit" disabled={isSubmitting} className="uppercase h-12 mt-3 text-white w-full rounded bg-gray-700 hover:bg-gray-800">
                {`${isSubmitting ? "Logging In" : "Log In"}`}
              </button>
            </form>
            <div className="flex justify-between items-center mt-3">
              <hr className="w-full"/> <span className="p-2 text-gray-400 mb-1">OR</span>
              <hr className="w-full"/>
            </div>
            <button className="uppercase h-12 mt-3 text-white w-full rounded bg-gray-800 hover:bg-gray-900" onClick={googleLoginHandler}><i className="fa fa-google mr-2"></i>Google</button>
          </div>
        </div>
      </div>
    )
}
export default Login