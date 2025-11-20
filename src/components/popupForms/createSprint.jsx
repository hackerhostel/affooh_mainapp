import React, {useState} from 'react';
import {XMarkIcon} from '@heroicons/react/24/outline';
import FormInput from "../../components/FormInput.jsx";
import {useToasts} from "react-toast-notifications";
import axios from "axios";
import {useDispatch, useSelector} from "react-redux";
import {selectSelectedProject} from "../../state/slice/projectSlice.js";
import {doGetSprintBreakdown, selectSprintFormData} from "../../state/slice/sprintSlice.js";

const CreateSprintPopup = ({
  isOpen,
  formErrors,
  isValidationErrorsShown,
  handleClosePopup
}) => {
  const {addToast} = useToasts();
  const dispatch = useDispatch();
  const selectedProject = useSelector(selectSelectedProject);
  const sprintStatusList = useSelector(selectSprintFormData);

  const [createSprintDetails, setCreateSprintDetails] = useState({
    name: '',
    startDate: '',
    endDate: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLocalFormChange = (name, value) => {
    setCreateSprintDetails(prevDetails => ({
      ...prevDetails,
      [name]: value
    }));
  };

  const resetForm = () => {
    setCreateSprintDetails({
      name: '',
      startDate: '',
      endDate: ''
    });
  };

  const handleClose = () => {
    resetForm();
    if (handleClosePopup) {
      handleClosePopup();
    }
  };

  const createSprint = async (event) => {
    event.preventDefault();
    setIsSubmitting(true)

    try {
      const response = await axios.post("/sprints", {
        project: {
          ...createSprintDetails,
          projectID: selectedProject?.id,
          statusID: sprintStatusList[0]?.id
        }
      })
      const sprintID = response?.data?.body?.sprintID

      if (sprintID > 0) {
        addToast('Sprint Successfully Created', {appearance: 'success'});
        dispatch(doGetSprintBreakdown(selectedProject?.id))
        handleClose()
      } else {
        addToast('Failed To Create The Sprint', {appearance: 'error'});
      }
    } catch (error) {
      addToast('Failed To Create The Sprint', {appearance: 'error'});
    }
    setIsSubmitting(false)
  }

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 flex items-right justify-end bg-white bg-opacity-25 backdrop-blur-sm">
          <div className="bg-white p-6 shadow-lg w-1/3 h-full">
            <div className="flex justify-between items-center mb-4">
              <p className="font-bold text-2xl">Create New Sprint</p>
              <button onClick={handleClose} className="cursor-pointer">
                <XMarkIcon className="w-6 h-6 text-gray-500" />
              </button>
            </div>
            <form
              className="flex flex-col justify-between h-5/6 mt-10"
              onSubmit={createSprint}
            >
              <div className="space-y-4">
                <div className="flex-col">
                  <FormInput
                    type="text"
                    name="name"
                    formValues={createSprintDetails}
                    placeholder="Sprint Name"
                    onChange={({ target: { name, value } }) => handleLocalFormChange(name, value)}
                    formErrors={formErrors}
                    showErrors={isValidationErrorsShown}
                  />
                </div>
                <div className="flex gap-4 mt-5">
                  <div className="flex-col w-1/2">
                    <FormInput
                      type="date"
                      name="startDate"
                      formValues={createSprintDetails}
                      placeholder="Start Date"
                      onChange={({ target: { name, value } }) => handleLocalFormChange(name, value)}
                      formErrors={formErrors}
                      showErrors={isValidationErrorsShown}
                    />
                  </div>
                  <div className="flex-col w-1/2">
                    <FormInput
                      type="date"
                      name="endDate"
                      formValues={createSprintDetails}
                      placeholder="End Date"
                      onChange={({ target: { name, value } }) => handleLocalFormChange(name, value)}
                      formErrors={formErrors}
                      showErrors={isValidationErrorsShown}
                    />
                  </div>
                </div>
              </div>
              <div className="flex space-x-4 mt-6 self-end w-full">
                <button
                  type="button"
                  onClick={handleClose}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={isSubmitting}
                >
                  Create New Sprint
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default CreateSprintPopup;
