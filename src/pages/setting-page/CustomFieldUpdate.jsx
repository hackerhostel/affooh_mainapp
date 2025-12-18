import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import axios from 'axios';
import {
  TrashIcon,
  PlusCircleIcon,
  XMarkIcon,
  PencilSquareIcon,
  CheckBadgeIcon,
  ArrowLongLeftIcon,
  EllipsisVerticalIcon
} from '@heroicons/react/24/outline';

import { fetchCustomFields } from '../../state/slice/customFieldSlice';
import FormInput from '../../components/FormInput';
import FormTextArea from '../../components/FormTextArea';
import ConfirmationDialog from "../../components/ConfirmationDialog";
import ErrorAlertPopup from "../../components/ErrorAlertPopup";

const CustomFieldUpdate = ({ onClose }) => {
  const dispatch = useDispatch();
  

  const customFieldId = useSelector((state) => state.customField.selectedCustomFieldId);
  const customFields = useSelector((state) => state.customField.customFields);

  const [fieldType, setFieldType] = useState('');
  const [formValues, setFormValues] = useState({ name: '', description: '', newValue: '', editValue: '' });
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [options, setOptions] = useState([]);
  const [formErrors, setFormErrors] = useState({});
  const [isValidationErrorsShown, setIsValidationErrorsShown] = useState(false);
  const [deleteError, setDeleteError] = useState(null);

  const [addingNew, setAddingNew] = useState(false);
  const [newOption, setNewOption] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editingValue, setEditingValue] = useState('');
  const [showActionsId, setShowActionsId] = useState(null);

  useEffect(() => {
    dispatch(fetchCustomFields());
  }, [dispatch]);

  useEffect(() => {
    if (customFieldId && customFields.length > 0) {
      const selected = customFields.find((field) => field.id === customFieldId);
      if (selected) {
        setFormValues({
          name: selected.name || '',
          description: selected.description || '',
        });
        setOptions(selected.fieldValues || []);
        setFieldType(selected.fieldType?.name || '');
      }
    }
  }, [customFieldId, customFields]);

  const handleFormChange = (name, value) => {
    setFormValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpdateCustomField = async () => {
    if (!customFieldId) {
      toast.error();
      return;
    }

    try {
      await axios.put(`/custom-fields/${customFieldId}`, {
        customField: {
          name: formValues.name,
          description: formValues.description,
        },
      });
      toast.success();
      dispatch(fetchCustomFields());
      onClose?.();
    } catch (error) {
      console.error('Error updating custom field:', error);
      toast.error();
    }
  };

  const handleAddNewRow = () => {
    setAddingNew(true);
    setNewOption('');
    setShowActionsId(null);
  };

  const handleCancelNew = () => {
    setAddingNew(false);
    setNewOption('');
  };

  const handleSaveNewOption = async () => {
    if (!newOption.trim()) return;
    try {
      await axios.post(`/custom-fields/${customFieldId}/field-values`, {
        customFieldValue: {
          taskFieldID: Number(customFieldId),
          value: newOption.trim(),
          colourCode: '#fff',
        },
      });
      toast.success();
      dispatch(fetchCustomFields());
      setAddingNew(false);
    } catch (error) {
      console.error(error);
      toast.error();
    }
  };

  const handleEditOption = (id, value) => {
    setEditingId(id);
    setEditingValue(value);
    setShowActionsId(null);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingValue('');
  };

  const handleSaveEdit = async (id) => {
    if (!editingValue.trim()) return;
    try {
      await axios.put(`/custom-fields/${customFieldId}/field-values/${id}`, {
        customFieldValue: {
          value: editingValue.trim(),
          colourCode: '#FFF',
        },
      });
      toast.success();
      setEditingId(null);
      dispatch(fetchCustomFields());
    } catch (error) {
      console.error(error);
      toast.error();
    }
  };

  const handleDeleteOption = async (id) => {
    try {
      // First check if the field value is in use
      const usageResponse = await axios.get(`/custom-fields/${customFieldId}/field-values/${id}/usage-check`);
      
      if (usageResponse.data.body.isInUse === true) {
        const usageCount = usageResponse.data.body.usageCount || 0;
        setDeleteError(`Cannot delete this option as it is currently being used in ${usageCount} task(s)`);
        return;
      }
      
      // Proceed with deletion if not in use
      await axios.delete(`/custom-fields/${customFieldId}/field-values/${id}`);
      toast.success();
      dispatch(fetchCustomFields());
    } catch (error) {
      console.error('Error deleting option:', error);
      if (error.response?.status === 400) {
        setDeleteError(error.response.data.body.error || 'Cannot delete this option as it is currently being used');
      } else {
        setDeleteError('Failed to delete option');
      }
    }
  };

  return (
    <div className="p-3 bg-dashboard-bgc h-full">
      <div className="flex p-3 justify-between">
        <div className="flex flex-col space-y-5">
          <button
            className="w-8"
            onClick={onClose}
          >
            <ArrowLongLeftIcon />
          </button>
          <div className="flex items-center space-x-3">
            <span className="text-lg font-semibold">Custom Field</span>
            <span className="bg-primary-pink text-white rounded-full px-6 py-1 inline-block">
              {fieldType || '—'}
            </span>

          </div>
          <div className="flex space-x-5 text-text-color">
            <span>
              Created date: <span>10/07/2025</span>
            </span>
            <span>Created By: Nilanga</span>
          </div>
        </div>
        <div>
          <button
            className="bg-primary-pink px-8 py-2 rounded-md text-white"
            onClick={handleUpdateCustomField}
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
        </div>

        {(fieldType === 'DDL' || fieldType === 'MULTI_SELECT') && (
          <div className="mt-4 px-4 pb-4">
            <div className="flex justify-between mb-3">
              <p className="text-lg text-text-color font-semibold">Options</p>
              {!addingNew && editingId === null && (
                <button
                  className="flex items-center text-text-color"
                  onClick={handleAddNewRow}
                >
                  <PlusCircleIcon className="w-5 h-5 mr-1" />
                  Add New
                </button>
              )}
            </div>

            {deleteError && (
              <div className="mb-4">
                <ErrorAlertPopup 
                  message={deleteError} 
                  type="error" 
                  onClose={() => setDeleteError(null)} 
                />
              </div>
            )}

            <table className="w-full border-t border-gray-200">
              <thead>
                <tr className="text-sm text-secondary-grey">
                  <th className="py-4 px-2 text-left">Value</th>
                  <th className="py-4 px-2 text-right ">Actions</th>
                </tr>
              </thead>
              <tbody>
                {addingNew && (
                  <tr className="border-b border-gray-100">
                    <td className="py-2 px-2 text-center">
                      <FormInput
                        type="text"
                        name="newValue"
                        value={newOption}
                        onChange={({ target: { value } }) => setNewOption(value)}
                      />
                    </td>
                    <td className="py-2 px-2 text-center">
                      <div className="flex justify-center gap-3 items-center">
                        <button onClick={handleSaveNewOption} disabled={!newOption.trim()} data-testid="save-new-option-button">
                          <CheckBadgeIcon className="w-5 h-5 text-primary-pink" />
                        </button>
                        <button onClick={handleCancelNew} data-testid="cancel-new-option-button">
                          <XMarkIcon className="w-5 h-5 text-gray-600" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )}

                {options.map((opt) => (
                  <tr key={opt.id} className="border-b border-gray-100">
                    <td className="py-2 px-2 text-left text-text-color">
                      {editingId === opt.id ? (
                        <FormInput
                          type="text"
                          name="editValue"
                          value={editingValue}
                          onChange={({ target: { value } }) => setEditingValue(value)}
                        />
                      ) : (
                        opt.value
                      )}
                    </td>
                    <td className="py-2 px-2 text-right">
                      {editingId === opt.id ? (
                        <div className="flex justify-end gap-3 items-center">
                          <button onClick={() => handleSaveEdit(opt.id)} disabled={!editingValue.trim()} data-testid={`save-edit-option-${opt.id}`}>
                            <CheckBadgeIcon className="w-5 h-5 text-primary-pink" />
                          </button>
                          <button onClick={handleCancelEdit} data-testid={`cancel-edit-option-${opt.id}`}>
                            <XMarkIcon className="w-5 h-5 text-gray-600" />
                          </button>
                        </div>
                      ) : showActionsId === opt.id ? (
                        <div className="flex justify-end gap-3 items-center">
                          <PencilSquareIcon
                            className="w-5 h-5 text-text-color cursor-pointer"
                            onClick={() => handleEditOption(opt.id, opt.value)}
                          />
                          <TrashIcon
                            className="w-5 h-5 text-text-color cursor-pointer"
                            onClick={() => setConfirmDeleteId(opt.id)}
                          />
                          <XMarkIcon
                            className="w-5 h-5 text-text-color cursor-pointer"
                            onClick={() => setShowActionsId(null)}
                          />
                        </div>
                      ) : (
                        <div className="flex justify-end">
                          <EllipsisVerticalIcon
                            className="w-6 text-text-color cursor-pointer"
                            onClick={() => setShowActionsId(opt.id)}
                          />
                        </div>
                      )}
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>

            <ConfirmationDialog
              isOpen={confirmDeleteId !== null}
              onClose={() => setConfirmDeleteId(null)}
              onConfirm={() => {
                handleDeleteOption(confirmDeleteId);
                setConfirmDeleteId(null);
              }}
              title="Delete Option"
              message="Are you sure you want to delete this option? This action cannot be undone."
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomFieldUpdate;
