import React, {useEffect, useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {useHistory} from 'react-router-dom';
import {PencilSquareIcon, PlusIcon, TrashIcon} from '@heroicons/react/24/outline';
import {toast} from "react-toastify";
import ConfirmationDialog from '../../components/ConfirmationDialog';
import {
    doDeleteRole,
    doGetRoles,
    selectIsRoleDeleting,
    selectIsRolesLoading,
    selectRoleDeleteError,
    selectRoles,
} from '../../state/slice/roleSlice';
import CreateUserRole from "./CreateUserRole.jsx";
import EditUserRole from "./EditUserRole.jsx";

const UserRoles = () => {
    const dispatch = useDispatch();

    const [isRoleCreateOpen, setIsRoleCreateOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [roleToDelete, setRoleToDelete] = useState(null);
    const [isRoleEditOpen, setIsRoleEditOpen] = useState(false);
    const [roleToEdit, setRoleToEdit] = useState(null);

    const roles = useSelector(selectRoles);
    const loading = useSelector(selectIsRolesLoading);
    const isDeleting = useSelector(selectIsRoleDeleting);
    const deleteError = useSelector(selectRoleDeleteError);

    useEffect(() => {
        dispatch(doGetRoles());
    }, [dispatch]);

    const handleEdit = (roleId) => {
        setRoleToEdit(roleId)
        setIsRoleEditOpen(true)
    };

    const handleDeleteClick = (role) => {
        setRoleToDelete(role);
        setDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (roleToDelete) {
            try {
                await dispatch(doDeleteRole(roleToDelete.id)).unwrap();
                toast.success('User role deleted successfully!')
                setDeleteDialogOpen(false);
                setRoleToDelete(null);
            } catch (error) {
                toast.error('Failed to delete user role!')
            }
        }
    };

    const handleDeleteCancel = () => {
        setDeleteDialogOpen(false);
        setRoleToDelete(null);
    };

    const handleEditCancel = () => {
        setRoleToEdit(null)
        setIsRoleEditOpen(false)
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-pink"></div>
            </div>
        );
    }

    return (
        <div>
            {/* Error Message */}
            {deleteError && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
                    <p className="text-sm text-red-600">{deleteError}</p>
                </div>
            )}

            <div className="flex justify-between items-center mb-6">
                <h4 className="text-lg font-semibold text-gray-900">User Roles</h4>
                <button
                    onClick={()=> setIsRoleCreateOpen(true)}
                    className="flex items-center px-4 py-2 bg-primary-pink text-white rounded-md hover:bg-pink-600 duration-200"
                >
                    <PlusIcon className="w-4 h-4 mr-2"/>
                    Add New
                </button>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg overflow-visible">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Role Name
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Description
                            </th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Action
                            </th>
                        </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                        {roles && roles.length > 0 ? (
                            roles.map((role) => (
                                <tr key={role.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        {role.name}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {role.description}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <div className="inline-flex items-center gap-3">
                                            <button
                                                onClick={() => handleEdit(role.id)}
                                                className="text-gray-500 hover:text-gray-700 focus:outline-none"
                                                aria-label="Edit role"
                                                title="Edit"
                                            >
                                                <PencilSquareIcon className="w-5 h-5"/>
                                            </button>
                                            <button
                                                onClick={() => handleDeleteClick(role)}
                                                disabled={isDeleting}
                                                className="text-red-500 hover:text-red-600 disabled:opacity-50 focus:outline-none"
                                                aria-label="Delete role"
                                                title={isDeleting ? 'Deleting...' : 'Delete'}
                                            >
                                                <TrashIcon className="w-5 h-5"/>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="3" className="px-6 py-12 text-center text-sm text-gray-500">
                                    No user roles found. Click "Add New" to create your first role.
                                </td>
                            </tr>
                        )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Delete Confirmation Dialog */}
            <ConfirmationDialog
                isOpen={deleteDialogOpen}
                onClose={handleDeleteCancel}
                onConfirm={handleDeleteConfirm}
                title="Delete User Role?"
                message={`Are you sure you want to delete "${roleToDelete?.name}"? This action cannot be undone.`}
            />
            <CreateUserRole isOpen={isRoleCreateOpen} onClose={() => setIsRoleCreateOpen(false)}/>
            <EditUserRole isOpen={isRoleEditOpen} onClose={handleEditCancel} roleId={roleToEdit}/>
        </div>
    );
};

export default UserRoles;