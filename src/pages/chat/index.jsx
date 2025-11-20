import React, { useState } from "react";
import MainPageLayout from "../../layouts/MainPageLayout.jsx";
import ChatListPage from "./ChatListPage.jsx";
import ChatContentPage from './ChatContentPage.jsx'

const ChatLayout = () => {
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
      title="Chat"
      subText="Add new"
      leftColumn={
        <ChatListPage
          selectedFolderId={selectedFolderId}
          onSelect={setSelectedFolderId}
          onDocumentSelect={handleDocumentSelect}
        />
      }
      rightColumn={<ChatContentPage selectedDocument={selectedDocument} />}
      onAction={onAddNew}
    />
  );
};

export default ChatLayout;
