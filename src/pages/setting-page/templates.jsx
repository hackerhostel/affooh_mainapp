import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import CreateTemplate from "./CreateTemplate";
import TemplateUpdate from "./TemplateUpdate";
import { toast } from 'react-toastify';
import ConfirmationDialog from "../../components/ConfirmationDialog";
import { selectUser } from "../../state/slice/authSlice";
import { PencilSquareIcon, TrashIcon } from "@heroicons/react/24/outline";
import useFetchTemplates from "../../hooks/custom-hooks/template/useFetchTemplates";

const Templates = () => {
  
  const user = useSelector(selectUser);
  const [templates, setTemplates] = useState([]);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [showUpdateComponent, setShowUpdateComponent] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [templateToDelete, setTemplateToDelete] = useState(null);
  
  // Use custom hook for template fetch operations
  const { 
    fetchTemplates: apiFetchTemplates, 
    loadingTemplates: loading 
  } = useFetchTemplates();

  const organizationID = user?.organization?.id;

  // Fetch all templates
  const fetchTemplates = async () => {
    if (!organizationID) return;
    
    const result = await apiFetchTemplates(organizationID);
    if (result) {
      setTemplates(result);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  // Handle delete template
  const handleDelete = async () => {
    if (!templateToDelete) return;

    try {
      await axios.delete(`/templates/${templateToDelete.id}`);
      toast.success("Template deleted successfully", { appearance: "success" });
      fetchTemplates();
    } catch (error) {
      toast.success("Failed to delete template", { appearance: "error" });
    } finally {
      setDeleteConfirmOpen(false);
      setTemplateToDelete(null);
    }
  };

  // Handle edit template
  const handleEdit = (template) => {
    setEditingTemplate(template);
    setShowUpdateComponent(true);
  };

  const openDeleteConfirm = (template) => {
    setTemplateToDelete(template);
    setDeleteConfirmOpen(true);
  };

  return (
    <div className="p-3 bg-dashboard-bgc h-full">
      {!showUpdateComponent ? (
        <>
          {/* Header */}
          <div className="mb-6 flex items-center justify-between">
            <h4 className="text-2xl font-semibold">Templates</h4>
            <button
              onClick={() => setIsCreateOpen(true)}
              className="rounded-md bg-primary-pink px-4 py-2 text-white hover:bg-pink-600"
            >
              Add New Template
            </button>
          </div>

          {/* Templates Table */}
          {loading ? (
            <div className="py-8 text-center">Loading templates...</div>
          ) : templates.length === 0 ? (
            <div className="py-8 text-center text-gray-500">
              No templates found. Create your first template!
            </div>
          ) : (
            <div className="overflow-hidden rounded-lg bg-white shadow">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Description
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Task Count
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Created By
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {templates.map((template) => (
                    <tr key={template.id} className="hover:bg-gray-50">
                      <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                        {template.name}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {template.description || "-"}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                        {template.taskCount || 0}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                        {template.creatorName || "-"}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleEdit(template)}
                            className="rounded p-1 transition hover:bg-gray-100"
                            title="Edit"
                          >
                            <PencilSquareIcon className="h-5 w-5 text-blue-600 hover:text-blue-800" />
                          </button>
                          <button
                            onClick={() => openDeleteConfirm(template)}
                            className="rounded p-1 transition hover:bg-gray-100"
                            title="Delete"
                          >
                            <TrashIcon className="h-5 w-5 text-red-600 hover:text-red-800" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Create Template Modal */}
          {isCreateOpen && (
            <CreateTemplate
              isOpen={isCreateOpen}
              onClose={() => setIsCreateOpen(false)}
              onSuccess={fetchTemplates}
            />
          )}
          {/* Delete Confirmation */}
          {deleteConfirmOpen && (
            <ConfirmationDialog
              isOpen={deleteConfirmOpen}
              onClose={() => {
                setDeleteConfirmOpen(false);
                setTemplateToDelete(null);
              }}
              onConfirm={handleDelete}
              title="Delete Template"
              message={`Are you sure you want to delete the template "${templateToDelete?.name}"? This action cannot be undone.`}
            />
          )}
        </>
      ) : (
        <TemplateUpdate
          templateId={editingTemplate?.id}
          onClose={() => {
            setShowUpdateComponent(false);
            setEditingTemplate(null);
            fetchTemplates();
          }}
          onSuccess={() => {
            fetchTemplates();
          }}
        />
      )}
    </div>
  );
};

export default Templates;



