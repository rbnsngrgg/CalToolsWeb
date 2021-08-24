import { useCallback, useContext, useEffect } from "react";
import { UserContext } from "./context/UserContext";
import './App.css';
import {BrowserRouter as Router, Redirect, Route, Switch} from 'react-router-dom';
import Login from './components/login';
import Register from './components/register';
import Home from "./components/home";
import Loader from "./components/loader"
import Navbar from "./components/navbar";
import OrganizationComponent from "./components/organization";
import NewOrganizationComponent from "./components/newOrganization";

function App() {
  const [userContext, setUserContext] = useContext(UserContext)

  const verifyUser = useCallback(() => {
    fetch(process.env.REACT_APP_API_ENDPOINT + "users/refreshToken", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
    }).then(async response => {
      if (response.ok) {
        const data = await response.json()
        setUserContext(oldValues => {
          return { ...oldValues, token: data.token }
        })
      } else {
        setUserContext(oldValues => {
          return { ...oldValues, token: null }
        })
      }
      // call refreshToken every 5 minutes to renew the authentication token.
      setTimeout(verifyUser, 5 * 60 * 1000)
    })
  }, [setUserContext])
  useEffect(() => {
    verifyUser()
  }, [verifyUser])

  /**
   * Sync logout across tabs
   */
   const syncLogout = useCallback(event => {
    if (event.key === "logout") {
      // If using react-router-dom, you may call history.push("/")
      window.location.reload()
    }
  }, [])
  useEffect(() => {
    window.addEventListener("storage", syncLogout)
    return () => {
      window.removeEventListener("storage", syncLogout)
    }
  }, [syncLogout])  

  return (
    <div className="App bg-gray-300 h-screen">
      <div>
        <Router>
          <Navbar/>
          {userContext.token === null ?
          (<div>
            <Switch>
            <Route exact path="/"><Redirect to="/login"/></Route>
            <Route exact path="/register" component={Register}/>
            <Route exact path="/login" component={Login}/>
            <Route><Redirect to="/login"/></Route>
            </Switch>
          </div>) : 
            userContext.token ? 
            (<>
            <Switch>
            <Route exact path="/" component={Home}/> 
            <Route exact path="/organization" component={OrganizationComponent}/>
            <Route exact path="/organization/new" component={NewOrganizationComponent}/>
            <Route><Redirect to="/"/></Route>
            </Switch>
            </>)
            :<Loader/>
          }
        </Router>
      </div>
    </div>
  )
}

export default App;
