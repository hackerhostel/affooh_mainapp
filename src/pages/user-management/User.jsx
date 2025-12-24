import React, { useState, useEffect, useCallback, useRef } from "react";
import {
    PencilIcon,
    EllipsisVerticalIcon,
    XMarkIcon,
    TrashIcon,
    CheckBadgeIcon,
    PlusCircleIcon,
} from "@heroicons/react/24/outline";
import FormSelect from "../../components/FormSelect.jsx";
import { getSelectOptions } from "../../utils/commonUtils.js";
import SearchBar from "../../components/SearchBar.jsx";
import FormInput from "../../components/FormInput.jsx";
import { useDispatch, useSelector } from "react-redux";
import { selectOrganizationUsers, selectInitialDataLoading, selectInitialDataError, doGetOrganizationUsers } from "../../state/slice/appSlice.js";
import { sendInvitation } from "../../state/slice/registerSlice.js";
import { toast } from "react-toastify";
import axios from "axios";
import ConfirmationDialog from "../../components/ConfirmationDialog.jsx";

const User = () => {
    const dispatch = useDispatch();
    const organizationUsers = useSelector(selectOrganizationUsers);
    const isLoading = useSelector(selectInitialDataLoading);
    const hasError = useSelector(selectInitialDataError);

    const [formValues, setFormValues] = useState({
        inviteEmail: "",
        selectedRole: 1,
    });

    const [roles, setRoles] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [emailError, setEmailError] = useState("");
    const [isValidating, setIsValidating] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingRowId, setEditingRowId] = useState(null);
    const [openActionRowId, setOpenActionRowId] = useState(null);
    const debounceTimeoutRef = useRef(null);

    useEffect(() => {
        async function fetchRoles() {
            try {
                const response = await axios.get('/organizations/form-data');
                const rolesData = response?.data?.body;
                if (rolesData) {
                    setRoles(Object.values(rolesData).map(role => role));
                }
            } catch (error) {
                toast.error(error.message || 'Failed to fetch user roles');
            }
        }
        fetchRoles();
    }, []);

    useEffect(() => {
        if (organizationUsers && organizationUsers.length) {
            const sortedUsers = [...organizationUsers].sort((a, b) => {
                const nameA = `${a?.firstName || ''} ${a?.lastName || ''}`.trim().toLowerCase();
                const nameB = `${b?.firstName || ''} ${b?.lastName || ''}`.trim().toLowerCase();
                return nameA.localeCompare(nameB);
            });
            setFilteredUsers(sortedUsers);
        } else {
            setFilteredUsers([]);
        }
    }, [organizationUsers]);

    useEffect(() => {
        return () => {
            if (debounceTimeoutRef.current) {
                clearTimeout(debounceTimeoutRef.current);
            }
        };
    }, []);

    const validateEmail = useCallback(async (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setEmailError("Please enter a valid email address");
            return false;
        }
        setEmailError("");
        return true;
    }, []);

    const debouncedValidateEmail = useCallback((email) => {
        if (debounceTimeoutRef.current) {
            clearTimeout(debounceTimeoutRef.current);
        }

        debounceTimeoutRef.current = setTimeout(async () => {
            if (email.trim() === "") {
                setEmailError("");
                setIsValidating(false);
                return;
            }
            setIsValidating(true);
            await validateEmail(email);
            setIsValidating(false);
        }, 500);
    }, [validateEmail]);

    const handleEmailChange = (e) => {
        const email = e.target.value;
        setFormValues({ ...formValues, inviteEmail: email });
        
        if (email.trim() === "") {
            setEmailError("");
            setIsValidating(false);
            if (debounceTimeoutRef.current) {
                clearTimeout(debounceTimeoutRef.current);
            }
            return;
        }
        debouncedValidateEmail(email);
    };

    const handleInvite = async () => {
        if (!formValues.inviteEmail.trim()) {
            setEmailError("Email is required");
            toast.error("Please enter an email to invite.");
            return;
        }

        const isValidEmail = await validateEmail(formValues.inviteEmail);
        if (!isValidEmail) {
            toast.error("Please enter a valid email address.");
            return;
        }

        try {
            await dispatch(sendInvitation({
                email: formValues.inviteEmail.trim(),
                userRole: formValues.selectedRole
            })).unwrap();

            setFormValues({ inviteEmail: "", selectedRole: 1 });
            setEmailError("");
            toast.success("Invitation sent successfully!");
            dispatch(doGetOrganizationUsers());
        } catch (error) {
            toast.error(error.message || 'Failed to send invitation');
        }
    };

    const handleSearch = (term) => {
        setSearchTerm(term);
        if (term.trim() === '') {
            const sortedUsers = [...organizationUsers].sort((a, b) => {
                const nameA = `${a?.firstName || ''} ${a?.lastName || ''}`.trim().toLowerCase();
                const nameB = `${b?.firstName || ''} ${b?.lastName || ''}`.trim().toLowerCase();
                return nameA.localeCompare(nameB);
            });
            setFilteredUsers(sortedUsers);
        } else {
            const filtered = organizationUsers.filter(user => {
                const searchableText = `${user?.firstName || ''} ${user?.lastName || ''} ${user?.email || ''}`.toLowerCase();
                return searchableText.includes(term.toLowerCase());
            });
            const sortedFiltered = filtered.sort((a, b) => {
                const nameA = `${a?.firstName || ''} ${a?.lastName || ''}`.trim().toLowerCase();
                const nameB = `${b?.firstName || ''} ${b?.lastName || ''}`.trim().toLowerCase();
                return nameA.localeCompare(nameB);
            });
            setFilteredUsers(sortedFiltered);
        }
    };

    const handleDeleteClick = (user) => {
        setSelectedUser(user);
        setIsDialogOpen(true);
        setOpenActionRowId(null);
    };

    const handleConfirmDelete = async () => {
        if (selectedUser) {
            try {
                await axios.delete(`/users/${selectedUser.id}`);
                toast.success('User Successfully Deleted');
                dispatch(doGetOrganizationUsers());
            } catch (error) {
                toast.error('User delete request failed');
            }
        }
        setIsDialogOpen(false);
    };

    const handleEdit = (id) => setEditingRowId(id);
    const handleDone = () => setEditingRowId(null);
    const toggleMenu = (id) => setOpenActionRowId((prev) => (prev === id ? null : id));

    const renderUserCell = (user) => {
        if (!user)
            return <span className="text-gray-400 italic">No user</span>;

        return (
            <div className="flex items-center space-x-2">
                {user.avatar ? (
                    <img
                        src={user.avatar}
                        alt={`${user.firstName} ${user.lastName}`}
                        className="w-10 h-10 rounded-full object-cover"
                    />
                ) : (
                    <div className="w-10 h-10 rounded-full bg-primary-pink flex items-center justify-center text-white text-sm font-semibold">
                        {user.firstName?.[0]}
                        {user.lastName?.[0]}
                    </div>
                )}
                <span>
                    {user.firstName} {user.lastName}
                </span>
            </div>
        );
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="text-gray-600">Loading users...</div>
            </div>
        );
    }

    if (hasError) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="text-red-600">Failed to fetch users. Please try again.</div>
            </div>
        );
    }

    return (
        <div className="">
            <div className="">
                <p className="text-left text-2xl">User</p>

                <div className="flex items-center gap-4">
                    <div className="w-2/5">
                        <SearchBar onSearch={handleSearch} placeholder="Search users..." />
                    </div>

                    <div className="w-1/5">
                        <div className="relative">
                            <input
                                type="email"
                                value={formValues.inviteEmail}
                                onChange={handleEmailChange}
                                placeholder="Enter email address"
                                className={`w-full p-4 rounded-lg shadow-md border focus:outline-none focus:ring-2 ${
                                    emailError ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                                }`}
                            />
                            {emailError && (
                                <div className="text-red-500 text-sm mt-1">
                                    {emailError}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="w-1/5">
                        <select
                            value={formValues.selectedRole}
                            onChange={(e) => setFormValues({ ...formValues, selectedRole: e.target.value })}
                            className="w-full p-4 rounded-lg shadow-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            {roles?.map((r) => (
                                <option key={r.id} value={r.id}>{r.value}</option>
                            ))}
                        </select>
                    </div>

                    <div className="w-1/5">
                        <button 
                            onClick={handleInvite}
                            disabled={!formValues.inviteEmail.trim() || !!emailError || isValidating}
                            className={`w-full px-8 py-3 rounded-md text-white ${
                                !formValues.inviteEmail.trim() || !!emailError || isValidating
                                    ? 'bg-gray-400 cursor-not-allowed'
                                    : 'bg-primary-pink hover:bg-pink-600'
                            }`}
                        >
                            {isValidating ? 'Validating...' : 'Invite'}
                        </button>
                    </div>

                </div>

                {/* <div className="flex items-center gap-1 cursor-pointer">
          <PlusCircleIcon className="w-6 h-6 text-pink-500" />
          <span className="text-text-color">Add New</span>
        </div> */}
            </div>

            <div className="bg-white rounded p-2 mt-3">
                <table className="table-auto w-full border-collapse">
                    <thead>
                        <tr className="text-left border-b border-gray-200 text-secondary-grey">
                            <th className="py-3 px-2 text-center">#</th>
                            <th className="py-3 px-2 text-center">User</th>
                            <th className="py-3 px-2 text-center">Role</th>
                            <th className="py-3 px-2 text-center">Email</th>
                            <th className="py-3 px-2 text-center">Contact</th>
                            <th className="py-3 px-2">Actions</th>
                        </tr>
                    </thead>

                    <tbody>
                        {filteredUsers.map((user, index) => {
                            const isEditing = editingRowId === user.id;
                            const userRoleName = roles.find(r => r.id === user.userRole)?.value || 'N/A';

                            return (
                                <tr key={user.id} className="border-b border-gray-200">
                                    <td className="py-3 px-2">{index + 1}</td>

                                    <td className="py-3 px-2">
                                        {renderUserCell(user)}
                                    </td>

                                    <td className="py-3 px-2 w-40">
                                        {userRoleName}
                                    </td>

                                    <td className="py-3 px-2">
                                        {user.email}
                                    </td>

                                    <td className="py-3 px-2">
                                        {user.contactNumber || 'N/A'}
                                    </td>

                                    <td className="py-3 px-2">
                                        {openActionRowId !== user.id ? (
                                            <EllipsisVerticalIcon
                                                className="w-5 h-5 text-secondary-grey cursor-pointer"
                                                onClick={() => toggleMenu(user.id)}
                                            />
                                        ) : (
                                            <div className="flex items-center gap-3">
                                                <TrashIcon
                                                    className="w-5 h-5 text-text-color cursor-pointer"
                                                    onClick={() => handleDeleteClick(user)}
                                                />
                                                <XMarkIcon
                                                    className="w-5 h-5 text-text-color cursor-pointer"
                                                    onClick={() => toggleMenu(null)}
                                                />
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            <ConfirmationDialog
                isOpen={isDialogOpen}
                onClose={() => setIsDialogOpen(false)}
                onConfirm={handleConfirmDelete}
                message={selectedUser ? `To delete user - ${selectedUser.firstName} ${selectedUser.lastName}?` : ''}
            />
        </div>
    );
};

export default User;
