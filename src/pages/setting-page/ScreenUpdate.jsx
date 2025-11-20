import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useToasts } from "react-toast-notifications";
import axios from "axios";
import {
  ArrowLongLeftIcon,
  PlusCircleIcon,
  TrashIcon,
  CheckBadgeIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import FormInput from "../../components/FormInput";
import FormTextArea from "../../components/FormTextArea";
import { selectUser } from "../../state/slice/authSlice";
import FormSelect from "../../components/FormSelect";
import { fetchCustomFields } from "../../state/slice/customFieldSlice";

const ScreenUpdate = ({ screen, onClose, onRefresh }) => {
  const dispatch = useDispatch();
  const { addToast } = useToasts();
  const user = useSelector(selectUser);
  const customFields = useSelector((state) => state.customField.customFields);

  const [formValues, setFormValues] = useState({
    name: screen?.name || "",
    description: screen?.description || "",
  });
  const [fields, setFields] = useState([]);
  const [formErrors, setFormErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [addingNew, setAddingNew] = useState(false);
  const [newFieldName, setNewFieldName] = useState("");
  const [newFieldRequired, setNewFieldRequired] = useState(false);
  const [loadingScreenDetails, setLoadingScreenDetails] = useState(true);
  const [screenTabs, setScreenTabs] = useState([]);

  // Fetch screen details with fields
  const fetchScreenDetails = async () => {
    if (!screen?.id) return;

    setLoadingScreenDetails(true);
    try {
      const response = await axios.get(`/screens/${screen.id}/single`);
      const screenData = response.data.screen;

      // Update form values
      setFormValues({
        name: screenData.name || "",
        description: screenData.description || "",
      });

      // Screen tabs store
      setScreenTabs(screenData.tabs || []);

      setFields(
        screenData.fields?.map((field) => ({
          ...field,
          required: field.required || false,
        })) || []
      );
    } catch (error) {
      console.error("Error fetching screen details:", error);
      addToast("Failed to load screen details", { appearance: "error" });
    } finally {
      setLoadingScreenDetails(false);
    }
  };

  useEffect(() => {
    dispatch(fetchCustomFields());
    fetchScreenDetails();
  }, [dispatch, screen?.id]);

  const handleFormChange = (name, value) => {
    setFormValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpdateScreen = async () => {
    if (!screen?.id) {
      addToast("Invalid screen ID", { appearance: "error" });
      return;
    }

    setIsLoading(true);

    try {
      let tabsToUpdate = screenTabs;
      if (!tabsToUpdate || tabsToUpdate.length === 0) {
        const defaultTab = {
          id: `default-${screen.id}`,
          name: "General",
          fields: fields.map((f) => ({
            id: f.id?.toString(),
            name: f.name,
            required: f.required || false,
          })),
        };
        tabsToUpdate = [defaultTab];
      } else {
        tabsToUpdate = tabsToUpdate.map((tab, index) => ({
          ...tab,
          id: tab.id?.toString(),
          fields:
            index === 0
              ? fields.map((f) => ({
                  id: f.id?.toString(),
                  name: f.name,
                  required: f.required || false,
                }))
              : tab.fields || [],
        }));
      }

      const payload = {
        screen: {
          screenID: Number(screen.id),
          name: formValues.name,
          description: formValues.description,
          tabs: tabsToUpdate,
        },
      };

      await axios.put(`/screens/${screen.id}`, payload);

      addToast("Screen updated successfully!", { appearance: "success" });
      onClose?.(); 
    } catch (error) {
      console.error("Error updating screen:", error);

      let errorMessage = "Failed to update screen";
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      }

      addToast(errorMessage, { appearance: "error" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddNew = () => {
    setAddingNew(true);
    setNewFieldName("");
    setNewFieldRequired(false);
  };

  const handleSaveNewField = () => {
    if (!newFieldName) return;
    const selectedField = customFields.find(
      (f) => f.id.toString() === newFieldName.toString()
    );
    if (selectedField) {
      // Check if field already exists
      const fieldExists = fields.some((f) => f.id === selectedField.id);
      if (!fieldExists) {
        setFields([
          ...fields,
          {
            id: selectedField.id,
            name: selectedField.name,
            required: newFieldRequired,
          },
        ]);
      } else {
        addToast("Field already added", { appearance: "warning" });
      }
    }
    setAddingNew(false);
    setNewFieldName("");
    setNewFieldRequired(false);
  };

  const handleDeleteField = (id) => {
    setFields(fields.filter((f) => f.id !== id));
  };

  const handleRequiredChange = (fieldId, isRequired) => {
    setFields(
      fields.map((field) =>
        field.id === fieldId ? { ...field, required: isRequired } : field
      )
    );
  };

  const createdDate = screen?.createdAt
    ? new Date(screen.createdAt).toLocaleDateString()
    : "—";
  const createdBy = screen?.createdBy || "—";

  const availableCustomFields = customFields.filter(
    (cf) => !fields.some((f) => f.id === cf.id)
  );

  if (loadingScreenDetails) {
    return (
      <div className="p-3 bg-dashboard-bgc h-full flex items-center justify-center">
        <div>Loading screen details...</div>
      </div>
    );
  }

  return (
    <div className="p-3 bg-dashboard-bgc h-full">
      <div className="bg-[#f7f8fa] rounded-t-md px-4 py-3 flex justify-between items-center">
        <div>
          <div className="font-semibold text-base">Screens</div>
          <div className="flex gap-8 text-xs mt-1 text-gray-500">
            <span>Created Date: {createdDate}</span>
            <span>Created By: {createdBy}</span>
          </div>
        </div>
        <button
          className="bg-primary-pink px-8 py-2 rounded-md text-white"
          onClick={handleUpdateScreen}
          disabled={isLoading}
        >
          {isLoading ? "Updating..." : "Update"}
        </button>
      </div>
      <div className="mt-5 bg-white rounded-b-md">
        <div className="p-4">
          <FormInput
            type="text"
            name="name"
            formValues={formValues}
            placeholder="Name"
            onChange={({ target: { name, value } }) =>
              handleFormChange(name, value)
            }
            formErrors={formErrors}
            showErrors={false}
          />
          <FormTextArea
            name="description"
            placeholder="Description"
            showShadow={false}
            formValues={formValues}
            onChange={({ target: { name, value } }) =>
              handleFormChange(name, value)
            }
            rows={6}
            formErrors={formErrors}
            showErrors={false}
          />
        </div>
        <div className="px-4 pb-4">
          <div className="flex justify-between items-center mb-3">
            <span className="font-semibold text-base">Fields</span>
            {!addingNew && availableCustomFields.length > 0 && (
              <button
                className="flex items-center text-primary-pink"
                onClick={handleAddNew}
              >
                <PlusCircleIcon className="w-5 h-5 mr-1" /> Add New
              </button>
            )}
          </div>
          <table className="w-full border-t border-gray-200">
            <thead>
              <tr className="bg-gray-50">
                <th className="py-2 px-2 text-left font-medium text-gray-700">
                  Field Name
                </th>
                <th className="py-2 px-2 text-center font-medium text-gray-700">
                  Required
                </th>
                <th className="py-2 px-2 text-right font-medium text-gray-700">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {addingNew && (
                <tr className="border-b border-gray-100">
                  <td className="py-2 px-2">
                    <FormSelect
                      name="newFieldId"
                      value={newFieldName}
                      options={availableCustomFields.map((f) => ({
                        label: f.name,
                        value: f.id,
                      }))}
                      onChange={({ target: { value } }) =>
                        setNewFieldName(value)
                      }
                      placeholder="Select Custom Field"
                    />
                  </td>
                  <td className="py-2 px-2 text-center">
                    <input
                      type="checkbox"
                      checked={newFieldRequired}
                      onChange={(e) => setNewFieldRequired(e.target.checked)}
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                    />
                  </td>
                  <td className="py-2 px-2 text-right">
                    <button
                      onClick={handleSaveNewField}
                      disabled={!newFieldName}
                      className="mr-3 p-1 rounded-full hover:bg-green-50 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Save field"
                    >
                      <CheckBadgeIcon className="w-6 h-6 text-green-600" />
                    </button>
                    <button
                      onClick={() => setAddingNew(false)}
                      className="p-1 rounded-full hover:bg-red-50 transition-colors duration-200"
                      title="Cancel"
                    >
                      <XMarkIcon className="w-6 h-6 text-red-600" />
                    </button>
                  </td>
                </tr>
              )}
              {fields.length === 0 && !addingNew && (
                <tr>
                  <td
                    colSpan="3"
                    className="py-4 px-2 text-center text-gray-500"
                  >
                    No fields added this screen yet
                  </td>
                </tr>
              )}
              {fields.map((field) => (
                <tr key={field.id} className="border-b border-gray-100">
                  <td className="py-2 px-2">{field.name}</td>
                  <td className="py-2 px-2 text-center">
                    <input
                      type="checkbox"
                      checked={field.required || false}
                      onChange={(e) =>
                        handleRequiredChange(field.id, e.target.checked)
                      }
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                    />
                  </td>
                  <td className="py-2 px-2 text-right">
                    <TrashIcon
                      className="w-5 h-5 text-text-color cursor-pointer inline-block"
                      onClick={() => handleDeleteField(field.id)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <button className="w-8 mt-4 ml-4" onClick={onClose}>
        <ArrowLongLeftIcon />
      </button>
    </div>
  );
};

export default ScreenUpdate;