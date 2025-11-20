import React, { useCallback, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import FormInput from "../FormInput.jsx";
import FormSelect from "../FormSelect.jsx";
import { doSwitchProject, selectProjectList, selectSelectedProject } from "../../state/slice/projectSlice.js";
import {XMarkIcon} from '@heroicons/react/24/outline';

const CreateNewScreenPopup = ({
    screenDetails = {},
    handleFormChange,
    formErrors,
    isValidationErrorsShown,
    handleFormSubmit,
    handleClosePopup,
    handleDeleteStoryPoint
}) => {
    const dispatch = useDispatch();
    const selectedProject = useSelector(selectSelectedProject);
    const projectList = useSelector(selectProjectList);
    const [statusTags, setStatusTags] = useState([]);

    const handleProjectChange = (name, value) => {
        handleFormChange(name, value);
        dispatch(doSwitchProject(value));
    };

    const getProjectOptions = useCallback(() => {
        return projectList.map(project => ({
            value: project.id,
            label: project.name
        }));
    }, [projectList]);

    const handleAddTag = () => {
        setStatusTags([...statusTags, { id: Date.now(), name: 'Status' }]);
    };

    const handleRemoveTag = (id) => {
        setStatusTags(statusTags.filter(tag => tag.id !== id));
    };

    return (
        <div style={popupStyles}>
            <button onClick={handleClosePopup} style={closeButtonStyles}>
        <XMarkIcon className='w-6 h-6'/>
            </button>
            <span className='text-3xl'>Create New Screen</span>
            <form onSubmit={handleFormSubmit}>
                <div className='ml-2 mt-5'>
                    <FormInput
                        type="text"
                        name="name"
                        formValues={screenDetails}
                        placeholder="Name"
                        onChange={({ target: { name, value } }) => handleFormChange(name, value)}
                        formErrors={formErrors}
                        showErrors={isValidationErrorsShown}
                        style={{ marginTop: '8px' }}
                    />
                </div>

                <div className='ml-2 mt-5'>
                    <FormSelect
                        name="project"
                        formValues={{ project: screenDetails.project || selectedProject?.id }}
                        placeholder="Project"
                        options={getProjectOptions()}
                        onChange={handleProjectChange}
                        style={{ width: '100%', height: '45px', padding: '8px', borderRadius: '10px', borderColor: '#ccc', borderWidth: '1px', borderStyle: 'solid', marginTop: '8px' }}
                    />
                </div>

                <div className='ml-2 mt-5'>
                    <label>Description</label>
                    <textarea
                        name="description"
                        value={screenDetails.description || ''}
                        placeholder="Description"
                        onChange={({ target: { name, value } }) => handleFormChange(name, value)}
                        style={{ width: '100%', height: '152px', padding: '10px', borderRadius: '10px', borderColor: '#ccc', borderWidth: '1px', borderStyle: 'solid', resize: 'none', fontSize: '14px', marginTop: '8px' }}
                    />
                    {isValidationErrorsShown && formErrors.description && (
                        <span className="text-red-500">{formErrors.description}</span>
                    )}
                </div>

                <div className='ml-2 mt-4 flex justify-between items-center'>
                    <label>General</label>
                    <button
                        type="button"
                        onClick={handleAddTag}
                        style={{ borderRadius: '8px', border: '1.5px solid rgba(235, 90, 132, 1)' }}
                        className='text-black py-2 px-4 rounded-lg'
                    >
                        Add New 
                    </button>
                </div>

                <div className='ml-2 mt-3 flex flex-wrap gap-2'>
                    {statusTags.map(tag => (
                        <div
                            key={tag.id}
                            style={{ backgroundColor: '#333', color: '#fff', borderRadius: '16px', padding: '5px 10px', display: 'flex', alignItems: 'center', gap: '10px' }}
                        >
                            {tag.name}
                            <button
                                onClick={() => handleRemoveTag(tag.id)}
                                style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer' }}
                            >
                                &times;
                            </button>
                        </div>
                    ))}
                </div>

                <div className='ml-2'>
                    <div className='flex mt-3'>
                        <FormInput
                            type="text"
                            name="storyPoints"
                            formValues={screenDetails}
                            placeholder="Story Points"
                            onChange={({ target: { name, value } }) => handleFormChange(name, value)}
                            formErrors={formErrors}
                            showErrors={isValidationErrorsShown}
                            style={{ flex: 1, width: '600px' }}
                        />
                        <button
                            type="button"
                            onClick={handleDeleteStoryPoint}
                            style={{ color: 'black', width: '147px', height: '42px', borderRadius: '8px', border: '1.5px solid rgba(235, 90, 132, 1)', cursor: 'pointer', marginTop: '25px' }}
                        >
                            Add
                        </button>
                    </div>
                </div>

                <div className='flex gap-5 ml-6 mt-5'>
                    <input
                        type="button"
                        value="Cancel"
                        className="w-full py-3 rounded-lg text-black font-bold cursor-pointer"
                        style={{ width: '205px', borderColor: 'rgba(116, 122, 136, 1)', borderWidth: '2px', borderStyle: 'solid', color: 'rgba(116, 122, 136, 1)' }}
                        onClick={handleClosePopup}
                    />

                    <input
                        type="submit"
                        value="Create"
                        className="py-3 rounded-lg bg-primary-pink text-white font-bold cursor-pointer"
                        style={{ width: '484px' }}
                    />
                </div>
            </form>
        </div>
    );
};

const popupStyles = {
    position: 'fixed',
    top: '420px',
    right: '0',
    transform: 'translateY(-50%)',
    width: '797px',
    height: '840px',
    padding: '20px',
    backgroundColor: '#fff',
    boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)',
    zIndex: 1000,
    borderRadius: '8px 0 0 8px',
};

const closeButtonStyles = {
    position: 'absolute',
    top: '10px',
    right: '10px',
    background: 'transparent',
    border: 'none',
    fontSize: '16px',
    cursor: 'pointer',
};

export default CreateNewScreenPopup;
