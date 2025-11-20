import React, {useCallback, useState} from "react";
import FormInput from "../../../../components/FormInput";
import FormSelect from "../../../../components/FormSelect";
import {useSelector} from "react-redux";
import {selectSprintListForProject} from "../../../../state/slice/sprintSlice.js";
import axios from "axios";
import {useToasts} from "react-toast-notifications";
import {useHistory} from "react-router-dom";

const MoveSprintPopup = ({isOpen, onClose, currentSprintName, currentSprintId, taskId}) => {
    const {addToast} = useToasts();
    const history = useHistory();
    const sprintListForProject = useSelector(selectSprintListForProject);
    const [selectedNewSprint, setSelectedNewSprint] = useState(null);

    const getSprintOptions = useCallback(() => {
        if (sprintListForProject.length) {
            return sprintListForProject
                .filter((sprint) => currentSprintId !== sprint.id)
                .map((sprint) => ({
                    value: sprint.id,
                    label: sprint.name,
                }));
        } else {
            return []
        }
    }, [sprintListForProject]);

    const handleMoveSprint = async () => {
        if (selectedNewSprint) {
            try {
                const response = await axios.post(`/tasks/${taskId}/move-to-sprint`, {
                    sprintID: selectedNewSprint
                })
                const status = response?.status
                if (status === 204) {
                    addToast('Task Moved Successfully', {appearance: 'success'});
                    history.push(`/sprints/${currentSprintId}`);
                    onClose();
                } else {
                    addToast('Failed move the task', {appearance: 'error'});
                }
            } catch (error) {
                addToast('Failed move the task', {appearance: 'error'});
            }
        } else {
            addToast('Please select a sprint', {appearance: 'warning'});
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-white rounded-lg shadow-lg p-6 w-[500px]">
                {/* Header */}
                <div className="flex justify-between items-center border-b pb-2">
          <span className="text-lg font-semibold">
            Move Sprint: <span className="text-sm">Select Sprint</span>
          </span>
                    <button className="text-gray-500 hover:text-gray-700" onClick={onClose}>
                        ✖
                    </button>
                </div>

                <div className="mt-4">
                    <label className="text-sm text-gray-500">Current Sprint</label>
                    <FormInput
                        name="currentSprint"
                        formValues={{currentSprint: currentSprintName}}
                        placeholder="Current Sprint"
                        className="w-full p-2 border rounded-md bg-gray-100 cursor-not-allowed"
                        disabled={true}
                        showErrors={false}
                        showLabel={false}
                    />

                    <label className="text-sm text-gray-500 mt-4 block">New Sprint</label>
                    <FormSelect
                        name="newSprint"
                        showLabel={false}
                        formValues={{newSprint: selectedNewSprint}}
                        placeholder="Select a new sprint"
                        options={getSprintOptions()}
                        onChange={(e, value) => setSelectedNewSprint(value)}
                    />
                </div>

                <div className="flex justify-between space-x-2 mt-6">
                    <button className="btn-secondary" onClick={onClose}>
                        Cancel
                    </button>
                    <button
                        className={`btn-primary`}
                        onClick={handleMoveSprint}

                    >
                        Move Sprint
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MoveSprintPopup;
