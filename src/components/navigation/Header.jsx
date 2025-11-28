import React, {useState} from "react";
import {useSelector} from "react-redux";
import {BellIcon} from "@heroicons/react/24/outline";
import {selectUser} from "../../state/slice/authSlice.js";
import Notification from "./NotificationPopup.jsx"
import AffoohLogo from "../../assets/affooh_logo.png";

const Header = () => {
  const userDetails = useSelector(selectUser);
  const [isOpenPopUp, setIsOpenPopUp] = useState(false);

  const getInitials = (name) => {
    if (!name) return "";
    const nameParts = name.split(" ");
    const initials = nameParts.map((part) => part.charAt(0).toUpperCase()).join("");
    return initials;
  };

  const openPopUp = () =>{
    setIsOpenPopUp((prevState) => !prevState);
  }

  const closePopUp = () => {
    setIsOpenPopUp(false);
  }

  return (
    <div className="flex justify-between h-16 w-full">
      {/* Left Section */}
      <div className="py-3 px-4 w-72">
        <img
            src={AffoohLogo}
            alt="Affooh Logo"
            className="h-[2.5rem] object-contain"
        />
      </div>

      {/* Right Section */}
      <div className="flex items-center mr-6 space-x-3">
        <div>
          <BellIcon onClick={openPopUp} className="w-7 h-7 cursor-pointer"/>
        </div>

        <div className="z-50">
          <Notification isOpen={isOpenPopUp} onClose={closePopUp}/>
        </div>

        {/* Divider */}
        <div className="border-l border-gray-300 h-8"></div>

        {/* User Avatar and Menu */}
        <div className="h-20 flex items-center justify-center px-2 py-4">
          <div
              className="w-12 h-12 rounded-full bg-primary-pink flex items-center justify-center text-white text-lg font-semibold mb-1">
            {userDetails?.organization ? (getInitials(userDetails?.organization?.name)) : "Affooh"}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;
