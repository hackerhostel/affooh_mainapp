import React, { useState } from "react";
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

const User = () => {

    const [formValues, setFormValues] = useState({
        user: "",
        role: "",
        email: "",
        contact: ""
    });
    // User role options
    const roleOptions = getSelectOptions([
        { id: "Admin", name: "Admin" },
        { id: "Manager", name: "Manager" },
        { id: "Employee", name: "Employee" },
    ]);

    const scrums = getSelectOptions([
        { id: "scrum1", name: "scrum1" },
        { id: "scrum2", name: "scrum2" },
        { id: "scrum3", name: "scrum3" },
    ]);

  
    const [rows, setRows] = useState([
        {
            id: 1,
            user: {
                firstName: "John",
                lastName: "Doe",
                avatar: "",
            },
            role: "Admin",
            email: "john.doe@example.com",
            contact: "+1 202 555 0183",
        },
        {
            id: 2,
            user: {
                firstName: "Jane",
                lastName: "Smith",
                avatar: "",
            },
            role: "Manager",
            email: "jane.smith@example.com",
            contact: "+1 202 555 0105",
        },
    ]);

    const [editingRowId, setEditingRowId] = useState(null);
    const [openActionRowId, setOpenActionRowId] = useState(null);

   
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

    // Handlers
    const handleEdit = (id) => setEditingRowId(id);
    const handleDone = () => setEditingRowId(null);
    const handleDelete = (id) =>
        setRows((prev) => prev.filter((r) => r.id !== id));
    const toggleMenu = (id) =>
        setOpenActionRowId((prev) => (prev === id ? null : id));

    const handleEditChange = (id, name, value) => {
        setRows((prev) =>
            prev.map((r) =>
                r.id === id ? { ...r, [name]: value } : r
            )
        );
    };

    return (
        <div className="">
            <div className="">
                <p className="text-left text-2xl">User</p>

                <div className="flex items-center gap-4">
                    <div className="w-2/5">
                        <SearchBar className="" />
                    </div>

                    <div className="w-1/5">
                        <FormInput
                            type="text"
                            name="invite"
                            formValues={formValues}
                            onChange={({ target: { name, value } }) =>
                                handleFormChange(name, value)
                            }
                        />
                    </div>

                    <div className="w-1/5">
                        <FormSelect
                            name="role"
                            formValues={scrums}
                            options={scrums}
                           onChange={({ target: { name, value } }) =>
                                                        handleFormChange(name, value)
                                                    }
                        />
                    </div>

                    <div className="w-1/5">
                        <button className="bg-primary-pink px-8 py-3 rounded-md text-white">Invite</button>
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
                        {rows.map((row, index) => {
                            const isEditing = editingRowId === row.id;

                            return (
                                <tr key={row.id} className="border-b border-gray-200">
                                    {/* Row Number */}
                                    <td className="py-3 px-2">{index + 1}</td>

                                    {/* User */}
                                    <td className="py-3 px-2">
                                        {!isEditing ? (
                                            renderUserCell(row.user)
                                        ) : (
                                            <div className="flex gap-2">
                                                <FormInput
                                                    type="text"
                                                    name="name"
                                                    formValues={formValues}
                                                    onChange={({ target: { name, value } }) =>
                                                        handleFormChange(name, value)
                                                    }

                                                />

                                            </div>
                                        )}
                                    </td>

                                    {/* Role */}
                                    <td className="py-3 px-2 w-40">
                                        {!isEditing ? (
                                            row.role
                                        ) : (
                                            <FormSelect
                                                name="role"
                                                formValues={{ role: row.role }}
                                                options={roleOptions}
                                                onChange={(e) =>
                                                    handleEditChange(row.id, "role", e.target.value)
                                                }
                                            />
                                        )}
                                    </td>

                                    {/* Email */}
                                    <td className="py-3 px-2">
                                        {!isEditing ? (
                                            row.email
                                        ) : (
                                            <FormInput
                                                type="text"
                                                name="email"
                                                formValues={formValues}
                                                onChange={({ target: { name, value } }) =>
                                                    handleFormChange(name, value)
                                                }

                                            />
                                        )}
                                    </td>

                                    {/* Contact */}
                                    <td className="py-3 px-2">
                                        {!isEditing ? (
                                            row.contact
                                        ) : (
                                            <FormInput
                                                type="text"
                                                name="contact"
                                                formValues={formValues}
                                                onChange={({ target: { name, value } }) =>
                                                    handleFormChange(name, value)
                                                }
                                            />
                                        )}
                                    </td>

                                    {/* Actions */}
                                    <td className="py-3 px-2">
                                        {!isEditing ? (
                                            openActionRowId !== row.id ? (
                                                <EllipsisVerticalIcon
                                                    className="w-5 h-5 text-secondary-grey cursor-pointer"
                                                    onClick={() => toggleMenu(row.id)}
                                                />
                                            ) : (
                                                <div className="flex items-center gap-3">
                                                    <PencilIcon
                                                        className="w-5 h-5 text-text-color cursor-pointer"
                                                        onClick={() => handleEdit(row.id)}
                                                    />
                                                    <TrashIcon
                                                        className="w-5 h-5 text-text-color cursor-pointer"
                                                        onClick={() => handleDelete(row.id)}
                                                    />
                                                    <XMarkIcon
                                                        className="w-5 h-5 text-text-color cursor-pointer"
                                                        onClick={() => toggleMenu(null)}
                                                    />
                                                </div>
                                            )
                                        ) : (
                                            <div className="flex items-center gap-3">
                                                <CheckBadgeIcon
                                                    className="w-5 h-5 text-green-600 cursor-pointer"
                                                    onClick={handleDone}
                                                />
                                                <XMarkIcon
                                                    className="w-5 h-5 text-red-500 cursor-pointer"
                                                    onClick={() => setEditingRowId(null)}
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
        </div>
    );
};

export default User;
