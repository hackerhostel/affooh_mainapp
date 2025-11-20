import React, { useEffect, useState } from "react";
import { PencilIcon } from "@heroicons/react/24/outline/index.js";
import FormInput from "../../components/FormInput.jsx";
import axios from "axios";
import { useToasts } from "react-toast-notifications";
import { getSelectOptions } from "../../utils/commonUtils.js";
import FormSelect from "../../components/FormSelect.jsx";
import { useDispatch, useSelector } from "react-redux";
import {
  clickedUser,
  doGetProjectUsers,
  selectProjectUserList,
} from "../../state/slice/projectUsersSlice.js";
import { selectSelectedProject } from "../../state/slice/projectSlice.js";
import {
  doGetOrganizationUsers,
  selectAppConfig,
} from "../../state/slice/appSlice.js";
import useFetchSprint from "../../hooks/custom-hooks/sprint/useFetchSprint.jsx";
import SearchBar from "../../components/SearchBar.jsx";
import {
  priorityCellRender,
  statusCellRender,
} from "../../utils/taskutils.jsx";

// Transform task to match table field names with correct property access
const transformTask = (task) => {
  return {
    key: "",
    code: task.code || "N/A",
    title: task.name || "N/A",
    priority: task.attributes?.priority?.value || "N/A",
    status: task.attributes?.status?.value || "N/A",
    startDate: task.attributes?.startDate?.value || "N/A",
    endDate: task.attributes?.endDate?.value || "N/A",
    type: task.type || "N/A",
    assigneeId: task?.assignee?.id ? task?.assignee?.id : 0,
    assignee: task?.assignee?.firstName
      ? `${task?.assignee?.firstName} ${task?.assignee?.lastName}`
      : "Unassigned",
    priorityId: task.attributes?.priority?.id || 0,
    statusId: task.attributes?.status?.id || 0,
  };
};

const UserContentPage = () => {
  const { addToast } = useToasts();
  const dispatch = useDispatch();
  const [formErrors, setFormErrors] = useState({});
  const [isEditable, setIsEditable] = useState(false);
  const [roles, setRoles] = useState([]);
  const [assigneeOptions, setAssigneeOptions] = useState([]);
  const selectedUser = useSelector(clickedUser);
  const selectedProject = useSelector(selectSelectedProject);
  const projectUsers = useSelector(selectProjectUserList);
  const appConfig = useSelector(selectAppConfig);

  // Task filtering states
  const [filteredTaskList, setFilteredTaskList] = useState([]);
  const [assigneeFilter, setAssigneeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [startDateFilter, setStartDateFilter] = useState(null);
  const [endDateFilter, setEndDateFilter] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [taskCounts, setTaskCounts] = useState({
    all: 0,
    tasks: 0,
    bugs: 0,
    stories: 0,
  });

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const tasksPerPage = 5;

  // Fetch tasks using useFetchSprint hook
  const {
    data: sprintData,
    error,
    loading,
    refetch: refetchSprint,
  } = useFetchSprint(selectedProject?.id, selectedUser?.email);

  const toggleEditable = () => {
    setIsEditable(!isEditable);
  };

  useEffect(() => {
    async function fetchRoles() {
      try {
        const response = await axios.get("/organizations/form-data");
        const roles = response?.data.body;
        return Object.values(roles).map((role) => role);
      } catch (error) {
        addToast(error.message || "Failed to fetch user roles", {
          appearance: "error",
        });
      }
    }

    fetchRoles().then((r) => setRoles(r));
  }, []);

  useEffect(() => {
    if (selectedProject?.id) {
      dispatch(doGetProjectUsers(selectedProject.id));
    }
  }, [selectedProject?.id, dispatch]);

  useEffect(() => {
    if (sprintData?.tasks && sprintData.tasks.length > 0) {
      const assigneeMap = new Map();
      assigneeMap.set("", { value: "", label: "All Assignees" });

      sprintData.tasks.forEach((task) => {
        const assignee = task.assignee;
        if (assignee?.id && assignee?.firstName && assignee?.lastName) {
          const fullName = `${assignee.firstName} ${assignee.lastName}`;
          if (!assigneeMap.has(assignee.id)) {
            assigneeMap.set(assignee.id, {
              value: assignee.id,
              label: fullName,
            });
          }
        }
      });

      setAssigneeOptions(Array.from(assigneeMap.values()));
    } else {
      setAssigneeOptions([{ value: "", label: "All Assignees" }]);
    }
  }, [sprintData]);

  const [formValues, setFormValues] = useState({
    email: selectedUser?.email,
    contactNumber: selectedUser?.contactNumber,
    teamID: selectedUser?.teamID,
    userRole: selectedUser?.userRole,
  });

  useEffect(() => {
    setFormValues({ ...formValues, ...selectedUser });
  }, [selectedUser]);

  useEffect(() => {
    if (selectedProject?.id && selectedUser?.email) {
      refetchSprint();
    }
  }, [selectedProject?.id, selectedUser?.email]);

  useEffect(() => {
    if (sprintData?.tasks && sprintData.tasks.length > 0) {
      const transformedTasks = sprintData.tasks.map((task, index) => ({
        ...transformTask(task),
        key: `${(index + 1).toString().padStart(3, "0")}`,
      }));

      setFilteredTaskList(transformedTasks);

      const all = transformedTasks.length;
      const tasks = transformedTasks.filter(
        (task) => task.type === "Task"
      ).length;
      const bugs = transformedTasks.filter(
        (task) => task.type === "Bug"
      ).length;
      const stories = transformedTasks.filter(
        (task) => task.type === "Story"
      ).length;
      setTaskCounts({ all, tasks, bugs, stories });
      setCurrentPage(1); // Reset to first page when data changes
    } else {
      setFilteredTaskList([]);
      setTaskCounts({ all: 0, tasks: 0, bugs: 0, stories: 0 });
    }
  }, [sprintData]);

  useEffect(() => {
    applyFilters();
  }, [
    assigneeFilter,
    statusFilter,
    priorityFilter,
    startDateFilter,
    endDateFilter,
    sprintData,
    searchTerm,
  ]);

  const applyFilters = () => {
    if (!sprintData?.tasks || sprintData.tasks.length === 0) return;

    let filtered = sprintData.tasks.map((task, index) => ({
      ...transformTask(task),
      key: `${(index + 1).toString().padStart(3, "0")}`,
    }));

    if (searchTerm.trim() !== "") {
      filtered = filtered.filter((task) =>
        task.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (assigneeFilter !== "") {
      filtered = filtered.filter(
        (task) =>
          assigneeFilter === "" || task.assigneeId === Number(assigneeFilter)
      );
    }

    if (statusFilter) {
      filtered = filtered.filter(
        (task) =>
          task.status &&
          task.status.toLowerCase() === statusFilter.toLowerCase()
      );
    }

    if (priorityFilter) {
      filtered = filtered.filter(
        (task) =>
          task.priority &&
          task.priority.toLowerCase() === priorityFilter.toLowerCase()
      );
    }

    if (startDateFilter) {
      filtered = filtered.filter((task) => {
        if (!task.startDate || task.startDate === "N/A") return false;

        const taskStartDate = new Date(task.startDate);
        if (isNaN(taskStartDate.getTime())) return false;

        return (
          taskStartDate.getDate() === startDateFilter.getDate() &&
          taskStartDate.getMonth() === startDateFilter.getMonth() &&
          taskStartDate.getFullYear() === startDateFilter.getFullYear()
        );
      });
    }

    if (endDateFilter) {
      filtered = filtered.filter((task) => {
        if (!task.endDate || task.endDate === "N/A") return false;

        const taskEndDate = new Date(task.endDate);
        if (isNaN(taskEndDate.getTime())) return false;

        return (
          taskEndDate.getDate() === endDateFilter.getDate() &&
          taskEndDate.getMonth() === endDateFilter.getMonth() &&
          taskEndDate.getFullYear() === endDateFilter.getFullYear()
        );
      });
    }

    filtered = filtered.map((task, index) => ({
      ...task,
      key: `${(index + 1).toString().padStart(3, "0")}`,
    }));

    setFilteredTaskList(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  };

  const resetFilters = () => {
    setAssigneeFilter("");
    setStatusFilter("");
    setPriorityFilter("");
    setStartDateFilter(null);
    setEndDateFilter(null);
    setSearchTerm("");
  };

  const handleSearch = (term) => {
    setSearchTerm(term);
  };

  const updateUser = () => {
    if (selectedUser) {
      axios
        .put(`/users/${selectedUser.id}`, { ...formValues })
        .then(() => {
          addToast("User Successfully Updated", { appearance: "success" });
          dispatch(doGetOrganizationUsers());
        })
        .catch(() => {
          addToast("User update request failed ", { appearance: "error" });
        });
    }
  };

  // Calculate pagination
  const indexOfLastTask = currentPage * tasksPerPage;
  const indexOfFirstTask = indexOfLastTask - tasksPerPage;
  const currentTasks = filteredTaskList.slice(
    indexOfFirstTask,
    indexOfLastTask
  );
  const totalPages = Math.ceil(filteredTaskList.length / tasksPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const statusOptions = [
    { value: "", label: "All Statuses" },
    { value: "To Do", label: "To Do" },
    { value: "In Progress", label: "In Progress" },
    { value: "QA", label: "QA" },
    { value: "UAT", label: "UAT" },
    { value: "Done", label: "Done" },
  ];

  const priorityOptions = [
    { value: "", label: "All Priorities" },
    { value: "Low", label: "Low" },
    { value: "Medium", label: "Medium" },
    { value: "High", label: "High" },
  ];

  return (
    <div className="p-6 bg-dashboard-bgc min-h-screen">
      <div className="flex flex-col md:flex-row gap-6">
        {/* Left Sidebar - Fixed width for user profile */}
        <div className="w-full md:w-72 bg-white rounded-lg p-6 h-fit sticky top-16">
          <div className="flex justify-end">
            <PencilIcon
              onClick={toggleEditable}
              className="w-4 text-secondary-grey cursor-pointer"
            />
          </div>
          <div className="flex flex-col items-center">
            {selectedUser?.avatar ? (
              <img
                src={selectedUser.avatar}
                alt={`${selectedUser.firstName} ${selectedUser.lastName}`}
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-primary-pink flex items-center justify-center text-white text-sm font-semibold">
                {selectedUser?.firstName?.[0]}
                {selectedUser?.lastName?.[0]}
              </div>
            )}
            <span className="text-xl font-semibold mt-5 text-secondary-grey mb-1">
              {selectedUser?.firstName} {selectedUser?.lastName}
            </span>
            <div className="bg-task-status-qa px-2 mt-1 rounded-md">
              <span className="text-xs">Admin</span>
            </div>
            <hr className="w-full mt-6 border-t border-gray-200" />
            <div className="w-full space-y-4 mt-6">
              <FormInput
                name="email"
                formValues={formValues}
                placeholder="Email"
                onChange={(e) =>
                  setFormValues({ ...formValues, email: e.target.value })
                }
                className={`w-full p-2 border rounded-md ${
                  isEditable
                    ? "bg-white text-secondary-grey border-border-color"
                    : "bg-user-detail-box text-secondary-grey border-border-color cursor-not-allowed"
                }`}
                disabled={!isEditable}
                formErrors={formErrors}
                showErrors={true}
                showLabel={true}
              />

              <FormInput
                name="contactNumber"
                formValues={formValues}
                placeholder="Contact Number"
                onChange={(e) =>
                  setFormValues({
                    ...formValues,
                    contactNumber: e.target.value,
                  })
                }
                className={`w-full p-2 border rounded-md ${
                  isEditable
                    ? "bg-white text-secondary-grey border-border-color"
                    : "bg-user-detail-box text-secondary-grey border-border-color cursor-not-allowed"
                }`}
                disabled={!isEditable}
                formErrors={formErrors}
                showErrors={true}
                showLabel={true}
              />

              <FormSelect
                name="userRole"
                formValues={formValues}
                options={getSelectOptions(roles)}
                placeholder="Roles"
                onChange={(e) =>
                  setFormValues({ ...formValues, userRole: e.target.value })
                }
                className={`w-full p-2 border rounded-md ${
                  isEditable
                    ? "bg-white text-secondary-grey border-border-color"
                    : "bg-user-detail-box text-secondary-grey border-border-color cursor-not-allowed"
                }`}
                disabled={!isEditable}
                formErrors={formErrors}
                showErrors={true}
                showLabel={true}
              />

              <button
                onClick={updateUser}
                type="submit"
                className="px-4 py-2 bg-primary-pink w-full text-white rounded-md"
              >
                Update
              </button>
            </div>
          </div>
        </div>

        {/* Tasks Section - Responsive design that takes the remaining space */}
        <div className="flex-1 bg-white rounded-lg p-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <div className="flex flex-col md:flex-row gap-5 items-start md:items-center w-full md:w-auto">
              <h6 className="font-semibold whitespace-nowrap">{`Tasks (${filteredTaskList.length})`}</h6>
              <div className="w-full md:w-auto">
                <SearchBar
                  placeholder="Search"
                  onSearch={handleSearch}
                  value={searchTerm}
                />
              </div>
            </div>
            <div className="flex gap-4 w-full md:w-auto justify-between md:justify-end">
              {Object.entries(taskCounts).map(([type, count]) => (
                <div key={type} className="text-center">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-semibold
                    ${
                      type === "all"
                        ? "bg-pink-100 text-pink-500"
                        : type === "tasks"
                          ? "bg-green-100 text-green-500"
                          : type === "bugs"
                            ? "bg-red-100 text-red-500"
                            : "bg-blue-100 text-blue-500"
                    }`}
                  >
                    {count}
                  </div>
                  <p className="text-xs text-gray-500 mt-1 capitalize">
                    {type}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Filter controls - Responsive grid for small screens */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4 mb-4">
            <div className="flex flex-col">
              <label className="text-sm mb-1 text-gray-500">Assignee</label>
              <FormSelect
                name="assignee"
                formValues={{ assignee: assigneeFilter }}
                options={assigneeOptions}
                onChange={({ target: { value } }) => setAssigneeFilter(value)}
                className="w-full h-10"
              />
            </div>

            <div className="flex flex-col">
              <label className="text-sm mb-1 text-gray-500">Status</label>
              <FormSelect
                name="status"
                formValues={{ status: statusFilter }}
                options={statusOptions}
                onChange={({ target: { value } }) => setStatusFilter(value)}
                className="w-full h-10"
              />
            </div>

            <div className="flex flex-col">
              <label className="text-sm mb-1 text-gray-500">Priority</label>
              <FormSelect
                name="priority"
                formValues={{ priority: priorityFilter }}
                options={priorityOptions}
                onChange={({ target: { value } }) => setPriorityFilter(value)}
                className="w-full h-10"
              />
            </div>

            <div className="flex flex-col">
              <label className="text-sm mb-1 text-gray-500">Start Date</label>
              <input
                type="date"
                value={
                  startDateFilter
                    ? startDateFilter.toISOString().split("T")[0]
                    : ""
                }
                onChange={(e) => {
                  const date = e.target.value ? new Date(e.target.value) : null;
                  setStartDateFilter(date);
                }}
                className="h-10 w-full border border-gray-300 rounded-md px-2 text-sm"
              />
            </div>

            <div className="flex flex-col">
              <label className="text-sm mb-1 text-gray-500">End Date</label>
              <input
                type="date"
                value={
                  endDateFilter ? endDateFilter.toISOString().split("T")[0] : ""
                }
                onChange={(e) => {
                  const date = e.target.value ? new Date(e.target.value) : null;
                  setEndDateFilter(date);
                }}
                className="h-10 w-full border border-gray-300 rounded-md px-2 text-sm"
              />
            </div>

            <div className="flex flex-col">
              <label className="text-sm mb-1 text-gray-500">&nbsp;</label>
              <button
                onClick={resetFilters}
                className="h-10 w-full rounded-md bg-red-500 hover:bg-red-600 text-white text-sm font-medium transition-colors"
              >
                Reset
              </button>
            </div>
          </div>

          

          {loading && <p>Loading tasks...</p>}
          {error && <p>Error: {error}</p>}
          {!selectedProject && (
            <p>No project selected. Please select a project first.</p>
          )}
          {!loading && !error && selectedProject && (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="text-left text-sm text-gray-500">
                    <tr>
                      <th className="pb-3 w-1/12">Task ID</th>
                      <th className="pb-3 w-3/12">Task Name</th>
                      <th className="pb-3 w-1/12 text-center">Priority</th>
                      <th className="pb-3 w-1/12 text-center">Status</th>
                      <th className="pb-3 w-2/12 pl-6">Assignee</th>
                      <th className="pb-3 w-1/12">Start Date</th>
                      <th className="pb-3 w-1/12">End Date</th>
                      <th className="pb-3 w-1/12">Type</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm">
                    {currentTasks.length > 0 ? (
                      currentTasks.map((task) => (
                        <tr key={task.key} className="border-t">
                          <td className="py-3">{task.code}</td>
                          <td className="py-3">
                            <div className="line-clamp-3">{task.title}</div>
                          </td>
                          <td className="py-3">
                            {priorityCellRender({ value: task.priority })}
                          </td>
                          <td className="py-3 text-center">
                            {statusCellRender({ value: task.status })}
                          </td>
                          <td className="py-3 pl-6">{task.assignee}</td>
                          <td className="py-3">{task.startDate}</td>
                          <td className="py-3">{task.endDate}</td>
                          <td className="py-3">{task.type}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="8" className="py-3 text-center">
                          No tasks found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination - Centered and responsive */}
              {filteredTaskList.length > tasksPerPage && (
                <div className="flex justify-center items-center mt-6 gap-2 flex-wrap">
                  <button
                    onClick={() => paginate(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className={`w-8 h-8 flex items-center justify-center rounded-md ${
                      currentPage === 1
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    &lt;
                  </button>

                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    // Show pages around current page
                    const pageNum =
                      currentPage > 3 && totalPages > 5
                        ? currentPage - 2 + i
                        : i + 1;

                    // Only show page numbers that are valid
                    if (pageNum <= totalPages) {
                      return (
                        <button
                          key={pageNum}
                          onClick={() => paginate(pageNum)}
                          className={`w-8 h-8 flex items-center justify-center rounded-md ${
                            currentPage === pageNum
                              ? "bg-primary-pink text-white"
                              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                          }`}
                        >
                          {pageNum.toString().padStart(2, "0")}
                        </button>
                      );
                    }
                    return null;
                  })}

                  <button
                    onClick={() =>
                      paginate(Math.min(totalPages, currentPage + 1))
                    }
                    disabled={currentPage === totalPages}
                    className={`w-8 h-8 flex items-center justify-center rounded-md ${
                      currentPage === totalPages
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    &gt;
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserContentPage;
