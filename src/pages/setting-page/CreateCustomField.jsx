import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { XMarkIcon, TrashIcon } from '@heroicons/react/24/outline';
import FormInput from "../../components/FormInput.jsx";
import FormSelect from "../../components/FormSelect.jsx";
import useValidation from "../../utils/use-validation.jsx";
import axios from 'axios';
import FormTextArea from "../../components/FormTextArea.jsx"
import { CustomFieldCreateSchema } from '../../utils/validationSchemas.js';
import {
  fetchCustomFields,
} from '../../state/slice/customFieldSlice';
import { useToasts } from 'react-toast-notifications';
import { getSelectOptions } from "../../utils/commonUtils.js";
import DataGrid, { Column, Scrolling, Sorting } from 'devextreme-react/data-grid';


const CreateNewCustomField = ({ isOpen, onClose }) => {
    const dispatch = useDispatch();
    const { addToast } = useToasts();
    const [formValues, setFormValues] = useState({
        fieldTypeID: '',
        name: '',
        description: '',
    });

    const [optionName, setOptionName] = useState("");
    const [optionsList, setOptionsList] = useState([]);
    const [isValidationErrorsShown, setIsValidationErrorsShown] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formErrors] = useValidation(CustomFieldCreateSchema, formValues);
    const [fieldTypes, setFieldTypes] = useState([]);

    const handleFormChange = (name, value) => {
        if (name === "fieldTypeID") {
            value = value.toString();
            setOptionsList([]);
        }

        setFormValues({ ...formValues, [name]: value });
        setIsValidationErrorsShown(false);
    };

      useEffect(() => {
        dispatch(fetchCustomFields());
      }, [dispatch]);

    const handleClose = () => {
        onClose();
        setFormValues({ fieldTypeID: '', name: '', description: '' });
        setOptionName("");
        setOptionsList([]);
        setIsValidationErrorsShown(false);
    };

    const handleAddOption = () => {
        if (optionName.trim()) {
            setOptionsList([...optionsList, { value: optionName, colourCode: '#fff' }]);
            setOptionName("");
        }
    };

    const handleDeleteOption = (index) => {
        const newList = [...optionsList];
        newList.splice(index, 1);
        setOptionsList(newList);
    };

 // put this at the top of your component

const createNewCustomField = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);

    if (formErrors && Object.keys(formErrors).length > 0) {
        console.log("Validation errors:", formErrors);
        setIsValidationErrorsShown(true);
    } else {
        setIsValidationErrorsShown(false);
        try {
            const selectedFieldType = fieldTypes.body?.find(
                ft => ft.id.toString() === formValues.fieldTypeID
            )?.name;

            const payload = {
                ...formValues,
                ...(selectedFieldType === 'DDL' || selectedFieldType === 'MULTI_SELECT'
                    ? { fieldValues: optionsList }
                    : {})
            };

            await axios.post("/custom-fields", { customField: payload });

            addToast('Custom field created successfully!', { appearance: 'success' });

            dispatch(fetchCustomFields());

            handleClose();
        } catch (error) {
            console.error(error);
            addToast('Failed to create the custom field', { appearance: 'error' });
        }
    }

    setIsSubmitting(false);
};



    const fieldType = async () => {
        try {
            const response = await axios.get("/custom-fields/field-types");
            setFieldTypes(response.data);
        } catch (error) {
            console.error("Error fetching field types:", error);
            addToast('Failed to load field types', { appearance: 'error' });
        }
    };

    useEffect(() => {
        fieldType();
    }, []);

    const showOptionsInput = ['DDL', 'MULTI_SELECT'].includes(
        fieldTypes.body?.find(ft => ft.id.toString() === formValues.fieldTypeID)?.name
    );

    return (
        <>
            {isOpen && (
                <div className="fixed inset-0 flex items-right justify-end bg-white bg-opacity-25 backdrop-blur-sm">
                    <div className="bg-white p-6 shadow-lg w-2/4 max-h-screen overflow-y-auto">
                        <div className="flex justify-between items-center mb-4">
                            <p className="font-bold text-2xl">New Custom Field</p>
                            <div className="cursor-pointer" onClick={handleClose}>
                                <XMarkIcon className="w-6 h-6 text-gray-500" />
                            </div>
                        </div>
                        <form onSubmit={createNewCustomField} className="flex flex-col space-y-6">
                            <FormSelect
                                name="fieldTypeID"
                                placeholder="Field Type"
                                formValues={formValues}
                                options={getSelectOptions(fieldTypes.body)}
                                onChange={({ target: { name, value } }) => handleFormChange(name, value)}
                                formErrors={formErrors}
                                showErrors={isValidationErrorsShown}
                            />
                            <div>
                                <p className="text-secondary-grey">Name</p>
                                <FormInput
                                    type="text"
                                    name="name"
                                    formValues={formValues}
                                    onChange={({ target: { name, value } }) => handleFormChange(name, value)}
                                    formErrors={formErrors}
                                    showErrors={isValidationErrorsShown}
                                />
                            </div>
                            <div>
                                <p className="text-secondary-grey">Description</p>

                                <FormTextArea
                                    name="description"
                                    formValues={formValues}
                                    onChange={({ target: { name, value } }) => handleFormChange(name, value)}
                                    formErrors={formErrors}
                                    showErrors={isValidationErrorsShown}
                                />


                            </div>

                            {showOptionsInput && (
                                <>
                                    <div className="flex-col">
                                        <p className="text-secondary-grey">Option Name</p>
                                        <div className='flex justify-between items-center'>
                                            <FormInput
                                                type="text"
                                                style={{ width: "600px" }}
                                                name="optionName"
                                                value={optionName}
                                                onChange={({ target: { value } }) => setOptionName(value)}
                                            />
                                            <button
                                                type="button"
                                                className="w-24 h-11 text-text-color border rounded-md"
                                                onClick={handleAddOption}
                                            >
                                                Add
                                            </button>
                                        </div>
                                    </div>

                                    {optionsList.length > 0 && (
                                        <div className="mt-4">
                                            <DataGrid
                                                dataSource={optionsList}
                                                keyExpr="value"
                                                allowColumnReordering={true}
                                                showBorders={false}
                                                width="100%"
                                                className="rounded-lg overflow-hidden"
                                                showRowLines={true}
                                                showColumnLines={false}
                                            >
                                                <Scrolling columnRenderingMode="virtual" />
                                                <Sorting mode="none" />

                                                <Column width={50} cellRender={({ rowIndex }) => rowIndex + 1} />
                                                <Column dataField="value" caption="Option" />
                                                <Column
                                                    caption="Action"
                                                    width={100}
                                                    cellRender={({ rowIndex }) => (
                                                        <div className="flex items-center">
                                                            <TrashIcon
                                                                className="w-5 h-5 text-text-color cursor-pointer"
                                                                onClick={() => handleDeleteOption(rowIndex)}
                                                            />
                                                        </div>
                                                    )}
                                                />
                                            </DataGrid>
                                        </div>
                                    )}
                                </>
                            )}

                            <div className="flex justify-end space-x-4 mt-6">
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
            )}
        </>
    );
};

export default CreateNewCustomField;
