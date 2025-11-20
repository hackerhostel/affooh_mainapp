import React, { useState } from "react";
import { XMarkIcon } from '@heroicons/react/24/outline';




const NotificationPopup = ({ isOpen, onClose }) => {
    if (!isOpen) return null;
    const [tab, setTab] = useState("all");
    const notifications = [
        {
            id: 1,
            name: "Nilanga Pathirana",
            message: "has updated the Dashboard Research",
            time: "15 min ago",
            status: "unread",
            avatar: "https://via.placeholder.com/40", // Replace with actual avatar URL
        },
        {
            id: 2,
            name: "Anne Caroline",
            message: "has Changed Landing Page Structure",
            time: "1 day ago",
            status: "read",
            avatar: "https://via.placeholder.com/40", // Replace with actual avatar URL
        },
    ];

    const filteredNotifications =
        tab === "unread"
            ? notifications.filter((notif) => notif.status === "unread")
            : notifications;

    return (
        <div className="absolute top-14 right-4 bg-white shadow-lg rounded-lg w-96 border">
            <div className="p-4 border-b">

                <div className="flex items-center justify-between">
                    <div className="flex space-x-3 items-center">
                        <span className="font-semibold text-secondary-grey text-lg">Notifications</span>
                        <span className=" bg-count-notification border-solid text-xs text-secondary-grey w-9 h-4 rounded-full">
                            <span className="p-3 ">
                                {notifications.length < 10 ? `0${notifications.length}` : notifications.length}
                            </span>

                        </span>
                    </div>

                    <div className="flex items-center">
                        <div className="flex space-x-2">
                            <button
                                className={`w-10 h-4  rounded-full text-xs ${tab === "all"
                                    ? "bg-black text-white"
                                    : "bg-gray-100 text-gray-600"
                                    }`}
                                onClick={() => setTab("all")}
                            >
                                All
                            </button>
                            <button
                                className={`w-14 h-4 rounded-full text-xs ${tab === "unread"
                                    ? "bg-black text-white"
                                    : "bg-gray-100 text-secondary-grey"
                                    }`}
                                onClick={() => setTab("unread")}
                            >
                                Unread
                            </button>
                        </div>
                        <XMarkIcon onClick={onClose} className="w-4" />
                    </div>



                </div>


            </div>
            <div className="p-4 max-h-72 overflow-y-auto">
                {filteredNotifications.map((notif) => (
                    <div
                        key={notif.id}
                        className="flex items-start space-x-3 py-2 border-b last:border-b-0"
                    >
                        <img
                            src={notif.avatar}
                            alt={notif.name}
                            className="w-10 h-10 rounded-full"
                        />
                        <div className="flex-1">
                            <p className="text-xs text-secondary-grey">
                                {notif.name} {notif.message}
                            </p>
                            <span className="text-xs text-gray-500">{notif.time}</span>
                        </div>
                        {notif.status === "unread" && (
                            <span className="text-xs text-secondary-grey mt-10 font-medium">Unread</span>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default NotificationPopup;
