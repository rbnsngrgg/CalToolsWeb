import React, { useCallback, useContext, useEffect, useState } from "react"
import { UserContext } from "../context/UserContext"

const ItemListComponent = (props) => {
    const [userContext, setUserContext] = useContext(UserContext);
    const [items, setItems] = useState(null);

    useEffect(() => {
        // fetch only when user details are not present
        if (!userContext.details) {
            props.fetchUserDetails()
        }
        // eslint-disable-next-line
        }, [userContext.details, props.fetchUserDetails])   
        
    return (
        <div className="flex flex-col justify-center items-center">
            <div className="flex-row justify-center my-4 border-4 rounded-sm w-2/3 border-gray-400 bg-gray-100">
                <h1 className="text-lg my-4 w-1/2">Items</h1>
            </div>
            <input type="text" placeholder="Search" className="mb-4 px-2 border-2 border-gray-400 rounded-lg"/>
            <div className="p-2 border-4 border-gray-400 rounded-lg">
                <table className="table-auto">
                    <thead>
                        <tr>
                            <th className="px-8">Serial Number</th>
                            <th className="px-8">Model</th>
                            <th className="px-8">Description</th>
                            <th className="px-8">Location</th>
                            <th className="px-8">Due Date</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr className="hover:bg-gray-100">
                            <td>Test Item</td>
                            <td>TestItem1</td>
                            <td>A test item.</td>
                            <td>test area</td>
                            <td>2022-08-27</td>
                        </tr>
                        <tr className="bg-gray-200 hover:bg-gray-100">
                            <td>Test Item2</td>
                            <td>TestItem2</td>
                            <td>A test item.</td>
                            <td>test area 2</td>
                            <td>2022-08-26</td>
                        </tr>
                    </tbody>
                </table>        
            </div>
        </div>
    )
}

export default ItemListComponent;