import React, {useEffect, useState} from "react";
import {PencilIcon, XMarkIcon, ChevronLeftIcon} from "@heroicons/react/24/outline";
import FormInput from "../../components/FormInput.jsx";
import axios from "axios";
import {toast} from "react-toastify";
import {getSelectOptions} from "../../utils/commonUtils.js";
import FormSelect from "../../components/FormSelect.jsx";
import {useDispatch, useSelector} from "react-redux";
import {clickedUser, setClickedUser,} from "../../state/slice/projectUsersSlice.js";
import {updateOrganizationUser} from "../../state/slice/appSlice.js";
import useUserTasks from "../../hooks/custom-hooks/user/useUserTasks.jsx";
import SearchBar from "../../components/SearchBar.jsx";
import {priorityCellRender, statusCellRender,} from "../../utils/taskutils.jsx";
import {useHistory} from "react-router-dom";
import { UserUpdateSchema } from "../../utils/validationSchemas.js";
import {selectPermissions, selectUser} from "../../state/slice/authSlice.js";

// Transform task to match table field names with correct property access
const transformTask = (task) => {
  return {
    key: task.id,
    code: task.code || "N/A",
    title: task.name || "N/A",
    priority: task.attributes?.priority?.value || "N/A",
    status: task.attributes?.status?.value || "N/A",
    startDate: task.attributes?.startDate?.value || "N/A",
    endDate: task.attributes?.endDate?.value || "N/A",
    type: task.taskType?.name || "N/A",
    assigneeId: task?.assignee?.id ? task?.assignee?.id : 0,
    assignee: task?.assignee?.firstName
      ? `${task?.assignee?.firstName} ${task?.assignee?.lastName}`
      : "Unassigned",
    priorityId: task.attributes?.priority?.id || 0,
    statusId: task.attributes?.status?.id || 0,
    project: task.project?.name || "N/A",
  };
};

const UserManagementProfilePage = ({ onBack }) => {
  const history = useHistory();
  const dispatch = useDispatch();
  const clicked = useSelector(clickedUser);
  const loggedInUser = useSelector(selectUser);
  const selectedUser = clicked || loggedInUser;
  
  const userUpdatePermission = useSelector(selectPermissions).User?.update ?? false;
  const isOwnProfile = loggedInUser?.id === (clicked?.id || loggedInUser?.id);
  const canUpdate = isOwnProfile || userUpdatePermission;

  const [formErrors, setFormErrors] = useState({});
  const [isEditable, setIsEditable] = useState(false);
  const [roles, setRoles] = useState([]);
  const [projectOptions, setProjectOptions] = useState([]);
  const [statusOptions, setStatusOptions] = useState([]);
  const [priorityOptions, setPriorityOptions] = useState([]);

  // Task filtering states
  const [filteredTaskList, setFilteredTaskList] = useState([]);
  const [projectFilter, setProjectFilter] = useState("");
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

  // Fetch user tasks using useUserTasks hook
  const {
    data: userTasksData,
    error,
    loading,
    refetch: refetchUserTasks,
  } = useUserTasks(selectedUser?.id);

  const toggleEditable = (value) => {
  setIsEditable(value);
  if (!value) {
    setFormErrors({});
    setFormValues({
      ...selectedUser,
      contactNumber: selectedUser?.contactNumber || '',
      position: selectedUser?.position || ''
    });
  }
};

  const validateField = (fieldName, value) => {
    try {
      UserUpdateSchema.validateSyncAt(fieldName, { [fieldName]: value });
      setFormErrors(prev => ({ ...prev, [fieldName]: '' }));
    } catch (error) {
      setFormErrors(prev => ({ ...prev, [fieldName]: error.message }));
    }
  };

  const validateForm = async () => {
    try {
      await UserUpdateSchema.validate(formValues, { abortEarly: false });
      setFormErrors({});
      return true;
    } catch (error) {
      const errors = {};
      error.inner.forEach((err) => {
        errors[err.path] = err.message;
      });
      setFormErrors(errors);
      return false;
    }
  };

  const hasValidationErrors = () => {
    return Object.values(formErrors).some(error => error && error.trim() !== '');
  };

  useEffect(() => {
    async function fetchRoles() {
      try {
        const response = await axios.get("/organizations/form-data");
        const rolesData = response?.data.body;
        return Object.values(rolesData).map((role) => role);
      } catch (error) {
          toast.error(error.message || "Failed to fetch user roles");
      }
    }

    fetchRoles().then((r) => setRoles(r || []));
  }, []);

  // Update project and status options based on user tasks data
  useEffect(() => {
    if (userTasksData?.tasks && userTasksData.tasks.length > 0) {
      // Filter out completed tasks first
      const activeTasks = userTasksData.tasks.filter((task) => {
        const status = task.attributes?.status?.value;
        return status && status.toLowerCase() !== "done";
      });

      // Build project options
      const projectMap = new Map();
      projectMap.set("", { value: "", label: "All Projects" });

      // Build status options
      const statusMap = new Map();
      statusMap.set("", { value: "", label: "All Statuses" });

      // Build priority options
      const priorityMap = new Map();
      priorityMap.set("", { value: "", label: "All Priorities" });

      activeTasks.forEach((task) => {
        // Process projects
        const project = task.project;
        if (project?.name) {
          if (!projectMap.has(project.name)) {
            projectMap.set(project.name, {
              value: project.name,
              label: project.name,
            });
          }
        }

        // Process statuses
        const status = task.attributes?.status?.value;
        if (status) {
          if (!statusMap.has(status)) {
            statusMap.set(status, {
              value: status,
              label: status,
            });
          }
        }

        // Process priorities
        const priority = task.attributes?.priority?.value;
        if (priority) {
          if (!priorityMap.has(priority)) {
            priorityMap.set(priority, {
              value: priority,
              label: priority,
            });
          }
        }
      });

      setProjectOptions(Array.from(projectMap.values()));
      setStatusOptions(Array.from(statusMap.values()));
      setPriorityOptions(Array.from(priorityMap.values()));
    } else {
      setProjectOptions([{ value: "", label: "All Projects" }]);
      setStatusOptions([{ value: "", label: "All Statuses" }]);
      setPriorityOptions([{ value: "", label: "All Priorities" }]);
    }
  }, [userTasksData]);

const [formValues, setFormValues] = useState({
    email: selectedUser?.email,
    contactNumber: selectedUser?.contactNumber || '',
    position: selectedUser?.position || '',
    userRole: selectedUser?.userRole,
  });

useEffect(() => {
  if (selectedUser) {
    setFormValues({
      ...selectedUser,
      contactNumber: selectedUser?.contactNumber || '',
      position: selectedUser?.position || ''
    });
  }
  setFormErrors({});
}, [selectedUser]);

  useEffect(() => {
    if (selectedUser?.id && selectedUser.id !== 0) {
      refetchUserTasks();
    } else {
      setFilteredTaskList([]);
      setTaskCounts({ all: 0, tasks: 0, bugs: 0, stories: 0 });
    }
  }, [selectedUser?.id]);

  useEffect(() => {
    if (userTasksData?.tasks && userTasksData.tasks.length > 0) {
      const transformedTasks = userTasksData.tasks
        .filter((task) => {
          const status = task.attributes?.status?.value;
          return status && status.toLowerCase() !== "done";
        })
        .map((task, index) => ({
          ...transformTask(task),
          key: `${(index + 1).toString().padStart(3, "0")}`,
        }));

      setFilteredTaskList(transformedTasks);

      // Count tasks by type
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
      setCurrentPage(1); 
    } else {
      setFilteredTaskList([]);
      setTaskCounts({ all: 0, tasks: 0, bugs: 0, stories: 0 });
    }
  }, [userTasksData]);

  useEffect(() => {
    applyFilters();
  }, [
    projectFilter,
    statusFilter,
    priorityFilter,
    startDateFilter,
    endDateFilter,
    userTasksData,
    searchTerm,
  ]);

  const applyFilters = () => {
    if (!userTasksData?.tasks || userTasksData.tasks.length === 0) return;

    let filtered = userTasksData.tasks
      .filter((task) => {
        const status = task.attributes?.status?.value;
        return status && status.toLowerCase() !== "done";
      })
      .map((task, index) => ({
        ...transformTask(task),
        key: `${(index + 1).toString().padStart(3, "0")}`,
      }));

    if (searchTerm.trim() !== "") {
      filtered = filtered.filter((task) =>
        task.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (projectFilter !== "") {
      filtered = filtered.filter((task) => task.project === projectFilter);
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
    setCurrentPage(1); 
  };

  const resetFilters = () => {
    setProjectFilter("");
    setStatusFilter("");
    setPriorityFilter("");
    setStartDateFilter(null);
    setEndDateFilter(null);
    setSearchTerm("");
  };

  const handleSearch = (term) => {
    setSearchTerm(term);
  };

  const updateUser = async () => {
    if (!selectedUser) return;

    const isValid = await validateForm();
    if (!isValid) {
      toast.error("Please fix the validation errors");
      return;
    }

    try {
      await axios.put(`/users/${selectedUser.id}`, { ...formValues });
      toast.success("User Successfully Updated");

      const refreshedUser = {
        ...selectedUser,
        ...formValues,
      };

      dispatch(updateOrganizationUser(refreshedUser));
      dispatch(setClickedUser(refreshedUser));
      setFormValues({
        ...refreshedUser,
        contactNumber: refreshedUser?.contactNumber || "",
        position: refreshedUser?.position || "",
      });
      setIsEditable(false);
    } catch (error) {
      console.log(error);
      toast.error("User update request failed");
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

  return (
    <div className="p-6 bg-dashboard-bgc min-h-screen">
      <div className="flex flex-col md:flex-row gap-6">
        <div className="w-full md:w-72 bg-white rounded-lg p-6 h-fit sticky top-16">
          {canUpdate && (
              <div className="flex justify-end">
                {isEditable ? (
                    <XMarkIcon onClick={() => toggleEditable(false)}
                               className="w-4 text-secondary-grey cursor-pointer"/>
                ) : (
                    <PencilIcon onClick={() => toggleEditable(true)}
                                className="w-4 text-secondary-grey cursor-pointer"/>
                )}
              </div>
          )}
          <div className="flex flex-col items-center">
            {selectedUser?.avatar ? (
                <img
                    src={selectedUser.avatar}
                    alt={`${selectedUser.firstName} ${selectedUser.lastName}`}
                    className="w-10 h-10 rounded-full object-cover"
                />
            ) : (
                <div
                    className="w-10 h-10 rounded-full bg-primary-pink flex items-center justify-center text-white text-sm font-semibold">
                  {selectedUser?.firstName?.[0]}
                  {selectedUser?.lastName?.[0]}
                </div>
            )}
            {isEditable ? (
              <div className="w-full mt-4 space-y-3">
                <FormInput
                  name="firstName"
                  formValues={formValues}
                  placeholder="First Name"
                  onChange={(e) => {
                    const value = e.target.value;
                    setFormValues({
                      ...formValues,
                      firstName: value,
                    });
                    validateField('firstName', value);
                  }}
                  className={`w-full p-2 border rounded-md bg-user-detail-box text-secondary-grey border-border-color`}
                  formErrors={formErrors}
                  showErrors={true}
                  showLabel={true}
                />
                <FormInput
                  name="lastName"
                  formValues={formValues}
                  placeholder="Last Name"
                  onChange={(e) => {
                    const value = e.target.value;
                    setFormValues({
                      ...formValues,
                      lastName: value,
                    });
                    validateField('lastName', value);
                  }}
                  className={`w-full p-2 border rounded-md bg-user-detail-box text-secondary-grey border-border-color`}
                  formErrors={formErrors}
                  showErrors={true}
                  showLabel={true}
                />
              </div>
            ) : (
                <>
                  <span className="text-xl font-semibold mt-5 text-secondary-grey mb-1">
                    {selectedUser?.firstName} {selectedUser?.lastName}
                  </span>
                  <div className="bg-task-status-qa px-2 mt-1 rounded-md">
                    <span className="text-xs">{roles.find(r => r.id === formValues.userRole)?.value || ''}</span>
                  </div>
                  <hr className="w-full mt-6 border-t border-gray-200"/>
                </>
            )}
            <div className={`w-full space-y-4 ${isEditable ? "mt-4" : "mt-6"}`}>
              <FormInput
                name="email"
                formValues={formValues}
                placeholder="Email"
                onChange={(e) =>
                    setFormValues({...formValues, email: e.target.value})
                }
                className={`w-full p-2 border rounded-md bg-user-detail-box text-secondary-grey border-border-color cursor-not-allowed`}
                disabled={true}
                formErrors={formErrors}
                showErrors={true}
                showLabel={true}
              />

              <FormInput
                name="contactNumber"
                formValues={formValues}
                placeholder="Contact Number"
                onKeyPress={(e) => {
                  if (!/\d/.test(e.key)) e.preventDefault();
                }}
                onChange={(e) =>{
                  const value = e.target.value;
                    setFormValues({
                      ...formValues,
                      contactNumber: value,});
                      validateField('contactNumber', value);
                }}
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
                name="position"
                formValues={formValues}
                placeholder="Position"
                onChange={(e) =>{
                  const value = e.target.value;
                  setFormValues({
                    ...formValues,
                    position: value,
                  });
                  validateField('position', value);
                }}
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
                    setFormValues({...formValues, userRole: e.target.value})
                }
                className={`w-full p-2 border rounded-md ${
                    isEditable && !isOwnProfile
                        ? "bg-white text-secondary-grey border-border-color"
                        : "bg-user-detail-box text-secondary-grey border-border-color cursor-not-allowed"
                }`}
                disabled={!isEditable || isOwnProfile}
                formErrors={formErrors}
                showErrors={true}
                showLabel={true}
              />

              {canUpdate && (
                  <button
                      onClick={updateUser}
                      type="submit"
                      disabled={!isEditable || hasValidationErrors()}
                      className="px-4 py-2 bg-primary-pink w-full text-white rounded-md disabled:bg-gray-400"
                  >
                    Update
                  </button>
              )}
            </div>
          </div>
        </div>

        {/* Tasks Section */}
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

          {/* Filter controls */}
          <div className="flex flex-wrap gap-4 items-end mb-4">
            <div className="min-w-[150px]">
              <FormSelect
                name="project"
                formValues={{
                  project: projectFilter || "",
                }}
                options={projectOptions}
                onChange={({ target: { value } }) => setProjectFilter(value)}
                showLabel={false}
                className="h-10 py-2 px-3"
                showShadow={false}
              />
            </div>

            <div className="min-w-[150px]">
              <FormSelect
                name="status"
                formValues={{
                  status: statusFilter || "",
                }}
                options={statusOptions}
                onChange={({ target: { value } }) => setStatusFilter(value)}
                showLabel={false}
                className="h-10 py-2 px-3"
                showShadow={false}
              />
            </div>

            <div className="min-w-[150px]">
              <FormSelect
                name="priority"
                formValues={{
                  priority: priorityFilter || "",
                }}
                options={priorityOptions}
                onChange={({ target: { value } }) => setPriorityFilter(value)}
                showLabel={false}
                className="h-10 py-2 px-3"
                showShadow={false}
              />
            </div>

            <div className="min-w-[120px]">
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
                className="h-10 w-full border border-gray-300 rounded-md px-3 text-sm"
                placeholder="Start Date"
              />
            </div>

            <div className="min-w-[120px]">
              <input
                type="date"
                value={
                  endDateFilter ? endDateFilter.toISOString().split("T")[0] : ""
                }
                onChange={(e) => {
                  const date = e.target.value ? new Date(e.target.value) : null;
                  setEndDateFilter(date);
                }}
                className="h-10 w-full border border-gray-300 rounded-md px-3 text-sm"
                placeholder="End Date"
              />
            </div>

            <button
              onClick={resetFilters}
              className="h-10 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors"
            >
              Clear Filters
            </button>
          </div>

          {loading && <p className="text-center py-4">Loading tasks...</p>}
          {error && <p className="text-center py-4 text-red-500">Error loading tasks</p>}
          {!selectedUser && (
            <p className="text-center py-4">No user selected.</p>
          )}
          {!loading && !error && selectedUser && (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="text-left text-sm text-gray-500 border-b">
                  <tr>
                    <th className="pb-3 px-2">Task ID</th>
                    <th className="pb-3 px-2">Project</th>
                    <th className="pb-3 px-2">Task Name</th>
                    <th className="pb-3 px-2 text-center">Priority</th>
                    <th className="pb-3 px-2 text-center">Status</th>
                    <th className="pb-3 px-2">Start Date</th>
                    <th className="pb-3 px-2">End Date</th>
                    <th className="pb-3 px-2">Type</th>
                  </tr>
                  </thead>
                  <tbody className="text-sm">
                    {currentTasks.length > 0 ? (
                      currentTasks.map((task) => (
                          <tr key={task.key} className="border-b hover:bg-gray-50 transition-colors">
                            <td className="py-4 px-2 font-medium">{task.code}</td>
                            <td className="py-4 px-2">{task.project}</td>
                            <td className="py-4 px-2">
                              <div className="line-clamp-2 max-w-xs">{task.title}</div>
                            </td>
                            <td className="py-4 px-2">
                              <div className="flex justify-center">
                                {priorityCellRender({value: task.priority})}
                              </div>
                            </td>
                            <td className="py-4 px-2">
                              <div className="flex justify-center">
                                {statusCellRender({value: task.status})}
                              </div>
                            </td>
                            <td className="py-4 px-2">{task.startDate}</td>
                            <td className="py-4 px-2">{task.endDate}</td>
                            <td className="py-4 px-2">{task.type}</td>
                          </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="8" className="py-10 text-center text-gray-500">
                          No tasks found for this user
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {filteredTaskList.length > tasksPerPage && (
                <div className="flex justify-center items-center mt-6 gap-2">
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
                    const pageNum =
                      currentPage > 3 && totalPages > 5
                        ? currentPage - 2 + i
                        : i + 1;

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
                    onClick={() => paginate(Math.min(totalPages, currentPage + 1))}
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

export default UserManagementProfilePage;
