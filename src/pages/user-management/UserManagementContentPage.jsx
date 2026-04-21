import React, { useState, useEffect } from "react";
import User from "./User";
import UserRoles from "./UserRoles";
import Teams from "./Teams";
import UserManagementProfilePage from "./UserManagementProfilePage";
import { useSelector, useDispatch } from "react-redux";
import { setClickedUser } from "../../state/slice/projectUsersSlice";

const UserManagementContentPage = ({ selectedDocument }) => {
  const [showProfile, setShowProfile] = useState(false);
  const dispatch = useDispatch();

  useEffect(() => {
    // Reset profile view when changing folders/tabs
    setShowProfile(false);
  }, [selectedDocument]);

  const handleUserClick = (user) => {
    dispatch(setClickedUser(user));
    setShowProfile(true);
  };

  const handleBackToUsers = () => {
    setShowProfile(false);
  };

  const renderContent = () => {
    const docName = selectedDocument?.name || "User";

    if (docName === "User") {
      if (showProfile) {
        return <UserManagementProfilePage onBack={handleBackToUsers} />;
      }
      return <User onUserClick={handleUserClick} />;
    }

    switch (docName) {
      case "User Roles":
        return <UserRoles />;
      case "Teams":
        return <Teams />;
      case "Competency Matrix":
        return <CompetencyMatrixContentPage />;
      case "Stakeholder Context":
        return <StakeholderContextContent />;
      case "Communication Register":
        return <CommunicationRegisterContent />;
      default:
        return (
          <div className="text-gray-600 text-center mt-10">
            <User onUserClick={handleUserClick} />
          </div>
        );
    }
  };

  return <div className={`p-6 bg-dashboard-bgc min-h-screen ${showProfile ? 'p-0' : 'p-6'}`}>{renderContent()}</div>;
};

export default UserManagementContentPage;
