import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { selectSelectedProject } from "../../state/slice/projectSlice.js";
import { selectProjectUserList } from "../../state/slice/projectUsersSlice.js";
import {
  doGetReleases,
  doGetReleasesCheckListItems,
  selectCheckListItems,
  selectSelectedRelease,
} from "../../state/slice/releaseSlice.js";
import {
  PencilIcon,
  PlusCircleIcon,
  CheckBadgeIcon,
  XCircleIcon,
  XMarkIcon,
  PencilSquareIcon,
  TrashIcon,
} from "@heroicons/react/24/outline/index.js";
import FormInput from "../../components/FormInput.jsx";
import FormSelect from "../../components/FormSelect.jsx";
import FormTextArea from "../../components/FormTextArea.jsx";
import SearchBar from "../../components/SearchBar.jsx";
import ConfirmationDialog from "../../components/ConfirmationDialog.jsx";
import axios from "axios";
import { useToasts } from "react-toast-notifications";
import { getSelectOptions } from "../../utils/commonUtils.js";
import useFetchReleaseTasks from "../../hooks/custom-hooks/release/useFetchReleaseTasks.jsx";
import useFetchReleaseTypes from "../../hooks/custom-hooks/release/useFetchReleaseTypes.jsx";
import {
  priorityCellRender,
  statusCellRender,
} from "../../utils/taskutils.jsx";

const transformTask = (task) => {
  return {
    key: "",
    code: task?.code || "N/A",
    title: task?.name || "N/A",
    priority: task?.attributes?.priority?.value || "N/A",
    status: task?.attributes?.status?.value || "N/A",
    startDate: task?.attributes?.startDate?.value || "N/A",
    endDate: task?.attributes?.endDate?.value || "N/A",
    type: task?.taskType?.name || "N/A",
    assigneeId: task?.assignee?.id || 0,
    assignee: task?.assignee?.firstName
      ? `${task.assignee.firstName} ${task.assignee.lastName}`
      : "Unassigned",
    priorityId: task?.attributes?.priority?.id || 0,
    statusId: task?.attributes?.status?.id || 0,
    name: task?.name || "N/A",
  };
};

const ReleaseContentPage = () => {
  const { addToast } = useToasts();
  const dispatch = useDispatch();
  const selectedProject = useSelector(selectSelectedProject);
  const selectedRelease = useSelector(selectSelectedRelease);
  const projectUsers = useSelector(selectProjectUserList);
  const checkListItems = useSelector(selectCheckListItems);

  const [activeTab, setActiveTab] = useState("overview");
  const [isEditable, setIsEditable] = useState(false);
  const [releaseTypes, setReleaseTypes] = useState([]);
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showNewRow, setShowNewRow] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [toDeleteItem, setToDeleteItem] = useState({});

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
  const [assigneeOptions, setAssigneeOptions] = useState([]);

  const initialNewRowState = {
    name: "",
    status: "TODO",
    assignee: "",
  };
  const [newRow, setNewRow] = useState(initialNewRowState);

  const [formValues, setFormValues] = useState({
    id: selectedRelease?.rID,
    name: selectedRelease?.name,
    description: selectedRelease?.description,
    releaseDate: selectedRelease?.releaseDate
      ? new Date(selectedRelease.releaseDate).toISOString().split("T")[0]
      : "",
    type: selectedRelease?.type?.id,
    status: selectedRelease?.status,
    version: selectedRelease?.version,
    projectID: selectedProject?.id,
  });

  const checkListStatuses = [
    { value: "TODO", label: "TODO" },
    { value: "IN-PROGRESS", label: "IN-PROGRESS" },
    { value: "DONE", label: "DONE" },
  ];
  const releaseStatus = [
    { value: "RELEASED", label: "RELEASED" },
    { value: "UNRELEASED", label: "UNRELEASED" },
  ];

  const {
    data: releaseTasksData,
    error,
    loading,
    refetch: refetchReleaseTasks,
  } = useFetchReleaseTasks(selectedRelease?.rID);

  const {
    data: releaseTypesData,
    error: releaseTypesError,
    loading: releaseTypesLoading,
  } = useFetchReleaseTypes();

  useEffect(() => {
    if (selectedProject?.id) {
      dispatch(doGetReleases(selectedProject.id));
      dispatch(doGetReleasesCheckListItems());
    }
  }, [selectedProject?.id, dispatch]);

  useEffect(() => {
    if (selectedRelease) {
      setFormValues({
        id: selectedRelease.rID,
        name: selectedRelease.name,
        description: selectedRelease?.description,
        releaseDate: selectedRelease.releaseDate
          ? new Date(selectedRelease.releaseDate).toISOString().split("T")[0]
          : "",
        type: selectedRelease.type?.id,
        status: selectedRelease.status,
        version: selectedRelease.version,
        projectID: selectedProject?.id,
      });
    }
  }, [selectedRelease]);

  useEffect(() => {
    if (releaseTypesData) {
      setReleaseTypes(releaseTypesData);
    }
    if (releaseTypesError) {
      addToast("Failed to load release types", { appearance: "error" });
    }
  }, [releaseTypesData, releaseTypesError, addToast]);
  useEffect(() => {
    console.log('Release Tasks Data:', releaseTasksData);
    if (releaseTasksData?.tasks && releaseTasksData.tasks.length > 0) {
      const transformedTasks = releaseTasksData.tasks.map((task, index) => {
        const transformed = transformTask(task);
        console.log(`Transformed Task ${index}:`, transformed);
        return {
          ...transformed,
          key: `${(index + 1).toString().padStart(3, "0")}`,
        };
      });
      console.log('Setting Filtered Task List:', transformedTasks);
      setFilteredTaskList(transformedTasks);
    } else {
      console.log('No tasks found in releaseTasksData');
      setFilteredTaskList([]);
    }
  }, [releaseTasksData]);

  useEffect(() => {
    if (releaseTasksData?.tasks && releaseTasksData.tasks.length > 0) {
      const transformedTasks = releaseTasksData.tasks.map((task, index) => ({
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
  }, [releaseTasksData]);

  useEffect(() => {
    applyFilters();
  }, [
    assigneeFilter,
    statusFilter,
    priorityFilter,
    startDateFilter,
    endDateFilter,
    releaseTasksData,
    searchTerm,
  ]);

  useEffect(() => {
    if (projectUsers) {
      setAssigneeOptions(getProjectUsers());
    }
  }, [projectUsers]);

  const toggleEditable = () => {
    setIsEditable(!isEditable);
  };

  const handleFormChange = (name, value, isText) => {
    setFormValues({ ...formValues, [name]: isText ? value : Number(value) });
  };

  const editRelease = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    try {
      const response = await axios.put(`releases/${selectedRelease.rID}`, {
        release: formValues,
      });
      const status = response?.data?.status;
      if (status) {
        dispatch(doGetReleases(selectedProject?.id));
        addToast("Release Successfully Updated", { appearance: "success" });
      } else {
        addToast("Failed To Update The Release ", { appearance: "error" });
      }
    } catch (error) {
      addToast("Failed To Update The Release ", { appearance: "error" });
    }
    setIsSubmitting(false);
  };

  const handleAddNewRow = () => {
    setShowNewRow(true);
  };

  const handleCancelNewRow = () => {
    setShowNewRow(false);
    setNewRow(initialNewRowState);
  };

  const handleInputChange = (name, value) => {
    setNewRow((prevRow) => ({
      ...prevRow,
      [name]: value,
    }));
  };

  const addChecklist = async () => {
    if (newRow.name !== "") {
      try {
        const response = await axios.post(
          `releases/${selectedRelease.rID}/checkListItem`,
          {
            checkListItem: {
              ...newRow,
              checkListID: selectedRelease.checklistID,
            },
          }
        );
        const status = response?.status;
        if (status === 201) {
          setNewRow(initialNewRowState);
          setShowNewRow(false);
          addToast("Check List Item Created Successfully", {
            appearance: "success",
          });
          dispatch(doGetReleasesCheckListItems());
        } else {
          addToast("Failed To Create Check List Item", { appearance: "error" });
        }
      } catch (error) {
        addToast("Failed To Create Check List Item", { appearance: "error" });
      }
    } else {
      addToast("Please Enter a name", { appearance: "warning" });
    }
  };

  const updateCheckLitItem = async (row) => {
    await axios
      .put(`releases/${selectedRelease.rID}/checkListItem`, {
        checkListItem: row,
      })
      .then((r) => {
        if (r) {
          addToast("Check List Item Updated Successfully", {
            appearance: "success",
          });
          dispatch(doGetReleasesCheckListItems());
        } else {
          addToast("Failed To Update Check List Item", { appearance: "error" });
        }
      })
      .catch((e) => {
        addToast("Failed To Update Check List Item", { appearance: "error" });
      });
  };

  const handleDeleteClick = (item) => {
    setToDeleteItem(item);
    setIsDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (toDeleteItem) {
      try {
        const response = await axios.delete(
          `releases/${selectedRelease.rID}/checkListItem/${toDeleteItem.checklistItemID}`
        );
        const deleted = response?.data?.body?.checkListItem;
        if (deleted) {
          addToast("Check list item successfully deleted", {
            appearance: "success",
          });
          dispatch(doGetReleasesCheckListItems());
        } else {
          addToast("Failed to delete Check list item", { appearance: "error" });
        }
      } catch (error) {
        addToast("Failed to delete Check list item", { appearance: "error" });
      }
    }
    setIsDialogOpen(false);
  };  const applyFilters = () => {
    if (!releaseTasksData?.tasks) {
      setFilteredTaskList([]);
      return;
    }

    let filtered = Array.isArray(releaseTasksData.tasks) ? releaseTasksData.tasks.map((task, index) => {
      const transformedTask = transformTask(task);
      
      return {
        ...transformedTask,
        key: `${(index + 1).toString().padStart(3, "0")}`,
      };
    }) : [];

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

  const getProjectUsers = () => {
    return projectUsers.map((user) => ({
      value: user.id,
      label: `${user.firstName} ${user.lastName}`,
    }));
  };

  const GenerateRow = ({ row, onUpdate, onDelete }) => {
    const [name, setName] = useState(row?.name || "");
    const [status, setStatus] = useState(row?.status || "TODO");
    const [assignee, setAssignee] = useState(row?.assignee || "");
    const [isEditing, setIsEditing] = useState(false);
    const [hasChange, setHasChange] = useState(false);

    const handleChanges = (name, value) => {
      switch (name) {
        case "name":
          setName(value);
          break;
        case "status":
          setStatus(value);
          break;
        case "assignee":
          setAssignee(value);
          break;
        default:
          return "";
      }
      setHasChange(true);
    };

    const updateCheckListItemRow = () => {
      setHasChange(false);
      setIsEditing(false);
      onUpdate({
        name,
        status,
        assignee,
        checklistItemID: row?.checklistItemID,
      });
    };

    const enableEdit = () => {
      setIsEditing(true);
    };

    return (
      <tr className="border-b">
        <td className="px-4 py-2">
          {isEditing ? (
            <FormInput
              type="text"
              name="name"
              formValues={{ name: name }}
              onChange={({ target: { name, value } }) =>
                handleChanges(name, value)
              }
            />
          ) : (
            <span className="text-text-color">{name}</span>
          )}
        </td>
        <td className="px-4 py-2 w-36">
          {isEditing ? (
            <FormSelect
              name="status"
              formValues={{ status: status }}
              options={checkListStatuses}
              onChange={({ target: { name, value } }) =>
                handleChanges(name, value)
              }
            />
          ) : (
            <span className="text-text-color">{status}</span>
          )}
        </td>
        <td className="px-4 py-2">
          {isEditing ? (
            <FormSelect
              name="assignee"
              formValues={{ assignee }}
              options={getProjectUsers()}
              onChange={({ target: { name, value } }) =>
                handleChanges(name, value)
              }
            />
          ) : (
            <span className="text-text-color">
              {getProjectUsers().find((user) => user.value === assignee)
                ?.label || "Unassigned"}
            </span>
          )}
        </td>
        <td className="px-4 py-2">
          <div className="flex gap-5 items-center">
            {!isEditing ? (
              <>
                <div onClick={enableEdit} className="cursor-pointer">
                  <PencilSquareIcon className="w-5 h-5 text-text-color" />
                </div>
                <div onClick={() => onDelete(row)} className="cursor-pointer">
                  <TrashIcon className="w-5 h-5 text-red-500" />
                </div>
              </>
            ) : (
              <div className="flex space-x-2">
                <div
                  onClick={updateCheckListItemRow}
                  className="cursor-pointer"
                >
                  <CheckBadgeIcon className="w-5 h-5 text-text-color" />
                </div>
                <div
                  onClick={() => {
                    setIsEditing(false);
                    setHasChange(false);
                  }}
                  className="cursor-pointer"
                >
                  <XMarkIcon className="w-6 h-6 text-text-color" />
                </div>
              </div>
            )}
          </div>
        </td>
      </tr>
    );
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
    { value: "Done", label: "Done" },
  ];

  const priorityOptions = [
    { value: "", label: "All Priorities" },
    { value: "Low", label: "Low" },
    { value: "Medium", label: "Medium" },
    { value: "High", label: "High" },
  ];

  let releaseCheckListItems = checkListItems.filter(
    (item) => item.releaseID === selectedRelease?.rID
  );

  return (
    <div className="p-6 bg-dashboard-bgc min-h-screen">
      <div className="flex flex-col md:flex-row gap-6">
        <div className="w-full md:w-72 bg-white rounded-lg p-6 h-fit sticky top-16">
          <div className="flex justify-end">
            <PencilIcon
              onClick={toggleEditable}
              className="w-4 text-secondary-grey cursor-pointer"
            />
          </div>
          <div className="flex flex-col items-center">
            <span className="text-xl font-semibold mt-5 text-secondary-grey mb-1">
              {selectedRelease?.name}
            </span>
            <hr className="w-full mt-6 border-t border-gray-200" />
            <form
              id="editReleaseForm"
              onSubmit={editRelease}
              className="w-full space-y-4 mt-6 text-start"
            >
              <FormInput
                type="text"
                name="name"
                className={`w-full p-2 border rounded-md ${
                  isEditable
                    ? "bg-white text-secondary-grey border-border-color"
                    : "bg-user-detail-box text-secondary-grey border-border-color cursor-not-allowed"
                }`}
                disabled={!isEditable}
                formValues={formValues}
                placeholder="Name"
                onChange={({ target: { name, value } }) =>
                  handleFormChange(name, value, true)
                }
                formErrors={formErrors}
                showErrors={true}
                showLabel={true}
              />
              <FormTextArea
                name="description"
                className={`w-full p-2 border rounded-md ${
                  isEditable
                    ? "bg-white text-secondary-grey border-border-color"
                    : "bg-user-detail-box text-secondary-grey border-border-color cursor-not-allowed"
                }`}
                disabled={!isEditable}
                showShadow={false}
                formValues={formValues}
                onChange={({ target: { name, value } }) =>
                  handleFormChange(name, value, true)
                }
                rows={4}
                showLabel={true}
                label="Description"
              />
              <FormInput
                isDate={true}
                type="date"
                name="releaseDate"
                className={`w-full p-2 border rounded-md ${
                  isEditable
                    ? "bg-white text-secondary-grey border-border-color"
                    : "bg-user-detail-box text-secondary-grey border-border-color cursor-not-allowed"
                }`}
                disabled={!isEditable}
                formValues={formValues}
                placeholder="Release Date"
                onChange={({ target: { name, value } }) =>
                  handleFormChange(name, value, true)
                }
                showLabel={true}
              />
              <FormSelect
                name="status"
                className={`w-full p-2 border rounded-md ${
                  isEditable
                    ? "bg-white text-secondary-grey border-border-color"
                    : "bg-user-detail-box text-secondary-grey border-border-color cursor-not-allowed"
                }`}
                disabled={!isEditable}
                placeholder="Status"
                formValues={formValues}
                options={releaseStatus}
                formErrors={formErrors}
                onChange={({ target: { name, value } }) =>
                  handleFormChange(name, value, true)
                }
                showErrors={true}
                showLabel={true}
              />
              <FormInput
                type="text"
                name="version"
                className={`w-full p-2 border rounded-md ${
                  isEditable
                    ? "bg-white text-secondary-grey border-border-color"
                    : "bg-user-detail-box text-secondary-grey border-border-color cursor-not-allowed"
                }`}
                disabled={!isEditable}
                formValues={formValues}
                placeholder="Version"
                onChange={({ target: { name, value } }) =>
                  handleFormChange(name, value)
                }
                formErrors={formErrors}
                showErrors={true}
                showLabel={true}
              />
              <FormSelect
                formValues={formValues}
                name="type"
                className={`w-full p-2 border rounded-md ${
                  isEditable
                    ? "bg-white text-secondary-grey border-border-color"
                    : "bg-user-detail-box text-secondary-grey border-border-color cursor-not-allowed"
                }`}
                disabled={!isEditable || releaseTypesLoading}
                placeholder={releaseTypesLoading ? "Loading types..." : "Type"}
                options={getSelectOptions(releaseTypes)}
                formErrors={formErrors}
                onChange={({ target: { name, value } }) =>
                  handleFormChange(name, value)
                }
                showErrors={true}
                showLabel={true}
              />
              <button
                form="editReleaseForm"
                type="submit"
                disabled={isSubmitting || releaseTypesLoading}
                className="px-4 py-2 bg-primary-pink w-full text-white rounded-md disabled:bg-gray-300"
              >
                Update
              </button>
            </form>
          </div>
        </div>

        <div className="flex-1 bg-white rounded-lg p-6">
          <div className="flex border-b mb-6">
            <button
              className={`px-4 py-2 text-sm font-medium ${
                activeTab === "overview"
                  ? "border-b-2 border-primary-pink text-primary-pink"
                  : "text-gray-500"
              }`}
              onClick={() => setActiveTab("overview")}
            >
              Overview
            </button>
            <button
              className={`px-4 py-2 text-sm font-medium ${
                activeTab === "checklist"
                  ? "border-b-2 border-primary-pink text-primary-pink"
                  : "text-gray-500"
              }`}
              onClick={() => setActiveTab("checklist")}
            >
              Check List
            </button>
          </div>

          {activeTab === "overview" && (
            <div>
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
                        className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-semibold ${
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

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4 mb-4">
                <div className="flex flex-col">
                  <label className="text-sm mb-1 text-gray-500">Assignee</label>
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
                  <label className="text-sm mb-1 text-gray-500">End Date</label>
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
                <div className="flex flex-col">
                  <label className="text-sm mb-1 text-gray-500"> </label>
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
                          <th className="pb-3 w-1/12">ID</th>
                          <th className="pb-3 w-3/12">Task Name</th>
                          <th className="pb-3 w-1/12 text-center">Priority</th>
                          <th className="pb-3 w-1/12 text-center">Status</th>
                          <th className="pb-3 w-1/12">Start Date</th>
                          <th className="pb-3 w-1/12">End Date</th>
                          <th className="pb-3 w-2/12 pl-6">Assignee</th>
                          <th className="pb-3 w-1/12">Type</th>
                        </tr>
                      </thead>
                      
                      <tbody className="text-sm">
                        {currentTasks.length > 0 ? (
                          currentTasks.map((task) => (
                            <tr key={task.key} className="border-t">
                              <td className="py-3">{task.code}</td>
                              <td className="py-3">
                                <div className="line-clamp-3">{task.name}</div>
                              </td>
                              <td className="py-3">
                                {priorityCellRender({
                                  value: task.priority
                                })}
                              </td>
                              <td className="py-3 text-center">
                                {statusCellRender({
                                  value: task.status
                                })}
                              </td>
                              <td className="py-3">
                                {task.startDate}
                              </td>
                              <td className="py-3">
                                {task.endDate}
                              </td>
                              <td className="py-3 pl-6">{task.assignee}</td>
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
                        onClick={() => paginate(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                        className={`w-8 h-8 flex items-center justify-center rounded-md ${
                          currentPage === 1
                            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                      ></button>
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
                      ></button>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {activeTab === "checklist" && (
            <div className="py-7">
              <div className="flex items-center justify-between">
                <div className="font-semibold text-start w-56 text-xl text-secondary-grey">
                  Check List Items
                </div>
                <div className="flex w-full justify-center pr-5">
                  <div className="flex gap-1 items-center">
                    <PlusCircleIcon
                      onClick={handleAddNewRow}
                      className={`w-6 h-6 ${
                        showNewRow
                          ? "text-gray-300 cursor-not-allowed"
                          : "text-pink-500 cursor-pointer"
                      }`}
                    />
                    <span className="font-thin text-xs text-gray-600">
                      Add New
                    </span>
                  </div>
                </div>
              </div>
              <div className="w-full mt-2">
                <div
                  style={{ width: "800px" }}
                  className="p-6 bg-white rounded-lg flex-col"
                >
                  {releaseCheckListItems.length || showNewRow ? (
                    <table className="min-w-full border-collapse">
                      <thead>
                        <tr className="text-text-color">
                          <th className="px-4 py-2 text-left">Name</th>
                          <th className="px-4 py-2 text-left">Status</th>
                          <th className="px-4 py-2 text-left">Assignee</th>
                          <th className="px-4 py-2 text-left">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {showNewRow && (
                          <tr className="border-b">
                            <td className="w-56 px-2 py-2">
                              <FormInput
                                type="text"
                                name="name"
                                formValues={newRow}
                                onChange={({ target: { name, value } }) =>
                                  handleInputChange(name, value)
                                }
                              />
                            </td>
                            <td className="w-56 px-4 py-2">
                              <FormSelect
                                name="status"
                                formValues={newRow}
                                options={checkListStatuses}
                                onChange={({ target: { name, value } }) =>
                                  handleInputChange(name, value)
                                }
                              />
                            </td>
                            <td className="px-4 py-2">
                              <FormSelect
                                name="assignee"
                                formValues={newRow}
                                options={getProjectUsers()}
                                onChange={({ target: { name, value } }) =>
                                  handleInputChange(name, value)
                                }
                              />
                            </td>
                            <td className="px-4 py-2">
                              <div className="flex gap-5">
                                <XCircleIcon
                                  onClick={handleCancelNewRow}
                                  className="w-5 h-5 text-gray-500 cursor-pointer"
                                />
                                <CheckBadgeIcon
                                  onClick={addChecklist}
                                  className="w-5 h-5 text-pink-700 cursor-pointer"
                                />
                              </div>
                            </td>
                          </tr>
                        )}
                        {releaseCheckListItems.map((row, index) => (
                          <GenerateRow
                            row={row}
                            key={index}
                            onUpdate={updateCheckLitItem}
                            onDelete={handleDeleteClick}
                          />
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <p className="text-text-color">
                      No Check List Items Available
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <ConfirmationDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onConfirm={handleConfirmDelete}
        message={toDeleteItem ? `To delete item - ${toDeleteItem.name} ?` : ""}
      />
    </div>
  );
};

export default ReleaseContentPage;