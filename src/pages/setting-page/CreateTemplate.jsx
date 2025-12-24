import React, { useState } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { toast } from 'react-toastify';
import { XMarkIcon } from "@heroicons/react/24/outline";
import { selectUser } from "../../state/slice/authSlice";

const CreateTemplate = ({ isOpen, onClose, onSuccess }) => {
  
  const user = useSelector(selectUser);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  const organizationID = user?.organization?.id;
  const userID = user?.id;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.success("Template name is required", { appearance: "error" });
      return;
    }

    setLoading(true);
    try {
      await axios.post("/templates", {
        name: name.trim(),
        description: description.trim(),
        organizationID: parseInt(organizationID),
        createdBy: parseInt(userID),
      });

      toast.success("Template created successfully", { appearance: "success" });
      onSuccess();
      onClose();
    } catch (error) {
      toast.success(error.response?.data?.error || "Failed to create template", { appearance: "error" });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 flex items-right justify-end bg-white bg-opacity-25 backdrop-blur-sm z-10">
        <div className="bg-white p-6 shadow-lg w-2/5 h-full overflow-y-auto">
          <div className="flex justify-between items-center mb-4">
            <p className="font-bold text-2xl">Create New Template</p>
            <button onClick={onClose} className="cursor-pointer" data-testid="close-template-popup">
              <XMarkIcon className="w-6 h-6 text-gray-500" />
            </button>
          </div>
          <form
            className="flex flex-col justify-between h-5/6 mt-10"
            onSubmit={handleSubmit}
          >
            <div className="space-y-6">
              {/* Name Field */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:border-primary-pink focus:ring-2 focus:ring-primary-pink"
                  placeholder="Enter template name"
                  required
                />
              </div>

              {/* Description Field */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:border-primary-pink focus:ring-2 focus:ring-primary-pink"
                  placeholder="Enter template description"
                  rows="4"
                />
              </div>
            </div>

            {/* Buttons */}
            <div className="flex justify-end gap-3 border-t border-gray-100 pt-4 mt-6">
              <button
                type="button"
                onClick={onClose}
                className="rounded-md border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-md bg-primary-pink px-4 py-2 text-white hover:bg-pink-600 disabled:opacity-50"
                disabled={loading}
              >
                {loading ? "Creating..." : "Create"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default CreateTemplate;



