import React, {useCallback, useEffect} from "react";
import FormSelect from "../../FormSelect.jsx";
import FormInput from "../../FormInput.jsx";
import {useSelector} from "react-redux";
import {selectProjectUserList} from "../../../state/slice/projectUsersSlice.js";
import {isNotEmptyObj} from "../../../utils/commonUtils.js";

const ScreenTabField = ({ field, formValues, onChange, isValidationErrorsShown }) => {
  const userListForProject = useSelector(selectProjectUserList);

  const handleChange = (name, value) => {
    const fieldValue = Array.isArray(value) ? value : [value];
    onChange({
      fieldTypeName: field.fieldType.name,
      fieldValue,
      taskFieldID: field.id
    });
  };

  const getErrorMessage = () => {
    if (field.required === 1 && (!formValues[field.id] || formValues[field.id].length === 0)) {
      return `${field.name} is required`;
    }

    return undefined
  };

  const getObjectByTaskFieldID = (inputObj, targetID) => {
    const foundObject = Object.values(inputObj).find(obj => obj.taskFieldID === targetID);
    return foundObject || null;
  }

  const handleDefaultValue = (defaultValue) => {
    const fieldValues = field?.fieldValues;
    if (fieldValues && fieldValues.length) {
      const defaultFieldValue = fieldValues.find(fv => fv.value === defaultValue);
      if (defaultFieldValue) {
        handleChange(field?.name, defaultFieldValue?.id);
      }
    }
  }

  const handleField = (defaultValue) => {
    if (formValues && !isNotEmptyObj(formValues)) {
      handleDefaultValue(defaultValue);
    } else {
      const exists = getObjectByTaskFieldID(formValues, field.id);
      if (!exists) {
        handleDefaultValue(defaultValue);
      }
    }
  }

  useEffect(() => {
    if (field.name === "Status") {
      handleField("To Do");
    }

    if (field.name === "Priority") {
      handleField("Medium");
    }
  }, [field, formValues]);

  const renderField = useCallback(() => {
    const errorMessage = getErrorMessage();
    const commonProps = {
      name: field.name,
      onChange: ({ target: { name, value } }) => handleChange(name, value),
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
            formValues={formValues[field.id] ? { [field.name]: formValues[field.id].fieldValue } : {[field.name]: ""}}
            placeholder={field.name}
            options={field.fieldValues.map(fv => ({ value: fv.id, label: fv.value }))}
            isMulti={field.fieldType.canSelectMultiValues === 1}
          />
        );
      case "USER_PICKER":
        return (
          <FormSelect
            {...commonProps}
            showLabel
            formValues={formValues[field.id] ? { [field.name]: formValues[field.id].fieldValue } : {[field.name]: ""}}
            placeholder={field.name}
            options={userListForProject.map(fv => ({ value: fv.id, label: `${fv.firstName} ${fv.lastName}` }))}
            isMulti={field.fieldType.canSelectMultiValues === 1}
          />
        );
      case "DATE_PICKER":
        return (
          <FormInput
            {...commonProps}
            formValues={formValues[field.id] ? { [field.name]: formValues[field.id].fieldValue[0] } : {[field.name]: ""}}
            type="date"
            placeholder={field.name}
          />
        );
      case "TEXT":
      default:
        return (
          <FormInput
            {...commonProps}
            formValues={formValues[field.id] ? { [field.name]: formValues[field.id].fieldValue[0] } : {[field.name]: ""}}
            type="text"
            placeholder={field.name}
          />
        );
    }
  }, [formValues, isValidationErrorsShown]);

  return (
    <div className="mb-6">
      {renderField()}
    </div>
  );
};

export default ScreenTabField;