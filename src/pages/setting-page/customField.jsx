import React, { useEffect, useState } from "react";
import axios from "axios";
import { useToasts } from "react-toast-notifications";
import { useDispatch, useSelector } from "react-redux";
import {
  TrashIcon,
  PencilSquareIcon,
  PlusCircleIcon,
  XMarkIcon,
  EllipsisVerticalIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";
import DataGrid, { Column, Scrolling, Sorting } from "devextreme-react/data-grid";
import "../../components/sprint-table/custom-style.css";
import CustomFieldUpdate from "./CustomFieldUpdate";
import CreateCustomField from "./CreateCustomField";
import DeleteConformation from "./DeleteConformation"
import {
  fetchCustomFields,
  setSelectedCustomFieldId,
  clearSelectedCustomFieldId,
} from "../../state/slice/customFieldSlice";

const CustomFieldPage = () => {
  const dispatch = useDispatch();
  const { addToast } = useToasts();

  const customFields = useSelector((state) => state.customField.customFields);

  const [editingRow, setEditingRow] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [showUpdateComponent, setShowUpdateComponent] = useState(false);
  const [newCustomField, setNewCustomField] = useState(false);
  const [showActionsId, setShowActionsId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 4;

  const totalPages = Math.ceil(customFields.length / pageSize);
  const paginatedFields = customFields.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  useEffect(() => {
    dispatch(fetchCustomFields()).catch(console.error);
  }, [dispatch]);

  const closeCreateCustomField = () => setNewCustomField(false);

  const handleEdit = (field) => {
    dispatch(setSelectedCustomFieldId(field.id));
    setEditingRow({ ...field });
    setShowUpdateComponent(true);
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) setCurrentPage((prev) => prev - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage((prev) => prev + 1);
  };

  const deleteCustomField = async (id) => {
    try {
      await axios.delete(`/custom-fields/${id}`);
      addToast("Custom field deleted successfully!", { appearance: "success" });
      dispatch(fetchCustomFields());
      setCurrentPage(1);
    } catch (error) {
      console.error("Delete error:", error);
      addToast("Failed to delete custom field", { appearance: "error" });
    }
  };

  return (
    <div className="p-3 bg-dashboard-bgc h-full">
      {!showUpdateComponent ? (
        <>
          <div className="flex items-center justify-between p-4">
            <p className="text-secondary-grey text-lg font-medium">
              {`Custom Fields (${customFields.length})`}
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
            dataSource={paginatedFields}
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
            <Column dataField="fieldType.name" caption="Type" width="20%" />
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
                        onClick={() => setConfirmDeleteId(data.data.id)}
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

          {customFields.length > 0 && (
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

              <DeleteConformation
                isOpen={confirmDeleteId !== null}
                onClose={() => setConfirmDeleteId(null)}
                onConfirm={() => {
                  deleteCustomField(confirmDeleteId);
                  setConfirmDeleteId(null);
                }}
                title="Delete Custom Field"
                message="Are you sure you want to delete this custom field?"
              />
            </div>
          )}

          <CreateCustomField isOpen={newCustomField} onClose={closeCreateCustomField} />
        </>
      ) : (
        <CustomFieldUpdate
          customFieldId={editingRow?.id}
          onClose={() => {
            setShowUpdateComponent(false);
            setEditingRow(null);
            dispatch(clearSelectedCustomFieldId());
            dispatch(fetchCustomFields());
            setCurrentPage(1);
          }}
        />
      )}
    </div>


  );
};

export default CustomFieldPage;
