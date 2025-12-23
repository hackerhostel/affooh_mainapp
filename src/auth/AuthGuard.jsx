import React, {useEffect, useState} from "react";
import {Route, useLocation} from "react-router-dom";
import {getCurrentUser, signInWithRedirect} from "aws-amplify/auth";
import LoadingPage from "../pages/LoadingPage.jsx";
import {setupAuthorizationHeader} from "../utils/apiUtils.js";

setupAuthorizationHeader();

const AuthGuard = ({ children, ...rest }) => {
  const location = useLocation();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        await getCurrentUser();
        setLoading(false);
      } catch (err) {
        await signInWithRedirect();
      }
    };

    checkAuth();
  }, [location.pathname]);

  if (loading) {
    return <LoadingPage/>;
  }

  return <Route {...rest} render={() => children}/>;
};

export default AuthGuard;