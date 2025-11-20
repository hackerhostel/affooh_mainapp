import React from "react";
import MainPageLayout from "../../layouts/MainPageLayout";
import DashboardListPage from "../dashboard-page/dashboardListPage";
// import WebSocketComponent from "./WebSocketComponent.jsx";
import DashboardContentPage from "./dashboardContentPage.jsx";

const DashboardLayout = () => {
  return (
    <MainPageLayout
      title="Dashboard"
      leftColumn={<DashboardListPage />}
      rightColumn={<DashboardContentPage />}
      // rightColumn={<WebSocketComponent/>}
    />
  );
};

export default DashboardLayout;
