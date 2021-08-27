import React, { useCallback, useContext, useEffect, useState } from "react"
import { UserContext } from "../context/UserContext"
import Loader from "./loader";
import { Link } from "react-router-dom";

const OrganizationComponent = (props) => {
    const [userContext] = useContext(UserContext);
    const [organizationNames, setOrganizationNames] = useState(null);
    const [invitations, setInvitations] = useState(null);

    const fetchOrganizationNames = useCallback(() => {
      fetch(process.env.REACT_APP_API_ENDPOINT + "users/me/organizations", {
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
    }, [userContext.token, setOrganizationNames]);

    const fetchInvitations = useCallback(() => {
      fetch(process.env.REACT_APP_API_ENDPOINT + "users/me/invitations", {
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
          setInvitations(data);
        }});
    }, [userContext.token, setInvitations]);

        
    const acceptOrRejectInvitation = (index, userSelection) => {
      fetch(process.env.REACT_APP_API_ENDPOINT + "users/me/invitations", {
        method: "POST",
        credentials: "include",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${userContext.token}`
        },
        body: JSON.stringify({ id: invitations[index].id, selection: userSelection }),
      })
      .then(async response => {
        if (response.ok) {
          console.log("Invitation " + userSelection);
        }
      })
    }

    useEffect(() => {
      // fetch only when user details are not present
      if (!organizationNames) {
        fetchOrganizationNames();
      }
      if (!invitations){
        fetchInvitations();
      }
    }, [organizationNames, fetchOrganizationNames, invitations, fetchInvitations])
    return (
        <>
        {organizationNames !== null & invitations !== null ? 
        (<>
          <h1 className="mt-4 text-xl font-semibold">Organizations</h1>
          <div className="flex justify-center items-center flex flex-row">
            <div className="inline-block relative w-64 mt-3">
              <select className="block appearance-none w-full bg-white border border-gray-400 hover:border-gray-500 px-4 py-2 pr-8 rounded shadow leading-tight focus:outline-none focus:shadow-outline">
                  {(organizationNames && organizationNames.map((x, i) => <option key={i} value={x}>{x}</option>))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 mt-1">
                  <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
              </div>
            </div>
            <Link to="/organization/new" className="content-center">
              <button className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 border border-gray-700 rounded ml-2">
                  New
              </button>
            </Link>
          </div>
          <hr className="mt-10 mb-4"/>
          <div className="flex flex-col justify-center items-center">
            <h2 className="text-xl font-semibold">Invitations</h2>
            {invitations.map((inv,ind) => {
              let permission;
              if(inv.permissions === 0){ permission = "Read Only"; }
              else if (inv.permissions === 1){ permission = "Read/Update" }
              else if (inv.permissions === 2) { permission = "Create/Read/Update/Delete" }
              else if (inv.permissions === 3) { permission = "Admin (all content/user privileges)" }
              return (
                <div className="flex flex-row" key={ind}>
                  <div className="border-2 px-2 py-1 rounded border-gray-500 mr-1">
                    <p className="text-lg">{inv.name}: {permission}</p>
                  </div>
                  <button onClick={() => { acceptOrRejectInvitation(ind, "reject") }} id={`reject${ind}`} className="bg-red-300 hover:bg-red-500 text-red-700 font-semibold hover:text-white px-3 ml-1 border border-red-500 hover:border-transparent rounded">X</button>
                  <button onClick={() => { acceptOrRejectInvitation(ind, "accept") }} id={`accept${ind}`} className="bg-green-300 hover:bg-green-500 text-green-700 font-semibold hover:text-white px-3 ml-1 border border-green-500 hover:border-transparent rounded">{"\u2713"}</button>
                </div>
                )
            })}
          </div>
        </>
        ) : <Loader/>}
        </>
    );
}

export default OrganizationComponent