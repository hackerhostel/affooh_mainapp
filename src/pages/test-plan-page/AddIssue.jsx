import React, { useEffect, useState, useRef } from "react";
import { useSelector } from "react-redux";
import Select from "react-select";
import { selectSelectedProject } from "../../state/slice/projectSlice.js";
import useFetchFlatTasks from "../../hooks/custom-hooks/task/useFetchFlatTasks.jsx";
import useFetchTask from "../../hooks/custom-hooks/task/useFetchTask.jsx";
import SkeletonLoader from "../../components/SkeletonLoader.jsx";
import { useToasts } from "react-toast-notifications";
import axios from "axios";
import { useDispatch } from "react-redux";
import { doGetIssues } from "../../state/slice/testIssueSlice";

const statusMapping = {
  1: "To Do",
  2: "In Progress",
  3: "QA",
  4: "UAT",
  5: "Done",
};

const AddIssue = ({
  isOpen,
  onClose,
  testSuiteID,
  testCaseID,
  platform,
  testCycleID, 
  fetchTestSuite,
}) => {
  const dispatch = useDispatch();
  const selectedProject = useSelector(selectSelectedProject);
  const { loading, data: tasks } = useFetchFlatTasks(selectedProject?.id);
  const [selectedTasks, setSelectedTasks] = useState([]);
  const [taskOptions, setTaskOptions] = useState([]);
  const [selectedTaskForDetails, setSelectedTaskForDetails] = useState(null);
  const [isDetailsLoading, setIsDetailsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const selectRef = useRef(null);
  const { addToast } = useToasts();

  const [taskCode, setTaskCode] = useState(null);
  const {
    data: fullTaskDetails,
    loading: taskLoading,
    error: taskError,
  } = useFetchTask(taskCode);

  const [taskDetailsCache, setTaskDetailsCache] = useState({});
  const [existingTaskIds, setExistingTaskIds] = useState(new Set());

  useEffect(() => {
    if (isOpen && testSuiteID && testCaseID && platform && testCycleID) {
      
      dispatch(
        doGetIssues({ testSuiteID, testCaseID, platform, testCycleID })
      ).then(
        
        (response) => {
          const existingIds = new Set(
            response.payload.flatMap((issue) =>
              issue.tasks.map((task) => task.id)
            )
          );
          setExistingTaskIds(existingIds);
        }
      );
    }
  }, [isOpen, dispatch, testSuiteID, testCaseID, platform, testCycleID]); 

  useEffect(() => {
    if (tasks && tasks.length > 0) {
      const bugTasks = tasks.filter(
        (task) => task.type?.toLowerCase() === "bug"
      );

      const formattedTasks = bugTasks.map((task) => ({
        label: `${task.id.toString().padStart(2, "0")} - ${task.name || "Unnamed Task"} ${
          existingTaskIds.has(task.id) ? " (Already Added)" : ""
        }`,
        value: task.id,
        taskData: task,
        isDisabled: existingTaskIds.has(task.id),
      }));
      setTaskOptions(formattedTasks);
    }
  }, [tasks, existingTaskIds]);

  const handleSelectChange = (selectedOptions, actionMeta) => {
    setSelectedTasks(selectedOptions || []);
    if (actionMeta.action === "select-option" && selectRef.current) {
      selectRef.current.blur();
    }
  };

  const removeTask = (taskId) => {
    setSelectedTasks((prevSelectedTasks) =>
      prevSelectedTasks.filter((task) => task.value !== taskId)
    );
    if (selectedTaskForDetails && selectedTaskForDetails.id === taskId) {
      setSelectedTaskForDetails(null);
    }
  };

  const handleTaskClick = (task) => {
    if (
      selectedTaskForDetails &&
      selectedTaskForDetails.id === task.taskData.id
    ) {
      setSelectedTaskForDetails(null);
      return;
    }

    if (taskDetailsCache[task.taskData.id]) {
      setSelectedTaskForDetails(taskDetailsCache[task.taskData.id]);
      return;
    }

    setIsDetailsLoading(true);
    const taskToView = selectedTasks.find((t) => t.value === task.value);
    if (taskToView && taskToView.taskData) {
      console.log("Selected Task Details:", taskToView.taskData);
      setTaskCode(taskToView.taskData.code);
      setSelectedTaskForDetails({
        ...taskToView.taskData,
        status: "Loading...",
      });
    }
  };

  useEffect(() => {
    if (fullTaskDetails && Object.keys(fullTaskDetails).length > 0) {
      console.log("Full Task Details:", fullTaskDetails);

      const statusAttribute = fullTaskDetails.attributes?.find(
        (attr) => attr.taskFieldName === "Status"
      );
      const rawStatus = statusAttribute?.values?.[0];
      const statusValue = statusMapping[rawStatus] || "To Do";

      const updatedTaskDetails = {
        ...fullTaskDetails,
        status: statusValue,
      };

      setTaskDetailsCache((prev) => ({
        ...prev,
        [fullTaskDetails.id]: updatedTaskDetails,
      }));

      setSelectedTaskForDetails(updatedTaskDetails);
      setIsDetailsLoading(false);
    }
  }, [fullTaskDetails]);

  useEffect(() => {
    if (taskError) {
      addToast("Failed to fetch task details: " + taskError, {
        appearance: "error",
      });
      setIsDetailsLoading(false);
    }
  }, [taskError, addToast]);

  const handleClose = () => {
    onClose(false);
    setSelectedTasks([]);
    setSelectedTaskForDetails(null);
    setTaskDetailsCache({});
  };

  const createIssue = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      const taskIDs = selectedTasks.map((task) => task.value);
      const issueData = {
        testSuiteID,
        taskIDs,
        platform: platform.toLowerCase(),
        testCycleID, 
      };

      const response = await axios.post(
        `/test-plans/test-suites/${testSuiteID}/issues`,
        issueData,
        {
          params: { testCaseID },
        }
      );

      if (response?.status === 201) {
        addToast("Issues added successfully!", { appearance: "success" });
        if (fetchTestSuite) {
          await fetchTestSuite();
        }
        handleClose();
      } else {
        addToast("Failed to add issues.", { appearance: "error" });
      }
    } catch (error) {
      addToast("Failed to add issues: " + (error.message || error), {
        appearance: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const customStyles = {
    control: (provided) => ({
      ...provided,
      width: "100%",
      borderColor: "#e2e8f0",
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isSelected
        ? "#3b82f6"
        : state.isFocused
          ? "#f3f4f6"
          : "white",
      color: state.isSelected
        ? "white"
        : state.data.isDisabled
          ? "#ef4444"
          : "black",
      cursor: state.data.isDisabled ? "not-allowed" : "pointer",
    }),
    multiValue: (provided) => ({
      ...provided,
      display: "none",
    }),
  };

  const filterOption = (option, inputValue) => {
    if (option.isDisabled) return false;

    if (!inputValue) return true;

    return option.label.toLowerCase().includes(inputValue.toLowerCase());
  };

  const renderAssignee = (assignee) => {
    if (!assignee) return "Unassigned";

    const firstInitial = assignee.firstName
      ? assignee.firstName.charAt(0)
      : "N";
    const fullName = assignee.firstName
      ? `${assignee.firstName} ${assignee.lastName || ""}`
      : "Nilanga";

    return (
      <div className="flex items-center">
        <div className="w-8 h-8 rounded-full bg-gray-300 text-gray-700 flex items-center justify-center mr-2">
          {firstInitial}
        </div>
        {fullName}
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-2xl mx-auto">
        <div className="flex justify-between items-center border-b pb-2">
          <span className="text-lg font-semibold">Add Issue:</span>
          <button
            className="text-gray-500 hover:text-gray-700"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            ✖
          </button>
        </div>

        <form className="mt-4" onSubmit={createIssue}>
          {loading ? (
            <SkeletonLoader />
          ) : (
            <>
              <label className="text-sm text-gray-500">Select Issue</label>
              <Select
                ref={selectRef}
                name="tasks"
                options={taskOptions}
                value={selectedTasks}
                onChange={handleSelectChange}
                placeholder="Select tasks"
                styles={customStyles}
                isMulti
                closeMenuOnSelect={true}
                isSearchable={true}
                filterOption={filterOption}
                hideSelectedOptions={false}
                isDisabled={isSubmitting}
              />

              {selectedTasks.length > 0 && (
                <div className="mt-4">
                  {selectedTasks.map((task) => (
                    <div
                      key={task.value}
                      className="bg-gray-50 p-3 mb-3 rounded border border-gray-200"
                    >
                      <div className="flex justify-between items-center">
                        <div
                          className="text-gray-800 font-medium cursor-pointer hover:text-blue-600"
                          onClick={() => handleTaskClick(task)}
                        >
                          {task.label}
                        </div>
                        <button
                          className="text-gray-500 hover:text-gray-700"
                          onClick={() => removeTask(task.value)}
                          disabled={isSubmitting}
                        >
                          ✕
                        </button>
                      </div>

                      {selectedTaskForDetails &&
                        selectedTaskForDetails.id === task.taskData.id &&
                        (isDetailsLoading || taskLoading ? (
                          <SkeletonLoader height="80px" className="mt-2" />
                        ) : (
                          <div className="mt-2 overflow-x-auto">
                            <table className="min-w-full border-collapse text-sm">
                              <thead>
                                <tr>
                                  <th className="p-1 border border-gray-300 text-left">
                                    ID
                                  </th>
                                  <th className="p-1 border border-gray-300 text-left">
                                    Type
                                  </th>
                                  <th className="p-1 border border-gray-300 text-left">
                                    Summary
                                  </th>
                                  <th className="p-1 border border-gray-300 text-left">
                                    Assignee
                                  </th>
                                  <th className="p-1 border border-gray-300 text-left">
                                    Status
                                  </th>
                                </tr>
                              </thead>
                              <tbody>
                                <tr>
                                  <td className="p-1 border border-gray-300">
                                    {selectedTaskForDetails.id}
                                  </td>
                                  <td className="p-1 border border-gray-300">
                                    {selectedTaskForDetails.type || "Bug"}
                                  </td>
                                  <td className="p-1 border border-gray-300">
                                    {selectedTaskForDetails.name ||
                                      "Unnamed Task"}
                                  </td>
                                  <td className="p-1 border border-gray-300">
                                    {renderAssignee(
                                      selectedTaskForDetails.assignee
                                    )}
                                  </td>
                                  <td className="p-1 border border-gray-300">
                                    {selectedTaskForDetails.status || "To Do"}
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                          </div>
                        ))}
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          <div className="flex justify-between space-x-2 mt-6">
            <button
              type="button"
              className="px-6 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-100"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-pink-400 text-white rounded hover:bg-pink-600"
              disabled={isSubmitting}
            >
              Add
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddIssue;
