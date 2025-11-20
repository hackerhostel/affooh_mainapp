import React from "react";
import User from "./User";
import UserRoles from "./UserRoles";
import Teams from "./Teams";


const UserManagementContentPage = ({ selectedDocument }) => {
  const renderContent = () => {
    if (!selectedDocument) {
      return (
        <div className="text-gray-600 text-center mt-10">
          <User />
        </div>
      );
    }

    switch (selectedDocument.name) {
      case "User":
        return <User />;
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
            <User />
          </div>
        );
    }
  };

  return <div className="p-6 bg-dashboard-bgc min-h-screen">{renderContent()}</div>;
};

export default UserManagementContentPage;
