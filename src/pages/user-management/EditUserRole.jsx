import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory, useParams } from 'react-router-dom';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { useToasts } from 'react-toast-notifications';
import RolePermissionsEditor from '../../components/RolePermissionsEditor.jsx';
import {
  doGetRoleTemplate,
  doGetRoleById,
  doUpdateRole,
  clearSelectedRole,
  selectTemplate,
  selectIsTemplateLoading,
  selectSelectedRole,
  selectIsRoleLoading,
  selectIsRoleSaving,
  selectRoleSaveError,
} from '../../state/slice/roleSlice.js';

const EditUserRole = () => {
  const dispatch = useDispatch();
  const history = useHistory();
  const { roleId } = useParams();
  const { addToast } = useToasts();

  const [roleName, setRoleName] = useState('');
  const [roleDescription, setRoleDescription] = useState('');
  const [rolePermissions, setRolePermissions] = useState(null);

  const template = useSelector(selectTemplate);
  const isTemplateLoading = useSelector(selectIsTemplateLoading);
  const role = useSelector(selectSelectedRole);
  const isRoleLoading = useSelector(selectIsRoleLoading);
  const isSaving = useSelector(selectIsRoleSaving);
  const saveError = useSelector(selectRoleSaveError);

  // Fetch template and role on mount
  useEffect(() => {
    dispatch(doGetRoleTemplate());
    dispatch(doGetRoleById(roleId));

    return () => {
      dispatch(clearSelectedRole());
    };
  }, [dispatch, roleId]);

  // Update form when role data is loaded
  useEffect(() => {
    if (role) {
      setRoleName(role.name || '');
      setRoleDescription(role.description || '');
    }
  }, [role]);

  const handlePermissionsChange = (permissions) => {
    setRolePermissions(permissions);
  };

  const handleUpdate = async () => {
    if (!roleName.trim()) {
      addToast('Role name is required', { appearance: 'error' });
      return;
    }

    if (!rolePermissions || !rolePermissions.modules || rolePermissions.modules.length === 0) {
      addToast('Please select at least one module and configure permissions', { appearance: 'error' });
      return;
    }

    // Validate that permissions object exists and is not empty
    if (!rolePermissions.permissions || typeof rolePermissions.permissions !== 'object') {
      addToast('Permissions data is not properly loaded. Please wait and try again.', { appearance: 'error' });
      return;
    }

    // Backend expects permissions to be an object containing both modules and permissions
    const roleData = {
      name: roleName,
      description: roleDescription,
      permissions: {
        modules: rolePermissions.modules,
        permissions: rolePermissions.permissions || {},
      },
    };

    try {
      await dispatch(doUpdateRole({ roleId, roleData })).unwrap();
      addToast('User role updated successfully!', { appearance: 'success' });
      // Navigate back to user roles list on success
      history.push('/settings?view=userRoles');
    } catch (error) {
      console.error('Error updating role:', error);
      addToast(error || 'Failed to update user role', { appearance: 'error' });
    }
  };

  const handleCancel = () => {
    history.push('/settings?view=userRoles');
  };

  if (isTemplateLoading || isRoleLoading || !role) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-pink"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto py-8 px-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {/* Header */}
          <div className="flex justify-between items-center p-6 border-b border-gray-200">
            <h4 className="text-md font-semibold text-gray-900">Edit User Role</h4>
            <button
              onClick={handleCancel}
              className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>

          {/* Error Message */}
          {saveError && (
            <div className="mx-6 mt-6 p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{saveError}</p>
            </div>
          )}

          <div className="p-6">
            {/* User Role Details */}
            <div className="mb-8">
              <div className="flex justify-between items-center mb-6">
                <div>
                  {role.createdAt && (
                    <p className="text-sm text-gray-600">
                      Created: {new Date(role.createdAt).toLocaleDateString()}
                    </p>
                  )}
                  {role.createdBy && (
                    <p className="text-sm text-gray-600">Created By: {role.createdBy}</p>
                  )}
                </div>
                <button
                  onClick={handleUpdate}
                  disabled={isSaving}
                  className="px-6 py-2 bg-primary-pink text-white rounded-md hover:bg-secondary-pink transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSaving ? 'Updating...' : 'Update'}
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    User Role Name *
                  </label>
                  <input
                    type="text"
                    value={roleName}
                    onChange={(e) => setRoleName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-pink focus:border-transparent"
                    placeholder="Enter role name"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={roleDescription}
                    onChange={(e) => setRoleDescription(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-pink focus:border-transparent"
                    placeholder="Enter role description"
                  />
                </div>
              </div>
            </div>

            {/* Permissions Section */}
            <div className="mb-6 pt-6 border-t border-gray-200">
              <h5 className="text-lg font-medium text-gray-900 mb-6">Update Permissions</h5>
              <RolePermissionsEditor
                template={template}
                initialPermissions={role?.permissions || {}}
                onChange={handlePermissionsChange}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditUserRole;
