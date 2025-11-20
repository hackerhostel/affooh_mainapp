import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useToasts } from 'react-toast-notifications';
import axios from 'axios';
import { ArrowLongLeftIcon } from '@heroicons/react/24/outline';
import { selectProjectList, selectSelectedProject } from "../../state/slice/projectSlice.js";
import { selectScreens } from "../../state/slice/screenSlice.js";
import { fetchAllTaskTypes, selectTaskTypes } from "../../state/slice/taskTypeSlice.js";
import FormInput from '../../components/FormInput';
import FormTextArea from '../../components/FormTextArea';
import FormSelect from "../../components/FormSelect.jsx";
import { getSelectOptions } from "../../utils/commonUtils";

const TaskTypeUpdate = ({ onClose, taskTypeId }) => {
  const dispatch = useDispatch();
  const { addToast } = useToasts();

  const [formValues, setFormValues] = useState({
    name: '',
    description: '',
    projectIDs: '',
    screenID: '',
    newValue: '',
    editValue: '',
    createdAt: '',
    createdBy: ''
  });

  const [formErrors, setFormErrors] = useState({});
  const [isValidationErrorsShown, setIsValidationErrorsShown] = useState(false);
  const projectList = useSelector(selectProjectList);
  const selectedProject = useSelector(selectSelectedProject);
  const screens = useSelector(selectScreens);
  const taskTypes = useSelector(selectTaskTypes)

  useEffect(() => {
    if (taskTypeId && taskTypes.length > 0) {
      const taskType = taskTypes.find((t) => t.id === Number(taskTypeId));
      if (taskType) {
        setFormValues({
          name: taskType.name || '',
          description: taskType.description || '',
          projectIDs: (taskType.projects || []).map(p => p.id),
          screenID: taskType.screen?.id || '',
          newValue: '',
          editValue: '',
          createdAt: taskType.createdAt || '',
          createdBy: taskType.createdBy || '',
        });
      }
    }
  }, [taskTypeId, taskTypes]);

  const handleFormChange = (name, value) => {
    setFormValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleTaskTypeUpdate = async () => {
    if (!taskTypeId) {
      addToast('Invalid Task Type ID', { appearance: 'error' });
      return;
    }
    try {
      await axios.put("/task-types/${taskTypeId}", {
        taskType: {
          id: Number(taskTypeId),
          name: formValues.name,
          description: formValues.description,
          projectIDs: Array.isArray(formValues.projectIDs)
            ? formValues.projectIDs.map(String)
            : [String(formValues.projectIDs)],
          screenID: Number(formValues.screenID),
        }
      });

      addToast("Task Type updated successfully!", { appearance: "success" });
      dispatch(fetchAllTaskTypes());
      onClose?.();
    } catch (error) {
      console.error("Error updating Task Type:", error);
      addToast("Failed to update Task Type", { appearance: "error" });
    }
  };

 const createDate = formValues?.createdAt
  ? new Date(formValues.createdAt).toLocaleDateString()
  : "-";

const createdBy = formValues?.createdBy || "-";


  return (
    <div className="p-3 bg-dashboard-bgc h-full">
      <div className="flex p-3 justify-between">
        <div className="flex flex-col space-y-5">
          <button className="w-8" onClick={onClose}>
            <ArrowLongLeftIcon />
          </button>
          <div className="flex items-center space-x-3">
            <span className="text-lg font-semibold">Task Type</span>
          </div>
          <div className="flex space-x-5 text-text-color">
            <span>
              Created date: <span>{createDate}</span>
            </span>
            <span>Created By: <span>{createdBy}</span></span>
          </div>
        </div>
        <div>
          <button
            className="bg-primary-pink px-8 py-2 rounded-md text-white"
            onClick={handleTaskTypeUpdate}
          >
            Update
          </button>
        </div>
      </div>

      <div className="mt-5 bg-white rounded-md">
        <div className="p-4">
          <FormInput
            type="text"
            name="name"
            formValues={formValues}
            placeholder="Name"
            onChange={({ target: { name, value } }) => handleFormChange(name, value)}
            formErrors={formErrors}
            showErrors={isValidationErrorsShown}
          />

          <FormTextArea
            name="description"
            placeholder="Description"
            showShadow={false}
            formValues={formValues}
            onChange={({ target: { name, value } }) => handleFormChange(name, value)}
            rows={6}
            formErrors={formErrors}
            showErrors={isValidationErrorsShown}
          />

          <div className='flex space-x-5 mt-8'>
            <div className="flex-col w-1/2">
              <p className="text-secondary-grey">Project</p>
              <FormSelect
                name="projectIDs"
                formValues={formValues}
                options={getSelectOptions(projectList && projectList.length ? projectList : [])}
                onChange={({ target: { name, value } }) =>
                  handleFormChange(name, value)
                }
              />
            </div>

            <div className="flex-col w-1/2">
              <p className="text-secondary-grey">Screens</p>
              <FormSelect
                name="screenID"
                formValues={formValues}
                showLabel={false}
                placeholder="Select a screen"
                options={getSelectOptions(
                  (screens || []).filter(screen =>
                    Array.isArray(screen.projects) &&
                    screen.projects.some(project => Number(project.id) === Number(selectedProject?.id))
                  )
                )}
                onChange={({ target: { name, value } }) => handleFormChange(name, value)}
                value={formValues.screenID}
              />
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskTypeUpdate;
