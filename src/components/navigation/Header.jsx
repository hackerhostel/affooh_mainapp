import React, {Fragment, useCallback, useState} from "react";
import {Menu, Transition} from "@headlessui/react";
import {useDispatch, useSelector} from "react-redux";
import {BellIcon} from "@heroicons/react/24/outline";
import FormSelect from "../FormSelect.jsx";
import {doSwitchProject, selectProjectList, selectSelectedProject} from "../../state/slice/projectSlice.js";
import {signOut} from 'aws-amplify/auth';
import {selectUser} from "../../state/slice/authSlice.js";
import Notification from "./NotificationPopup.jsx"
import HeaderTaskCreateComponent from "../task/create/HeaderTaskCreateComponent.jsx";

const Header = () => {
  const dispatch = useDispatch();
  const selectedProject = useSelector(selectSelectedProject);
  const projectList = useSelector(selectProjectList);
  const userDetails = useSelector(selectUser);
  const [loading, setLoading] = useState(false);
  const [isOpenPopUp, setIsOpenPopUp] = useState(false);
  const [newHeaderTaskModalOpen, setNewHeaderTaskModalOpen] = useState(false);

  const handleChange = (e, value) => {
    dispatch(doSwitchProject(Number(value)));
  };

  const getInitials = (name) => {
    if (!name) return "";
    const nameParts = name.split(" ");
    const initials = nameParts.map((part) => part.charAt(0).toUpperCase()).join("");
    return initials;
  };


  const getProjectOptions = useCallback(() => {
    return projectList.map((project) => ({
      value: project.id,
      label: project.name,
    }));
  }, [projectList]);

  const openPopUp = () =>{
    setIsOpenPopUp((prevState) => !prevState);
  }

  const closePopUp = () => {
    setIsOpenPopUp(false);
  }

  const closeHeaderCreateTaskModal = () => setNewHeaderTaskModalOpen(false)

  return (
    <div className="flex justify-between h-16 w-full">
      {/* Left Section */}
      <div className="py-3 px-4 w-72">
        <FormSelect
          name="project"
          showLabel={false}
          formValues={{ project: selectedProject?.id }}
          placeholder="Select a project"
          options={getProjectOptions()}
          onChange={handleChange}
        />
      </div>

      {/* Right Section */}
      <div className="flex items-center mr-6 space-x-3">
        <div>
          <button
              className="w-24 h-10 text-white rounded-lg border border-primary-pink bg-primary-pink cursor-pointer disabled:cursor-not-allowed disabled:text-gray-300 disabled:border-gray-300"
              onClick={() => setNewHeaderTaskModalOpen(true)}>
            New Task
          </button>
        </div>
        <div>
          <BellIcon onClick={openPopUp} className="w-7 h-7 m-3 cursor-pointer"/>
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
      <HeaderTaskCreateComponent isOpen={newHeaderTaskModalOpen} onClose={closeHeaderCreateTaskModal}/>
    </div>
  );
};

export default Header;
