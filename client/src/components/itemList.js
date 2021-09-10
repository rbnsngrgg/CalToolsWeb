import React, { useCallback, useContext, useEffect, useState } from "react"
import { UserContext } from "../context/UserContext"
import { ContextMenu, MenuItem, ContextMenuTrigger } from "react-contextmenu";

const ItemListComponent = (props) => {
    let contextTrigger = null;
    let contextMenuTriggeredItem = null;
    let defaultTask = {
        _id: 0,
        title: "New Task",
        serviceVendor: "",
        isMandatory: true,
        interval: 12,
        completeDate: "",
        actionType: "Calibration",
        remarks: "",
        dateOverride: ""
    }
    const [errorMessage, setErrorMessage] = useState("");
    const [deleteConfirm, setDeleteConfirm] = useState(false);
    const [deleteTaskConfirm, setDeleteTaskConfirm] = useState(false);
    const [userContext, setUserContext] = useContext(UserContext);
    const [items, setItems] = useState(null);
    const [selectedItem, setSelectedItem] = useState(null);
    const [categories, setCategories] = useState([]);
    const [organizationNames, setOrganizationNames] = useState(null);
    const [readOnly, setReadOnly] = useState(true);
    const [taskReadOnly, setTaskReadOnly] = useState(true);
    const [currentTasks, setCurrentTasks] = useState([]);
    const [showTaskDetails, setShowTaskDetails] = useState(false);
    const [currentTask, setCurrentTask] = useState(defaultTask);

    const fetchItems = useCallback(() => {
        clearForm();
        if(!readOnly){ toggleEdit(); }
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
            setItems(data.items);
            let newCategories = []
            for(let i = 0; i < data.items.length; i++){
                if(!newCategories.includes(data.items[i].itemCategory)){
                    newCategories.push(data.items[i].itemCategory);
                }
            }
            setCategories(newCategories);
          }});
      }, [userContext.token, setItems, setCategories, readOnly]);

      const fetchTasks = useCallback(() => {
        fetch(process.env.REACT_APP_API_ENDPOINT + "items/" + document.getElementById("orgSelect").value + "/" + document.getElementById("itemSelect").value + "/tasks", {
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
            setCurrentTasks(data.tasks);
          }});
      }, [userContext.token, setCurrentTasks]);

      const fetchItemDetails = useCallback(() => {
          if(!document.getElementById("itemSelect").value){return;}
        fetch(process.env.REACT_APP_API_ENDPOINT + "items/" + document.getElementById("orgSelect").value + "/" + document.getElementById("itemSelect").value, {
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
              setSelectedItem(data.item);
              document.getElementById("categoryInput").value = data.item.itemCategory;
              document.getElementById("snInput").value = data.item.serialNumber;
              document.getElementById("modelInput").value = data.item.model;
              document.getElementById("descriptionInput").value = data.item.itemDescription;
              document.getElementById("locationInput").value = data.item.location;
              document.getElementById("manufacturerInput").value = data.item.manufacturer;
              document.getElementById("standardEquipmentInput").checked = data.item.isStandardEquipment;
              document.getElementById("inOperationInput").checked = data.item.inOperation;
              document.getElementById("itemGroupInput").value = data.item.itemGroup;
              document.getElementById("remarksInput").value = data.item.remarks;
            }});
        }, [userContext.token, setSelectedItem])

      const saveItem = async () => {
        let itemData = {
            itemCategory: document.getElementById("categoryInput").value,
            serialNumber: document.getElementById("snInput").value,
            model: document.getElementById("modelInput").value,
            itemDescription: document.getElementById("descriptionInput").value,
            location: document.getElementById("locationInput").value,
            manufacturer: document.getElementById("manufacturerInput").value,
            isStandardEquipment: document.getElementById("standardEquipmentInput").checked,
            inOperation: document.getElementById("inOperationInput").checked,
            itemGroup: document.getElementById("itemGroupInput").value,
            remarks: document.getElementById("remarksInput").value,
            tasks: currentTasks,
        }
        fetch(process.env.REACT_APP_API_ENDPOINT + "items/save", {
            method: "POST",
            credentials: "include",
            // Pass authentication token as bearer token in header
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${userContext.token}`,
            },
            body: JSON.stringify({
                item: itemData,
                organization: document.getElementById("orgSelect").value
            })
          })
          .then(async response => {
            if (response.ok) {
                fetchItems();
                if(document.getElementById("itemSelect").value)
                {
                    fetchItemDetails();
                }
            }
            else{
                setErrorMessage(response);
            }
        });
    }

    const saveTask = async (task) => {
        console.log("Saving task")
        fetch(process.env.REACT_APP_API_ENDPOINT + "items/tasks/save", {
            method: "POST",
            credentials: "include",
            // Pass authentication token as bearer token in header
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${userContext.token}`,
            },
            body: JSON.stringify({
                task: task,
                organization: document.getElementById("orgSelect").value
            })
          })
          .then(async response => {
            if (response.ok) {
                if(document.getElementById("itemSelect").value)
                {
                    fetchTasks();
                }
            }
            else{
                setErrorMessage(response);
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
    
    const deleteItem = useCallback(() => {
        fetch(process.env.REACT_APP_API_ENDPOINT + "items/delete", {
            method: "POST",
            credentials: "include",
            // Pass authentication token as bearer token in header
            headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${userContext.token}`,
            },
            body: JSON.stringify({
                serialNumber: document.getElementById("snInput").value,
                organization: document.getElementById("orgSelect").value
            })
        })
        .then(async response => {
            if(response.ok) {
                fetchItems();
            }
            else{
                let text = response.statusText;
                setErrorMessage(text);
            }
        })
    }, [userContext.token]);

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

    const newTask = () => {
        console.log("New task");
        let newTasks = currentTasks.slice();
        displayTaskDetails(defaultTask);
    }

    const saveEditButtonClick = () => {
        if(!readOnly){
            saveItem();
        }
        toggleEdit();
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
        document.getElementById("itemDeleteButton").disabled = !readOnly;
        setReadOnly(!readOnly);
    }

    const taskSaveEditButtonClick = () => {
        if(!taskReadOnly){            
            let task = {
                _id: currentTask._id,
                itemId: selectedItem._id,
                title: document.getElementById("titleInput").value,
                serviceVendor: document.getElementById("vendorInput").value,
                isMandatory: document.getElementById("mandatoryInput").checked,
                interval: document.getElementById("intervalInput").value,
                completeDate: document.getElementById("completeDateText").value,
                actionType: document.getElementById("actionTypeInput").value,
                remarks: document.getElementById("taskRemarksInput").value,
                dateOverride: ""
            }
            saveTask(task);
        }
        taskToggleEdit();
    }

    const taskToggleEdit = () => {
        let form = document.getElementById("taskForm");
        for(let i = 0; i < form.children.length; i++){
            if((form.children[i].type === "text" || form.children[i].type === "textarea" || form.children[i].type === "number")
                && form.children[i].id !== "taskIdText"
                && form.children[i].id !== "dueDateText"){
                form.children[i].readOnly = !readOnly;
            }
            else if(form.children[i].type === "checkbox" && form.children[i].id !== "dueCheckbox"){
                form.children[i].disabled = !readOnly;
            }
        }
        document.getElementById("taskEditButton").innerText = taskReadOnly ? "Save" : "Edit";
        document.getElementById("taskDeleteButton").disabled = !taskReadOnly;
        setTaskReadOnly(!taskReadOnly);
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
        if(!readOnly){ toggleEdit(); }
        fetchItemDetails();
        fetchTasks();
    }

    const cancelButtonClick = () => {
        setDeleteConfirm(false);
        toggleEdit();
        fetchItemDetails();
    }

    const deleteConfirmSelection = (confirm) => {
        if(confirm){
            deleteItem();
        }
        setDeleteConfirm(false);
    }

    const deleteTaskSelection = (confirm) => {
        setDeleteTaskConfirm(false);
        if(confirm){
            if(currentTask._id != 0){
                //deleteTask();
            }
            setShowTaskDetails(false);
            setTaskReadOnly(true);
        }        
    }


    const displayTaskDetails = (task) => {
        if(task){
            setCurrentTask(task);
            setShowTaskDetails(true);
        }
    }

    const taskCancelButtonClick = () => {
        setTaskReadOnly(true);
        setShowTaskDetails(false);
    }
    


    const buildItemCategory = (cat) => {
        if(!items){return <></>}
        let options = [];
        for(let i = 0; i < items.length; i++){
            if(items[i].itemCategory === cat){
                options.push(<option key={items[i].serialNumber}>{items[i].serialNumber}</option>)
            }
        }
        return <optgroup label={cat} key={cat}>
            {options}
        </optgroup>
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
                    {categories.map(cat => buildItemCategory(cat))}
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
                    <div className="flex w-full items-center justify-center justify-evenly mb-2">
                        <button id="newItemButton" className="my-2 border-2 border-gray-400 rounded-md w-1/6 hover:bg-gray-100" onClick={newItem}>New Item</button>
                        <button id="editButton" className="my-2 border-2 border-gray-400 rounded-md w-1/6 hover:bg-gray-100" onClick={saveEditButtonClick}>Edit</button>
                        <button disabled={readOnly} id="cancelButton" className="opacity-100 my-2 border-2 border-gray-400 rounded-md w-1/6 hover:bg-gray-100 disabled:bg-gray-100 disabled:opacity-20" onClick={cancelButtonClick}>Cancel</button>
                        <button disabled={readOnly} id="itemDeleteButton" className="opacity-100 my-2 border-2 border-gray-400 rounded-md w-1/6 hover:bg-gray-100 disabled:bg-gray-100 disabled:opacity-20" onClick={() => {setDeleteConfirm(true)}}>Delete</button>
                    </div>
                    {deleteConfirm && 
                        <div id="itemDeleteConfirm" className="flex flex-row w-full items-center justify-center justify-evenly mb-2 border-2 border-gray-500 rounded-md">
                            <h1>Confirm item deletion?</h1>
                            <button id="confirmItemDelete" className="my-2 border-2 border-gray-400 rounded-md w-1/6 hover:bg-gray-100" onClick={() => deleteConfirmSelection(true)}>Confirm</button>
                            <button id="cancelItemDelete" className="my-2 border-2 border-gray-400 rounded-md w-1/6 hover:bg-gray-100" onClick={() => deleteConfirmSelection(false)}>Cancel</button>
                        </div>
                    }
                    {errorMessage &&
                        <div className="flex w-full items-center justify-center mb-2">
                            <p className="text-red-500 text-xl">{errorMessage}</p>
                            <button className="ml-4 px-2 text-sm border-2 border-red-400 rounded-md bg-red-300 text-white hover:bg-red-500" onClick={() => setErrorMessage("")}>X</button>
                        </div>
                    }
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
                    <div className="flex justify-center border-2 border-gray-400 rounded-lg mt-5 pb-5 overflow-auto w-auto">
                        <table className="">
                            <thead>
                                <tr>
                                    <th className="pr-4">Task ID</th>
                                    <th className="pr-4">Title</th>
                                    <th className="pr-4">Mandatory</th>
                                    <th className="pr-4">Due Date</th>
                                    <th className="pr-4">Due</th>
                                    <th className="pr-4">Action</th>
                                    <th className="pr-4"></th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentTasks.map((t,i) => { return(
                                        <tr>
                                            <td className="px-2">{t._id}</td>
                                            <td className="px-2"><input readOnly={readOnly} type="text" id={`task${i}TitleInput`} name={`task${i}TitleInput`} value={t.title}></input></td>
                                            <td className="px-2"><input disabled={readOnly} type="checkbox" id={`task${i}MandatoryInput`} name={`task${i}MandatoryInput`} checked={t.isMandatory} className="col-span-3 self-center"/></td>
                                            <td className="px-2">placeholder</td>
                                            <td className="px-2">placeholder</td>
                                            <td className="px-2">{t.actionType}</td>
                                            <td className="px-2"><button id={`task${i}DetailsButton`} onClick={() => {displayTaskDetails(t)}}>...</button></td>
                                        </tr>
                                )})}
                            </tbody>
                        </table>
                    </div>
                    <div className="flex w-full items-center justify-center justify-evenly mb-2">
                        <button id="newTaskButton" className="opacity-100 my-2 border-2 border-gray-400 rounded-md w-1/6 hover:bg-gray-100 disabled:bg-gray-100 disabled:opacity-20" onClick={newTask}>New Task</button>
                        {/* <button id="editButton" className="opacity-100 my-2 border-2 border-gray-400 rounded-md w-1/6 hover:bg-gray-100 disabled:bg-gray-100 disabled:opacity-20" onClick={saveEditButtonClick}>Edit</button>
                        <button disabled={readOnly} id="cancelButton" className="opacity-100 my-2 border-2 border-gray-400 rounded-md w-1/6 hover:bg-gray-100 disabled:bg-gray-100 disabled:opacity-20" onClick={cancelButtonClick}>Cancel</button>
                        <button disabled={readOnly} id="itemDeleteButton" className="opacity-100 my-2 border-2 border-gray-400 rounded-md w-1/6 hover:bg-gray-100 disabled:bg-gray-100 disabled:opacity-20" onClick={() => {setDeleteConfirm(true)}}>Delete</button> */}
                    </div>
                </div>
                {/* Task Details pop up window */}
                {showTaskDetails && currentTask &&
                        <div id="taskDetailsWindow" className="flex flex-col mt-20 p-2 border-4 border-gray-400 rounded-lg w-3/6 px-4 mt-2 justify-center z-1 fixed bg-gray-200">
                            <div className="flex justify-end mb-3"><button className="ml-4 w-10 px-2 text-sm border-2 border-red-400 rounded-md bg-red-300 text-white hover:bg-red-500" onClick={taskCancelButtonClick}>X</button></div>
                            <form className="grid w-full grid-cols-4 grid-rows-20 gap-y-2" id="taskForm">
                                <label htmlFor="taskIdText" className="">Task ID:</label>
                                <input readOnly type="text" id="taskIdText" name="taskIdText" className="col-span-3" value={currentTask._id}></input>
                                <label htmlFor="titleInput" className="">Title:</label>
                                <input readOnly type="text" id="titleInput" name="titleInput" className="col-span-3" value={currentTask.title}></input>
                                <label htmlFor="vendorInput" className="">Service Vendor:</label>
                                <input readOnly type="text" id="vendorInput" name="vendorInput" className="col-span-3" value={currentTask.serviceVendor}></input>
                                <label htmlFor="mandatoryInput" className="">Mandatory:</label>
                                <input disabled type="checkbox" id="mandatoryInput" name="mandatoryInput" className="col-span-3 self-center" checked={currentTask.isMandatory}></input>
                                <label htmlFor="intervalInput" className="">Interval:</label>
                                <input readOnly type="number" id="intervalInput" name="intervalInput" className="col-span-3" value={currentTask.interval}></input>
                                <label htmlFor="completeDateText" className="">Complete Date:</label>
                                <input readOnly type="date" id="completeDateText" name="completeDateText" className="col-span-3" value={currentTask.completeDate}></input>
                                <label htmlFor="dueDateText" className="">Due Date:</label>
                                <input readOnly type="date" id="dueDateText" name="dueDateText" className="col-span-3"></input>
                                <label htmlFor="dueCheckbox" className="">Due:</label>
                                <input disabled type="checkbox" id="dueCheckbox" name="dueCheckbox" className="col-span-3 self-center"></input>
                                <label htmlFor="actionTypeInput" className="">Action Type:</label>
                                <input readOnly type="text" id="actionTypeInput" name="actionTypeInput" className="col-span-3" value={currentTask.actionType}></input>
                                <label htmlFor="taskRemarksInput" className="">Remarks:</label>
                                <textarea readOnly id="taskRemarksInput" name="taskRemarksInput" className="col-span-3 row-span-4" value={currentTask.remarks}></textarea>
                            </form>
                            {deleteTaskConfirm && 
                                <div id="taskDeleteConfirm" className="flex flex-row w-full items-center justify-center justify-evenly mb-2 border-2 border-gray-500 rounded-md">
                                    <h1>Confirm task deletion?</h1>
                                    <button id="confirmTaskDelete" className="my-2 border-2 border-gray-400 rounded-md w-1/6 hover:bg-gray-100" onClick={() => deleteTaskSelection(true)}>Confirm</button>
                                    <button id="cancelTaskDelete" className="my-2 border-2 border-gray-400 rounded-md w-1/6 hover:bg-gray-100" onClick={() => deleteTaskSelection(false)}>Cancel</button>
                                </div>
                            }
                            <div className="flex flex-row justify-evenly">
                                <button id="taskEditButton" className="my-2 border-2 border-gray-400 rounded-md w-1/6 hover:bg-gray-100" onClick={taskSaveEditButtonClick}>{taskReadOnly ? "Edit" : "Save"}</button>
                                <button disabled={taskReadOnly} id="taskDeleteButton" className="opacity-100 my-2 border-2 border-gray-400 rounded-md w-1/6 hover:bg-gray-100 disabled:bg-gray-100 disabled:opacity-20" onClick={() => {setDeleteTaskConfirm(true)}}>Delete</button>
                            </div>
                        </div>
                }
            </div>
        </div>
    )
}

export default ItemListComponent;