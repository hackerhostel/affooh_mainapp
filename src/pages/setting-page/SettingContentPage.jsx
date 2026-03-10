import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useLocation, Route, Switch, Redirect } from "react-router-dom";
import CustomFieldPage from "./customField";
import Screens from "./screens";
import TaskTypes from "./taskTypes";
import UserRoles from "./userRoles";
import AddUserRole from "./AddUserRole";
import EditUserRole from "./EditUserRole";
import OAuthSettings from "./OAuthSettings.jsx";
import GitIntegration from "./GitIntegration.jsx";
import Templates from "./templates.jsx";
import { settingView, setSettingView } from "../../state/slice/settingSlice.js";

const SettingContentPage = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const selectedView = useSelector(settingView);

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const view = urlParams.get('view');
    if (view === 'userRoles') {
      dispatch(setSettingView('userRoles'));
    } else if (view === 'oauthSettings') {
      dispatch(setSettingView('oauthSettings'));
    } else if (view === 'gitIntegration') {
      dispatch(setSettingView('gitIntegration'));
    }
    
    // Sync selectedView based on path if needed
    if (location.pathname.includes('/user-roles')) {
      dispatch(setSettingView('userRoles'));
    }
  }, [location.search, location.pathname, dispatch]);

  return (
    <div className="h-full">
      {selectedView === "userRoles" && (
        <Switch>
          <Route path="/settings/user-roles/add">
            <AddUserRole />
          </Route>
          <Route path="/settings/user-roles/edit/:roleId">
            <EditUserRole />
          </Route>
          <Route path="/settings/user-roles">
            <UserRoles />
          </Route>
          {/* Default to UserRoles for /settings if selectedView is userRoles */}
          <Route path="/settings">
            <UserRoles />
          </Route>
        </Switch>
      )}

      {selectedView === "customFields" && <CustomFieldPage />}
      {selectedView === "screens" && <Screens />}
      {selectedView === "taskTypes" && <TaskTypes />}
      {selectedView === "notifications" && <div className="p-6 text-gray-500">Notifications page - Coming soon</div>}
      {selectedView === "oauthSettings" && <OAuthSettings />}
      {selectedView === "gitIntegration" && <GitIntegration />}
      {selectedView === "templates" && <Templates />}
    </div>
  );
};

export default SettingContentPage;


