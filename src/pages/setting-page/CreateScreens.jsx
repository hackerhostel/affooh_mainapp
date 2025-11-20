import React, { useState, useCallback, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  XMarkIcon,
  TrashIcon,
  PlusCircleIcon,
} from "@heroicons/react/24/outline";
import FormInput from "../../components/FormInput.jsx";
import FormSelect from "../../components/FormSelect.jsx";
import useValidation from "../../utils/use-validation.jsx";
import axios from "axios";
import { CreateScreenSchema } from "../../utils/validationSchemas.js";
import { useToasts } from "react-toast-notifications";
import DataGrid, {
  Column,
  Scrolling,
  Sorting,
} from "devextreme-react/data-grid";
import {
  selectProjectList,
  selectSelectedProject,
} from "../../state/slice/projectSlice.js";
import { fetchCustomFields } from "../../state/slice/customFieldSlice";
import { fetchScreensByOrganization } from "../../state/slice/screenSlice";
import {
  doGetWhoAmI,
  selectUser,
  selectInitialUserDataLoading,
} from "../../state/slice/authSlice.js";
import FormTextArea from "../../components/FormTextArea.jsx";

const stripHtmlTags = (html) => {
  const tmp = document.createElement("div");
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || "";
};

const generateUUID = () => {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

const CreateNewScreen = ({ isOpen, onClose }) => {
  const { addToast } = useToasts();
  const [formValues, setFormValues] = useState({
    name: "",
    description: "",
    projectIDs: [],
  });

  const [optionsList, setOptionsList] = useState([]);
  const [isValidationErrorsShown, setIsValidationErrorsShown] = useState(false);
  const [customFieldOptions, setCustomFieldOptions] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors] = useValidation(CreateScreenSchema, formValues);
  const [selectedFields, setSelectedFields] = useState([]);
  const [tabsList, setTabsList] = useState([]);
  const projectList = useSelector(selectProjectList);
  const selectedProject = useSelector(selectSelectedProject);
  const [showGeneralInput, setShowGeneralInput] = useState(false);
  const [generalInputValue, setGeneralInputValue] = useState("");
  const [generalList, setGeneralList] = useState([]);
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const initialUserDataLoading = useSelector(selectInitialUserDataLoading);

  const handleFormChange = (name, value) => {
    setFormValues({ ...formValues, [name]: value });
    setIsValidationErrorsShown(false);
  };

  useEffect(() => {
    const hasUserData = user && Object.keys(user).length > 1;

    if (isOpen && !hasUserData) {
      dispatch(doGetWhoAmI());
    }
  }, [isOpen, user, dispatch]);

  useEffect(() => {
    const fetchFields = async () => {
      try {
        const resultAction = await dispatch(
          fetchCustomFields(selectedProject?.id)
        );
        if (fetchCustomFields.fulfilled.match(resultAction)) {
          const options = resultAction.payload.map((field) => ({
            label: field.name || `Field ${field.id}`,
            value: field.id,
            field,
          }));
          setCustomFieldOptions(options);
        }
      } catch (error) {
        console.error("Error fetching custom fields", error);
      }
    };

    if (isOpen && selectedProject?.id) {
      fetchFields();
    }
  }, [dispatch, isOpen, selectedProject]);

  const handleClose = () => {
    onClose();
    setFormValues({
      name: "",
      description: "",
      projectIDs: [],
    });
    setOptionsList([]);
    setSelectedFields([]);
    setGeneralList([]);
    setIsValidationErrorsShown(false);
  };

  const handleSelectField = (name, value) => {
    const exists = selectedFields.find(
      (f) => f.id.toString() === value.toString()
    );
    if (!exists) {
      const option = customFieldOptions.find(
        (opt) => opt.value.toString() === value.toString()
      );
      if (option && option.field) {
        setSelectedFields((prev) => [
          ...prev,
          {
            id: option.field.id,
            name: option.field.name,
            status: "Active",
          },
        ]);
      }
    }
  };

  const handleDeleteOption = (index) => {
    const newList = [...optionsList];
    newList.splice(index, 1);
    setOptionsList(newList);
  };

  const updateFieldStatus = (id, status) => {
    setSelectedFields((prev) =>
      prev.map((f) => (f.id === id ? { ...f, status } : f))
    );
  };

  const createScreen = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);

    if (initialUserDataLoading) {
      addToast("Please wait, user data is loading...", {
        appearance: "warning",
      });
      setIsSubmitting(false);
      return;
    }

    if (formErrors && Object.keys(formErrors).length > 0) {
      setIsValidationErrorsShown(true);
      setIsSubmitting(false);
      return;
    }

    setIsValidationErrorsShown(false);

    try {
      const payload = {
        name: formValues.name,
        description:(formValues.description),
        organizationID: user?.organization?.id?.toString(),
        projectIDs: Array.isArray(formValues.projectIDs)
          ? formValues.projectIDs
          : [formValues.projectIDs],
        tabs:
          selectedFields.length > 0
            ? [
                {
                  id: generateUUID(),
                  name: "General",
                  fields: selectedFields.map((field) => ({
                    id: field.id,
                    required: field.status === "required",
                  })),
                },
              ]
            : [],
        generalTabs: generalList.map((name) => ({
          name,
          required: false,
        })),
      };

      const response = await axios.post("/screens", { screen: payload });
      addToast("Screen created successfully!", { appearance: "success" });
      dispatch(fetchScreensByOrganization());
      handleClose();
    } catch (error) {
      console.error(" CreateScreen: Error:", error);
      if (error.response) {
        console.error("Error response:", error.response.data);
        addToast(
          `Failed to create screen: ${error.response.data.message || "Unknown error"}`,
          { appearance: "error" }
        );
      } else {
        addToast("Failed to create the screen", { appearance: "error" });
      }
    }

    setIsSubmitting(false);
  };

  const getProjectOptions = useCallback(() => {
    return projectList.map((project) => ({
      value: String(project.id),
      label: project.name,
    }));
  }, [projectList]);

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 flex items-right justify-end bg-white bg-opacity-25 backdrop-blur-sm">
          <div className="bg-white p-6 shadow-lg w-2/4 max-h-screen overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <p className="font-bold text-2xl">New Screen</p>
              <div className="cursor-pointer" onClick={handleClose}>
                <XMarkIcon className="w-6 h-6 text-gray-500" />
              </div>
            </div>

            {/* Loading indicator for user data */}
            {initialUserDataLoading && (
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                  <span className="text-blue-800 text-sm">
                    Loading user data...
                  </span>
                </div>
              </div>
            )}

            <form onSubmit={createScreen} className="flex flex-col space-y-6">
              <div>
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

              <div>
                <p className="text-secondary-grey">Projects</p>
                <FormSelect
                  name="projectIDs"
                  formValues={formValues}
                  options={getProjectOptions()}
                  onChange={({ target: { name, value } }) =>
                    handleFormChange(name, value)
                  }
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
                  rows={6}
                />
              </div>

              <div className="text-text-color">
                <div className="flex justify-between">
                  <span className="text-lg">General</span>
                  <div
                    className="flex items-center space-x-2 cursor-pointer"
                    onClick={() => setShowGeneralInput(true)}
                  >
                    <PlusCircleIcon className="w-5" />
                    <span>Add New</span>
                  </div>
                </div>

                {showGeneralInput && (
                  <div className="flex items-center space-x-2 justify-between">
                    <FormInput
                      style={{ width: "600px" }}
                      name="generalInput"
                      value={generalInputValue}
                      onChange={({ target: { value } }) =>
                        setGeneralInputValue(value)
                      }
                    />
                    <button
                      type="button"
                      className="w-24 mt-4 h-11 text-text-color border rounded-md"
                      onClick={() => {
                        if (generalInputValue.trim()) {
                          setGeneralList((prev) => [
                            ...prev,
                            generalInputValue.trim(),
                          ]);
                          setGeneralInputValue("");
                          setShowGeneralInput(false);
                        }
                      }}
                    >
                      Add
                    </button>
                  </div>
                )}
              </div>

              {generalList.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-4 mt-4">
                  {generalList.map((item, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div className="flex items-center bg-primary-pink text-white px-4 py-2 rounded-full text-sm font-medium">
                        <span className="text-sm text-white">{item}</span>
                        <XMarkIcon
                          className="w-4 h-4 ml-2 text-white cursor-pointer"
                          onClick={() =>
                            setGeneralList((prev) =>
                              prev.filter((_, i) => i !== index)
                            )
                          }
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex-col">
                <p className="text-secondary-grey">Fields</p>
                <FormSelect
                  name="customField"
                  formValues={{ customField: formValues.customField }}
                  onChange={({ target: { name, value } }) => {
                    handleSelectField(name, value);
                    setFormValues({ ...formValues, [name]: value });
                  }}
                  options={customFieldOptions}
                />
              </div>

              {selectedFields.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-4 mt-4">
                  {selectedFields.map((field) => (
                    <div key={field.id} className="flex items-center gap-2">
                      <div className="flex items-center bg-primary-pink text-white px-4 py-2 rounded-full text-sm font-medium">
                        {field.name}
                        <XMarkIcon
                          className="w-4 h-4 ml-2 text-white cursor-pointer"
                          onClick={() =>
                            setSelectedFields((prev) =>
                              prev.filter((f) => f.id !== field.id)
                            )
                          }
                        />
                      </div>

                      <div className="flex items-center space-x-2 text-sm">
                        <input
                          type="checkbox"
                          checked={field.status === "required"}
                          onChange={(e) =>
                            updateFieldStatus(
                              field.id,
                              e.target.checked ? "required" : "optional"
                            )
                          }
                          className="form-checkbox h-4 w-4 text-blue-600"
                        />
                        <span className="text-text-color">Required</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

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

                    <Column
                      width={50}
                      cellRender={({ rowIndex }) => rowIndex + 1}
                    />
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

              <div className="flex justify-end space-x-4 mt-6">
                <button
                  onClick={handleClose}
                  className="btn-secondary"
                  disabled={isSubmitting || initialUserDataLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={isSubmitting || initialUserDataLoading}
                >
                  {initialUserDataLoading ? "Loading..." : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default CreateNewScreen;
