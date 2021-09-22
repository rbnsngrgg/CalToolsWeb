import { useCallback, useContext, useEffect } from "react";
import { UserContext } from "./context/UserContext";
import './App.css';
import {BrowserRouter, BrowserRouter as Router, Redirect, Route, Switch} from 'react-router-dom';
import Login from './components/login';
import Register from './components/register';
import Home from "./components/home";
import Loader from "./components/loader"
import Navbar from "./components/navbar";
import OrganizationComponent from "./components/organization";
import NewOrganizationComponent from "./components/newOrganization";
import ProfileComponent from "./components/profile";
import ItemListComponent from "./components/itemList";
import SingleItemPage from "./components/singleItemPage";

function App() {
  const [userContext, setUserContext] = useContext(UserContext)
  const endpoint = process.env.REACT_APP_API_ENDPOINT;

  const fetchUserDetails = useCallback(() => {
    fetch(endpoint + "users/me", {
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
  }, [setUserContext, userContext.token, endpoint])

  const verifyUser = useCallback(() => {
    fetch(endpoint + "users/refreshToken", {
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
  }, [setUserContext, endpoint])
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
    <div className="flex flex-col App bg-gray-300 h-screen overflow-auto">
      <BrowserRouter>
        <Router className="h-full flex flex-col">
          <Navbar  fetchUserDetails={fetchUserDetails}/>
          {userContext.token === null ?
          (<>
            <Switch>
            <Route exact path="/"><Redirect to="/login"/></Route>
            <Route exact path="/register" component={Register}/>
            <Route exact path="/login" component={Login}/>
            <Route exact path="/item/:organization/:item" component={SingleItemPage}/>
            <Route><Redirect to="/login"/></Route>
            </Switch>
          </>) : 
            userContext.token ? 
            (<>
            <Switch>
            <Route exact path="/" component={Home}/> 
            <Route exact path="/itemlist" render={() => (<ItemListComponent fetchUserDetails={fetchUserDetails}/>)}/>
            <Route exact path="/organization" render={() => (<OrganizationComponent fetchUserDetails={fetchUserDetails}/>)}/>
            <Route exact path="/organization/new" render={() => (<NewOrganizationComponent fetchUserDetails={fetchUserDetails}/>)}/>
            <Route exact path="/users/me/profile" render={() => (<ProfileComponent fetchUserDetails={fetchUserDetails}/>)}/>
            <Route exact path="/i/:organization/:item" component={SingleItemPage}/>
            <Route><Redirect to="/"/></Route>
            </Switch>
            </>)
            :<Loader/>
          }
        </Router>
      </BrowserRouter>
    </div>
  )
}

export default App;
