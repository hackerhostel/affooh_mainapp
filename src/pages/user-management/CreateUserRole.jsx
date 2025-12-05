import React, {useEffect, useState} from "react";
import {XMarkIcon} from "@heroicons/react/24/outline";
import {useDispatch, useSelector} from "react-redux";
import {useHistory} from "react-router-dom";
import {
    doCreateRole,
    doGetRoleTemplate,
    selectIsRoleSaving,
    selectIsTemplateLoading,
    selectRoleSaveError,
    selectTemplate
} from "../../state/slice/roleSlice.js";
import {toast} from "react-toastify";
import RolePermissionsEditor from "../../components/RolePermissionsEditor.jsx";

const CreateUserRole = ({isOpen, onClose}) => {
    const dispatch = useDispatch();
    const history = useHistory();

    const [roleName, setRoleName] = useState('');
    const [roleDescription, setRoleDescription] = useState('');
    const [rolePermissions, setRolePermissions] = useState(null);

    const template = useSelector(selectTemplate);
    const isTemplateLoading = useSelector(selectIsTemplateLoading);
    const isSaving = useSelector(selectIsRoleSaving);
    const saveError = useSelector(selectRoleSaveError);

    // Fetch template on mount
    useEffect(() => {
        dispatch(doGetRoleTemplate());
    }, [dispatch]);

    const handlePermissionsChange = (permissions) => {
        setRolePermissions(permissions);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!roleName.trim()) {
            toast.success('Role name is required')
            return;
        }

        console.log('handleSubmit - rolePermissions:', rolePermissions);

        if (!rolePermissions || !rolePermissions.modules || rolePermissions.modules.length === 0) {
            toast.error('Please select at least one module and configure permissions')
            return;
        }

        // Validate that permissions object exists and is not empty
        if (!rolePermissions.permissions || typeof rolePermissions.permissions !== 'object') {
            toast.error('Permissions data is not properly loaded. Please wait and try again.')
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

        console.log('Submitting roleData (correct structure):', JSON.stringify(roleData, null, 2));

        try {
            await dispatch(doCreateRole(roleData)).unwrap();
            toast.success('User role created successfully!')
            onClose()
        } catch (error) {
            console.error('Error creating role:', error);
            console.error('Error details:', error);
            toast.error('Failed to create user role')
        }
    };

    if (isTemplateLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-pink"></div>
            </div>
        );
    }

    return (
        <>
            {isOpen && (
                <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex justify-end z-[999]">
                    <div
                        className="fixed top-[370px] right-0 transform -translate-y-1/2 w-[797px] h-[740px] p-5 bg-white shadow-md z-[1000] rounded-l-lg overflow-y-auto"
                    >
                        <button
                            onClick={onClose}
                            className="absolute top-2.5 right-2.5 bg-transparent border-none text-[16px] cursor-pointer backdrop-blur-sm"
                        ><XMarkIcon className="w-6 h-6"/></button>
                        <div className="p-2 ">
                            {saveError && (
                                <div className="mx-6 mt-6 p-4 bg-red-50 border border-red-200 rounded-md">
                                    <p className="text-sm text-red-600">{saveError}</p>
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="p-6">
                                <div className="space-y-6">
                                    <div>
                                        <label htmlFor="roleName"
                                               className="block text-sm font-medium text-gray-700 mb-2">
                                            User Role Name *
                                        </label>
                                        <input
                                            type="text"
                                            id="roleName"
                                            value={roleName}
                                            onChange={(e) => setRoleName(e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-pink focus:border-transparent"
                                            placeholder="Enter role name"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="roleDescription"
                                               className="block text-sm font-medium text-gray-700 mb-2">
                                            Description
                                        </label>
                                        <textarea
                                            id="roleDescription"
                                            value={roleDescription}
                                            onChange={(e) => setRoleDescription(e.target.value)}
                                            rows={3}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-pink focus:border-transparent"
                                            placeholder="Enter role description"
                                        />
                                    </div>

                                    {/* Permissions Editor */}
                                    <div className="pt-6 border-t border-gray-200">
                                        <RolePermissionsEditor
                                            template={template}
                                            initialPermissions={{}}
                                            onChange={handlePermissionsChange}
                                        />
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex justify-end space-x-3 mt-8 pt-6 border-t border-gray-200">
                                    <button
                                        type="button"
                                        onClick={onClose}
                                        disabled={isSaving}
                                        className="px-6 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-pink disabled:opacity-50"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={!roleName.trim() || isSaving}
                                        className="px-6 py-2 text-sm font-medium text-white bg-primary-pink border border-transparent rounded-md hover:bg-secondary-pink focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-pink disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isSaving ? 'Creating...' : 'Create Role'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default CreateUserRole;
