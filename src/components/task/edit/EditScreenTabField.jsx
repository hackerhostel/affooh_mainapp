import React, {useEffect, useState} from "react";
import FormSelect from "../../FormSelect.jsx";
import FormInput from "../../FormInput.jsx";
import FormInputWrapper from "./FormEditInputWrapper.jsx";
import {getSelectOptions, getUserSelectOptions} from "../../../utils/commonUtils.js";
import {useToasts} from "react-toast-notifications";

const EditScreenTabField = ({
                                isEditing,
                                field,
                                onChange,
                                initialAttributeData = [],
                                isValidationErrorsShown,
                                updateTaskAttribute,
                                tabName,
                                users,
                                taskAttributes = []
                            }) => {
    const {addToast} = useToasts();

    const [currentValue, setCurrentValue] = useState('');
    const [initialValue, setInitialValue] = useState('');

    useEffect(() => {
        if (initialAttributeData.length) {
            const filteredTaskAttribute = initialAttributeData.find(ta => ta?.taskFieldName === field?.name);
            const value = filteredTaskAttribute?.values?.[0] ?? '';
            setInitialValue(value)
            setCurrentValue(value)
        } else {
            setInitialValue('')
            setCurrentValue('')
        }
    }, [initialAttributeData]);

    const handleChange = (value) => {
        onChange(field.id, value);
        setCurrentValue(value)
    };

    const updateAttributes = (value) => {
        if (tabName === "General") {
            updateTaskAttribute(field.id, value);
        } else {
            addToast(`Under Development!`, {appearance: 'warning'});
        }
    }

    const getErrorMessage = () => {
        const filteredTaskAttribute = initialAttributeData.find(ta => ta?.taskFieldID === field.id)
        if (field.required === 1 && filteredTaskAttribute.values.length === 0) {
            return `${field.name} is required`;
        }

        return undefined
    };

    const getFormValue = (name) => {
        const filteredTaskAttribute = taskAttributes.find(ta => ta?.taskFieldName === name)
        return {[name]: filteredTaskAttribute ? filteredTaskAttribute.values[0] : ''}
    }

    const renderField = () => {
        const errorMessage = getErrorMessage();
        const commonProps = {
            name: field.name,
            formErrors: errorMessage ? { [field.name]: errorMessage } : {},
            showErrors: isValidationErrorsShown,
        };
    
        switch (field.fieldType.name) {
            case "DDL":
            case "MULTI_SELECT":
            case "TASK_PICKER_MULTI_SELECT":
            case "TASK_PICKER":
            case "RELEASE_PICKER":
                return (
                    <FormSelect
                        {...commonProps}
                        showLabel
                        disabled={isEditing}
                        formValues={getFormValue(field?.name)}
                        placeholder={field.name}
                        options={getSelectOptions(field?.fieldValues && field.fieldValues.length ? field?.fieldValues : [])}
                        isMulti={field.fieldType.canSelectMultiValues === 1}
                        onChange={({ target: { value } }) => {
                            handleChange(value);
                            updateAttributes(value);
                        }}
                    />
                );
            case "USER_PICKER":
                return (
                    <FormSelect
                        {...commonProps}
                        disabled={isEditing}
                        showLabel
                        formValues={getFormValue(field?.name)}
                        placeholder={field.name}
                        options={users.length ? getUserSelectOptions(users) : []}
                        isMulti={field.fieldType.canSelectMultiValues === 1}
                        onChange={({ target: { value } }) => {
                            handleChange(value);
                            updateAttributes(value);
                        }}
                    />
                );
            case "DATE_PICKER":
                return (
                    <FormInputWrapper
                        isEditing={isEditing}
                        initialData={{ [field?.name]: initialValue }}
                        currentData={{ [field?.name]: currentValue }}
                        onAccept={() => updateAttributes(currentValue)}
                        onReject={() => setCurrentValue(initialValue)}
                        actionButtonPlacement={"bottom"}
                    >
                        <FormInput
                            {...commonProps}
                            formValues={{ [field?.name]: currentValue }}
                            type="date"
                            placeholder={field.name}
                            onChange={({ target: { value } }) => handleChange(value)}
                        />
                    </FormInputWrapper>
                );
            case "LABELS":
                return (
                    <FormSelect
                        {...commonProps}
                        disabled={isEditing}
                        showLabel
                        formValues={getFormValue(field?.name)}
                        placeholder={field.name}
                        options={field?.fieldValues.map((value) => ({ label: value, value }))}
                        isMulti
                        onChange={({ target: { value } }) => {
                            handleChange(value);
                            updateAttributes(value);
                        }}
                    />
                );
            case "TEXT":
            default:
                return (
                    <FormInputWrapper
                        isEditing={isEditing}
                        initialData={{ [field?.name]: initialValue }}
                        currentData={{ [field?.name]: currentValue }}
                        onAccept={() => updateAttributes(currentValue)}
                        onReject={() => setCurrentValue(initialValue)}
                        actionButtonPlacement={"bottom"}
                    >
                        <FormInput
                            {...commonProps}
                            formValues={{ [field?.name]: currentValue }}
                            type="text"
                            placeholder={field.name}
                            onChange={({ target: { value } }) => handleChange(value)}
                        />
                    </FormInputWrapper>
                );
        }
    };
    

    return (
        <div className="mb-6">
            {renderField()}
        </div>
    );
};

export default EditScreenTabField;