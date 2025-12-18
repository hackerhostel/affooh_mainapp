import React, { useState, useEffect } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { toast } from 'react-toastify';
import Select from "react-select";
import Modal from "../../components/Modal";
import { selectUser } from "../../state/slice/authSlice";
import useFetchTemplateTasks from "../../hooks/custom-hooks/template/useFetchTemplateTasks";
import useFetchAvailableTasks from "../../hooks/custom-hooks/template/useFetchAvailableTasks";

const UpdateTemplate = ({
  isOpen,
  template,
  onClose,
  onSuccess,
  renderInline = false,
}) => {
  
  const user = useSelector(selectUser);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [templateTasks, setTemplateTasks] = useState([]);
  const [availableTasks, setAvailableTasks] = useState([]);
  const [selectedTaskID, setSelectedTaskID] = useState("");
  
  // Use custom hooks for template fetch operations
  const { 
    fetchTemplateTasks: apiFetchTemplateTasks, 
    loadingTasks 
  } = useFetchTemplateTasks();
  
  const { 
    fetchAvailableTasks: apiFetchAvailableTasks 
  } = useFetchAvailableTasks();

  const organizationID = user?.organization?.id;

  useEffect(() => {
    if (template) {
      setName(template.name);
      setDescription(template.description || "");
      fetchTemplateTasks();
      fetchAvailableTasks();
    }
  }, [template]);

  // Fetch tasks in this template
  const fetchTemplateTasks = async () => {
    if (!template?.id) return;
    
    const result = await apiFetchTemplateTasks(template.id);
    if (result) {
      setTemplateTasks(result);
    }
  };

  // Fetch available template tasks (all tasks with isTemplate = TRUE)
  const fetchAvailableTasks = async () => {
    if (!organizationID) {
      return;
    }
    
    const result = await apiFetchAvailableTasks(organizationID);
    if (result) {
      setAvailableTasks(result);
    }
  };

  // Update template name/description
  const handleUpdate = async (e) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.success("Template name is required", { appearance: "error" });
      return;
    }

    setLoading(true);
    try {
      await axios.put(`/templates/${template.id}`, {
        name: name.trim(),
        description: description.trim(),
      });

      toast.success("Template updated successfully", { appearance: "success" });
      onSuccess();
      onClose();
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
      await axios.post(`/templates/${template.id}/tasks`, {
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
      await axios.delete(`/templates/${template.id}/tasks/${taskID}`);
      toast.success("Task removed from template", { appearance: "success" });
      fetchTemplateTasks();
    } catch (error) {
      toast.success("Failed to remove task", { appearance: "error" });
    }
  };

  const bodyWrapperClasses = renderInline
    ? "flex-1 space-y-8 overflow-y-auto px-6 pt-6"
    : "flex-1 space-y-8 overflow-y-auto px-4 pt-4 pr-1";

  const footerClasses = `mt-6 flex justify-end border-t border-gray-100 pt-4 ${
    renderInline ? "px-6" : "px-4"
  }`;

  // Filter out tasks that are already in the template
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

  const content = (
    <div className={`flex h-full flex-col ${renderInline ? "" : "pb-6"}`}>
      {renderInline && (
        <div className="border-b border-gray-100 px-6 py-4">
          <h4 className="text-xl font-semibold text-gray-900">Update Template</h4>
        </div>
      )}

      <div className={bodyWrapperClasses}>
        {/* Template Info Form */}
        <form onSubmit={handleUpdate} className="space-y-6">
          {/* Name Field */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-pink"
              placeholder="Enter template name"
              required
            />
          </div>

          {/* Description Field */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-pink"
              placeholder="Enter template description"
              rows="4"
            />
          </div>

          {/* Update Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              className="rounded-md bg-primary-pink px-4 py-2 text-white hover:bg-pink-600 disabled:opacity-50"
              disabled={loading}
            >
              {loading ? "Updating..." : "Update Template Info"}
            </button>
          </div>
        </form>

        <div className="border-t border-gray-100 pt-6">
          {/* Manage Template Tasks */}
          <div className="space-y-4">
            <h5 className="text-lg font-semibold">Manage Template Tasks</h5>

            {/* Add Task Section */}
            <div className="flex flex-col gap-3 sm:flex-row">
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
                            Remove
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

      <div className={footerClasses}>
        <button
          onClick={onClose}
          className="rounded-md border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50"
        >
          Close
        </button>
      </div>
    </div>
  );

  if (renderInline) {
    return (
      <div className="flex h-full max-h-[calc(100vh-160px)] flex-col rounded-lg bg-white shadow">
        {content}
      </div>
    );
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} type="side" title="Update Template">
      {content}
    </Modal>
  );
};

export default UpdateTemplate;



