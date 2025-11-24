import {Redirect, Route, Switch} from "react-router-dom";
import Sidebar from "../components/navigation/Sidebar.jsx";
import Header from "../components/navigation/Header.jsx";
import {useDispatch, useSelector} from "react-redux";
import React, {useEffect} from "react";
import {doGetWhoAmI, selectInitialUserDataError, selectInitialUserDataLoading} from "../state/slice/authSlice.js";
import LoadingPage from "./LoadingPage.jsx";
import ServiceDownPage from "./ServiceDownPage.jsx";
import DashboardLayout from "./dashboard-page/index.jsx";
// import SettingLayout from "./setting-page/index.jsx";
import UserManagementLayout from "./user-management/index.jsx";
import ChatLayout from "./chat/index.jsx";
import {doGetProjectBreakdown, selectSelectedProject} from "../state/slice/projectSlice.js";
import {isNotEmptyObj} from "../utils/commonUtils.js";
import {doGetMasterData, selectInitialDataError, selectInitialDataLoading} from "../state/slice/appSlice.js";

const Dashboard = () => {
  const isInitialAppDataError = useSelector(selectInitialDataError);
  const isInitialAppDataLoading = useSelector(selectInitialDataLoading);
  const isInitialUserDataError = useSelector(selectInitialUserDataError);
  const isInitialUserDataLoading = useSelector(selectInitialUserDataLoading);
  const selectedProject = useSelector(selectSelectedProject);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(doGetWhoAmI())
    dispatch(doGetMasterData())
  }, []);

  useEffect(() => {
    if(isNotEmptyObj(selectedProject)) {
      dispatch(doGetProjectBreakdown())
    }
  }, [selectedProject])

  if (isInitialUserDataLoading || isInitialAppDataLoading) return <LoadingPage />;
  if (isInitialUserDataError || isInitialAppDataError) return <ServiceDownPage />;

  return (
    <div  className="flex h-screen">
      <Sidebar/>
      <div className="bg-white overflow-hidden flex flex-col w-full">
        <Header/>

        <main className="flex-1 relative overflow-y-auto focus:outline-none">
          <Switch>
            <Route path="/dashboard">
              <DashboardLayout />
            </Route>

            <Route path="/user-management">
              <UserManagementLayout />
            </Route>

            <Route path="/chat">
              <ChatLayout />
            </Route>

            {/*<Route path="/settings">*/}
            {/*  <SettingLayout/>*/}
            {/*</Route>*/}

            <Route exact path="/">
              <Redirect
                to={{
                  pathname: '/dashboard',
                }}
              />
            </Route>
          </Switch>
        </main>
      </div>
    </div>
  )
}

export default Dashboard;