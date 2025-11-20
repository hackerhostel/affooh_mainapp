import { useDispatch, useSelector } from "react-redux";
import React, { useEffect, useRef, useState } from "react";
import {
  selectIsProjectDetailsLoading,
  selectSelectedProjectFromList,
  setProjectType,
} from "../../state/slice/projectSlice.js";
import FormInput from "../../components/FormInput.jsx";
import {
  EllipsisVerticalIcon,
  PencilIcon,
  PlusCircleIcon,
} from "@heroicons/react/24/outline";
import FormSelect from "../../components/FormSelect.jsx";
import { getInitials, getSelectOptions } from "../../utils/commonUtils.js";
import SkeletonLoader from "../../components/SkeletonLoader.jsx";
import {
  doGetProjectUsers,
  selectProjectUserList,
} from "../../state/slice/projectUsersSlice.js";
import { useToasts } from "react-toast-notifications";
import axios from "axios";
import useValidation from "../../utils/use-validation.jsx";
import { ProjectUpdateSchema } from "../../utils/validationSchemas.js";
import { selectOrganizationUsers } from "../../state/slice/appSlice.js";
import { doGetWhoAmI } from "../../state/slice/authSlice.js";
import { TrashIcon } from "@heroicons/react/24/outline/index.js";
import ConfirmationDialog from "../../components/ConfirmationDialog.jsx";
import Icon from "../../../public/Icon.png";
import OpenPopUp from "./AddUserPopup.jsx";
import useFetchSprint from "../../hooks/custom-hooks/sprint/useFetchSprint.jsx";
import SearchBar from "../../components/SearchBar.jsx";
import {
  priorityCellRender,
  statusCellRender,
} from "../../utils/taskutils.jsx";

const ProjectContentPage = () => {
  const dispatch = useDispatch();
  const { addToast } = useToasts();
  const formRef = useRef(null);
  const selectedProject = useSelector(selectSelectedProjectFromList);
  const isProjectDetailsLoading = useSelector(selectIsProjectDetailsLoading);
  const userListForProject = useSelector(selectProjectUserList);
  const projectTypes = useSelector(setProjectType);
  const organizationUsers = useSelector(selectOrganizationUsers);
  const [activeButton, setActiveButton] = useState("Overview"); // Default tab changed to Overview
  const [formValues, setFormValues] = useState({
    name: "",
    prefix: "",
    projectType: "",
    projectUserIDs: "",
    status: "",
  });
  const [formErrors] = useValidation(ProjectUpdateSchema, formValues);
  const projectUsersIdList = userListForProject.map((user) => user.id);

  const [isValidationErrorsShown, setIsValidationErrorsShown] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isOpenPopUp, setIsOpenPopUp] = useState(false);
  const [isEditable, setIsEditable] = useState(false);

  useEffect(() => {
    if (selectedProject?.id) {
      setFormValues({ ...selectedProject, projectUserIDs: projectUsersIdList });
      dispatch(doGetProjectUsers(selectedProject.id));
    }
  }, [selectedProject]);

  const toggleEditable = () => {
    setIsEditable(!isEditable);
  };

  const handleButtonClick = (buttonName) => {
    setActiveButton(buttonName);
  };

  const handleFormChange = (name, value) => {
    setFormValues({ ...formValues, [name]: value });
  };

  const openPopUp = () => {
    setIsOpenPopUp(true);
  };

  const closePopUp = () => {
    setIsOpenPopUp(false);
  };

  const handleSubmitPopup = (userData) => {
    console.log("User Data Submitted:", userData);
  };

  const [issueFormValues, setIssueFormValues] = useState({
    issueType: "",
    priority: "",
    severity: "",
    status: "",
  });

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [toDeleteItem, setToDeleteItem] = useState({});
  const projectStatus = [
    { value: "Active", label: "Active" },
    { value: "On Hold", label: "On Hold" },
    { value: "Closed", label: "Closed" },
  ];

  const handleDeleteClick = (user) => {
    setToDeleteItem(user);
    setIsDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    const updatedList = projectUsersIdList.filter(
      (user) => user !== toDeleteItem.id
    );

    try {
      const payLoad = {
        ...formValues,
        projectUserIDs: [...updatedList],
      };
      const response = await axios.put(
        `/projects/${selectedProject.id}`,
        payLoad
      );
      const updated = response?.data?.body;

      if (updated) {
        addToast("User Deleted Successfully", { appearance: "success" });
        dispatch(doGetProjectUsers(selectedProject?.id));
      } else {
        addToast("Failed To Delete User", { appearance: "error" });
      }
    } catch (error) {
      addToast("Failed To Delete User", { appearance: "error" });
    }

    setIsDialogOpen(false);
  };

  const handleIssueFormChange = (name, value) => {
    setIssueFormValues({
      ...issueFormValues,
      [name]: value,
    });
  };

  const handleUserAdd = async () => {
    if (formValues.projectUserIDs === "") {
      addToast("Please select a user to add", { appearance: "error" });
      return;
    }

    setIsSubmitting(true);

    if (formErrors && Object.keys(formErrors).length > 0) {
      setIsValidationErrorsShown(true);
    } else {
      setIsValidationErrorsShown(false);
      try {
        const payLoad = {
          ...formValues,
          projectUserIDs: [
            ...projectUsersIdList,
            parseInt(formValues.projectUserIDs),
          ],
        };
        const response = await axios.put(
          `/projects/${selectedProject.id}`,
          payLoad
        );
        const updated = response?.data?.body;

        if (updated) {
          addToast("User Added Successfully Updated", {
            appearance: "success",
          });
          dispatch(doGetProjectUsers(selectedProject?.id));
        } else {
          addToast("Failed To Add User", { appearance: "error" });
        }
      } catch (error) {
        addToast("Failed To Add User", { appearance: "error" });
      }
    }
    setIsSubmitting(false);
  };

  const userList = (users) => {
    const nonProjectUsers = organizationUsers.filter(
      (orgUser) =>
        !userListForProject.some((projUser) => projUser.id === orgUser.id)
    );

    return nonProjectUsers.map((users) => ({
      value: users.id,
      label: `${users.firstName} ${users.lastName}`,
    }));
  };

  const updateProject = async (event) => {
    setIsSubmitting(true);
    event.preventDefault();

    if (formErrors && Object.keys(formErrors).length > 0) {
      setIsValidationErrorsShown(true);
    } else {
      setIsValidationErrorsShown(false);
      try {
        const response = await axios.put(`/projects/${selectedProject.id}`, {
          ...formValues,
        });
        const updated = response?.data?.body;

        if (updated) {
          dispatch(doGetWhoAmI());
          addToast("Project Successfully Updated", { appearance: "success" });
        } else {
          addToast("Failed To Updated The Project", { appearance: "error" });
        }
      } catch (error) {
        addToast("Failed To Updated The Project", { appearance: "error" });
      }
    }
    setIsSubmitting(false);
  };

  // Task Section State and Logic
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
  const [currentPage, setCurrentPage] = useState(1);
  const tasksPerPage = 5;

  const [currentUserPage, setCurrentUserPage] = useState(1);
  const usersPerPage = 5;

  const {
    data: sprintData,
    error,
    loading,
    refetch: refetchSprint,
  } = useFetchSprint(selectedProject?.id);

  useEffect(() => {
    if (selectedProject?.id) {
      refetchSprint();
    }
  }, [selectedProject?.id]);

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
      setCurrentPage(1);
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

  const applyFilters = () => {
    if (!sprintData?.tasks || sprintData.tasks.length === 0) return;

    let filtered = sprintData.tasks.map((task, index) => ({
      ...transformTask(task),
      key: `${(index + 1).toString().padStart(3, "0")}`,
    }));

    // Exclude tasks with "Done" status
    const allowedStatuses = ["To Do", "In Progress", "QA", "UAT"];
    filtered = filtered.filter(
      (task) => task.status && allowedStatuses.includes(task.status)
    );

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

    // Sort tasks by end date (latest first)
    filtered.sort((a, b) => {
      const dateA =
        a.endDate && a.endDate !== "N/A" ? new Date(a.endDate) : new Date(0);
      const dateB =
        b.endDate && b.endDate !== "N/A" ? new Date(b.endDate) : new Date(0);
      return dateB - dateA; // Descending order (latest first)
    });

    filtered = filtered.map((task, index) => ({
      ...task,
      key: `${(index + 1).toString().padStart(3, "0")}`,
    }));

    setFilteredTaskList(filtered);
    setCurrentPage(1);
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
    // "Done" status removed from filter options
  ];

  const priorityOptions = [
    { value: "", label: "All Priorities" },
    { value: "Low", label: "Low" },
    { value: "Medium", label: "Medium" },
    { value: "High", label: "High" },
  ];

  const assigneeOptions = [
    { value: "", label: "All Assignees" },
    ...(sprintData?.tasks
      ?.flatMap((task) =>
        task.assignee?.id
          ? {
              value: task.assignee.id,
              label: `${task.assignee.firstName} ${task.assignee.lastName}`,
            }
          : []
      )
      .filter((v, i, a) => a.findIndex((t) => t.value === v.value) === i) ||
      []),
  ];

  if (isProjectDetailsLoading)
    return (
      <div className="p-2">
        <SkeletonLoader />
      </div>
    );

  return (
    <>
      {!selectedProject ? (
        <div>
          <h5 className="text-black">No Project Selected</h5>
        </div>
      ) : (
        <div className="p-3 bg-dashboard-bgc h-full ">
          <div className="py-5 flex gap-4 items-center">
            <span className="text-popup-screen-header text-sm">Project</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 text-popup-screen-header"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
            <span className="text-black text-sm font-bold">
              {selectedProject.name}
            </span>
          </div>
          <div className="text flex gap-3 mt-3 text-xs justify-end mr-6">
            {["Overview", "People"].map((buttonName) => (
              <button
                key={buttonName}
                onClick={() => handleButtonClick(buttonName)}
                className={`px-4 py-2 rounded-full ${
                  activeButton === buttonName
                    ? "bg-black text-white"
                    : "bg-white text-black"
                }`}
              >
                {buttonName}
              </button>
            ))}
          </div>

          <div className="flex space-x-4">
            <div>
              <form
                onSubmit={updateProject}
                ref={formRef}
                className="flex p-5 flex-col w-72 gap-4  bg-white rounded-lg"
              >
                <div>
                  <div className="flex justify-end">
                    <PencilIcon
                      onClick={toggleEditable}
                      className="w-4 text-secondary-grey cursor-pointer"
                    />
                  </div>
                  <div className="flex justify-center">
                    {selectedProject?.name ? (
                      <div className="w-24 h-24 rounded-full bg-primary-pink flex items-center justify-center text-white text-lg font-semibold mb-1">
                        {getInitials(selectedProject?.name)}
                      </div>
                    ) : (
                      <img src={Icon} alt="Icon" className="w-24" />
                    )}
                  </div>
                  <span className="mt-2 flex justify-center text-secondary-grey text-xl font-bold">
                    {selectedProject.name}
                  </span>
                </div>
                <div className="flex-col">
                  <p className="text-secondary-grey">Name</p>
                  <div className="">
                    <FormInput
                      type="text"
                      name="name"
                      className={`w-full p-2 border rounded-md ${
                        isEditable
                          ? "bg-white text-secondary-grey border-border-color"
                          : "bg-user-detail-box text-secondary-grey border-border-color cursor-not-allowed"
                      }`}
                      disabled={!isEditable}
                      value={formValues.name}
                      formValues={formValues}
                      onChange={({ target: { name, value } }) =>
                        handleFormChange(name, value, true)
                      }
                      formErrors={formErrors}
                      showErrors={isValidationErrorsShown}
                    />
                  </div>
                </div>

                <div className="flex-col">
                  <p className="text-secondary-grey">Key</p>
                  <FormInput
                    type="text"
                    name="prefix"
                    className={`w-full p-2 border rounded-md ${
                      isEditable
                        ? "bg-white text-secondary-grey border-border-color"
                        : "bg-user-detail-box text-secondary-grey border-border-color cursor-not-allowed"
                    }`}
                    disabled={!isEditable}
                    value={formValues.prefix}
                    formValues={formValues}
                    onChange={({ target: { name, value } }) =>
                      handleFormChange(name, value, true)
                    }
                    formErrors={formErrors}
                    showErrors={isValidationErrorsShown}
                  />
                </div>

                <div className="flex gap-10">
                  <div className="flex-col w-full">
                    <p className="text-secondary-grey">Type</p>
                    <FormSelect
                      name="projectType"
                      className={`w-full p-2 border rounded-md ${
                        isEditable
                          ? "bg-white text-secondary-grey border-border-color"
                          : "bg-user-detail-box text-secondary-grey border-border-color cursor-not-allowed"
                      }`}
                      disabled={!isEditable}
                      formValues={formValues}
                      value={formValues.projectType}
                      options={getSelectOptions(projectTypes)}
                      onChange={({ target: { name, value } }) =>
                        handleFormChange(name, value)
                      }
                      formErrors={formErrors}
                      showErrors={isValidationErrorsShown}
                    />
                  </div>
                </div>

                <div className="flex gap-10">
                  <div className="flex-col w-full">
                    <p className="text-secondary-grey">Status</p>
                    <FormSelect
                      name="status"
                      className={`w-full p-2 border rounded-md ${
                        isEditable
                          ? "bg-white text-secondary-grey border-border-color"
                          : "bg-user-detail-box text-secondary-grey border-border-color cursor-not-allowed"
                      }`}
                      disabled={!isEditable}
                      formValues={formValues}
                      value={formValues.status}
                      options={projectStatus}
                      onChange={({ target: { name, value } }) =>
                        handleFormChange(name, value)
                      }
                      formErrors={formErrors}
                      showErrors={isValidationErrorsShown}
                    />
                  </div>
                </div>

                <div className="flex gap-10 justify-end">
                  <div className="flex-col">
                    <button
                      disabled={isSubmitting}
                      type="submit"
                      className="px-4 py-2 bg-primary-pink w-full text-white rounded-md"
                    >
                      Update
                    </button>
                  </div>
                </div>
              </form>
            </div>

            {activeButton === "Overview" && (
              <div>
                <span className="text-secondary-grey font-semibold text-base">
                  Overview
                </span>
                <div className="flex-1 bg-white rounded-lg p-6 mt-5">
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

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4 mb-4 items-end">
                    <div className="flex flex-col">
                      <label className="text-sm mb-1 text-gray-500">
                        Assignee
                      </label>
                      <FormSelect
                        name="assignee"
                        formValues={{ assignee: assigneeFilter }}
                        options={assigneeOptions}
                        onChange={({ target: { value } }) =>
                          setAssigneeFilter(value)
                        }
                        className="w-full h-10"
                      />
                    </div>

                    <div className="flex flex-col">
                      <label className="text-sm mb-1 text-gray-500">
                        Status
                      </label>
                      <FormSelect
                        name="status"
                        formValues={{ status: statusFilter }}
                        options={statusOptions}
                        onChange={({ target: { value } }) =>
                          setStatusFilter(value)
                        }
                        className="w-full h-10"
                      />
                    </div>

                    <div className="flex flex-col">
                      <label className="text-sm mb-1 text-gray-500">
                        Priority
                      </label>
                      <FormSelect
                        name="priority"
                        formValues={{ priority: priorityFilter }}
                        options={priorityOptions}
                        onChange={({ target: { value } }) =>
                          setPriorityFilter(value)
                        }
                        className="w-full h-10"
                      />
                    </div>

                    <div className="flex flex-col">
                      <label className="text-sm mb-1 text-gray-500">
                        Start Date
                      </label>
                      <input
                        type="date"
                        value={
                          startDateFilter
                            ? startDateFilter.toISOString().split("T")[0]
                            : ""
                        }
                        onChange={(e) => {
                          const date = e.target.value
                            ? new Date(e.target.value)
                            : null;
                          setStartDateFilter(date);
                        }}
                        className="h-10 w-full border border-gray-300 rounded-md px-2 text-sm"
                      />
                    </div>

                    <div className="flex flex-col">
                      <label className="text-sm mb-1 text-gray-500">
                        End Date
                      </label>
                      <input
                        type="date"
                        value={
                          endDateFilter
                            ? endDateFilter.toISOString().split("T")[0]
                            : ""
                        }
                        onChange={(e) => {
                          const date = e.target.value
                            ? new Date(e.target.value)
                            : null;
                          setEndDateFilter(date);
                        }}
                        className="h-10 w-full border border-gray-300 rounded-md px-2 text-sm"
                      />
                    </div>

                    <button
                      onClick={resetFilters}
                      className="h-10 w-full rounded-md bg-red-500 hover:bg-red-600 text-white text-sm font-medium transition-colors"
                    >
                      Reset
                    </button>
                  </div>

                  {loading && <p>Loading tasks...</p>}
                  {error && <p>Error: {error}</p>}
                  {!loading && !error && selectedProject && (
                    <>
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead className="text-left text-sm text-gray-500">
                            <tr>
                              <th className="pb-3 w-1/12">Task ID</th>
                              <th className="pb-3 w-3/12">Task Name</th>
                              <th className="pb-3 w-1/12 text-center">
                                Priority
                              </th>
                              <th className="pb-3 w-1/12 text-center">
                                Status
                              </th>
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
                                    <div className="line-clamp-3">
                                      {task.title}
                                    </div>
                                  </td>
                                  <td className="py-3">
                                    {priorityCellRender({
                                      value: task.priority,
                                    })}
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

                      {filteredTaskList.length > tasksPerPage && (
                        <div className="flex justify-center items-center mt-6 gap-2 flex-wrap">
                          <button
                            onClick={() =>
                              paginate(Math.max(1, currentPage - 1))
                            }
                            disabled={currentPage === 1}
                            className={`w-8 h-8 flex items-center justify-center rounded-md ${
                              currentPage === 1
                                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                            }`}
                          >
                            &lt;
                          </button>

                          {Array.from(
                            { length: Math.min(5, totalPages) },
                            (_, i) => {
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
                            }
                          )}

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
            )}

            {activeButton === "People" && (
              <div>
                <div className="flex items-center space-x-4">
                  <span className="text-secondary-grey font-semibold text-base">
                    People
                  </span>
                  <div className="flex items-center space-x-1">
                    <PlusCircleIcon
                      onClick={openPopUp}
                      className="w-6 cursor-pointer text-primary-pink"
                    />
                    <span className="text-popup-screen-header text-sm">
                      Add New
                    </span>
                  </div>
                </div>
                <div
                  style={{ width: "759px" }}
                  className="rounded-lg bg-white mt-5 p-4"
                >
                  <table className="table-auto w-full text-left">
                    <thead>
                      <tr className="text-secondary-grey text-sm h-16 font-medium border-b">
                        <th className="py-3 px-4">User</th>
                        <th className="py-3 px-4">Role</th>
                        <th className="py-3 px-4 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="text-sm text-gray-800">
                      {userListForProject
                        .slice(
                          (currentUserPage - 1) * usersPerPage,
                          currentUserPage * usersPerPage
                        )
                        .map((user, idx) => (
                          <tr key={idx} className="border-b hover:bg-gray-50">
                            <td className="py-6 px-4 flex items-center space-x-3">
                              <div className="w-8 h-8 rounded-full bg-primary-pink flex items-center justify-center text-white text-sm font-semibold">
                                {getInitials(
                                  `${user.firstName} ${user.lastName}`
                                )}
                              </div>
                              <span>{`${user.firstName} ${user.lastName}`}</span>
                            </td>
                            <td className="py-3 px-4">{user.role}</td>
                            <td className="py-3 px-4">
                              <div className="flex justify-end">
                                <div
                                  className="cursor-pointer"
                                  onClick={() => handleDeleteClick(user)}
                                >
                                  <TrashIcon className="w-5 h-5 text-gray-500" />
                                </div>
                              </div>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>

                  {/* Pagination controls */}
                  {userListForProject.length > usersPerPage && (
                    <div className="flex justify-end items-center mt-6 gap-2">
                      <button
                        onClick={() =>
                          setCurrentUserPage(Math.max(1, currentUserPage - 1))
                        }
                        disabled={currentUserPage === 1}
                        className={`w-8 h-8 flex items-center justify-center rounded-md ${
                          currentUserPage === 1
                            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                      >
                        &lt;
                      </button>

                      {Array.from(
                        {
                          length: Math.min(
                            2,
                            Math.ceil(userListForProject.length / usersPerPage)
                          ),
                        },
                        (_, i) => {
                          const pageNum = i + 1;
                          return (
                            <button
                              key={pageNum}
                              onClick={() => setCurrentUserPage(pageNum)}
                              className={`w-8 h-8 flex items-center justify-center rounded-md ${
                                currentUserPage === pageNum
                                  ? "bg-primary-pink text-white"
                                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                              }`}
                            >
                              {pageNum.toString().padStart(2, "0")}
                            </button>
                          );
                        }
                      )}

                      <button
                        onClick={() =>
                          setCurrentUserPage(
                            Math.min(
                              Math.ceil(
                                userListForProject.length / usersPerPage
                              ),
                              currentUserPage + 1
                            )
                          )
                        }
                        disabled={
                          currentUserPage ===
                          Math.ceil(userListForProject.length / usersPerPage)
                        }
                        className={`w-8 h-8 flex items-center justify-center rounded-md ${
                          currentUserPage ===
                          Math.ceil(userListForProject.length / usersPerPage)
                            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                      >
                        &gt;
                      </button>
                    </div>
                  )}
                </div>

                <OpenPopUp
                  isOpen={isOpenPopUp}
                  onClose={closePopUp}
                  onSubmit={handleSubmitPopup}
                />
              </div>
            )}

            {activeButton === "Configuration" && (
              <div>
                <div>
                  <span className="text-secondary-grey font-semibold text-base">
                    Configuration
                  </span>
                </div>
                <div
                  style={{ width: "759px" }}
                  className=" bg-white p-4 rounded-md mt-5"
                >
                  <table className="w-full text-sm text-left text-gray-500">
                    <thead className="text-sm text-secondary-grey">
                      <tr>
                        <th
                          scope="col"
                          className="px-6 py-3 text-secondary-grey"
                        >
                          Title
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-secondary-grey"
                        >
                          Priority
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-secondary-grey"
                        >
                          Severity
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-secondary-grey"
                        >
                          Status
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-secondary-grey"
                        >
                          Action
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      <tr className="bg-white border-b hover:bg-gray-50">
                        <td className="px-6 py-4 h-16 font-medium text-secondary-grey">
                          Task
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-5 py-1 rounded bg-priority-button-high text-sm text-white">
                            High
                          </span>
                        </td>
                        <td className="px-6 py-4">Sprint 1</td>
                        <td className="px-6 py-4">
                          <span className="bg-blue-100 text-blue-800 text-xs px-3 py-2 rounded">
                            In Progress
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <button className="text-gray-500 hover:text-gray-700">
                            <EllipsisVerticalIcon className="h-6 w-6" />
                          </button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <ConfirmationDialog
        isOpen={isDialogOpen}
        onClose={() => {
          setIsDialogOpen(false);
        }}
        onConfirm={() => {
          handleConfirmDelete(toDeleteItem.id);
        }}
        message={
          toDeleteItem
            ? `To delete user - ${toDeleteItem.firstName} ${toDeleteItem.lastName} ?`
            : ""
        }
      />
    </>
  );
};

export default ProjectContentPage;
