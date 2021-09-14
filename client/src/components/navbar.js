import React, { useContext } from "react"
import { Link } from "react-router-dom";
import { UserContext } from "../context/UserContext"
import { useHistory } from "react-router";

const Navbar = (props) => {
    const [userContext, setUserContext] = useContext(UserContext);
    const history = useHistory();
    const endpoint = process.env.REACT_APP_API_ENDPOINT || process.env.DEBUG_REACT_APP_API_ENDPOINT

    const logoutHandler = async () => {
        await fetch(endpoint + "users/logout", {
            credentials: "include",
            headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${userContext.token}`,
            },
        }).then(async response => {
            setUserContext(oldValues => {
            return { ...oldValues, details: undefined, token: null }
            })
            window.localStorage.setItem("logout", Date.now())
            history.push("/");
            })
    }
    return (
        <nav className="flex items-center justify-between flex-wrap bg-gray-600 p-6">
        <div className="flex items-center flex-shrink-0 text-white mr-6">
            <img alt="CalTools logo" src="https://caltools.herokuapp.com/images/CalToolsIcon.png" className="w-1/6"></img>
            <span className="font-semibold text-xl tracking-tight pl-4"><Link to="/">CalTools</Link></span>
        </div>
        {userContext.token !== null && 
        (<><div className="block lg:hidden">
            <button className="flex items-center px-3 py-2 border rounded text-teal-200 border-teal-400 hover:text-white hover:border-white">
            <svg className="fill-current h-3 w-3" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><title>Menu</title><path d="M0 3h20v2H0V3zm0 6h20v2H0V9zm0 6h20v2H0v-2z"/></svg>
            </button>
        </div>
        <div className="w-full block lg:flex lg:items-center lg:w-auto">
            <div className="text-sm lg:flex-grow">
                <Link to="/itemlist" className="block mt-4 lg:inline-block lg:mt-0 text-white hover:text-gray-400 mr-4">
                    Item List
                </Link>
                <Link to="/organization" className="block mt-4 lg:inline-block lg:mt-0 text-white hover:text-gray-400 mr-4" onClick={props.fetchUserDetails}>
                    Organization
                </Link>
                <Link to="/users/me/profile" className="block mt-4 lg:inline-block lg:mt-0 text-white hover:text-gray-400 mr-4">
                    User
                </Link>
                <button text="Logout" onClick={logoutHandler} intent="primary" className="block mt-4 lg:inline-block lg:mt-0 text-white hover:text-gray-400">Logout</button>
            </div>
        </div></>)
        }
        </nav>
        );
}

export default Navbar;