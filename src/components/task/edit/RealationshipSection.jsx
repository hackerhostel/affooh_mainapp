import React, {useEffect, useState} from "react";
import {
    CheckBadgeIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
    TrashIcon,
    XMarkIcon
} from "@heroicons/react/24/outline/index.js";
import {getInitials, getSelectOptions} from "../../../utils/commonUtils.js";
import FormSelect from "../../FormSelect.jsx";
import axios from "axios";
import {useToasts} from "react-toast-notifications";
import {useHistory} from "react-router-dom";
import useFetchTaskLinkTypes from "../../../hooks/custom-hooks/task/useFetchTaskLinkTypes.jsx";
import {relationCellRender} from "../../sprint-table/utils.jsx";

const RelationshipSection = ({
                                 linkedTasks,
                                 addingNew,
                                 selectedTab,
                                 setAddingNew,
                                 taskId,
                                 refetchTask,
                                 projectId,
                                 projectTaskList
                             }) => {
    const {addToast} = useToasts();
    const history = useHistory();

    const {data: linkTypeResponse} = useFetchTaskLinkTypes(projectId)

    const [newRow, setNewRow] = useState({task: 0, type: 0});
    const [showNewRow, setShowNewRow] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [linkTypes, setLinkTypes] = useState([]);

    useEffect(() => {
        if (addingNew && selectedTab === 'relationship') {
            setShowNewRow(true)
        } else {
            setShowNewRow(false)
        }
    }, [addingNew, selectedTab]);

    useEffect(() => {
        if (linkTypeResponse.length) {
            setLinkTypes(getSelectOptions(linkTypeResponse))
        }
    }, [linkTypeResponse]);

    const rowsPerPage = 5;
    const totalPages = linkedTasks && linkedTasks.length ? Math.ceil(linkedTasks.length / rowsPerPage) : 0;
    const indexOfLastTask = currentPage * rowsPerPage;
    const indexOfFirstTask = indexOfLastTask - rowsPerPage;
    const currentPageContent = linkedTasks && linkedTasks.length ? linkedTasks.slice(indexOfFirstTask, indexOfLastTask) : [];

    const handleNextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
        }
    };

    const handlePreviousPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    const onHideNew = () => {
        setAddingNew(false)
        setNewRow({task: projectTaskList[0]?.id, type: linkTypes[0].value})
    }

    const handleFormChange = (name, value) => {
        setNewRow({...newRow, [name]: Number(value)});
    };

    const linkTask = async () => {
        const payload = {
            taskID: taskId,
            linkedTasks: [{
                taskID: newRow.task === 0 ? projectTaskList[0]?.id : newRow.task,
                linkTypeID: newRow.type === 0 ? linkTypes[0].value : newRow.type
            }],
        }

        try {
            const response = await axios.post(`/tasks/${taskId}/link`, payload)
            const status = response?.status
            if (status === 204) {
                addToast('Task link successfully', {appearance: 'success'});
                refetchTask(true)
                onHideNew()
            }
        } catch (error) {
            console.log(error)
            addToast('Failed link the task', {appearance: 'error'});
        }
    };

    const GenerateRow = ({linkedTask}) => {
        const linkedTaskId = linkedTask?.linkID
        const assignee = linkedTask?.assignee
        const linkedType = linkedTask?.linkType

        const onRedirectClick = () => {
            history.push(`/task/${linkedTask?.code}`);
        }

        const removeTaskLink = async () => {
            try {
                const response = await axios.delete(`/tasks/links/${linkedTaskId}`)
                const status = response?.status
                if (status === 200) {
                    addToast('Task link successfully removed', {appearance: 'success'});
                    refetchTask(true)
                } else {
                    addToast('Failed remove the task link', {appearance: 'error'});
                }
            } catch (error) {
                addToast('Failed remove the task link', {appearance: 'error'});
            }
        }

        return (
            <tr className="border-b border-gray-200">
                <td className="py-5 px-4 text-text-color cursor-pointer"
                    onClick={onRedirectClick}>{linkedTask?.name}</td>
                <td className="py-5 px-4 flex gap-3 items-center text-text-color">
                    <div
                        className="w-8 h-8 rounded-full bg-primary-pink flex items-center justify-center text-white text-md font-semibold">
                        {assignee?.id ? (getInitials(`${assignee?.firstName} ${assignee?.lastName}`)) : "N/A"}
                    </div>
                    <p>{assignee?.id ? assignee?.firstName : "Unassigned"}</p>
                </td>
                <td className="py-5 px-4">
                    <div className={"max-w-28"}>
                        {relationCellRender(linkedType)}
                    </div>
                </td>
                <td className="px-4 py-5">
                    <div className={"flex gap-5"}>
                        <div className="cursor-pointer" onClick={removeTaskLink}>
                            <TrashIcon className={"w-5 h-5 text-red-600 cursor-pointer"}/>
                        </div>
                    </div>
                </td>
            </tr>
        );
    };

    return (
        <div className="w-full mt-8 px-6 py-4 bg-white rounded-md shadow-lg">
            {(linkedTasks && linkedTasks.length) || showNewRow ? (
                <>
                    <table className="table-auto w-full border-collapse">
                        <thead>
                        <tr className="text-left text-secondary-grey border-b border-gray-200">
                            <th className="py-5 px-4">Task Name</th>
                            <th className="py-5 px-4">Assignee</th>
                            <th className="py-5 px-4">Status</th>
                            <th className="py-5 px-4">Action</th>
                        </tr>
                        </thead>
                        <tbody>
                        {showNewRow && (
                            <tr className="border-b border-gray-200">
                                <td className="px-4 py-5" colSpan="2">
                                    <FormSelect
                                        name="task"
                                        formValues={{task: newRow.task}}
                                        options={getSelectOptions(projectTaskList)}
                                        onChange={({target: {name, value}}) => handleFormChange(name, value)}
                                    />
                                </td>
                                <td className="px-4 py-5 w-44">
                                    <FormSelect
                                        name="type"
                                        formValues={{type: newRow.type}}
                                        options={linkTypes}
                                        onChange={({target: {name, value}}) => handleFormChange(name, value)}
                                    />
                                </td>
                                <td className="px-4 py-5">
                                    <div className={"flex gap-5"}>
                                        <div className={"cursor-pointer"} onClick={linkTask}>
                                            <CheckBadgeIcon className={"w-6 h-6 text-pink-700"}/>
                                        </div>
                                        <div className={"cursor-pointer"} onClick={onHideNew}>
                                            <XMarkIcon className={"w-6 h-6 text-text-color"}/>
                                        </div>
                                    </div>
                                </td>
                            </tr>
                        )}
                        {currentPageContent.map((task) => (
                            <GenerateRow linkedTask={task} key={task?.id}/>
                        ))}
                        </tbody>
                    </table>
                    {(linkedTasks && linkedTasks.length > 0) && (
                        <div className="w-full flex gap-5 items-center justify-end mt-4">
                            <button
                                onClick={handlePreviousPage}
                                className={`p-2 rounded-full bg-gray-200 ${currentPage === 1 ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-300"}`}
                                disabled={currentPage === 1}
                            >
                                <ChevronLeftIcon className={"w-4 h-4 text-secondary-grey"}/>
                            </button>
                            <span className="text-gray-500 text-center">Page {currentPage} of {totalPages}</span>
                            <button
                                onClick={handleNextPage}
                                className={`p-2 rounded-full bg-gray-200 ${currentPage === totalPages ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-300"}`}
                                disabled={currentPage === totalPages}
                            >
                                <ChevronRightIcon className={"w-4 h-4 text-secondary-grey"}/>
                            </button>
                        </div>
                    )}
                </>
            ) : (
                <p className="text-text-color w-full text-center">No Tasks Relations Available</p>
            )}
        </div>
    );
};

export default RelationshipSection;
