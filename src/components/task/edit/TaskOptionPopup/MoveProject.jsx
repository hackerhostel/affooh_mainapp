import React, {useCallback, useState} from "react";
import {useSelector} from "react-redux";
import FormInput from "../../../../components/FormInput";
import FormSelect from "../../../../components/FormSelect";
import {selectProjectList, selectSelectedProject} from "../../../../state/slice/projectSlice";
import axios from "axios";
import {useToasts} from "react-toast-notifications";
import {useHistory} from "react-router-dom";

const MoveProjectPopup = ({isOpen, onClose, taskID, taskTypeID, sprintId}) => {
    const {addToast} = useToasts();
    const history = useHistory();
    const [selectedProject, setSelectedProject] = useState(null);
    const selectedProjectFromStore = useSelector(selectSelectedProject);
    const projectList = useSelector(selectProjectList);

    const getProjectOptions = useCallback(() => {
        return projectList
            .filter((project) => selectedProjectFromStore?.id !== project.id)
            .map((project) => ({
                value: project.id,
                label: project.name,
            }));
    }, [projectList]);

    const handleMoveProject = async () => {
        if (selectedProject) {
            try {
                const response = await axios.post(`/tasks/${taskID}/move-to-project`, {
                    projectID: selectedProject,
                    taskID: taskID,
                    taskTypeID: taskTypeID
                })
                const status = response?.status
                if (status === 204) {
                    addToast('Task Moved Successfully', {appearance: 'success'});
                    history.push(`/sprints/${sprintId}`);
                    onClose();
                } else {
                    addToast('Failed move the task', {appearance: 'error'});
                }
            } catch (error) {
                addToast('Failed move the task', {appearance: 'error'});
            }
        } else {
            addToast('Please select a project', {appearance: 'warning'});
        }
    };

    return (
        <>
            {isOpen && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                    <div className="bg-white rounded-lg shadow-lg p-6 w-[500px]">
                        <div className="flex justify-between items-center border-b pb-2">
              <span className="text-lg font-semibold">
                Move Project: <span className="text-sm">Select Project</span>
              </span>
                            <button className="text-gray-500 hover:text-gray-700" onClick={onClose}>
                                ✖
                            </button>
                        </div>

                        <div className="mt-4">

                            <label className="text-sm text-gray-500">Current Project</label>
                            <FormInput
                                name="currentProject"
                                formValues={{currentProject: selectedProjectFromStore?.name || "N/A"}}
                                placeholder="Current Project"
                                className="w-full p-2 border rounded-md bg-gray-100 cursor-not-allowed"
                                disabled={true}
                                showErrors={false}
                                showLabel={false}
                            />


                            <label className="text-sm text-gray-500 mt-4 block">New Project</label>
                            <FormSelect
                                name="newProject"
                                showLabel={false}
                                formValues={{newProject: selectedProject}}
                                placeholder="Select a project"
                                options={getProjectOptions()}
                                onChange={(e, value) => setSelectedProject(value)}
                            />
                        </div>


                        <div className="flex justify-between space-x-2 mt-6">
                            <button className="btn-secondary" onClick={onClose}>
                                Cancel
                            </button>
                            <button
                                className="btn-primary"
                                onClick={handleMoveProject}
                            >
                                Move Project
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default MoveProjectPopup;
