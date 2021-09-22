import React, { useCallback, useContext, useEffect, useState } from "react"
import { BrowserRouter, Link, Router } from "react-router-dom";
import { UserContext } from "../context/UserContext"
import { useHistory } from "react-router";

const Navbar = (props) => {
    const [userContext, setUserContext] = useContext(UserContext);
    const history = useHistory();
    const endpoint = process.env.REACT_APP_API_ENDPOINT;
    const [mobileNavToggled, setMobileNavToggled] = useState(false);
    const [organizationNames, setOrganizationNames] = useState(null);

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

    const fetchOrganizationNames = useCallback(() => {
        fetch(endpoint + "users/me/organizations", {
            method: "GET",
            credentials: "include",
            // Pass authentication token as bearer token in header
            headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${userContext.token}`,
            }
        })
        .then(async response => {
            if (response.ok) {
            let data = await response.json();
            setOrganizationNames(data);
            }});
    }, [userContext.token, setOrganizationNames, endpoint]);
    
    useEffect(() => {
        if(!organizationNames){
            fetchOrganizationNames();
        }
    }, [organizationNames, fetchOrganizationNames]);

    return (
            <nav className="transition-all duration-500 flex items-center justify-between flex-wrap bg-gray-600 p-2 lg:p-4">
                <div className="flex items-center flex-shrink-0 text-white">
                    <img alt="CalTools logo" src="https://caltools.herokuapp.com/images/CalToolsIcon.png" className="w-8 md:w-1/6 rounded-md"></img>
                    <span className="font-semibold text-xl tracking-tight pl-4"><Link to="/">CalTools</Link></span>
                </div>
                {userContext.token !== null && 
                (<><div className="block lg:hidden">
                    <button className="flex items-center px-3 py-2 border rounded text-teal-200 border-teal-400 hover:text-white hover:border-white"
                        onClick={(e) => {setMobileNavToggled(!mobileNavToggled); e.preventDefault();}}>
                    <svg className="fill-current h-3 w-3" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><title>Menu</title><path d="M0 3h20v2H0V3zm0 6h20v2H0V9zm0 6h20v2H0v-2z"/></svg>
                    </button>
                </div>
                <div className={mobileNavToggled ? "transition-all duration-500 overflow-hidden w-full block lg:flex lg:items-center lg:content-center w-auto h-auto" :
                    "transition-all duration-500 overflow-hidden w-full block lg:flex lg:items-center lg:w-auto h-0 lg:h-auto"}>
                {userContext.token &&
                    <div className="flex flex-col lg:flex-row text-sm flex-grow h-auto overflow-hidden justify-end items-end lg:items-center">
                        <div id="orgSelectDiv" className="flex justify-center w-full h-full lg:w-60 lg:mr-4 mt-4 lg:mt-0 self-center">
                            <select id="orgSelect" className="w-5/6 bg-white border border-gray-400 hover:border-gray-500 px-4 py-2 pr-8 rounded shadow leading-tight focus:outline-none focus:shadow-outline"
                                onChange={(e) => setUserContext(context => {return {...context, currentOrg: e.target.value}})} onClick={()=> fetchOrganizationNames()}>
                                {(organizationNames && organizationNames.map((x, i) => <option key={`org${i}`} value={x}>{x}</option>))}
                            </select>
                        </div>
                        <Link to="/users/me/profile" className="mt-4 lg:mt-0 text-white hover:text-gray-400 lg:mr-4">
                            User
                        </Link>
                        <Link to="/itemlist" className="mt-4 lg:mt-0 text-white hover:text-gray-400 lg:mr-4">
                            Item List
                        </Link>
                        <Link to="/organization" className="mt-4 lg:mt-0 text-white hover:text-gray-400 lg:mr-4" onClick={props.fetchUserDetails}>
                            Organization
                        </Link>
                        <button text="Logout" onClick={logoutHandler} intent="primary" className="mt-4 lg:mt-0 lg:ml-10 text-white hover:text-gray-400">Logout</button>
                    </div>
                }
                </div></>)
                }
            </nav>
        );
}

export default Navbar;