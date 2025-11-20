import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from "react-redux";
import { XMarkIcon } from '@heroicons/react/24/outline';
import FormInput from "../../components/FormInput.jsx";
import FormSelect from "../../components/FormSelect.jsx";
import useValidation from "../../utils/use-validation.jsx";
import axios from 'axios';
import { CreateTaskTypeSchema } from '../../utils/validationSchemas.js';
import { useToasts } from 'react-toast-notifications';
import { selectProjectList, selectSelectedProject } from "../../state/slice/projectSlice.js";
import { fetchScreensByOrganization, selectScreens } from "../../state/slice/screenSlice.js";
import FormTextArea from "../../components/FormTextArea.jsx";
import { getSelectOptions } from "../../utils/commonUtils";

const CreateNewTaskType = ({ isOpen, onClose }) => {
    const { addToast } = useToasts();
    const [formValues, setFormValues] = useState({
        name: '',
        description: '',
        projectIDs: [],
        screenID: null
    });


    const [isValidationErrorsShown, setIsValidationErrorsShown] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formErrors] = useValidation(CreateTaskTypeSchema, {
        ...formValues,
        projectIDs: formValues.projectIDs ?? [],
    });


    const dispatch = useDispatch();
    const projectList = useSelector(selectProjectList);
    const selectedProject = useSelector(selectSelectedProject);
    const screens = useSelector(selectScreens);

    useEffect(() => {
        dispatch(fetchScreensByOrganization());
    }, [dispatch]);

    const handleFormChange = (name, value) => {
        if (name === "projectIDs") {
            setFormValues({ ...formValues, [name]: [String(value)] });
        } else if (name === "screenID") {
            setFormValues({ ...formValues, [name]: value ? Number(value) : null });
        } else {
            setFormValues({ ...formValues, [name]: value });
        }
        setIsValidationErrorsShown(false);
    };


    const handleClose = () => {
        onClose();
        setFormValues({
            name: '',
            description: '',
            projectIDs: [],
            screenID: null
        });
        setIsValidationErrorsShown(false);
    };


    const createNewTaskType = async (event) => {
        event.preventDefault();
        setIsSubmitting(true);

        const payload = {
            name: formValues.name,
            description: formValues.description,
            projectIDs: Array.isArray(formValues.projectIDs)
                ? formValues.projectIDs
                : [formValues.projectIDs],
            screenID: formValues.screenID ?? null,
        };



        if (
            !payload.projectIDs.length ||
            payload.screenID === null ||
            isNaN(payload.screenID) ||
            (formErrors && Object.keys(formErrors).length > 0)
        ) {
            setIsValidationErrorsShown(true);
            setIsSubmitting(false);
            return;
        }

        try {
            await axios.post("/task-types", { taskType: payload });
            addToast('Task type created successfully!', { appearance: 'success' });
            handleClose();
        } catch (error) {
            console.error("API Error:", error);
            console.error("Error response:", error.response?.data);
            addToast('Failed to create the Task type', { appearance: 'error' });
        }

        setIsSubmitting(false);
    };


    return (
        isOpen && (
            <div className="fixed inset-0 flex items-right justify-end bg-white bg-opacity-25 backdrop-blur-sm">
                <div className="bg-white p-6 shadow-lg w-2/4">
                    <div className="flex justify-between items-center mb-4">
                        <p className="font-bold text-2xl">New Task Type</p>
                        <div className="cursor-pointer" onClick={handleClose}>
                            <XMarkIcon className="w-6 h-6 text-gray-500" />
                        </div>
                    </div>
                    <form className="flex flex-col justify-between h-5/6 mt-10" onSubmit={createNewTaskType}>
                        <div className="space-y-4">
                            <div className="flex-col">
                                <p className="text-secondary-grey">Name</p>
                                <FormInput
                                    type="text"
                                    name="name"
                                    formValues={formValues}
                                    onChange={({ target: { name, value } }) =>
                                        handleFormChange(name, value)
                                    }
                                    formErrors={formErrors}
                                    showErrors={isValidationErrorsShown}
                                />
                            </div>
                            <div className="flex-col">
                                <p className="text-secondary-grey">Description</p>
                                <FormTextArea
                                    name="description"
                                    formValues={formValues}
                                    onChange={({ target: { name, value } }) => handleFormChange(name, value)}
                                    formErrors={formErrors}
                                    showErrors={isValidationErrorsShown}
                                    rows={6}
                                />

                            </div>

                            <div className="flex-col">
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

                            <div className="flex-col">
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
                        <div className="flex space-x-4 mt-6 self-end w-full">
                            <button
                                onClick={handleClose}
                                className="btn-secondary"
                                disabled={isSubmitting}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="btn-primary"
                                disabled={isSubmitting}
                            >
                                Create
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        )
    );
};

export default CreateNewTaskType;
