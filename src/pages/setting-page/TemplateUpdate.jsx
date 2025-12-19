import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import { toast } from 'react-toastify';
import Select from "react-select";
import { ArrowLongLeftIcon, TrashIcon } from "@heroicons/react/24/outline";
import FormInput from "../../components/FormInput";
import FormTextArea from "../../components/FormTextArea";
import { selectUser } from "../../state/slice/authSlice";
import useFetchTemplateDetails from "../../hooks/custom-hooks/template/useFetchTemplateDetails";
import useFetchTemplateTasks from "../../hooks/custom-hooks/template/useFetchTemplateTasks";
import useFetchAvailableTasks from "../../hooks/custom-hooks/template/useFetchAvailableTasks";

const TemplateUpdate = ({ templateId, onClose, onSuccess }) => {
  
  const user = useSelector(selectUser);
  const organizationID = user?.organization?.id;

  const [formValues, setFormValues] = useState({ name: "", description: "" });
  const [loading, setLoading] = useState(false);
  const [templateTasks, setTemplateTasks] = useState([]);
  const [availableTasks, setAvailableTasks] = useState([]);
  const [selectedTaskID, setSelectedTaskID] = useState("");
  
  // Use custom hooks for template fetch operations
  const { 
    fetchTemplateDetails: apiFetchTemplateDetails, 
    loadingTemplate 
  } = useFetchTemplateDetails();
  
  const { 
    fetchTemplateTasks: apiFetchTemplateTasks, 
    loadingTasks 
  } = useFetchTemplateTasks();
  
  const { 
    fetchAvailableTasks: apiFetchAvailableTasks 
  } = useFetchAvailableTasks();

  // Fetch template details
  useEffect(() => {
    if (templateId) {
      fetchTemplateDetails();
      fetchTemplateTasks();
      fetchAvailableTasks();
    }
  }, [templateId]);

  const fetchTemplateDetails = async () => {
    if (!templateId) return;
    
    const result = await apiFetchTemplateDetails(templateId);
    if (result) {
      setFormValues({
        name: result.name || "",
        description: result.description || "",
      });
    }
  };

  const handleFormChange = (name, value) => {
    setFormValues((prev) => ({ ...prev, [name]: value }));
  };

  // Fetch tasks in this template
  const fetchTemplateTasks = async () => {
    if (!templateId) return;
    
    const result = await apiFetchTemplateTasks(templateId);
    if (result) {
      setTemplateTasks(result);
    }
  };

  // Fetch available template tasks (all tasks with isTemplate = TRUE)
  const fetchAvailableTasks = async () => {
    if (!organizationID) return;
    
    const result = await apiFetchAvailableTasks(organizationID);
    if (result) {
      setAvailableTasks(result);
    }
  };

  // Update template name/description
  const handleUpdate = async () => {
    if (!formValues.name.trim()) {
      toast.success("Template name is required", { appearance: "error" });
      return;
    }

    setLoading(true);
    try {
      await axios.put(`/templates/${templateId}`, {
        name: formValues.name.trim(),
        description: formValues.description.trim(),
      });

      toast.success("Template updated successfully", { appearance: "success" });
      if (onSuccess) onSuccess();
      if (onClose) onClose();
    } catch (error) {
      toast.success(error.response?.data?.error || "Failed to update template", { appearance: "error" });
    } finally {
      setLoading(false);
    }
  };

  // Add task to template
  const handleAddTask = async () => {
    if (!selectedTaskID) {
      toast.success("Please select a task to add", { appearance: "error" });
      return;
    }

    try {
      await axios.post(`/templates/${templateId}/tasks`, {
        taskID: parseInt(selectedTaskID),
        displayOrder: templateTasks.length,
      });

      toast.success("Task added to template", { appearance: "success" });
      setSelectedTaskID("");
      fetchTemplateTasks();
    } catch (error) {
      toast.success(error.response?.data?.error || "Failed to add task", { appearance: "error" });
    }
  };

  // Remove task from template
  const handleRemoveTask = async (taskID) => {
    try {
      await axios.delete(`/templates/${templateId}/tasks/${taskID}`);
      toast.success("Task removed from template", { appearance: "success" });
      fetchTemplateTasks();
    } catch (error) {
      toast.success("Failed to remove task", { appearance: "error" });
    }
  };

  if (loadingTemplate) {
    return (
      <div className="p-3 bg-dashboard-bgc h-full flex items-center justify-center">
        <div>Loading template...</div>
      </div>
    );
  }

  const filteredTasks = availableTasks.filter(
    (task) => !templateTasks.find((t) => t.id === task.id)
  );

  // Get selected task for react-select value
  const selectedTaskOption = selectedTaskID
    ? (() => {
        const task = filteredTasks.find((t) => t.id === parseInt(selectedTaskID));
        return task
          ? {
              value: task.id,
              label: `${task.code} - ${task.name} (${task.taskTypeName})`,
            }
          : null;
      })()
    : null;

  return (
    <div className="p-3 bg-dashboard-bgc h-full">
      <div className="flex p-3 justify-between">
        <div className="flex flex-col space-y-5">
          <button className="w-8" onClick={onClose}>
            <ArrowLongLeftIcon />
          </button>
          <div className="flex items-center space-x-3">
            <span className="text-lg font-semibold">Template</span>
          </div>
        </div>
        <div>
          <button
            className="bg-primary-pink px-8 py-2 rounded-md text-white"
            onClick={handleUpdate}
            disabled={loading}
          >
            {loading ? "Updating..." : "Update"}
          </button>
        </div>
      </div>

      <div className="mt-5 bg-white rounded-md">
        <div className="p-4">
          <FormInput
            type="text"
            name="name"
            formValues={formValues}
            onChange={({ target: { name, value } }) => handleFormChange(name, value)}
            placeholder="Name"
          />
          <FormTextArea
            name="description"
            placeholder="Description"
            showShadow={false}
            formValues={formValues}
            onChange={({ target: { name, value } }) => handleFormChange(name, value)}
            rows={6}
          />
        </div>

        <div className="mt-4 px-4 pb-4">
          <div className="flex justify-between mb-3">
            <p className="text-lg text-text-color font-semibold">Manage Template Tasks</p>
          </div>

          {/* Add Task Section */}
          <div className="flex flex-col gap-3 sm:flex-row mb-4">
            <div className="flex-1">
              <Select
                value={selectedTaskOption}
                onChange={(option) => setSelectedTaskID(option ? option.value.toString() : "")}
                options={filteredTasks.map((task) => ({
                  value: task.id,
                  label: `${task.code} - ${task.name} (${task.taskTypeName})`,
                }))}
                placeholder="Select a task to add..."
                isSearchable={true}
                isClearable={true}
                className="react-select-container"
                classNamePrefix="react-select"
                styles={{
                  control: (base) => ({
                    ...base,
                    minHeight: "42px",
                    borderColor: "#d1d5db",
                    "&:hover": {
                      borderColor: "#d1d5db",
                    },
                  }),
                }}
              />
            </div>
            <button
              onClick={handleAddTask}
              className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
            >
              Add Task
            </button>
          </div>

          {/* Template Tasks List */}
          {loadingTasks ? (
            <div className="py-4 text-center">Loading tasks...</div>
          ) : templateTasks.length === 0 ? (
            <div className="py-4 text-center text-gray-500">
              No tasks in this template yet.
            </div>
          ) : (
            <div className="overflow-hidden rounded-lg border">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      Code
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      Name
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      Type
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      Assignee
                    </th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {templateTasks.map((task) => (
                    <tr key={task.id} className="hover:bg-gray-50">
                      <td className="px-4 py-2 text-sm">{task.code}</td>
                      <td className="px-4 py-2 text-sm">{task.name}</td>
                      <td className="px-4 py-2 text-sm">{task.taskTypeName || "-"}</td>
                      <td className="px-4 py-2 text-sm">{task.assigneeName || "-"}</td>
                      <td className="px-4 py-2 text-right">
                        <button
                          onClick={() => handleRemoveTask(task.id)}
                          className="text-sm text-red-600 hover:text-red-900"
                        >
                          <TrashIcon className="w-5 h-5 inline" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TemplateUpdate;



