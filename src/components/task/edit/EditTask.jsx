import FormInput from "../../FormInput.jsx";
import React, {useEffect, useState} from "react";
import useValidation from "../../../utils/use-validation.jsx";
import {LoginSchema} from "../../../state/domains/authModels.js";
import {useParams} from "react-router-dom";
import axios from "axios";
import SkeletonLoader from "../../SkeletonLoader.jsx";
import ErrorAlert from "../../ErrorAlert.jsx";
import {getSelectOptions, getUserOptions} from "../../../utils/commonUtils.js";
import FormSelect from "../../FormSelect.jsx";
import {useSelector} from "react-redux";
import {selectProjectUserList} from "../../../state/slice/projectUsersSlice.js";
import FormInputWrapper from "./FormEditInputWrapper.jsx";
import EditTaskScreenDetails from "./EditTaskScreenDetails.jsx";
import {useToasts} from "react-toast-notifications";
import TimeTracking from "./TimeTracking.jsx";
import useFetchTimeLogs from "../../../hooks/custom-hooks/task/useFetchTimeLogs.jsx";
import CommentAndTimeTabs from "./CommentAndTimeTabs.jsx";
import TaskRelationTabs from "./TaskRelationTabs.jsx";
import useFetchTask from "../../../hooks/custom-hooks/task/useFetchTask.jsx";
import useFetchFlatTasks from "../../../hooks/custom-hooks/task/useFetchFlatTasks.jsx";
import {selectSelectedProject} from "../../../state/slice/projectSlice.js";
import WYSIWYGInput from "../../WYSIWYGInput.jsx";
import {selectSelectedSprint} from '../../../state/slice/sprintSlice.js';
import UserSelect from "../../UserSelect.jsx";
import useFetchComments from "../../../hooks/custom-hooks/task/useFetchComments.jsx";
import {EllipsisVerticalIcon} from "@heroicons/react/24/outline";
import TaskOptionsPopup from "./TaskOptionPopup.jsx";


const EditTaskPage = () => {
    const { code } = useParams();
    const { addToast } = useToasts();
    const projectUserList = useSelector(selectProjectUserList);
    const selectedProject = useSelector(selectSelectedProject);
    const Sprint = useSelector(selectSelectedSprint);

    const [initialTaskData, setInitialTaskData] = useState({});
    const [taskData, setTaskData] = useState({});
    const [taskAttributes, setTaskAttributes] = useState([]);
    const [description, setDescription] = useState('');
    const [initialDescription, setInitialDescription] = useState('');
    const [isValidationErrorsShown, setIsValidationErrorsShown] = useState(false);
    const [isEditing, setIsEditing] = useState(false)
    const [epics, setEpics] = useState([]);
    const [formErrors] = useValidation(LoginSchema, taskData);
    const [isOpen, setIsOpen] = useState(false);

    const {
        loading: loading, error: apiError, data: taskDetails, refetch: refetchTask
    } = useFetchTask(code)
    const { data: timeLogs, refetch: refetchTimeLogs } = useFetchTimeLogs(initialTaskData?.id)
    const { data: comments, refetch: reFetchComments } = useFetchComments(initialTaskData?.id || 0)
    const { data: tasksList } = useFetchFlatTasks(initialTaskData?.project?.id)

    const handleFormChange = (name, value) => {
        const newForm = { ...taskData, [name]: value };
        setTaskData(newForm);
    };

    const handleDescription = (name, value) => {
        setDescription(value);
    };

    const handleAdditionalFieldChange = (fieldId, value) => {
        const filteredTaskAttribute = taskAttributes.find(ta => ta?.taskFieldID === fieldId);
        if (filteredTaskAttribute) {
            filteredTaskAttribute.values[0] = value;
            setTaskAttributes(prevValues => prevValues.map(ta => ta.taskFieldID === fieldId ? filteredTaskAttribute : ta));
        }
    };

    const updateStates = (task) => {
        setTaskData({ ...task, assignee: task?.assignee?.id })
        setInitialDescription(task?.description || '')
        setDescription(task?.description || '')
        setTaskAttributes(JSON.parse(JSON.stringify(task?.attributes)));
        setInitialTaskData({ ...task })
    }

    useEffect(() => {
        if (taskDetails?.id && taskDetails?.attributes && taskDetails?.attributes.length) {
            updateStates(taskDetails)
        }
    }, [taskDetails]);

    useEffect(() => {
        if (tasksList?.length) {
            setEpics(tasksList.filter(tl => tl.type === "Epic"))
        }
    }, [tasksList]);

    if (loading) {
        return <div className="p-5"><SkeletonLoader fillBackground /></div>
    }

    if (apiError) {
        return <div className="p-10"><ErrorAlert message="Cannot get task additional details at the moment" /></div>
    }

    const updateTaskDetails = async (attributeKey, attributeValue) => {
        setIsEditing(true)
        const payload = {
            "taskID": initialTaskData.id, "type": "TASK", "attributeDetails": {
                attributeKey, attributeValue
            }
        }

        try {
            const updatedTask = await axios.put(`/tasks/${initialTaskData.id}`, payload)
            const updatedTaskDetails = updatedTask?.data?.body?.task
            if (updatedTaskDetails) {
                await refetchTask(true)
                addToast(`Task successfully updated!`, { appearance: 'success', autoDismiss: true });
            }
        } catch (e) {
            setTaskData(initialTaskData)
            addToast(e.message, { appearance: 'error' });
        } finally {
            setIsEditing(false);
        }
    }

    const updateTaskAttribute = async (fieldId, value) => {
        let payload = {
            taskID: initialTaskData.id, type: "TASK_ATTRIBUTE", attributeDetails: {},
        };

        const filteredAttribute = taskAttributes.find((ta) => ta?.taskFieldID === fieldId);
        if (filteredAttribute) {
            payload.attributeDetails = {
                attributeKey: filteredAttribute?.id, taskFieldID: filteredAttribute.taskFieldID, attributeValue: value,
            };
        } else {
            payload.attributeDetails = {
                taskFieldID: fieldId, attributeValue: value, attributeValues: [value]
            };
        }

        try {
            const updatedTask = await axios.put(`/tasks/${initialTaskData.id}`, payload);
            const updatedTaskDetails = updatedTask?.data?.body?.task;
            if (updatedTaskDetails) {
                await refetchTask(true)
                addToast(`Task attribute updated!`, { appearance: "success", autoDismiss: true });
            }
        } catch (e) {
            addToast(e.message, { appearance: "error" });
        } finally {
            setIsEditing(false);
        }
    };

    const filterTaskFieldValue = (fieldName) => {
        return taskAttributes.find((ta) => ta?.taskFieldName === fieldName)?.values[0] || "";
    };

    const filterTaskFieldId = (fieldName) => {
        let taskFieldID = "";
        const taskAttributesFieldID = taskAttributes.find((ta) => ta?.taskFieldName === fieldName)?.taskFieldID || "";
        if (taskAttributesFieldID !== "") {
            taskFieldID = taskAttributesFieldID;
        } else {
            const taskScreens = taskData?.screen || {};
            const generalScreen = taskScreens.tabs?.find((t) => t.name === "General");
            taskFieldID = generalScreen?.fields?.find((f) => f.name === fieldName)?.id || "";
        }

        return taskFieldID;
    };

    return (<div className="flex">
        <div className="w-8/12 p-5 bg-dashboard-bgc">
            <div className="flex mt-3 text-sm flex-col">
                <div className="flex gap-5 items-center">
                    <span className="text-sm text-text-color">
                        <span
                            className="text-project-name-content-pages-color font-semibold ">{selectedProject?.name || "No project selected"}
                        </span>  &gt;  {Sprint?.name} &gt; {initialTaskData.name}
                    </span>
                    <div className="bg-primary-pink text-white rounded-full px-6 py-1 inline-block">
                        {taskDetails?.taskType?.name}
                    </div>
                </div>
                <span className="text-text-color mt-2">
                    <span>Created date: {taskDetails?.createdAt ? new Date(taskDetails.createdAt).toLocaleDateString() : "N/A"} </span>
                    <span
                        className="ml-3">Created by: {taskDetails?.createdBy ? `${taskDetails.createdBy.firstName} ${taskDetails.createdBy.lastName}` : "Unknown"}
                    </span>
                </span>

            </div>
            <div className="bg-white p-5 rounded-md mt-5">
                <div className="mb-6">
                    <FormInputWrapper
                        isEditing={isEditing}
                        initialData={initialTaskData}
                        currentData={taskData}
                        onAccept={() => {
                            updateTaskDetails("Name", taskData.name);
                        }}
                        onReject={() => {
                            handleFormChange('name', initialTaskData.name);
                        }}
                    >
                        <FormInput
                            type="text"
                            name="name"
                            formValues={taskData}
                            placeholder="Title"
                            onChange={({ target: { name, value } }) => handleFormChange(name, value)}
                            formErrors={formErrors}
                            showErrors={isValidationErrorsShown}
                        />
                    </FormInputWrapper>
                </div>
                <div>
                    <label className="block text-sm font-medium text-secondary-text mb-1">Description</label>
                    <div className="border border-gray-300 rounded-md p-2">
                        <div className="flex space-x-2 mb-2">
                            <button type="button" className="p-1 rounded hover:bg-gray-100">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    className="w-4 h-4">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                        d="M4 6h16M4 12h16M4 18h16" />
                                </svg>
                            </button>
                            {/* Add more formatting buttons here */}
                        </div>
                        <div className="mb-6">
                            <FormInputWrapper
                                isEditing={isEditing}
                                initialData={{ description: initialDescription }}
                                currentData={{ description: description }}
                                onAccept={() => {
                                    updateTaskDetails("Description", description);
                                }}
                                onReject={() => {
                                    setDescription(initialDescription)
                                }}
                                actionButtonPlacement={"bottom"}
                            >
                                <WYSIWYGInput initialValue={initialDescription}
                                    value={description}
                                    name={"description"} onchange={handleDescription} />
                            </FormInputWrapper>
                        </div>
                    </div>
                </div>
            </div>


            <TaskRelationTabs taskId={initialTaskData?.id || ''} subTasks={taskData?.subTasks}
                sprintId={taskData?.sprint?.id} refetchTask={refetchTask}
                projectId={selectedProject?.id}
                linkedTasks={taskData?.linkedTasks} projectTaskList={tasksList}
                acceptedCriteria={taskData?.acceptedCriteria} testCases={taskData?.testCases} />
            <CommentAndTimeTabs timeLogs={timeLogs} taskId={initialTaskData?.id || ''}
                refetchTimeLogs={refetchTimeLogs}
                comments={comments} reFetchComments={reFetchComments} />
        </div>
        <div className=" p-5 bg-dashboard-bgc">
            <div className="flex flex-col ">
            <div className="relative">
    <div
        style={{ marginLeft: "400px" }}
        onClick={() => setIsOpen((prev) => !prev)} 
        className="w-6 justify-end flex mt-11"
    >
        <EllipsisVerticalIcon className="text-text-color cursor-pointer" />
    </div>

    <TaskOptionsPopup
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        task={taskData}
    />
</div>


                <div className="bg-white p-5 rounded-md mt-5">
                    <div className="mb-6 mt-5">
                        <UserSelect
                            name="assignee"
                            value={taskData.assignee}
                            onChange={({ target: { name, value } }) => {
                                handleFormChange(name, value)
                                updateTaskDetails("assigneeID", value)
                            }}
                            users={projectUserList && projectUserList.length ? getUserOptions(projectUserList) : []}
                            label={"Assignee"}
                        />
                    </div>
                    <div className="mb-6">
                        <UserSelect
                            name="owner"
                            value={filterTaskFieldValue("Task Owner")}
                            onChange={({ target: { value } }) => {
                                handleAdditionalFieldChange(filterTaskFieldId("Task Owner"), value)
                                updateTaskAttribute(filterTaskFieldId("Task Owner"), value);
                            }}
                            users={projectUserList && projectUserList.length ? getUserOptions(projectUserList) : []}
                            label={"Task Owner"}
                        />
                    </div>
                    <div className="mb-6">
                        <FormSelect
                            placeholder="Epic"
                            name="epicID"
                            formValues={{ epicID: taskData?.epicID }}
                            options={getSelectOptions(epics)}
                            onChange={({ target: { name, value } }) => {
                                handleFormChange(name, value);
                                updateTaskDetails("epicID", value)
                            }}
                            disabled={isEditing}
                        />
                    </div>
                </div>
            </div>


            <EditTaskScreenDetails
                isEditing={isEditing}
                initialTaskData={initialTaskData}
                handleFormChange={handleAdditionalFieldChange}
                isValidationErrorsShown={isValidationErrorsShown}
                screenDetails={taskData.screen}
                updateTaskAttribute={updateTaskAttribute}
                users={projectUserList}
                taskAttributes={taskAttributes}
            />
            <TimeTracking timeLogs={timeLogs}
                initialEstimationAttribute={initialTaskData?.attributes?.find(ta => ta?.taskFieldName === "Estimation") || {}}
                updateTaskAttribute={updateTaskAttribute} isEditing={isEditing}
                taskFieldID={filterTaskFieldId("Estimation")}
            />
        </div>
    </div>)
}

export default EditTaskPage