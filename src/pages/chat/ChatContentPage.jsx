import React, { useState } from "react";
import {
    UserPlusIcon
} from "@heroicons/react/24/outline";
import { Link, useHistory, useLocation } from 'react-router-dom';

const ChatContentPage = () => {


    const MenuItem = ({ link, Icon }) => (
        <Link
            to={link}
            className={`w-36 h-36 ${location.pathname === link
                ? 'bg-primary-pink'
                : 'bg-primary-pink hover:bg-secondary-pink'
                } rounded-full flex items-center justify-center transition-colors duration-200`}
        >
            <Icon
                className={`w-10 h-10 ${location.pathname === link ? 'text-white' : 'text-white'
                    }`}
            />
        </Link>
    );
    return (
        <div className="h-[calc(100vh-250px)] overflow-y-full flex flex-col gap-6 p-6 bg-dashboard-bgc">
            <div className="flex-col space-y-5">
                <div className="bg-white px-6 py-24 flex items-center justify-center gap-10">
                    <div className="flex flex-col items-center justify-center gap-4">
                        <MenuItem link="##" Icon={UserPlusIcon} />
                        <p className="text-center">Project Management</p>
                    </div>

                    <div className="flex flex-col items-center justify-center gap-4">
                        <MenuItem link="##" className="" Icon={UserPlusIcon} />
                        <p className="text-center">Compliance Management</p>
                    </div>

                    <div className="flex flex-col items-center justify-center gap-4">
                        <MenuItem link="##" className="" Icon={UserPlusIcon} />
                        <p className="text-center">Human resource Management</p>
                    </div>

                    <div className="flex flex-col items-center justify-center gap-4">
                        <MenuItem link="##" className="" Icon={UserPlusIcon} />
                        <p className="text-center">Finance Management</p>
                    </div>

                    <div className="flex flex-col items-center justify-center gap-4">
                        <MenuItem link="##" className="" Icon={UserPlusIcon} />
                        <p className="text-center">Sales Management</p>
                    </div>
                </div>

                <div className="bg-white px-60 py-24 flex items-center justify-start gap-10">
                    <div className="flex flex-col items-center justify-center gap-4">
                        <MenuItem link="##" Icon={UserPlusIcon} />
                        <p className="text-center">Scrum Master</p>
                    </div>

                    <div className="flex flex-col items-center justify-center gap-4">
                        <MenuItem link="##" className="" Icon={UserPlusIcon} />
                        <p className="text-center">Business Analysis</p>
                    </div>
                </div>
            </div>
        </div>



    );
};

export default ChatContentPage;
