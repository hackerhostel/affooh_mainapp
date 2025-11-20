import ReleaseListPage from "./ReleaseListPage.jsx";
import ReleaseContentPage from "./ReleaseContentPage.jsx";
import ReleaseCreate from "./ReleaseCreate.jsx";
import {useState} from "react";
import MainPageLayout from "../../layouts/MainPageLayout.jsx";
import ReleaseEdit from "./ReleaseEdit.jsx";

const ReleaseLayout = () => {
  const [isOpen, setIsOpen] = useState(false);

  const onAddNew = () => {
    setIsOpen(true);
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  return (
      <MainPageLayout
          title={"Releases"}
          onAction={onAddNew}
          subText={"Add New"}
          leftColumn={<ReleaseListPage/>}
          rightColumn={
            <div className={"bg-dashboard-bgc"}>
              <ReleaseContentPage />
              <ReleaseCreate onClose={handleClose} isOpen={isOpen}/>
            </div>
          }
      />
  );
};

export default ReleaseLayout;
