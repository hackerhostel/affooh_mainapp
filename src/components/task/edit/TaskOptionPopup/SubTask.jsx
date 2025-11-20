import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import useFetchTask from "../../../../hooks/custom-hooks/task/useFetchTask";
import { useParams } from "react-router-dom";
import FormInput from "../../../../components/FormInput";
import FormSelect from "../../../../components/FormSelect";
import { selectSelectedProject } from "../../../../state/slice/projectSlice";
import { selectAppConfig } from "../../../../state/slice/appSlice";
import useValidation from "../../../../utils/use-validation";
const ChangeTypePopup = ({ sprintId, isOpen, onClose, currentIssueType, issueTypeOptions }) => {
    const { code } = useParams();
    const dispatch = useDispatch();
    const [selectedType, setSelectedType] = useState("");
    const [createTaskForm, setCreateTaskForm] = useState({ name: '', taskTypeID: '', description: '' });
    const [additionalFormValues, setAdditionalFormValues] = useState({});
    const tasksList = useSelector((state) => state.tasksList);
    const selectedProject = useSelector(selectSelectedProject);
    const appConfig = useSelector(selectAppConfig);
    

    const {
        loading: loading, error: apiError, data: taskDetails, refetch: refetchTask
    } = useFetchTask(code)
    const updateStates = (taskDetails) => {
        setSelectedType(taskDetails.issueType || ""); 
    };

    const fetchScreenForTask = async (screenId) => {
        setIsTaskTypeLoading(true)
        try {
            const response = await axios.get(`screens/${screenId}?projectID=${selectedProject.id}`)
            if (response.data.screen) {
                const screenData = response.data.screen

                setScreenDetails(screenData)
                setRequiredAdditionalFieldList(getRequiredAdditionalFieldList(screenData.tabs))
            }
            setIsTaskTypeApiError(false)
        } catch (e) {
            setIsTaskTypeApiError(true)
        } finally {
            setIsTaskTypeLoading(false)
            setAdditionalFormValues({})
        }
    }

    const payload = {
        ...createTaskForm,
        sprintID: sprintId,
        projectID: selectedProject?.id,
        attributes: Object.entries(additionalFormValues).map(([key, value]) => value),
    };

    const handleFormChange = (name, value) => {
        if (name === 'taskTypeID') {
            const selectedTaskType = appConfig.taskTypes.find(tt => tt.id === parseInt(value))
            if (selectedTaskType?.screenID) {
                fetchScreenForTask(selectedTaskType.screenID)
                setIsEpicScreen(selectedTaskType.value === 'Epic')
            }
        }

        const newForm = { ...createTaskForm, [name]: value };
        setCreateTaskForm(newForm);
    };



    if (!isOpen) return null;

    useEffect(() => {
        if (taskDetails?.id && taskDetails?.attributes && taskDetails?.attributes.length) {
            updateStates(taskDetails);
        }
    }, [taskDetails]);


    useEffect(() => {
        if (tasksList?.length) {
            setEpics(tasksList.filter(tl => tl.type === "Epic"))
        }
    }, [tasksList])



    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-[500px]">
                {/* Header */}
                <div className="flex justify-between items-center border-b pb-2">
                    <span className="text-sm  font-semibold">
                        Convert To Sub task: <span className="text-gray-500">Select parent</span>
                    </span>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-xl">
                        &times;
                    </button>
                </div>

                <div className="mt-4">
                    <label className="text-sm text-gray-500">Current Sub Task Type</label>
                    <FormInput
                        name="currentIssueType"
                        formValues={{ currentIssueType: taskDetails?.taskType?.name || "N/A" }}
                        placeholder="Current Issue Type"
                        className="w-full p-2 border rounded-md bg-gray-100 cursor-not-allowed"
                        disabled={true}
                        showErrors={false}
                        showLabel={false}
                    />

                </div>

                
                <div className="mt-4">
                    <label className="text-sm text-gray-500">New Issue Type</label>
                    <FormSelect
                        showLabel
                        name="taskTypeID"
                        formValues={createTaskForm}
                        options={appConfig.taskTypes.map(tt => {
                            return {
                                label: tt.value, value: tt.id
                            }
                        })}
                        onChange={({ target: { name, value } }) => handleFormChange(name, value)}
                        
                    />
                </div>

            
                <div className="flex justify-end mt-6 gap-2">
                    <button
                        onClick={onClose}
                        className="btn-secondary"
                    >
                        Cancel
                    </button>
                    <button

                        className="btn-primary"
                    >
                        Change Type
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ChangeTypePopup;
