import React, { useCallback, useContext, useEffect, useState } from "react"
import { UserContext } from "../context/UserContext"
import { ContextMenu, MenuItem, ContextMenuTrigger } from "react-contextmenu";

const ItemListComponent = (props) => {
    let contextTrigger = null;
    let contextMenuTriggeredItem = null;
    const [userContext, setUserContext] = useContext(UserContext);
    const [items, setItems] = useState(null);
    const [organizationNames, setOrganizationNames] = useState(null);

    const fetchItems = useCallback(() => {
        fetch(process.env.REACT_APP_API_ENDPOINT + "items/" + document.getElementById("orgSelect").value, {
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
            setItems(data);
          }});
      }, [userContext.token, setItems]);
  
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
        
    const handleClick = (e,data) => {
        console.log(contextMenuTriggeredItem);
    }

    const toggleMenu = (e,i) => {
        if(contextTrigger) {
            contextMenuTriggeredItem = i;
            //console.log(contextTrigger.props);
            contextTrigger.handleContextClick(e);
        }
    };
    useEffect(() => {
        // fetch only when user details are not present
        if (!userContext.details) {
            props.fetchUserDetails();
        }
        if(!organizationNames){
            fetchOrganizationNames();
        }
        if(!items && organizationNames){
            fetchItems();
        }
        // eslint-disable-next-line
        }, [userContext.details, props.fetchUserDetails, items, fetchItems, organizationNames, fetchOrganizationNames]);
        
    return (
        <div className="flex flex-row justify-center content-start h-5/6 w-screen">
            <div className="h-full mr-4 my-8 w-2/12">
                <select name="Items" size="2" className="h-full w-full border-4 border-gray-400 rounded-lg">
                    <optgroup label="Default Items">
                        <option>Item 1</option>
                        <option>Item 2</option>
                    </optgroup>
                </select>
            </div>
            <div className="flex flex-col justify-start items-center w-3/5 my-8">
                <div className="flex-row justify-center my-4 border-4 rounded-sm w-full border-gray-400 bg-gray-100">
                    <h1 className="text-lg my-4 w-1/2">Items</h1>
                </div>
                <div className="inline-block relative w-64 mt-3">
                    <select id="orgSelect" className="block appearance-none w-full bg-white border border-gray-400 hover:border-gray-500 px-4 py-2 pr-8 rounded shadow leading-tight focus:outline-none focus:shadow-outline">
                        {(organizationNames && organizationNames.map((x, i) => <option key={i} value={x}>{x}</option>))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 mt-1">
                        <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                    </div>
                </div>
                <input type="text" placeholder="Search" className="mb-4 px-2 border-2 border-gray-400 rounded-lg"/>
                <div className="p-2 border-4 border-gray-400 rounded-lg">
                    
                    <ContextMenuTrigger id="itemContextMenu" ref={c => contextTrigger = c}><div></div></ContextMenuTrigger>
                    <ContextMenu id="itemContextMenu">
                        <MenuItem data={{foo: 'bar'}} onClick={handleClick}>
                            ContextMenu Item 1
                        </MenuItem>
                        <MenuItem data={{foo: 'bar'}} onClick={handleClick}>
                            ContextMenu Item 2
                        </MenuItem>
                        <MenuItem divider />
                        <MenuItem data={{foo: 'bar'}} onClick={handleClick}>
                            ContextMenu Item 3
                        </MenuItem>
                    </ContextMenu>
                </div>
            </div>
        </div>
    )
}

export default ItemListComponent;