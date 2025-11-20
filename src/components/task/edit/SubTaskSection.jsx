import React, { useEffect, useState } from "react";
import {
    CheckBadgeIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
    EllipsisVerticalIcon,
    XMarkIcon
} from "@heroicons/react/24/outline/index.js";
import { getInitials, getSelectOptions, getUserSelectOptions } from "../../../utils/commonUtils.js";
import { statusCellRender } from "../../sprint-table/utils.jsx";
import FormInput from "../../FormInput.jsx";
import FormSelect from "../../FormSelect.jsx";
import { useSelector } from "react-redux";
import { selectAppConfig } from "../../../state/slice/appSlice.js";
import { selectProjectUserList } from "../../../state/slice/projectUsersSlice.js";
import useFetchScreensForTask from "../../../hooks/custom-hooks/task/useFetchScreensForTask.jsx";
import axios from "axios";
import { useToasts } from "react-toast-notifications";
import { useHistory } from "react-router-dom";
import UserSelect from "../../UserSelect.jsx";

const SubTaskSection = ({
    subtasks,
    addingNew,
    selectedTab,
    setAddingNew,
    taskId,
    sprintId,
    refetchTask,
    projectId
}) => {
    const { addToast } = useToasts();
    const history = useHistory();
    const appConfig = useSelector(selectAppConfig);
    const { data: screenResponse } = useFetchScreensForTask(appConfig?.taskTypes.find(tt => tt.value === "Task")?.screenID || 0, projectId)
    const users = useSelector(selectProjectUserList);
    const [newRow, setNewRow] = useState({ name: '', assignee: 0, status: 0 });
    const [showNewRow, setShowNewRow] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [status, setStatus] = useState([]);

    useEffect(() => {
        if (addingNew && selectedTab === 'sub_task') {
            setShowNewRow(true)
        } else {
            setShowNewRow(false)
        }
    }, [addingNew, selectedTab]);

    useEffect(() => {
        if (screenResponse?.id) {
            const fieldStatus = screenResponse?.tabs[0]?.fields.find(f => f.name === "Status")?.fieldValues || []
            setStatus(fieldStatus)
            if (fieldStatus.length) {
                setNewRow({ ...newRow, status: fieldStatus[0].id, assignee: users[0]?.id })
            }
        }
    }, [screenResponse]);

    const rowsPerPage = 5;
    const totalPages = subtasks && subtasks.length ? Math.ceil(subtasks.length / rowsPerPage) : 0;
    const indexOfLastTask = currentPage * rowsPerPage;
    const indexOfFirstTask = indexOfLastTask - rowsPerPage;
    const currentPageContent = subtasks && subtasks.length ? subtasks.slice(indexOfFirstTask, indexOfLastTask) : [];

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
        setNewRow({ name: '', status: status[0].id, assignee: users[0]?.id })
    }

    const handleFormChange = (name, value, isText) => {
        setNewRow({ ...newRow, [name]: isText ? value : Number(value) });
    };

    const handleSaveSubTask = async () => {
        if (newRow.name !== '') {
            const payload = {
                parentTaskID: taskId,
                name: newRow.name,
                assigneeID: newRow.assignee,
                projectID: projectId,
                sprintID: sprintId,
                statusID: newRow.status,
                taskTypeID: appConfig?.taskTypes.find(tt => tt.value === "Task")?.id
            }

            try {
                const response = await axios.post(`/tasks/sub-task`, { task: payload })
                const created = response?.data?.body

                if (created) {
                    addToast('Sub task successfully created', { appearance: 'success' });
                    refetchTask(true)
                    onHideNew()
                } else {
                    addToast('Failed to create the sub task', { appearance: 'error' });
                }
            } catch (error) {
                addToast('Failed to create the sub task', { appearance: 'error' });
            }
        } else {
            addToast('Name is required', { appearance: 'warning' });
        }
    };

    const GenerateRow = ({ subTask }) => {
        const subTaskId = subTask?.id
        const assignee = subTask?.assignee
        const editStatus = subTask?.attributes?.status
        const initialData = {
            name: subTask?.name,
            status: editStatus ? editStatus.id : status[0].id,
            assignee: assignee ? assignee?.id : users[0].id
        }

        const [isEditing, setIsEditing] = useState(false);
        const [editRow, setEditRow] = useState(initialData);
        

        const handleEditFormChange = (name, value, isText) => {
            setEditRow({ ...editRow, [name]: isText ? value : Number(value) });
        };

        

        const onHideEdit = () => {
            setIsEditing(false)
            setEditRow(initialData)
        }

        const onRedirectClick = () => {
            history.push(`/task/${subTask?.code}`);
        }

        const handleUpdateTask = async () => {
            const payloads = [];

            if (editRow.name !== initialData.name) {
                if (editRow.name.trim() === '') {
                    addToast('Name is required', { appearance: 'warning' });
                    return;
                }
                payloads.push({
                    taskID: subTaskId,
                    type: "TASK",
                    attributeDetails: {
                        attributeKey: "Name",
                        attributeValue: editRow.name,
                    },
                });
            }

            if (editRow.assignee !== initialData.assignee) {
                payloads.push({
                    taskID: subTaskId,
                    type: "TASK",
                    attributeDetails: {
                        attributeKey: "assigneeID",
                        attributeValue: editRow.assignee,
                    },
                });
            }

            if (editRow.status !== initialData.status) {
                if (!editStatus?.attributeId || !editStatus?.fieldID) {
                    addToast('Invalid status update details', { appearance: 'warning' });
                    return;
                }
                payloads.push({
                    taskID: subTaskId,
                    type: "TASK_ATTRIBUTE",
                    attributeDetails: {
                        attributeKey: editStatus.attributeId,
                        taskFieldID: editStatus.fieldID,
                        attributeValue: editRow.status,
                    },
                });
            }

            if (payloads.length) {
                try {
                    await Promise.all(
                        payloads.map(payload => axios.put(`/tasks/${subTaskId}`, payload))
                    );
                    addToast('Sub task successfully updated', { appearance: 'success' });
                    setIsEditing(false);
                    refetchTask(true);
                } catch (error) {
                    console.error('Error updating sub task:', error);
                    addToast('Failed to update the sub task', { appearance: 'error' });
                }
            } else {
                addToast('No changes to update', { appearance: 'warning' });
            }
        };

        return (
            <tr className="border-b border-gray-200">
                {!isEditing ? (
                    <>
                        <td className="py-5 px-4 text-text-color cursor-pointer" onClick={onRedirectClick}>{subTask?.name}</td>
                        <td className="py-5 px-4 flex gap-3 items-center text-text-color">
                            <div
                                className="w-8 h-8 rounded-full bg-primary-pink flex items-center justify-center text-white text-md font-semibold">
                                {assignee ? (getInitials(`${assignee?.firstName} ${assignee?.lastName}`)) : "N/A"}
                            </div>
                            {assignee && (<p>{assignee?.firstName}</p>)}
                        </td>
                        <td className="py-5 px-4">
                            <div className={"max-w-28"}>
                                {statusCellRender(editStatus)}
                            </div>
                        </td>
                        <td className="px-4 py-5">
                            <div className={"flex gap-5"}>
                                <div className="cursor-pointer" onClick={() => setIsEditing(true)}>
                                    <EllipsisVerticalIcon className={"w-5 h-5 text-secondary-grey cursor-pointer"} />
                                </div>
                            </div>
                        </td>
                    </>
                ) : (
                    <>
                        <td className="px-4 py-5 w-44">
                            <FormInput
                                type="text"
                                name="name"
                                formValues={{ name: editRow.name }}
                                onChange={({ target: { name, value } }) => handleEditFormChange(name, value, true)}
                            />
                        </td>
                        <td className="px-4 py-5">
                            <UserSelect
                                name="name"
                                values={{ assignee: editRow.assignee }}
                                users={users}
                                onChange={({ target: { name, value } }) => handleEditFormChange(name, value, false)}
                                
                            />
                        </td>
                        <td className="px-4 py-5">
                            <FormSelect
                                name="status"
                                formValues={{ status: editRow.status }}
                                options={getSelectOptions(status)}
                                onChange={({ target: { name, value } }) => handleEditFormChange(name, value, false)}
                            />
                        </td>
                        <td className="px-4 py-5">
                            <div className={"flex gap-5"}>
                                <div className={"cursor-pointer"} onClick={handleUpdateTask}>
                                    <CheckBadgeIcon className={"w-6 h-6 text-pink-700"} />
                                </div>
                                <div className={"cursor-pointer"} onClick={onHideEdit}>
                                    <XMarkIcon className={"w-6 h-6 text-text-color"} />
                                </div>
                            </div>
                        </td>
                    </>
                )}
            </tr>
        );
    };

    return (
        <div className="w-full mt-8 px-6 py-4 bg-white rounded-md">
            {(subtasks && subtasks.length) || showNewRow ? (
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
                                    <td className="px-4 py-5 w-44">
                                        <FormInput
                                            type="text"
                                            name="name"
                                            formValues={{ name: newRow.name }}
                                            onChange={({ target: { name, value } }) => handleFormChange(name, value, true)}
                                        />
                                    </td>
                                    <td className="px-4 py-5">
                                        <UserSelect
                                            name="assignee"
                                            values={{ assignee: newRow.assignee }}
                                            users={users}
                                            onChange={({ target: { name, value } }) => handleFormChange(name, value, false)}
                                        />
                                    </td>
                                    <td className="px-4 py-5">
                                        <FormSelect
                                            name="status"
                                            formValues={{ status: newRow.status }}
                                            options={getSelectOptions(status)}
                                            onChange={({ target: { name, value } }) => handleFormChange(name, value, false)}
                                        />
                                    </td>
                                    <td className="px-4 py-5">
                                        <div className={"flex gap-5"}>
                                            <div className={"cursor-pointer"} onClick={handleSaveSubTask}>
                                                <CheckBadgeIcon className={"w-6 h-6 text-pink-700"} />
                                            </div>
                                            <div className={"cursor-pointer"} onClick={onHideNew}>
                                                <XMarkIcon className={"w-6 h-6 text-text-color"} />
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            )}
                            {currentPageContent.map((task) => (
                                <GenerateRow subTask={task} key={task?.id} />
                            ))}
                        </tbody>
                    </table>
                    {(subtasks && subtasks.length > 0) && (
                        <div className="w-full flex gap-5 items-center justify-end mt-4">
                            <button
                                onClick={handlePreviousPage}
                                className={`p-2 rounded-full bg-gray-200 ${currentPage === 1 ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-300"}`}
                                disabled={currentPage === 1}
                            >
                                <ChevronLeftIcon className={"w-4 h-4 text-secondary-grey"} />
                            </button>
                            <span className="text-gray-500 text-center">Page {currentPage} of {totalPages}</span>
                            <button
                                onClick={handleNextPage}
                                className={`p-2 rounded-full bg-gray-200 ${currentPage === totalPages ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-300"}`}
                                disabled={currentPage === totalPages}
                            >
                                <ChevronRightIcon className={"w-4 h-4 text-secondary-grey"} />
                            </button>
                        </div>
                    )}
                </>
            ) : (
                <p className="text-text-color w-full text-center">No Sub Tasks Available</p>
            )}
        </div>
    );
};

export default SubTaskSection;
