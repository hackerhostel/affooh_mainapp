import React, { useState } from "react";

const UserManagementListPage = ({ onDocumentSelect }) => {

  // Dummy document list
  const [documents, setDocuments] = useState([
    { id: 1, name: "User", classification: "Manage Organization Users" },
    { id: 2, name: "User Roles", classification: "Manage Organization User Roles" },
    // { id: 3, name: "Teams", classification: "Manage Organization Teams" }, 
  ]);

  const [activeDocId, setActiveDocId] = useState(1); // Track active document

  const getColorClass = () => {
    return "text-yellow-500";
  };

  const handleDocumentClick = (doc) => {
    setActiveDocId(doc.id); // Set active document
    if (onDocumentSelect) {
      onDocumentSelect(doc);
    }
  };

  return (
    <div className="h-[calc(100vh-250px)] overflow-y-auto flex flex-col gap-3 pl-5 pr-3 mt-6">
      {documents.length === 0 ? (
        <div className="text-center text-gray-600">No documents found</div>
      ) : (
        documents.map((doc, index) => (
          <div
            key={doc.id}
            onClick={() => handleDocumentClick(doc)}
            className={`relative flex justify-between items-center p-3 border rounded-md w-full gap-2 hover:bg-gray-100 cursor-pointer ${
              activeDocId === doc.id ? 'border-primary-pink' : 'border-gray-200'
            }`}
          >
            <div className="flex flex-col">
              <div className="font-medium text-gray-900">{doc.name}</div>
              <div className={`text-sm font-semibold ${getColorClass(doc.classification)}`}>
                {doc.classification}
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default UserManagementListPage;
