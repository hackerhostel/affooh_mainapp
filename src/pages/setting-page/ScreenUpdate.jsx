import React, {useEffect, useState} from "react";
import {useDispatch, useSelector} from "react-redux";
import { toast } from 'react-toastify';
import axios from "axios";
import {
  ArrowLongLeftIcon,
  CheckBadgeIcon,
  PencilSquareIcon,
  PlusCircleIcon,
  TrashIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import FormInput from "../../components/FormInput";
import FormTextArea from "../../components/FormTextArea";
import {selectUser} from "../../state/slice/authSlice";
import FormSelect from "../../components/FormSelect";
import {fetchCustomFields} from "../../state/slice/customFieldSlice";

const ScreenUpdate = ({screen, onClose}) => {
  console.log(screen)
  const dispatch = useDispatch();
  
  const customFields = useSelector((state) => state.customField.customFields);

  const [formValues, setFormValues] = useState({
    name: screen?.name || "",
    description: screen?.description || "",
  });
  const [screenTabs, setScreenTabs] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingScreenDetails, setLoadingScreenDetails] = useState(true);

  const [editingTabName, setEditingTabName] = useState(null);
  const [newTabName, setNewTabName] = useState("");

  const fetchScreenDetails = async () => {
    try {
      setLoadingScreenDetails(true);
      const projectId = screen.projects[0].id;
      const {data} = await axios.get(`/screens/${screen.id}?projectID=${projectId}`);
      const screenData = data.screen;
      setFormValues({
        name: screenData.name || "",
        description: screenData.description || "",
      });
      setScreenTabs(screenData.tabs || []);
    } catch (error) {
      console.error("Error fetching screen details:", error);
      toast.success("Failed to load screen details", { appearance: "error" });
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

  const handleAddTab = () => {
    const newTab = {
      id: `temp-${Date.now()}`,
      name: `New Tab ${screenTabs.length + 1}`,
      fields: [],
      isNew: true,
    };
    setScreenTabs([...screenTabs, newTab]);
  };

  const handleRenameTab = (tabId) => {
    const newName = newTabName.trim();
    if (!newName) return;
    setScreenTabs((prev) =>
        prev.map((tab) =>
            tab.id === tabId ? {...tab, name: newName} : tab
        )
    );
    setEditingTabName(null);
    setNewTabName("");
  };

  const handleDeleteTab = (tabId) => {
    const tab = screenTabs.find((t) => t.id === tabId);
    if (tab.fields && tab.fields.length > 0) {
      toast.success("Cannot delete a tab that contains fields.", {
        appearance: "warning",
      });
      return;
    }
    setScreenTabs(screenTabs.filter((t) => t.id !== tabId));
  };

  const handleAddFieldToTab = (tabId, fieldId, required) => {
    const selectedField = customFields.find(
        (f) => f.id.toString() === fieldId.toString()
    );
    if (!selectedField) return;

    setScreenTabs((prev) =>
        prev.map((tab) =>
            tab.id === tabId
                ? {
                  ...tab,
                  fields: tab.fields.some((f) => f.id === selectedField.id)
                      ? tab.fields
                      : [...tab.fields, {id: selectedField.id, name: selectedField.name, required}],
                }
                : tab
        )
    );
  };

  const handleRemoveFieldFromTab = (tabId, fieldId) => {
    setScreenTabs((prev) =>
        prev.map((tab) =>
            tab.id === tabId
                ? {...tab, fields: tab.fields.filter((f) => f.id !== fieldId)}
                : tab
        )
    );
  };

  const handleRequiredChange = (tabId, fieldId, required) => {
    setScreenTabs((prev) =>
        prev.map((tab) =>
            tab.id === tabId
                ? {
                  ...tab,
                  fields: tab.fields.map((f) =>
                      f.id === fieldId ? {...f, required} : f
                  ),
                }
                : tab
        )
    );
  };

  const handleUpdateScreen = async () => {
    setIsLoading(true);
    try {
      const payload = {
        screen: {
          screenID: Number(screen.id),
          name: formValues.name,
          description: formValues.description,
          tabs: screenTabs.map((tab) => ({
            id: tab.id,
            name: tab.name,
            fields: (tab.fields || []).map((f) => ({
              id: f.id,
              required: f.required,
            })),
          })),
        },
      };

      await axios.put(`/screens/${screen.id}`, payload);

      toast.success("Screen updated successfully!", { appearance: "success" });
      await fetchScreenDetails()
    } catch (error) {
      console.error("Error updating screen:", error);
      toast.success("Failed to update screen", {appearance: "error"});
    } finally {
      setIsLoading(false);
    }
  };

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
            <div className="font-semibold text-base">Update Screen</div>
          </div>
          <button
              className="bg-primary-pink px-8 py-2 rounded-md text-white"
              onClick={handleUpdateScreen}
              disabled={isLoading}
          >
            {isLoading ? "Updating..." : "Update"}
          </button>
        </div>

        <div className="mt-5 bg-white rounded-b-md p-4">
          <FormInput
              name="name"
              placeholder="Name"
              value={formValues.name}
              onChange={({target: {value}}) => handleFormChange("name", value)}
          />
          <FormTextArea
              name="description"
              placeholder="Description"
              value={formValues.description}
              onChange={({target: {value}}) =>
                  handleFormChange("description", value)
              }
          />
        </div>

        <div className="mt-6 bg-white rounded-md p-4">
          <div className="flex justify-between mb-3">
            <h6 className="font-semibold">Tabs</h6>
            <button
                className="flex items-center text-primary-pink"
                onClick={handleAddTab}
            >
              <PlusCircleIcon className="w-5 h-5 mr-1"/> Add Tab
            </button>
          </div>

          {screenTabs.map((tab) => (
              <div
                  key={tab.id}
                  className="border rounded-md mb-4 p-3 shadow-sm bg-gray-50"
              >
                <div className="flex justify-between items-center mb-2">
                  {editingTabName === tab.id ? (
                      <div className="flex items-center gap-2">
                        <input
                            value={newTabName}
                            onChange={(e) => setNewTabName(e.target.value)}
                            className="border rounded p-1 text-sm"
                        />
                        <CheckBadgeIcon
                            className="w-5 h-5 text-green-600 cursor-pointer"
                            onClick={() => handleRenameTab(tab.id)}
                        />
                        <XMarkIcon
                            className="w-5 h-5 text-red-500 cursor-pointer"
                            onClick={() => setEditingTabName(null)}
                        />
                      </div>
                  ) : (
                      <div className="font-semibold">{tab.name}</div>
                  )}
                  {tab.name !== "General" && (
                      <div className="flex items-center gap-2">
                        <PencilSquareIcon
                            className="w-5 h-5 text-blue-500 cursor-pointer"
                            onClick={() => {
                              setEditingTabName(tab.id);
                              setNewTabName(tab.name);
                            }}
                        />
                        <TrashIcon
                            className="w-5 h-5 text-red-600 cursor-pointer"
                            onClick={() => handleDeleteTab(tab.id)}
                        />
                      </div>
                  )}
                </div>

                <table className="w-full border-t border-gray-200 text-sm">
                  <thead>
                  <tr className="bg-gray-100">
                    <th className="text-left p-2">Field</th>
                    <th className="text-center p-2">Required</th>
                    <th className="text-right p-2">Actions</th>
                  </tr>
                  </thead>
                  <tbody>
                  {tab.fields.map((field) => (
                      <tr key={field.id} className="border-b">
                        <td className="p-2">{field.name}</td>
                        <td className="text-center">
                          <input
                              type="checkbox"
                              checked={field.required}
                              onChange={(e) =>
                                  handleRequiredChange(tab.id, field.id, e.target.checked)
                              }
                          />
                        </td>
                        <td className="text-right">
                          <TrashIcon
                              className="w-4 h-4 text-gray-500 cursor-pointer"
                              onClick={() => handleRemoveFieldFromTab(tab.id, field.id)}
                          />
                        </td>
                      </tr>
                  ))}
                  </tbody>
                </table>

                <div className="mt-2 flex items-center gap-2">
                  <FormSelect
                      name="addField"
                      options={customFields.map((f) => ({
                        label: f.name,
                        value: f.id,
                      }))}
                      onChange={({target: {value}}) =>
                          handleAddFieldToTab(tab.id, value, false)
                      }
                      placeholder="Add Field"
                      className={"w-52"}
                  />
                </div>
              </div>
          ))}
        </div>

        <button className="w-8 mt-4 ml-4" onClick={onClose}>
          <ArrowLongLeftIcon/>
        </button>
      </div>
  );
};

export default ScreenUpdate;

