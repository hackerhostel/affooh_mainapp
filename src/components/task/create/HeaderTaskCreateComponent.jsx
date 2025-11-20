import React, { useRef, useState, useEffect } from "react";
import FormInput from "../../FormInput.jsx";
import useValidation from "../../../utils/use-validation.jsx";
import { HeaderTaskCreateSchema } from "../../../state/domains/authModels.js";
import FormSelect from "../../FormSelect.jsx";
import TaskScreenDetails from "./TaskScreenDetails.jsx";
import axios from "axios";
import { useSelector } from "react-redux";
import { selectAppConfig } from "../../../state/slice/appSlice.js";
import { selectSelectedProject } from "../../../state/slice/projectSlice.js";
import SkeletonLoader from "../../SkeletonLoader.jsx";
import ErrorAlert from "../../ErrorAlert.jsx";
import { useToasts } from "react-toast-notifications";
import { XMarkIcon } from "@heroicons/react/24/outline/index.js";
import { getSelectOptions } from "../../../utils/commonUtils.js";
import { selectProjectUserList } from "../../../state/slice/projectUsersSlice.js";
import { selectSprintListForProject } from "../../../state/slice/sprintSlice.js";
import WYSIWYGInput from "../../WYSIWYGInput.jsx";
import UserSelect from "../../UserSelect.jsx";
import useFetchEpics from "../../../hooks/custom-hooks/task/useFetchEpics.jsx";
import FileUpload from "../../FileUploadComponent.jsx";

function getRequiredAdditionalFieldList(fieldsArray) {
  const requiredFields = [];
  fieldsArray.forEach((field) => {
    if (Array.isArray(field.fields)) {
      field.fields.forEach((subField) => {
        if (subField.required === 1) {
          requiredFields.push(subField.id);
        }
      });
    }
  });
  return requiredFields;
}

const HeaderTaskCreateComponent = ({ onClose, isOpen }) => { const { addToast } = useToasts();
const appConfig = useSelector(selectAppConfig);
const selectedProject = useSelector(selectSelectedProject);
const users = useSelector(selectProjectUserList);
const sprintListForProject = useSelector(selectSprintListForProject);
const { data: epics } = useFetchEpics(selectedProject?.id);

const [loading, setLoading] = useState(false);
const [createTaskForm, setCreateTaskForm] = useState({
    name: "",
    taskTypeID: "",
    sprintID: "",
});
const [isValidationErrorsShown, setIsValidationErrorsShown] = useState(false);
const formRef = useRef(null);
const [formErrors] = useValidation(HeaderTaskCreateSchema, createTaskForm);
const [isTaskTypeLoading, setIsTaskTypeLoading] = useState(false);
const [isTaskTypeApiError, setIsTaskTypeApiError] = useState(false);
const [isSubmitting, setIsSubmitting] = useState(false);
const [isEpicScreen, setIsEpicScreen] = useState(false);
const [screenDetails, setScreenDetails] = useState(null);
const [additionalFormValues, setAdditionalFormValues] = useState({});
const [requiredAdditionalFieldList, setRequiredAdditionalFieldList] = useState([]);
const [attachments, setAttachments] = useState([]);
const [isUploadingFiles, setIsUploadingFiles] = useState(false);
const [uploadProgress, setUploadProgress] = useState(0);
const [currentFileIndex, setCurrentFileIndex] = useState(0);
const [createdTaskId, setCreatedTaskId] = useState(null);

  const handleFormChange = (name, value) => {
    if (name === "taskTypeID") {
      const selectedTaskType = appConfig.taskTypes.find(
        (tt) => tt.id === parseInt(value)
      );
      if (selectedTaskType?.screenID) {
        fetchScreenForTask(selectedTaskType.screenID);
        setIsEpicScreen(selectedTaskType.value === "Epic");
      }
    }
    const newForm = { ...createTaskForm, [name]: value };
    setCreateTaskForm(newForm);
  };

  const handleAdditionalFieldChange = (fieldData) => {
    setAdditionalFormValues((prevValues) => ({
      ...prevValues,
      [fieldData.taskFieldID]: fieldData,
    }));
  };

  const handleTaskCreateClose = () => {
    setCreateTaskForm({ name: "", taskTypeID: "", sprintID: "" });
    setAttachments([]);
    setUploadProgress(0);
    setCurrentFileIndex(0);
    setCreatedTaskId(null);
    setIsUploadingFiles(false);
    onClose();
  };

  const fetchScreenForTask = async (screenId) => {
    setIsTaskTypeLoading(true);
    try {
      const response = await axios.get(
        `screens/${screenId}?projectID=${selectedProject.id}`
      );
      if (response.data.screen) {
        const screenData = response.data.screen;
        setScreenDetails(screenData);
        setRequiredAdditionalFieldList(
          getRequiredAdditionalFieldList(screenData.tabs)
        );
      }
      setIsTaskTypeApiError(false);
    } catch (e) {
      setIsTaskTypeApiError(true);
    } finally {
      setIsTaskTypeLoading(false);
      setAdditionalFormValues({});
    }
  };

  const fileUploadRef = useRef(null);

  // Define handleFileUploads to call FileUploadComponent's handleFileUploads through ref
  const handleFileUploads = async (taskID) => {
    if (fileUploadRef.current) {
      return await fileUploadRef.current.handleFileUploads(taskID);
    }
    return { success: false, error: "File upload component not ready" };
  };

  const handleCreateTask = async (event) => {
    event.preventDefault();
    let additionalFieldFormErrors = false;

    requiredAdditionalFieldList.forEach((r) => {
      if (!additionalFormValues[r]) {
        additionalFieldFormErrors = true;
      }
    });

    if (formErrors || additionalFieldFormErrors || attachments.length === 0) {
      setIsValidationErrorsShown(true);
      if (attachments.length === 0) {
        addToast("Please add at least one file", {
          appearance: "error",
          autoDismiss: true,
        });
      }
      return;
    }

    if (loading || isUploadingFiles) {
      return;
    }

    setLoading(true);
    setIsValidationErrorsShown(false);

    try {
      const payload = {
        ...createTaskForm,
        projectID: selectedProject?.id,
        attributes: Object.entries(additionalFormValues).map(
          ([key, value]) => value
        ),
      };

      if (createTaskForm?.taskOwner) {
        const ownerValues = screenDetails?.tabs[0]?.fields.find(
          (at) => at?.fieldType?.name === "USER_PICKER"
        );
        let taskOwnerFound = false;

        if (ownerValues?.fieldType?.id) {
          payload.attributes = payload.attributes.map((attribute) => {
            if (attribute.fieldTypeName === "USER_PICKER") {
              taskOwnerFound = true;
              return {
                fieldTypeName: "USER_PICKER",
                fieldValue: [payload?.taskOwner],
                taskFieldID: ownerValues?.id,
              };
            }
            return attribute;
          });

          if (!taskOwnerFound) {
            payload.attributes.push({
              fieldTypeName: "USER_PICKER",
              fieldValue: [payload?.taskOwner],
              taskFieldID: ownerValues?.id,
            });
          }
        }

        delete payload?.taskOwner;
      }

      addToast("Creating task...", {
        appearance: "info",
        autoDismiss: true,
      });

      const response = await axios.post("tasks", {
        task: payload,
      });
      const taskID = response.data.id;
      setCreatedTaskId(taskID);

      addToast(`Task ID: ${taskID} created! Uploading files...`, {
        appearance: "success",
        autoDismiss: true,
      });

      const uploadResult = await handleFileUploads(taskID);

      if (!uploadResult.success) {
        throw new Error(
          `File upload failed. ${uploadResult.failed} files failed to upload.`
        );
      }

      setTimeout(() => {
        handleTaskCreateClose();
      }, 2000);
    } catch (error) {
      console.error("Error creating task:", error);
      addToast(error.message || "Failed to create task", {
        appearance: "error",
        autoDismiss: true,
      });

      setLoading(false);
      setUploadProgress(0);
      setIsUploadingFiles(false);
      setCreatedTaskId(null);
    }
  };

  const getTaskAdditionalDetailsComponent = () => {
    if (isTaskTypeLoading) {
      return (
        <div className="my-5">
          <SkeletonLoader />
        </div>
      );
    }

    if (isTaskTypeApiError) {
      return (
        <div className="my-5">
          <ErrorAlert message="Cannot get task additional details at the moment" />
        </div>
      );
    }

    if (!screenDetails) {
      return <></>;
    }

    return (
      <TaskScreenDetails
        taskFormData={additionalFormValues}
        handleFormChange={handleAdditionalFieldChange}
        isValidationErrorsShown={isValidationErrorsShown}
        screenDetails={screenDetails}
      />
    );
  };

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 flex items-right justify-end bg-white bg-opacity-25 backdrop-blur-sm z-10">
          <div className="bg-white pl-10 pt-6 pr-6 pb-10 shadow-lg w-3/6 h-screen overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <p className="text-2xl font-semibold">Create New Task</p>
              <div className="cursor-pointer" onClick={handleTaskCreateClose}>
                <XMarkIcon className="w-6 h-6 text-gray-500" />
              </div>
            </div>
            <form
              className="space-y-4 mt-10"
              ref={formRef}
              onSubmit={handleCreateTask}
            >
              <div className="mb-6">
                <FormSelect
                  showLabel
                  placeholder="Sprint"
                  name="sprintID"
                  formValues={createTaskForm}
                  options={getSelectOptions(sprintListForProject)}
                  onChange={({ target: { name, value } }) =>
                    handleFormChange(name, value)
                  }
                  formErrors={formErrors}
                  showErrors={isValidationErrorsShown}
                />
              </div>
              <div className="mb-6">
                <FormSelect
                  showLabel
                  placeholder="Task Type"
                  name="taskTypeID"
                  formValues={createTaskForm}
                  options={appConfig.taskTypes.map((tt) => ({
                    label: tt.value,
                    value: tt.id,
                  }))}
                  onChange={({ target: { name, value } }) =>
                    handleFormChange(name, value)
                  }
                  formErrors={formErrors}
                  showErrors={isValidationErrorsShown}
                />
              </div>
              <div className="mb-6">
                <FormInput
                  type="text"
                  name="name"
                  formValues={createTaskForm}
                  placeholder="Task Title"
                  onChange={({ target: { name, value } }) =>
                    handleFormChange(name, value)
                  }
                  formErrors={formErrors}
                  showErrors={isValidationErrorsShown}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-color mb-1">
                  Description
                </label>
                <div className="border border-gray-300 rounded-md p-2">
                  <div className="flex space-x-2 mb-2">
                    <button
                      type="button"
                      className="p-1 rounded hover:bg-gray-100"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        className="w-4 h-4"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 6h16M4 12h16M4 18h16"
                        />
                      </svg>
                    </button>
                  </div>
                  <div className="mb-6">
                    <WYSIWYGInput
                      initialValue={{ description: "" }}
                      value={createTaskForm.description}
                      name="description"
                      onchange={handleFormChange}
                    />
                  </div>
                </div>
              </div>
              {!isEpicScreen && (
                <div className="mb-6">
                  <FormSelect
                    showLabel
                    placeholder="Epic"
                    name="epicID"
                    formValues={createTaskForm}
                    options={getSelectOptions(epics)}
                    onChange={({ target: { name, value } }) =>
                      handleFormChange(name, value)
                    }
                  />
                </div>
              )}
              <div className="flex space-x-4 mb-6">
                <div className="w-2/4">
                  <UserSelect
                    label="Assignee"
                    name="assigneeID"
                    value={createTaskForm.assigneeID}
                    users={users}
                    onChange={({ target: { name, value } }) =>
                      handleFormChange(name, value)
                    }
                  />
                </div>
                <div className="w-2/4">
                  <UserSelect
                    label="Task Owner"
                    name="taskOwner"
                    value={createTaskForm.taskOwner}
                    users={users}
                    onChange={({ target: { name, value } }) =>
                      handleFormChange(name, value)
                    }
                  />
                </div>
              </div>
              <FileUpload
                ref={fileUploadRef}
                onUploadComplete={handleFileUploads}
                isUploading={isUploadingFiles}
                setIsUploading={setIsUploadingFiles}
                attachments={attachments}
                setAttachments={setAttachments}
                uploadProgress={uploadProgress}
                setUploadProgress={setUploadProgress}
                currentFileIndex={currentFileIndex}
                setCurrentFileIndex={setCurrentFileIndex}
                createdTaskId={createdTaskId}
                setCreatedTaskId={setCreatedTaskId}
              />
              {getTaskAdditionalDetailsComponent()}
              <div className="flex space-x-4 mt-10 self-end w-full">
                <button
                  onClick={handleTaskCreateClose}
                  className="btn-secondary"
                  disabled={loading || isUploadingFiles}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={isSubmitting || loading || isUploadingFiles}
                >
                  {loading
                    ? isUploadingFiles
                      ? "Uploading Files..."
                      : "Creating Task..."
                    : "Continue"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default HeaderTaskCreateComponent;
