import React, {useState} from 'react';
import MainPageLayout from '../../layouts/MainPageLayout.jsx';
import SprintListPage from "./SprintListPage.jsx";
import SprintContentPage from "./SprintContentPage.jsx";
import CreateSprintPopup from '../../components/popupForms/createSprint.jsx';
import {useSelector} from "react-redux";
import {selectSelectedProject} from "../../state/slice/projectSlice.js";

const SprintLayout = () => {
  const [isOpen, setIsOpen] = useState(false);
  const selectedProject = useSelector(selectSelectedProject);
  
  const onAddNew = () => {
    setIsOpen(true)
  };

  const handleClose = () => {
    setIsOpen(false);
  }

  return (
      <>
        <MainPageLayout
            title={selectedProject?.projectType === 1 ? 'Sprints' : 'Kanban'}
            onAction={onAddNew}
            subText={selectedProject?.projectType === 1 ? 'Add New' : ''}
            leftColumn={<SprintListPage/>}
            rightColumn={<SprintContentPage/>}
        />
        <CreateSprintPopup handleClosePopup={handleClose} isOpen={isOpen}/>
      </>
  );
};

export default SprintLayout;
