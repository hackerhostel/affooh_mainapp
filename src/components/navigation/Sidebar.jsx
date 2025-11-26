import {Menu, Transition} from '@headlessui/react';
import {
    ArrowRightStartOnRectangleIcon,
    BanknotesIcon,
    BellIcon,
    BriefcaseIcon,
    ChatBubbleOvalLeftIcon,
    CogIcon,
    DocumentChartBarIcon,
    PresentationChartLineIcon,
    Squares2X2Icon,
    UserGroupIcon,
    UserIcon
} from '@heroicons/react/24/outline';
import {signOut} from 'aws-amplify/auth';
import {Link, useHistory, useLocation} from 'react-router-dom';
import {useSelector} from 'react-redux';
import {selectUser} from '../../state/slice/authSlice';
import React, {Fragment, useEffect, useRef, useState} from 'react';
import Notification from "./NotificationPopup.jsx";
import AffoohDots from "../../assets/dots.png";

function Sidebar() {
  const location = useLocation();
  const history = useHistory();
  const userDetails = useSelector(selectUser);
  const [loading, setLoading] = useState(false);
  const [isOpenPopUp, setIsOpenPopUp] = useState(false);
    const [isAppMenuOpen, setIsAppMenuOpen] = useState(false);
    const menuRef = useRef(null);
    const menuButtonRef = useRef(null);

    const handleSignOut = async () => {
    setLoading(true);
    try {
      await signOut({ global: true });
      window.location.reload();
    } finally {
      setLoading(false);
    }
  };

  const userProfile = () => {
    history.push('/profile')
  };

  const handleSettingsClick = () => {
    history.push('/settings')
  };

  const handleNotificationClick = () => {
    setIsOpenPopUp((prevState) => !prevState);
  };

  const closePopUp = () => {
    setIsOpenPopUp(false);
  }

  const MenuItem = ({ link, Icon }) => (
    <Link
      to={link}
      className={`w-12 h-12 ${
        location.pathname === link
          ? 'bg-primary-pink'
          : 'bg-gray-200 hover:bg-secondary-pink'
      } rounded-full flex items-center justify-center transition-colors duration-200`}
    >
      <Icon
        className={`w-6 h-6 ${
          location.pathname === link ? 'text-white' : 'text-gray-700'
        }`}
      />
    </Link>
  );

    useEffect(() => {
        function handleClickOutside(e) {
            if (
                menuRef.current &&
                !menuRef.current.contains(e.target) &&
                menuButtonRef.current &&
                !menuButtonRef.current.contains(e.target)
            ) {
                setIsAppMenuOpen(false);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);


    return (
        <div className="w-20 flex flex-col h-screen border-r border-gray-200 bg-white shadow-md">
            <div className="relative flex items-center justify-center px-2 py-4">
                <img
                    ref={menuButtonRef}
                    src={AffoohDots}
                    alt="Affooh Dots"
                    className="h-[2rem] object-contain cursor-pointer"
                    onClick={() => setIsAppMenuOpen(prev => !prev)}
                />
                {isAppMenuOpen && (
                    <div
                        ref={menuRef}
                        className="absolute left-20 top-16 w-80 bg-white rounded-lg shadow-xl border border-gray-100 py-3 z-50"
                    >
                        {[
                            {name: "Project Management", url: "#", icon: <PresentationChartLineIcon/>},
                            {name: "Compliance Management", url: "#", icon: <DocumentChartBarIcon/>},
                            {name: "Human Resource Management", url: "#", icon: <UserGroupIcon/>},
                            {name: "Finance Management", url: "#", icon: <BanknotesIcon/>},
                            {name: "Sales Management", url: "#", icon: <BriefcaseIcon/>}
                        ].map((item, index) => (
                            <button
                                key={index}
                                className="flex items-center w-full px-4 py-3 hover:bg-gray-50 transition"
                            >
                                <div
                                    className="w-10 h-10 rounded-full bg-primary-pink flex items-center justify-center text-white text-sm font-semibold">
                                    {React.cloneElement(item.icon, {className: "w-5 h-5"})}
                                </div>
                                <span className="ml-3 text-gray-700 font-medium">{item?.name}</span>
                            </button>
                        ))}
                    </div>
                )}
            </div>

            <div className="flex-grow flex flex-col items-center py-5 space-y-6">
                <MenuItem link="/dashboard" Icon={Squares2X2Icon}/>
                <MenuItem link="/user-management" Icon={UserIcon}/>
                <MenuItem link="/chat" Icon={ChatBubbleOvalLeftIcon}/>
            </div>


            <div className="flex flex-col items-center py-5 space-y-6">
                {!loading ? (
                    <Menu as="div" className="relative inline-block text-left z-20">
                        <Menu.Button
                            className="w-12 h-12 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-pink">
                            {userDetails.avatar ? (
                                <img
                                    src={userDetails.avatar}
                                    alt={`${userDetails.firstName} ${userDetails.lastName}`}
                                    className="w-10 h-10 rounded-full object-cover"
                                />
                            ) : (
                                <div
                                    className="w-10 h-10 rounded-full bg-primary-pink flex items-center justify-center text-white text-sm font-semibold">
                                    {userDetails.firstName?.[0]}
                                    {userDetails.lastName?.[0]}
                                </div>
                            )}
                        </Menu.Button>

                        <Transition
                            as={Fragment}
                            enter="transition ease-out duration-100"
                            enterFrom="transform opacity-0 scale-95"
                            enterTo="transform opacity-100 scale-100"
                            leave="transition ease-in duration-75"
                            leaveFrom="transform opacity-100 scale-100"
                            leaveTo="transform opacity-0 scale-95"
                        >
                            <Menu.Items
                                className="absolute bottom-14 left-14 w-64 bg-white divide-y divide-gray-100 rounded-lg shadow-xl ring-1 ring-black ring-opacity-5 focus:outline-none">

                                <div className="flex items-center gap-3 px-4 py-3">
                                    {userDetails.avatar ? (
                                        <img
                                            src={userDetails.avatar}
                                            className="w-10 h-10 rounded-full object-cover"
                                        />
                                    ) : (
                                        <div
                                            className="w-10 h-10 rounded-full bg-primary-pink flex items-center justify-center text-white text-sm font-semibold">
                                            {userDetails.firstName?.[0]}
                                            {userDetails.lastName?.[0]}
                                        </div>
                                    )}
                                    <div>
                                        <p className="text-sm font-medium">{userDetails.firstName} {userDetails.lastName}</p>
                                        <p className="text-xs text-gray-500">{userDetails.email}</p>
                                    </div>
                                </div>

                                <div className="py-1">
                                    <Menu.Item>
                                        {({active}) => (
                                            <button
                                                onClick={userProfile}
                                                className={`${active ? "bg-gray-100" : ""} flex w-full items-center px-4 py-2 text-sm`}
                                            >
                                                <UserIcon className="w-4 h-4 mr-3"/> My Profile
                                            </button>
                                        )}
                                    </Menu.Item>

                                    <Menu.Item>
                                        {({active}) => (
                                            <button
                                                onClick={handleSettingsClick}
                                                className={`${active ? "bg-gray-100" : ""} flex w-full items-center px-4 py-2 text-sm`}
                                            >
                                                <CogIcon className="w-4 h-4 mr-3"/> Settings
                                            </button>
                                        )}
                                    </Menu.Item>

                                    <Menu.Item>
                                        {({active}) => (
                                            <button
                                                onClick={handleNotificationClick}
                                                className={`${active ? "bg-gray-100" : ""} flex w-full items-center px-4 py-2 text-sm`}
                                            >
                                                <BellIcon className="w-4 h-4 mr-3"/> Notifications
                                            </button>
                                        )}
                                    </Menu.Item>

                                    <Menu.Item>
                                        {({active}) => (
                                            <button
                                                onClick={handleSignOut}
                                                className={`${active ? "bg-gray-100" : ""} flex w-full items-center px-4 py-2 text-sm`}
                                            >
                                                <ArrowRightStartOnRectangleIcon className="w-4 h-4 mr-3"/>
                                                Log Out
                                            </button>
                                        )}
                                    </Menu.Item>
                                </div>
                            </Menu.Items>
                        </Transition>
                    </Menu>
                ) : (
                    <div className="w-12 h-12 flex items-center justify-center">
                        <Spinner/>
                    </div>
                )}
            </div>
            <Notification isOpen={isOpenPopUp} onClose={closePopUp}/>
        </div>
    );
}

export default Sidebar;
