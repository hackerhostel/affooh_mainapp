import React from 'react';
import FormInput from "../FormInput.jsx";
import {XMarkIcon} from '@heroicons/react/24/outline';

const CreateCustomFieldPopup = ({
  customFieldDetails = {},
  handleFormChange,
  formErrors,
  isValidationErrorsShown,
  handleFormSubmit,
  handleClosePopup,
  handleAddStoryPoint,
  handleDeleteStoryPoint
}) => {
  return (
    <div style={popupStyles}>
      <button onClick={handleClosePopup} style={closeButtonStyles}>
      <XMarkIcon className='w-6 h-6'/>
      </button>
      <span className='text-3xl'>Create New Custom Field</span>
      <form onSubmit={handleFormSubmit}>
        <div className='ml-2 mt-5'>
          <label>Field Type</label>
          <select
            name="fieldType"
            value={customFieldDetails.fieldType || ''}
            onChange={({ target: { name, value } }) => handleFormChange(name, value)}
            style={{ width: '100%', height:'45px', padding: '8px', borderRadius: '10px', marginTop: '20px' }}
          >
            <option value="">Select Field Type</option>
            <option value="text">Text</option>
            <option value="number">Number</option>
            <option value="date">Date</option>
            <option value="select">Select</option>
          </select>
        </div>

        <div className='ml-2 mt-3'>
          <FormInput
            type="text"
            name="name"
            formValues={customFieldDetails}
            placeholder="Name"
            onChange={({ target: { name, value } }) => handleFormChange(name, value)}
            formErrors={formErrors}
            showErrors={isValidationErrorsShown}
            style={{marginTop: '20px'}}
          />
        </div>

        <div className='ml-2 mt-3'>
          <label>Description</label>
          <textarea
            name="description"
            value={customFieldDetails.description || ''}
            placeholder="Description"
            onChange={({ target: { name, value } }) => handleFormChange(name, value)}
            style={{
              width: '100%',
              height: '152px',
              padding: '10px',
              borderRadius: '10px',
              borderColor: '#ccc',
              borderWidth: '1px',
              borderStyle: 'solid',
              resize: 'none',
              fontSize: '14px',
              marginTop:'20px'
            }}
          />
          {isValidationErrorsShown && formErrors.description && (
            <span className="text-red-500">{formErrors.description}</span>
          )}
        </div>

        <div className='ml-2 mt-4'>
          <label>Story Points</label>
          <div className='flex  mt-3 '>
            <FormInput
              type="number"
              name="storyPoints"
              formValues={customFieldDetails}
              placeholder="Story Points"
              onChange={({ target: { name, value } }) => handleFormChange(name, value)}
              formErrors={formErrors}
              showErrors={isValidationErrorsShown}
              style={{ flex: 1, marginTop:'20px', width:'600px' }}
            />
            <button
              type="button"
              onClick={handleDeleteStoryPoint}
              style={{
                color: 'black',
                width:'147px',
                height:'42px',
                borderRadius: '8px',
                border: '1.5px solid rgba(235, 90, 132, 1)',
                cursor: 'pointer',
                marginTop:'40px'
              }}
            >
              Add
            </button>
          </div>
        </div>

        <br />
        <div className='flex  gap-5 ml-6'>
          <input
            type="button"
            value="Cancel"
            className="w-full py-3 rounded-lg text-black font-bold cursor-pointer"
            style={{
              width: '205px',
              borderColor: 'rgba(116, 122, 136, 1)',
              borderWidth: '2px',
              borderStyle: 'solid',
              color: 'rgba(116, 122, 136, 1)'
            }}
            onClick={handleClosePopup}
          />

          <input
            type="submit"
            value="Create New Custom Field"
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

export default CreateCustomFieldPopup;
