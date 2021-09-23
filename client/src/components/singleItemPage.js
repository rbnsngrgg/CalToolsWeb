import React, { useCallback, useContext, useState, useEffect } from "react"
import { BrowserRouter, Link, Router } from "react-router-dom";
import { UserContext } from "../context/UserContext"
import { useHistory, useParams } from "react-router";

const SingleItemPage = () => {
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
    const [currentTasks, setCurrentTasks] = useState([]);
    const [currentTask, setCurrentTask] = useState(defaultTask);
    const [showTaskDetails, setShowTaskDetails] = useState(false);
    const endpoint = process.env.REACT_APP_API_ENDPOINT;
    const [dataPresent, setDataPresent] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    let {organization, item} = useParams();
    const displayTaskDetails = (task) => {
        if(task){
            setCurrentTask(task);
            setShowTaskDetails(true);
        }
    }

    const fetchItemDetails = useCallback(() => {
      fetch(endpoint + "items/" + organization + "/public/" + item, {
          method: "GET",
          credentials: "include",
          // Pass authentication token as bearer token in header
          headers: {
            "Content-Type": "application/json",
          }
        })
        .then(async response => {
          if (response.ok) {
            let data = await response.json();
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
            document.getElementById("publicInput").checked = data.item.readPublic;
            setDataPresent(true);
            setErrorMessage("");
          }
        else if (response.status === 400){
            setErrorMessage("Bad request.");
        }
        else if (response.status === 401){
            setErrorMessage("Unauthorized.");
        }
        else if (response.status === 500){
            setErrorMessage("Internal server error.");
        }});
      }, [endpoint, setDataPresent, setErrorMessage])
    useEffect(() => {
        // fetch only when user details are not present
        if (!dataPresent) {
            fetchItemDetails();
        }
        // eslint-disable-next-line
    },[dataPresent, item, organization]);

    return(
        <div className="flex flex-col w-full justify-center items-center">
            {errorMessage && <h1 className="mt-5 text-red-600 text-xl">{errorMessage}</h1>}
            <form className="grid w-3/4 grid-cols-4 grid-rows-20 gap-y-2 mt-5" id="itemForm">
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
                <label htmlFor="publicInput" className="">Public can read data?</label>
                <input disabled type="checkbox" id="publicInput" name="publicInput" className="col-span-3 self-center"></input>
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
                            <th className="pr-4">Complete Date</th>
                            {/* <th className="pr-4">Due Date</th>
                            <th className="pr-4">Due</th> */}
                            <th className="pr-4">Action</th>
                            <th className="pr-4"></th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentTasks.map((t,i) => { return(
                                <tr>
                                    <td className="px-2">{t._id}</td>
                                    <td className="px-2"><input readOnly type="text" id={`task${i}TitleInput`} name={`task${i}TitleInput`} value={t.title}></input></td>
                                    <td className="px-2"><input disabled type="checkbox" id={`task${i}MandatoryInput`} name={`task${i}MandatoryInput`} checked={t.isMandatory} className="col-span-3 self-center"/></td>
                                    <td className="px-2"><input readOnly type="date" id={`task${i}CompleteDate`} name={`task${i}CompleteDate`} className="" value={(t.completeDate && t.completeDate.split('T')[0]) || ""}></input></td>
                                    {/* <td className="px-2">placeholder</td> */}
                                    {/* <td className="px-2"><input disabled={readOnly} type="checkbox" id={`task${i}DueBox`} name={`task${i}DueBox`} className="col-span-3 self-center"/></td> */}
                                    <td className="px-2">{t.actionType}</td>
                                    <td className="px-2"><button id={`task${i}DetailsButton`} onClick={() => {displayTaskDetails(t)}}>...</button></td>
                                </tr>
                        )})}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

export default SingleItemPage;