import React, { useState } from "react";
import MainPageLayout from "../../layouts/MainPageLayout.jsx";
import UserManagementListPage from "./UserManagementListPage.jsx";
import UserManagementContentPage from './UserManagementContentPage.jsx'

const UserManagementLayout = () => {
  const [selectedFolderId, setSelectedFolderId] = useState(null);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [isOpen, setIsOpen] = useState(false);

  const onAddNew = () => {
    setIsOpen(true);
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  const handleDocumentSelect = (document) => {
    setSelectedDocument(document);
  };

  return (
    <MainPageLayout
      title="User Management"
      leftColumn={
        <UserManagementListPage
          selectedFolderId={selectedFolderId}
          onSelect={setSelectedFolderId}
          onDocumentSelect={handleDocumentSelect}
        />
      }
      rightColumn={<UserManagementContentPage selectedDocument={selectedDocument} />}
      onAction={onAddNew}
    />
  );
};

export default UserManagementLayout;
