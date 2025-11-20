import React from "react";
import { useSelector } from "react-redux";
import CustomFieldPage from "./customField";
import Screens from "./screens";
import TaskTypes from "./taskTypes";

const SettingContentPage = () => {
  const selectedView = useSelector((state) => state.setting.selectedView);

  return (
    <div>
      {selectedView === "customFields" && <CustomFieldPage />}
      {selectedView === "screens" && <Screens />}
      {selectedView === "taskTypes" && <TaskTypes />}
    </div>
  );
};

export default SettingContentPage;
