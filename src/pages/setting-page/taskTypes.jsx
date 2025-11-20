import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  TrashIcon,
  PencilSquareIcon,
  PlusCircleIcon,
  XMarkIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  EllipsisVerticalIcon,
} from "@heroicons/react/24/outline";
import DataGrid, {
  Column,
  Scrolling,
  Sorting,
} from "devextreme-react/data-grid";
import "../../components/sprint-table/custom-style.css";
import TaskTypeUpdate from "./TaskTypeUpdate";
import CreateTaskType from "./CreateTaskType";
import {
  fetchAllTaskTypes,
  selectTaskTypes,
  selectTaskTypeLoading,
  selectTaskTypeError,
} from "../../state/slice/taskTypeSlice";
import axios from "axios";
import ConfirmDialog from "./DeleteConformation";
import { useToasts } from "react-toast-notifications";

const TaskTypes = () => {
  const dispatch = useDispatch();
  const { addToast } = useToasts();
  const taskTypes = useSelector(selectTaskTypes);
  const loading = useSelector(selectTaskTypeLoading);
  const error = useSelector(selectTaskTypeError);
  const [showActionsId, setShowActionsId] = useState(null);
  const [editingRow, setEditingRow] = useState(null);
  const [showUpdateComponent, setShowUpdateComponent] = useState(false);
  const [newCustomField, setNewCustomField] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const closeCreateCustomField = () => setNewCustomField(false);
  const pageSize = 4;
  const totalPages = Math.ceil(taskTypes.length / pageSize);

  const paginatedTaskTypes = taskTypes.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handleEdit = (field) => {
    setEditingRow({ ...field });
    setShowUpdateComponent(true);
  };

  useEffect(() => {
    dispatch(fetchAllTaskTypes());
  }, [dispatch]);

  const formatProjects = (projects) => {
    if (!projects || projects.length === 0) return "No Projects";
    return projects.map((p) => p.name).join(", ");
  };

  const handleDelete = (id) => {
    setConfirmDeleteId(id);
  };

  const handleConfirmDelete = async () => {
    if (confirmDeleteId) {
      try {
        const response = await axios.delete(`/task-types/${confirmDeleteId}`);
        const status = response?.status;

        if (status === 200 || status === 204) {
          addToast("Task type deleted successfully!", { appearance: "success" });
          dispatch(fetchAllTaskTypes());
          setCurrentPage(1);
        } else {
          addToast("Failed to delete Task Type", { appearance: "error" });
        }
      } catch (error) {
        addToast("Failed to delete Task Type", { appearance: "error" });
      } finally {
        setConfirmDeleteId(null);
      }
    }
  };

  if (showUpdateComponent) {
    return (
      <TaskTypeUpdate
        taskTypeId={editingRow?.id}
        onClose={() => setShowUpdateComponent(false)}
      />
    );
  }

  const handlePreviousPage = () => {
    if (currentPage > 1) setCurrentPage((prev) => prev - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage((prev) => prev + 1);
  };



  if (error) {
    return (
      <div className="p-3 bg-dashboard-bgc h-full">
        <div className="flex justify-center items-center h-64">
          <div className="text-red-500">
            Error loading task types: {error}
            <button
              onClick={() => dispatch(fetchAllTaskTypes())}
              className="ml-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-3 bg-dashboard-bgc h-full">
      <div>
        <div className="flex items-center justify-between p-4">
          <p className="text-secondary-grey text-lg font-medium">
            {`Task Types (${taskTypes.length})`}
          </p>
          <div
            className="flex items-center space-x-2 text-text-color cursor-pointer"
            onClick={() => setNewCustomField(true)}
          >
            <PlusCircleIcon className="w-5 text-text-color" />
            <span>Add New</span>
          </div>
        </div>

        <DataGrid
          dataSource={paginatedTaskTypes}
          allowColumnReordering={true}
          showBorders={false}
          width="100%"
          className="rounded-lg overflow-hidden"
          showRowLines={true}
          showColumnLines={false}
          noDataText="No task types found"
        >
          <Scrolling columnRenderingMode="virtual" />
          <Sorting mode="multiple" />

          <Column dataField="name" caption="Name" width="20%" />
          <Column dataField="description" caption="Description" width="40%" />
          <Column
            dataField="projects"
            caption="Projects"
            width="25%"
            cellRender={(data) => <div>{formatProjects(data.value)}</div>}
          />
          <Column
            caption="Screens"
            width="40%"
            cellRender={(data) => (
              <div>{data.data.screen?.name}</div>
            )}
          />
          <Column
            caption="Action"
            width="15%"
            cellRender={(data) => (
              <div className="flex space-x-2">
                {showActionsId === data.data.id ? (
                  <div className="flex items-center gap-3">
                    <PencilSquareIcon
                      className="w-5 h-5 text-text-color cursor-pointer"
                      onClick={() => handleEdit(data.data)}
                    />
                    <TrashIcon
                      className="w-5 h-5 text-text-color cursor-pointer"
                      onClick={() => handleDelete(data.data.id)}
                    />
                    <XMarkIcon
                      className="w-5 h-5 text-text-color cursor-pointer"
                      onClick={() => setShowActionsId(null)}
                    />
                  </div>
                ) : (
                  <EllipsisVerticalIcon
                    className="w-5 h-5 text-text-color cursor-pointer"
                    onClick={() => setShowActionsId(data.data.id)}
                  />
                )}
              </div>
            )}
          />
        </DataGrid>

        {taskTypes.length > pageSize && (
          <div className="w-full flex gap-5 items-center justify-end mt-4 mb-4">
            <button
              onClick={handlePreviousPage}
              className={`p-2 rounded-full bg-gray-200 ${currentPage === 1
                ? "opacity-50 cursor-not-allowed"
                : "hover:bg-gray-300"
                }`}
              disabled={currentPage === 1}
            >
              <ChevronLeftIcon className={"w-4 h-4 text-secondary-grey"} />
            </button>
            <span className="text-gray-500 text-center">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={handleNextPage}
              className={`p-2 rounded-full bg-gray-200 ${currentPage === totalPages
                ? "opacity-50 cursor-not-allowed"
                : "hover:bg-gray-300"
                }`}
              disabled={currentPage === totalPages}
            >
              <ChevronRightIcon className={"w-4 h-4 text-secondary-grey"} />
            </button>
          </div>
        )}

      </div>
      <ConfirmDialog
        isOpen={confirmDeleteId !== null}
        onClose={() => setConfirmDeleteId(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Task Type"
        message="Are you sure you want to delete this task type?"
      />

      <CreateTaskType
        isOpen={newCustomField}
        onClose={closeCreateCustomField}
      />
    </div>
  );
};

export default TaskTypes;
