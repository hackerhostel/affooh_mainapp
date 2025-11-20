import React, { useEffect, useState } from "react";
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
import CreateNewScreen from "./CreateScreens";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchScreensByOrganization,
  selectScreens,
  selectScreenError,
} from "../../state/slice/screenSlice";
import { selectSelectedProject } from "../../state/slice/projectSlice";
import ScreenUpdate from "./ScreenUpdate";
import ConfirmDialog from "./DeleteConformation";
import axios from "axios";
import { useToasts } from "react-toast-notifications";

const Screens = () => {
  const dispatch = useDispatch();
  const screens = useSelector(selectScreens);
  const error = useSelector(selectScreenError);
  const selectedProject = useSelector(selectSelectedProject);
  const { addToast } = useToasts();

  const [editingRow, setEditingRow] = useState(null);
  const [showUpdateComponent, setShowUpdateComponent] = useState(false);
  const [newCustomField, setNewCustomField] = useState(false);
  const [filteredScreens, setFilteredScreens] = useState([]);
  const [showActionsId, setShowActionsId] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 4;

  const totalPages = Math.ceil(filteredScreens.length / pageSize);
  const paginatedScreens = filteredScreens.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  useEffect(() => {
    dispatch(fetchScreensByOrganization());
  }, [dispatch]);

  useEffect(() => {
    // Filter screens based on selected project
    if (selectedProject && selectedProject.id && screens.length > 0) {
      const filtered = screens.filter(
        (screen) =>
          screen.projects &&
          screen.projects.some((project) => project.id === selectedProject.id)
      );
      setFilteredScreens(filtered);
    } else {
      setFilteredScreens([]);
    }
  }, [selectedProject, screens]);

  useEffect(() => {
    console.log('Current Screens:', screens);
  }, [screens]);

  const closeCreateCustomField = () => setNewCustomField(false);

  const handleEdit = (field) => {
    setEditingRow({ ...field });
    setShowUpdateComponent(true);
  };

  const handleDelete = (id) => {
    setConfirmDeleteId(id);
  };

  const handleConfirmDelete = async () => {
    if (confirmDeleteId) {
      try {
        const response = await axios.delete(`/screens/${confirmDeleteId}`);
        const status = response?.status;
  
        if (status === 200 || status === 204) {
          addToast("Screen deleted successfully!", { appearance: "success" });
          setCurrentPage(1);
          dispatch(fetchScreensByOrganization());
        } else {
          addToast("Failed to delete screen", { appearance: "error" });
        }
      } catch (error) {
        addToast("Failed to delete screen", { appearance: "error" });
      } finally {
        setConfirmDeleteId(null);
      }
    }
  };
  


  const handlePreviousPage = () => {
    if (currentPage > 1) setCurrentPage((prev) => prev - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage((prev) => prev + 1);
  };

  if (showUpdateComponent) {
    return (
      <ScreenUpdate
        screen={editingRow}
        onClose={() => {
          setShowUpdateComponent(false);
          setEditingRow(null);
          dispatch(fetchScreensByOrganization()); 
          setCurrentPage(1); 
        }}
      />
    );
  }

  if (error) {
    return <div className="text-red-500">Error: {error}</div>;
  }

  return (
    <div className="p-3 bg-dashboard-bgc h-full">
      <div>
        <div className="flex items-center justify-between p-4">
          <p className="text-secondary-grey text-lg font-medium">
            {`Screens (${filteredScreens.length})`}
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
          dataSource={paginatedScreens}
          allowColumnReordering={true}
          showBorders={false}
          width="100%"
          className="rounded-lg overflow-hidden"
          showRowLines={true}
          showColumnLines={false}
        >
          <Scrolling columnRenderingMode="virtual" />
          <Sorting mode="multiple" />
          <Column dataField="name" caption="Name" width="20%" />
          <Column dataField="description" caption="Description" width="40%" />
          <Column
            caption="Projects"
            width="20%"
            cellRender={(data) => (
              <div>
                {data.data.projects && data.data.projects.length > 0
                  ? data.data.projects.map((project, index) => (
                      <span key={project.id}>
                        {project.name}
                        {index < data.data.projects.length - 1 ? ", " : ""}
                      </span>
                    ))
                  : "No projects"}
              </div>
            )}
          />
          <Column
            caption="Actions"
            width="20%"
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

        {filteredScreens.length > 0 && (
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

            <ConfirmDialog
              isOpen={confirmDeleteId !== null}
              onClose={() => setConfirmDeleteId(null)}
              onConfirm={handleConfirmDelete}
              title="Delete Screen"
              message="Are you sure you want to delete this screen?"
            />
          </div>
        )}

        <CreateNewScreen
          isOpen={newCustomField}
          onClose={closeCreateCustomField}
        />
      </div>
    </div>
  );
};

export default Screens;
