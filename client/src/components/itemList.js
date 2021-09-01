import React, { useCallback, useContext, useEffect, useState } from "react"
import { UserContext } from "../context/UserContext"
import { ContextMenu, MenuItem, ContextMenuTrigger } from "react-contextmenu";

const ItemListComponent = (props) => {
    let contextTrigger = null;
    let contextMenuTriggeredItem = null;
    const [userContext, setUserContext] = useContext(UserContext);
    const [items, setItems] = useState(null);
    const [organizationNames, setOrganizationNames] = useState(null);
    const [readOnly, setReadOnly] = useState(true);

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

      const saveItem = async () => {
        let itemData = {
            serialNumber: document.getElementById("snInput")
        }
        fetch(process.env.REACT_APP_API_ENDPOINT + "items/save", {
            method: "POST",
            credentials: "include",
            // Pass authentication token as bearer token in header
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${userContext.token}`,
            },
            body: JSON.stringify(itemData)
          })
          .then(async response => {
            if (response.ok) {
                props.fetchUserDetails();;
            }
            else{
                console.log(response);
            }
        });
  }
  
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

    const newItem = () => {
        clearForm();
        if(readOnly){
            toggleEdit();
        }
    }

    const toggleEdit = () => {
        let form = document.getElementById("itemForm");
        for(let i = 0; i < form.children.length; i++){
            if(form.children[i].type === "text" || form.children[i].type === "textarea"){
                form.children[i].readOnly = !readOnly;
            }
            else if(form.children[i].type === "checkbox"){
                form.children[i].disabled = !readOnly;
            }
        }
        document.getElementById("editButton").innerText = readOnly ? "Save" : "Edit";
        document.getElementById("cancelButton").disabled = !readOnly;
        setReadOnly(!readOnly);
    }

    const clearForm = () => {
        let form = document.getElementById("itemForm");
        for(let i = 0; i < form.children.length; i++){
            if(form.children[i].type === "text" || form.children[i].type === "textarea"){
                form.children[i].value = "";
            }
            else if(form.children[i].type === "checkbox"){
                form.children[i].checked = false;
            }
        }
    }

    const selectedItemChanged = () => {
        console.log(document.getElementById("itemSelect").value);
    }

    const cancelButtonClick = () => {
        console.log("Cancel");
    }

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
            <div className="h-full mr-4 mb-8 mt-3 w-2/12">
                <input type="text" placeholder="Search" className="w-full mb-1 px-2 border-2 border-gray-400 rounded-lg"/>
                <select id="itemSelect" name="Items" size="2" className="h-5/6 w-full border-4 border-gray-400 rounded-lg" onChange={selectedItemChanged}>
                    <optgroup label="Default Items">
                        <option>Item 1</option>
                        <option>Item 2</option>
                    </optgroup>
                </select>
            </div>
            <div className="flex flex-col justify-start items-center w-3/5 my-8">
                <div className="inline-block relative w-64 mt-3">
                    <select id="orgSelect" onChange={fetchItems} className="block appearance-none w-full bg-white border border-gray-400 hover:border-gray-500 px-4 py-2 pr-8 rounded shadow leading-tight focus:outline-none focus:shadow-outline">
                        {(organizationNames && organizationNames.map((x, i) => <option key={i} value={x}>{x}</option>))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 mt-1">
                        <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                    </div>
                </div>
                <div className="flex flex-col p-2 border-4 border-gray-400 rounded-lg w-full px-4 mt-2 justify-center">
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
                    <form className="grid w-full grid-cols-4 grid-rows-20 gap-y-2" id="itemForm">
                        <label htmlFor="categoryInput" className="">Item Category:</label>
                        <input readOnly type="text" id="categoryInput" name="categoryInput" className="col-span-3" placeholder="Ex. Production Equipment"></input>
                        <label htmlFor="snInput" className="">Serial Number:</label>
                        <input readOnly type="text" id="snInput" name="snInput" className="col-span-3"></input>
                        <label htmlFor="modelInput" className="">Model:</label>
                        <input readOnly type="text" id="modelInput" name="modelInput" className="col-span-3"></input>
                        <label htmlFor="descriptionInput" className="">Description:</label>
                        <input readOnly type="text" id="descriptionInput" name="descriptionInput" className="col-span-3"></input>
                        <label htmlFor="locationInput" className="">Location:</label>
                        <input readOnly type="text" id="locationInput" name="locationInput" className="col-span-3"></input>
                        <label htmlFor="manufacturerInput" className="">Manufacturer:</label>
                        <input readOnly type="text" id="manufacturerInput" name="manufacturerInput" className="col-span-3"></input>
                        <label htmlFor="standardEquipmentInput" className="">Standard Equipment:</label>
                        <input disabled type="checkbox" id="standardEquipmentInput" name="standardEquipmentInput" className="col-span-3 self-center"></input>
                        <label htmlFor="inOperationInput" className="">In Operation:</label>
                        <input disabled type="checkbox" id="inOperationInput" name="inOperationInput" className="col-span-3 self-center"></input>
                        <label htmlFor="itemGroupInput" className="">Item Group:</label>
                        <input readOnly type="text" id="itemGroupInput" name="itemGroupInput" className="col-span-3"></input>
                        <label htmlFor="remarksInput" className="">Remarks:</label>
                        <textarea readOnly id="remarksInput" name="remarksInput" className="col-span-3 row-span-4"></textarea>
                    </form>
                    <div className="flex justify-center border-2 border-gray-400 rounded-lg mt-5 overflow-auto w-auto">
                        <table className="">
                            <thead>
                                <tr>
                                    <th className="pr-4">Task ID</th>
                                    <th className="pr-4">Title</th>
                                    <th className="pr-4">Vendor</th>
                                    <th className="pr-4">Mandatory</th>
                                    <th className="pr-4">Interval</th>
                                    <th className="pr-4">Date</th>
                                    <th className="pr-4">Due Date</th>
                                    <th className="pr-4">Due</th>
                                    <th className="pr-4">Date Override</th>
                                    <th className="pr-4">Action</th>
                                    <th className="pr-4">Remarks</th>
                                </tr>
                            </thead>
                        </table>
                    </div>
                    <div className="flex w-full items-center justify-center justify-evenly">
                        <button id="newItemButton" className="my-2 border-2 border-gray-400 justify-self-start rounded-md w-1/6 hover:bg-gray-100" onClick={newItem}>New Item</button>
                        <button id="editButton" className="my-2 border-2 border-gray-400 rounded-md w-1/6 hover:bg-gray-100" onClick={toggleEdit}>Edit</button>
                        <button disabled id="cancelButton" className="opacity-100 my-2 border-2 border-gray-400 rounded-md w-1/6 hover:bg-gray-100 disabled:bg-gray-100 disabled:opacity-20" onClick={cancelButtonClick}>Cancel</button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ItemListComponent;