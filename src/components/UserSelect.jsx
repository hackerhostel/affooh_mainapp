import React, { useEffect, useRef, useState } from "react";
import { ChevronDownIcon } from "@heroicons/react/24/solid/index.js";

const UserSelect = ({ name, value, onChange, users, label = '' }) => {
    const [search, setSearch] = useState("");
    const [isOpen, setIsOpen] = useState(false);
    const [selected, setSelected] = useState({});
    const ref = useRef(null);

    useEffect(() => {
        setSelected(users.find(u => u.id === value));
    }, [value, users]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (ref.current && !ref.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    // Handle filtering of users
    const filteredUsers = users.filter((user) => {
        const fullName = user.name || `${user.firstName} ${user.lastName}`;
        return fullName.toLowerCase().includes(search.toLowerCase());
    });

    const handleSelect = (user) => {
        setIsOpen(false);
        setSearch("");
        onChange({ target: { name, value: user.id } });
    };

    const avatarInitials = selected?.name
        ? selected.name.charAt(0).toUpperCase()
        : `${selected?.firstName?.charAt(0).toUpperCase()}${selected?.lastName?.charAt(0).toUpperCase()}`;

    return (
        <div className="relative w-full" ref={ref}>
            <label className="block text-sm font-medium text-gray-500">{label}</label>
            <div
                className="-mt-1 flex items-center space-x-2 bg-white border border-gray-300 rounded-lg p-2 cursor-pointer"
                onClick={() => setIsOpen(!isOpen)}
            >
                {selected?.id ? (
                    <div className={"flex gap-4 items-center"}>
                        <div
                            className="w-8 h-8 rounded-full bg-primary-pink flex items-center justify-center text-white text-lg font-semibold">
                            {avatarInitials || 'N/A'}
                        </div>
                        <span className="text-text-color">{selected?.name || `${selected?.firstName} ${selected?.lastName}`}</span>
                    </div>
                ) : (
                    <span className="flex-grow text-text-color h-7 flex items-center">Select an option</span>
                )}
                <ChevronDownIcon className="absolute right-3 h-5 w-5 text-gray-400 pointer-events-none" />
            </div>
            {isOpen && (
                <div className="absolute z-10 mt-2 w-full bg-white border border-gray-300 rounded-lg shadow-lg">
                    <input
                        type="text"
                        placeholder="Search..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full p-2 border-b border-gray-300 text-sm focus:outline-none"
                    />
                    <ul className="max-h-40 overflow-y-auto">
                        {filteredUsers.length > 0 ? (
                            filteredUsers.map((user) => (
                                <li
                                    key={user.id}
                                    className="flex items-center space-x-2 p-2 hover:bg-gray-100 cursor-pointer"
                                    onClick={() => handleSelect(user)}
                                >
                                    <div
                                        className="w-8 h-8 rounded-full bg-primary-pink flex items-center justify-center text-white font-semibold">
                                        {user?.name
                                            ? user.name.charAt(0).toUpperCase()
                                            : `${user.firstName.charAt(0).toUpperCase()}${user.lastName.charAt(0).toUpperCase()}`}
                                    </div>
                                    <span className="text-text-color">{user?.name || `${user.firstName} ${user.lastName}`}</span>
                                </li>
                            ))
                        ) : (
                            <li className="p-2 text-gray-500 text-sm">No results found</li>
                        )}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default UserSelect;
