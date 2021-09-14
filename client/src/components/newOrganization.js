import React, { useContext, useState, useEffect } from "react"
import { UserContext } from "../context/UserContext"
import { useHistory
 } from "react-router";
const NewOrganizationComponent = (props) => {
    // eslint-disable-next-line
    const [userContext, setUserContext] = useContext(UserContext);
    const [userList, setUserList] = useState([]);
    const [lastUserValid, setLastUserValid] = useState(true);
    const [orgNameAvailable, setOrgNameAvailable] = useState(null);
    const history = useHistory();
    const endpoint = process.env.REACT_APP_API_ENDPOINT || process.env.DEBUG_REACT_APP_API_ENDPOINT

    const isUserValid = async (u) => {
        let valid = false;
        await fetch(endpoint + "users/exists", {
            method: "POST",
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${userContext.token}`
            },
            body: JSON.stringify({user: u})
        })
        .then(async response => {
            if(response.ok) {
                const data = await response.json();
                valid = data.validUser;
            }
        });
        return valid;
    }
    const isOrgNameAvailable = async (o) => {
        let available = false;
        await fetch(endpoint + "organizations/exists", {
            method: "POST",
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${userContext.token}`
            },
            body: JSON.stringify({organization: o})
        })
        .then(async response => {
            if(response.ok) {
                const data = await response.json();
                available = !data.exists;
            }
        });
        return available;
    }
    const formSubmitHandler = async (e) => {
        e.preventDefault();
        let orgName = document.getElementById("new-org-name").value;
        if(await isOrgNameAvailable(orgName)){
            fetch(endpoint + "organizations/create", {
                method: "POST",
                credentials: "include",
                // Pass authentication token as bearer token in header
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${userContext.token}`,
                },
                body: JSON.stringify({
                    name: document.getElementById("new-org-name").value,
                    users: userList.map((u,i) => {return {email: u, permission: document.getElementById(`user${i}Select`).value}})
                })
              })
              .then(async response => {
                if (response.ok) {
                    props.fetchUserDetails();
                    history.push("/organization");
                }});
        }
    }

    const userEnterHandler = async (e) => {
        if(e.key === ","){
            let userEmail = e.target.value.slice(0,-1);
            if(userEmail.includes("@") && userEmail.includes("."))
            {
                if(!userList.includes(userEmail) && userEmail !== userContext.details.email){
                    if(await isUserValid(userEmail)) {
                        setUserList([...userList, userEmail]);
                        setLastUserValid(true);
                    }
                    else{
                        setLastUserValid(false);
                    }
                }
                e.target.value = "";
            }
        }
    }
    const orgEnterHandler = async (e) => {
        let orgName = e.target.value;
        if(orgName !== ""){
            setOrgNameAvailable(await isOrgNameAvailable(orgName));
        }
        else{
            setOrgNameAvailable(null);
        }
    }

    const removeUserHandler = (e) => {
        var targetDiv = document.getElementById(e.target.getAttribute("divid"));
        var user = targetDiv.getAttribute("user");
        setUserList(userList.filter(u => u !== user))
    }

    useEffect(() => {
    // fetch only when user details are not present
    if (!userContext.details) {
        props.fetchUserDetails()
    }
    // eslint-disable-next-line
    }, [userContext.details, props.fetchUserDetails])   

      return (
        <div className=" flex-col justify-center items-center">
            <h1>New Organization</h1>
            <hr/>
            <div className="w-screen flex justify-center items-start">
                <form className="mt-10 w-1/2" onSubmit={formSubmitHandler} autoComplete="off">
                    <div className="flex flex-wrap -mx-3 mb-6">
                        <div className="w-full px-3">
                            <label className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2" htmlFor="grid-first-name">
                                Organization Name
                            </label>
                            <input className="appearance-none block w-full bg-gray-200 text-gray-700 border border-red-500 rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white" id="new-org-name" type="text" placeholder="Example, Inc." onBlur={orgEnterHandler}/>
                            <p className="text-red-500 text-xs italic">Please fill out this field.</p>
                            {orgNameAvailable === false && <p className="text-red-500 italic">This organization name is not available.</p>}
                            {orgNameAvailable === true && <p className="text-green-500 italic">This organization name is available.</p>}
                        </div>
                    </div>
                    <div className="flex flex-wrap -mx-3 mb-6">
                        <div className="w-full px-3">
                        <label className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2" htmlFor="grid-password">
                            Members (e-mail addresses)
                        </label>
                        <input className="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white focus:border-gray-500" id="new-org-members" type="email" placeholder="Users" onKeyUp={userEnterHandler}/>
                        <p className="text-gray-600 text-xs italic">Comma between users. Users will have to accept the invitation to this organization. The creator (current user: {userContext.details && userContext.details.email}) is automatically added as an admin.</p>
                        {!lastUserValid && <p className="text-red-500 italic">The entered user does not exist.</p>}
                        </div>
                    </div>
                    <div className="container flex flex-col items-center mb-4">
                        <ul>
                            {userList.map((u,i) => {return(
                                    <div id={`user${i}Div`} key={i} user={u} className="container flex flex-row">
                                        <li id={`user${i}Li`} className="text-2xl">{u}</li>
                                        {/* User permissions are:
                                            0 - Read only
                                            1 - Read/Update
                                            2 - Create/Read/Update/Delete
                                            3 - Organization Admin (Can modify user permissions and edit the organization details)
                                        Organizations always have at least one admin. */}
                                        <select id={`user${i}Select`} className="ml-4">
                                            <option value="0">Read Only</option>
                                            <option value="1">Read/Update</option>
                                            <option value="2">Create/Read/Update/Delete</option>
                                            <option value="3">Admin (all content/user privileges)</option>
                                        </select>
                                        <button type="button" divid={`user${i}Div`} liid={`user${i}Li`} selectid={`user${i}Select`} id={`user${i}Button`} onClick={removeUserHandler} className="bg-transparent hover:bg-red-500 text-red-700 font-semibold hover:text-white px-2 ml-4 border border-red-500 hover:border-transparent rounded">X</button>
                                    </div>
                                )})
                            }
                        </ul>
                    </div>
                    <input type="submit" className="uppercase h-12 mt-3 text-white w-1/2 rounded bg-gray-800 hover:bg-gray-900"/>
                </form>
            </div>
        </div>
    )
}

export default NewOrganizationComponent;