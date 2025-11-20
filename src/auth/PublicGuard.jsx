import React, { useState, useEffect } from 'react';
import { Route, Redirect, useLocation } from 'react-router-dom';
import {getCurrentUser} from "aws-amplify/auth";
import LoadingPage from "../pages/LoadingPage.jsx";

const PublicGuard = ({ children, ...rest }) => {
  const pageLocation = useLocation();

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  const initializeCurrentAuthUser = async () => {
    try {
      const user = await getCurrentUser();
      if (user.username) {
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
      }
      setLoading(false);
    } catch (error) {
      setIsAuthenticated(false);
      setLoading(false);
    }
  };

  useEffect(() => {
    initializeCurrentAuthUser();
  }, [pageLocation]);

  if (loading) {
    return <LoadingPage />;
  }

  return (
    <Route
      {...rest}
      render={({ location }) =>
        !isAuthenticated ? (
          children
        ) : (
          <Redirect
            to={{
              pathname: '/dashboard',
              state: { from: location },
            }}
          />
        )
      }
    />
  );
};

export default PublicGuard;
