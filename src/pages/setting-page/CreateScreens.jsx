import React, {useCallback, useEffect, useState} from "react";
import {useDispatch, useSelector} from "react-redux";
import {CheckIcon, PencilIcon, PlusCircleIcon, XMarkIcon,} from "@heroicons/react/24/outline";
import FormInput from "../../components/FormInput.jsx";
import FormSelect from "../../components/FormSelect.jsx";
import useValidation from "../../utils/use-validation.jsx";
import axios from "axios";
import {CreateScreenSchema} from "../../utils/validationSchemas.js";
import { toast } from 'react-toastify';
import {selectProjectList, selectSelectedProject,} from "../../state/slice/projectSlice.js";
import {fetchCustomFields} from "../../state/slice/customFieldSlice";
import {fetchScreensByOrganization} from "../../state/slice/screenSlice";
import {doGetWhoAmI, selectInitialUserDataLoading, selectUser,} from "../../state/slice/authSlice.js";
import FormTextArea from "../../components/FormTextArea.jsx";

const generateUUID = () =>
    "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
      const r = (Math.random() * 16) | 0;
      const v = c === "x" ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });

const CreateNewScreen = ({ isOpen, onClose }) => {
  
  const dispatch = useDispatch();
  const projectList = useSelector(selectProjectList);
  const selectedProject = useSelector(selectSelectedProject);
  const user = useSelector(selectUser);
  const initialUserDataLoading = useSelector(selectInitialUserDataLoading);

  const [formValues, setFormValues] = useState({
    name: "",
    description: "",
    projectIDs: [],
  });
  const [isValidationErrorsShown, setIsValidationErrorsShown] = useState(false);
  const [formErrors] = useValidation(CreateScreenSchema, formValues);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [customFieldOptions, setCustomFieldOptions] = useState([]);
  const [tabsList, setTabsList] = useState([]);
  const [activeTab, setActiveTab] = useState("General");

  const [editingTabId, setEditingTabId] = useState(null);
  const [editingTabName, setEditingTabName] = useState("");

  const handleFormChange = (name, value) => {
    setFormValues({ ...formValues, [name]: value });
    setIsValidationErrorsShown(false);
  };

  useEffect(() => {
    if (isOpen && (!user || Object.keys(user).length < 1)) {
      dispatch(doGetWhoAmI());
    }
  }, [isOpen, user, dispatch]);

  // Fetch fields and init tabs
  useEffect(() => {
    const fetchFields = async () => {
      try {
        const resultAction = await dispatch(fetchCustomFields(selectedProject?.id));
        if (fetchCustomFields.fulfilled.match(resultAction)) {
          const options = resultAction.payload.map((field) => ({
            label: field.name || `Field ${field.id}`,
            value: field.id,
            field,
          }));
          setCustomFieldOptions(options);

          // General tab with default fields
          const defaultFields = options
              .map((opt) => ({
                id: opt.field.id,
                name: opt.field.name,
                required: !!opt.field.required,
                readOnly: true,
              }));

          setTabsList([
            {
              id: generateUUID(),
              name: "General",
              isDefault: true,
              fields: defaultFields,
            },
          ]);
          setActiveTab("General");
        }
      } catch (error) {
        console.error("Error fetching custom fields", error);
      }
    };

    if (isOpen && selectedProject?.id) {
      fetchFields();
    }
  }, [dispatch, isOpen, selectedProject]);

  const handleAddTab = () => {
    const newTabName = `Tab ${tabsList.length}`;
    const newTab = {
      id: generateUUID(),
      name: newTabName,
      isDefault: false,
      fields: [],
    };
    setTabsList((prev) => [...prev, newTab]);
    setActiveTab(newTabName);
  };

  const handleRemoveTab = (tabId) => {
    setTabsList((prev) => prev.filter((t) => t.id !== tabId));
    setActiveTab("General");
  };

  const handleSelectFieldForTab = (tabId, fieldId) => {

    setTabsList((prev) =>
        prev.map((tab) => {
          if (tab.id !== tabId) return tab;
          const exists = tab.fields.find((f) => f.id === parseInt(fieldId));
          if (exists) return tab;
          const option = customFieldOptions.find((opt) => opt.value === parseInt(fieldId));
          if (!option) return tab;
          return {
            ...tab,
            fields: [
              ...tab.fields,
              {id: option.field.id, name: option.field.name, required: false},
            ],
          };
        })
    );
  };

  const toggleRequired = (tabId, fieldId) => {
    setTabsList((prev) =>
        prev.map((tab) => {
          if (tab.id !== tabId) return tab;
          return {
            ...tab,
            fields: tab.fields.map((f) =>
                f.id === fieldId ? {...f, required: !f.required} : f
            ),
          };
        })
    );
  };

  const startEditingTab = (tab) => {
    setEditingTabId(tab.id);
    setEditingTabName(tab.name);
  };

  const saveTabRename = (tabId) => {
    if (!editingTabName.trim()) return;
    setTabsList((prev) =>
        prev.map((t) =>
            t.id === tabId ? {...t, name: editingTabName.trim()} : t
        )
    );
    setActiveTab(editingTabName.trim());
    setEditingTabId(null);
    setEditingTabName("");
  };

  const handleClose = () => {
    onClose();
    setFormValues({name: "", description: "", projectIDs: []});
    setTabsList([]);
    setIsValidationErrorsShown(false);
  };

  const createScreen = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (formErrors && Object.keys(formErrors).length > 0) {
      setIsValidationErrorsShown(true);
      setIsSubmitting(false);
      return;
    }

    try {
      const generalTab = tabsList.find((tab) => tab.name === "General");
      const otherTabs = tabsList.filter((tab) => tab.name !== "General");

      const payload = {
        name: formValues.name,
        description: formValues.description,
        organizationID: user?.organization?.id?.toString(),
        projectIDs: Array.isArray(formValues.projectIDs)
            ? formValues.projectIDs
            : [formValues.projectIDs],
        generalTabs: generalTab ? [
              {
                id: generalTab.id,
                name: generalTab.name,
                fields: generalTab.fields.map((f) => ({
                  id: f.id,
                  required: f.required,
                })),
              },
            ]
            : [],
        tabs: otherTabs.map((tab) => ({
          id: tab.id,
          name: tab.name,
          fields: tab.fields.map((f) => ({
            id: f.id,
            required: f.required,
          })),
        })),
      };

      await axios.post("/screens", {screen: payload});
      toast.success("Screen created successfully!", { appearance: "success" });
      dispatch(fetchScreensByOrganization());
      handleClose();
    } catch (error) {
      console.error("CreateScreen error:", error);
      toast.success("Failed to create screen", {appearance: "error"});
    }

    setIsSubmitting(false);
  };

  const getProjectOptions = useCallback(() => {
    return projectList.map((p) => ({value: String(p.id), label: p.name}));
  }, [projectList]);

  return (
      <>
        {isOpen && (
            <div className="fixed inset-0 flex items-right justify-end bg-white bg-opacity-25 backdrop-blur-sm">
              <div className="bg-white p-6 shadow-lg w-2/4 max-h-screen overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                  <p className="font-bold text-2xl">New Screen</p>
                  <div className="cursor-pointer" onClick={handleClose}>
                    <XMarkIcon className="w-6 h-6 text-gray-500"/>
                  </div>
                </div>

                <form onSubmit={createScreen} className="flex flex-col space-y-6">
                  <div>
                    <p className="text-secondary-grey">Name</p>
                    <FormInput
                        type="text"
                        name="name"
                        formValues={formValues}
                        onChange={({target: {name, value}}) =>
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
                        onChange={({target: {name, value}}) =>
                            handleFormChange(name, value)
                        }
                    />
                  </div>

                  <div>
                    <p className="text-secondary-grey">Description</p>
                    <FormTextArea
                        name="description"
                        formValues={formValues}
                        onChange={({target: {name, value}}) =>
                            handleFormChange(name, value)
                        }
                        formErrors={formErrors}
                        showErrors={isValidationErrorsShown}
                        rows={5}
                    />
                  </div>

                  {/* Tabs */}
                  <div className="border-t border-gray-200 pt-4">
                    <div className="flex justify-between items-center mb-3">
                      <div className="flex space-x-3">
                        {tabsList.map((tab) => (
                            <div
                                key={tab.id}
                                className={`px-4 py-2 rounded-t-md cursor-pointer flex items-center space-x-1 ${
                                    activeTab === tab.name
                                        ? "bg-primary-pink text-white"
                                        : "bg-gray-100 text-gray-700"
                                }`}
                                onClick={() => setActiveTab(tab.name)}
                            >
                              {editingTabId === tab.id ? (
                                  <>
                                    <input
                                        type="text"
                                        value={editingTabName}
                                        onChange={(e) => setEditingTabName(e.target.value)}
                                        className="bg-white text-gray-800 rounded px-1 text-sm"
                                        onClick={(e) => e.stopPropagation()}
                                    />
                                    <CheckIcon
                                        className="ml-4 w-4 h-4 cursor-pointer"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          saveTabRename(tab.id);
                                        }}
                                    />
                                  </>
                              ) : (
                                  <>
                                    <span>{tab.name}</span>
                                    {!tab.isDefault && (
                                        <>
                                          <PencilIcon
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                startEditingTab(tab);
                                              }}
                                              className="w-4 h-4 cursor-pointer"
                                          />
                                          <XMarkIcon
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                handleRemoveTab(tab.id);
                                              }}
                                              className="w-4 h-4 cursor-pointer"
                                          />
                                        </>
                                    )}
                                  </>
                              )}
                            </div>
                        ))}
                      </div>
                      <button
                          type="button"
                          onClick={handleAddTab}
                          className="flex items-center space-x-1 text-sm text-primary-pink"
                      >
                        <PlusCircleIcon className="w-4 h-4"/>
                        <span>Add Tab</span>
                      </button>
                    </div>

                    {tabsList.map(
                        (tab) =>
                            tab.name === activeTab && (
                                <div key={tab.id} className="mt-2">
                                  {tab.isDefault ? (
                                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                        {tab.fields.length > 0 ? (
                                            tab.fields.map((field) => (
                                                <div
                                                    key={field.id}
                                                    className="bg-gray-50 p-2 rounded-md border text-gray-700"
                                                >
                                                  {field.name}
                                                </div>
                                            ))
                                        ) : (
                                            <p className="text-sm text-gray-500">
                                              No default fields available.
                                            </p>
                                        )}
                                      </div>
                                  ) : (
                                      <>
                                        <FormSelect
                                            name="customField"
                                            options={customFieldOptions}
                                            onChange={({target: {value}}) =>
                                                handleSelectFieldForTab(tab.id, value)
                                            }
                                        />
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-3">
                                          {tab.fields.map((field) => (
                                              <div
                                                  key={field.id}
                                                  className="flex items-center justify-between border rounded-md px-3 py-2 cursor-pointer"
                                              >
                                                <span>{field.name}</span>
                                                <div className="flex items-center space-x-2 cursor-pointer">
                                                  <input
                                                      type="checkbox"
                                                      checked={field.required}
                                                      onChange={() =>
                                                          toggleRequired(tab.id, field.id)
                                                      }
                                                  />
                                                  <span className="text-sm">Required</span>
                                                </div>
                                              </div>
                                          ))}
                                        </div>
                                      </>
                                  )}
                                </div>
                            )
                    )}
                  </div>

                  {/* Buttons */}
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
                      {isSubmitting ? "Creating..." : "Create"}
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

