import React, { useCallback, useEffect, useState } from "react";
import FormInput from "../../components/FormInput.jsx";
import FormSelect from "../../components/FormSelect.jsx";
import FormTextArea from "../../components/FormTextArea.jsx";
import useValidation from "../../utils/use-validation.jsx";
import { ReleaseEditSchema } from "../../utils/validationSchemas.js";
import { useToasts } from "react-toast-notifications";
import {
  CheckBadgeIcon,
  FolderIcon,
  PencilIcon,
  PlusCircleIcon,
  XMarkIcon,
  PencilSquareIcon,
  XCircleIcon

} from "@heroicons/react/24/outline/index.js";
import {
  doGetReleases,
  doGetReleasesCheckListItems,
  selectCheckListItems,
  selectSelectedRelease,
} from "../../state/slice/releaseSlice.js";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { getSelectOptions } from "../../utils/commonUtils.js";
import { selectSelectedProject } from "../../state/slice/projectSlice.js";
import { selectProjectUserList } from "../../state/slice/projectUsersSlice.js";
import ConfirmationDialog from "../../components/ConfirmationDialog.jsx";
import UserSelect from "../../components/UserSelect.jsx";
const ReleaseEdit = ({ releaseId }) => {
  const { addToast } = useToasts();
  const dispatch = useDispatch();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const SelectedRelease = useSelector(selectSelectedRelease);
  const selectedProject = useSelector(selectSelectedProject);
  const projectUsers = useSelector(selectProjectUserList);
  const checkListItems = useSelector(selectCheckListItems);

  const [releaseTypes, setReleaseTypes] = useState([]);
  const [createdDate, setCreatedDate] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [toDeleteItem, setToDeleteItem] = useState({});
  const [isEditable, setIsEditable] = useState(false);

  const [showNewRow, setShowNewRow] = useState(false);

  const initialNewRowState = {
    name: "",
    status: "TODO",
    assignee: "",
  };
  const [newRow, setNewRow] = useState({ initialNewRowState });

  const [dateSelectorOpen, setDateSelectorOpen] = useState(false);
  // const [releaseCheckListItems, setReleaseCheckListItems] = useState([]);
  const checkListStatuses = [
    { value: "TODO", label: "TODO" },
    { value: "IN-PROGRESS", label: "IN-PROGRESS" },
    { value: "DONE", label: "DONE" },
  ];
  const releaseStatus = [
    { value: "RELEASED", label: "RELEASED" },
    { value: "UNRELEASED", label: "UNRELEASED" },
  ];

  const handleAddNewRow = () => {
    setShowNewRow(true);
  };

  const toggleEditable = () => {
    setIsEditable(!isEditable)
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

  const handleFormChange = (name, value, isText) => {
    setFormValues({ ...formValues, [name]: isText ? value : Number(value) });
    setIsValidationErrorsShown(false);
  };

  const formatDateToMMDDYYYY = (dateString) => {
    const date = new Date(dateString);
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");
    const year = date.getFullYear();

    return `${year}-${month}-${day}`;
  };

  const [isValidationErrorsShown, setIsValidationErrorsShown] = useState(false);

  const [formValues, setFormValues] = useState({
    id: SelectedRelease?.rID,
    name: SelectedRelease?.name,
    description: SelectedRelease?.description,
    releaseDate: formatDateToMMDDYYYY(SelectedRelease?.releaseDate),
    type: SelectedRelease?.type.id,
    status: SelectedRelease?.status,
    version: SelectedRelease?.version,
    projectID: selectedProject?.id,
  });

  useEffect(() => {
    if (SelectedRelease) {
      setFormValues({
        id: SelectedRelease.rID,
        name: SelectedRelease.name,
        description: SelectedRelease?.description,
        releaseDate: formatDateToMMDDYYYY(SelectedRelease?.releaseDate),
        type: SelectedRelease.type?.id,
        status: SelectedRelease.status,
        version: SelectedRelease.version,
        projectID: selectedProject?.id,
      });

      setCreatedDate(new Date(SelectedRelease?.createdAt).toDateString());
    }
  }, [SelectedRelease]);

  useEffect(() => {
    getReleaseTypes();
    dispatch(doGetReleasesCheckListItems());
  }, []);

  let releaseCheckListItems = checkListItems.filter(
    (item) => item.releaseID === SelectedRelease?.rID,
  );

  const getProjectUsers = () => {
    return projectUsers.map(user => ({
      value: user.id,
      label: `${user.firstName} ${user.lastName}`
    }));
  };
  

  const getReleaseTypes = async () => {
    await axios
      .get("releases/types")
      .then((r) => {
        setReleaseTypes(r?.data?.releaseType);
      })
      .catch((e) => {
        addToast("Failed To Get Release Types", { appearance: "error" });
      });
  };

  const [formErrors] = useValidation(ReleaseEditSchema, formValues);

  const getCreatedUser = () => {
    const user = projectUsers.find(
      (user) => user.id === SelectedRelease?.createdBy,
    );
    return user?.firstName + user?.lastName;
  };

  const editRelease = async (event) => {
    event.preventDefault();

    setIsSubmitting(true);
    if (formErrors && Object.keys(formErrors).length > 0) {
      setIsValidationErrorsShown(true);
    } else {
      setIsValidationErrorsShown(false);
      try {
        const response = await axios.put(`releases/${SelectedRelease.rID}`, {
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
    }
    setIsSubmitting(false);
  };

  const addChecklist = async () => {
    if (newRow.name !== "") {
      try {
        const response = await axios.post(`releases/${SelectedRelease.rID}/checkListItem`, {
          checkListItem: {
            ...newRow,
            checkListID: SelectedRelease.checklistID,
          },
        });

        const status = response?.status;
        if (status === 201) {
          setNewRow(initialNewRowState);
          setShowNewRow(false);
          addToast("Check List Item Created Successfully", {
            appearance: "success",
          });
          dispatch(doGetReleasesCheckListItems());
        } else {
          addToast("Failed To Create Check List Item", {
            appearance: "error",
          });
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
      .put(`releases/${SelectedRelease?.rID}/checkListItem`, {
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
          `releases/${SelectedRelease.rID}/checkListItem/${toDeleteItem.checklistItemID}`,
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

    const deleteChecklistItem = async () => {
      onDelete(row);
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
          onChange={({ target: { name, value } }) => handleChanges(name, value)}
        />
        
          ) : (
            <span className="text-text-color">
            {getProjectUsers().find(user => user.value === assignee)?.label || "Unassigned"}
          </span>
          )}
        </td>
        <td className="px-4 py-2">
          <div className={"flex gap-5 items-center"}>
            {!isEditing ? (
              <div onClick={enableEdit} className={"cursor-pointer"}>
                <PencilSquareIcon className={"w-5 h-5 text-text-color"} />
              </div>
            ) : (
              <div className="flex space-x-2">
                <div onClick={updateCheckListItemRow} className={"cursor-pointer"}>
                  <CheckBadgeIcon className={"w-5 h-5 text-text-color"} />
                </div>
                <div
          onClick={() => {
            setIsEditing(false);
            setHasChange(false);
          }}
          className={"cursor-pointer"}
        >
          <XMarkIcon className={"w-6 h-6 text-text-color"} />
        </div>
              </div>



            )}
          </div>
        </td>
      </tr>
    );
  };

  return (
    <>
      {!SelectedRelease ? (
        <div className="flex flex-col items-center justify-center h-screen">
          <FolderIcon className="w-10 text-secondary-grey" />
          <p className="text-gray-500 text-sm">No Data Available.</p>
        </div>
      ) : (
        <div className="p-2">
          {/* Header Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div className="text-start">
              <div className="text-lg mt-5 flex items-center">
                <span className="font-bold text-sm">Release &gt;</span>
                <span className="text-gray-500 text-sm ml-1">{SelectedRelease?.name}</span>
              </div>
            </div>
            <div className="flex items-center justify-end"></div>
          </div>

          {/* Release Details Section */}
          <div className="flex space-x-5">
            <div className="p-5 mt-8 w-72 bg-white rounded-lg">
              <div className="flex justify-end">
                <PencilIcon
                  onClick={toggleEditable}
                  className="w-4 text-secondary-grey cursor-pointer"
                />
              </div>
              <form id="editReleaseForm" onSubmit={editRelease} className="text-start">
                {/* Name Input */}
                <div className="mt-4">
                  <FormInput
                    type="text"
                    name="name"
                    className={`w-full p-2 border rounded-md ${isEditable
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
                    showErrors={isValidationErrorsShown}
                  />
                </div>

                {/* Description Input */}
                <div className="mt-5">
                  <label className="block text-sm text-text-color">Description</label>
                  <FormTextArea
                    name="description"
                    className={`w-full p-2 border rounded-md ${isEditable
                      ? "bg-white text-secondary-grey border-border-color"
                      : "bg-user-detail-box text-secondary-grey border-border-color cursor-not-allowed"
                      }`}
                    disabled={!isEditable}
                    showShadow={false}
                    formValues={formValues}
                    onChange={({ target: { name, value } }) =>
                      handleFormChange(name, value, true)
                    }
                    rows={6}
                  />
                  {isValidationErrorsShown && formErrors.description && (
                    <span className="text-red-500">{formErrors.description}</span>
                  )}
                </div>

                {/* Release Date Input */}
                <div className="mt-5">
                  <FormInput
                    isDate={true}
                    type="date"
                    name="releaseDate"
                    className={`w-full p-2 border rounded-md ${isEditable
                      ? "bg-white text-secondary-grey border-border-color"
                      : "bg-user-detail-box text-secondary-grey border-border-color cursor-not-allowed"
                      }`}
                    disabled={!isEditable}
                    formValues={formValues}
                    placeholder="Release Date"
                    onChange={({ target: { name, value } }) =>
                      handleFormChange(name, value, true)
                    }
                  />
                </div>

                {/* Status Select */}
                <div className="mt-5">
                  <FormSelect
                    name="status"
                    className={`w-full p-2 border rounded-md ${isEditable
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
                    showErrors={isValidationErrorsShown}
                  />
                </div>

                {/* Version Input */}
                <div className="mt-5">
                  <FormInput
                    type="text"
                    name="version"
                    className={`w-full p-2 border rounded-md ${isEditable
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
                    showErrors={isValidationErrorsShown}
                  />
                </div>

                {/* Type Select */}
                <div className="mt-5">
                  <FormSelect
                    formValues={formValues}
                    name="type"
                    className={`w-full p-2 border rounded-md ${isEditable
                      ? "bg-white text-secondary-grey border-border-color"
                      : "bg-user-detail-box text-secondary-grey border-border-color cursor-not-allowed"
                      }`}
                    disabled={!isEditable}
                    placeholder="Type"
                    options={getSelectOptions(releaseTypes)}
                    formErrors={formErrors}
                    onChange={({ target: { name, value } }) =>
                      handleFormChange(name, value)
                    }
                    showErrors={isValidationErrorsShown}
                  />
                </div>

                {/* Submit Button */}
                <div className="flex justify-end mt-5">
                  <button
                    form="editReleaseForm"
                    type="submit"
                    disabled={isSubmitting}
                    className="px-9 py-2 rounded-lg bg-primary-pink text-white font-bold cursor-pointer"
                  >
                    Update
                  </button>
                </div>
              </form>
            </div>

            {/* Checklist Section */}
            <div className="py-7">
              <div className="flex items-center justify-between">
                <div className="font-semibold text-start w-56 text-xl text-secondary-grey">
                  Check List Items
                </div>
                <div className="flex w-full justify-end pr-5 ">
                  <div className="flex gap-1 items-center">
                    <PlusCircleIcon
                      onClick={handleAddNewRow}
                      className={`w-6 h-6 ${showNewRow
                        ? "text-gray-300 cursor-not-allowed"
                        : "text-pink-500 cursor-pointer"
                        }`}
                    />
                    <span className="font-thin text-xs text-gray-600">Add New</span>
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
                            <td className=" w-56 px-2 py-2">
                              <FormInput
                                type="text"
                                name="name"
                                formValues={newRow}
                                onChange={({ target: { name, value } }) =>
                                  handleInputChange(name, value)
                                }
                              />
                            </td>
                            <td className=" w-56 px-4 py-2">
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
                    <p className="text-text-color">No Check List Items Available</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onConfirm={handleConfirmDelete}
        message={toDeleteItem ? `To delete item - ${toDeleteItem.name} ?` : ""}
      />
    </>

  );
};

export default ReleaseEdit;
