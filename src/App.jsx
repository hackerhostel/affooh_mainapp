import './App.css';
import { BrowserRouter, Route, Switch } from 'react-router-dom';

import AuthGuard from './auth/AuthGuard';
import ForgotPassword from './auth/ForgotPassword';
import ResetPassword from "./auth/ResetPassword";
import Login from './auth/Login';
import OTPVerification from './auth/OTPVerification';
import PublicGuard from './auth/PublicGuard';
import Register from './auth/Register';
import UserInviteRegister from './auth/UserInviteRegister';
import Dashboard from './pages/Dashboard';

function App() {
  return (
    <BrowserRouter>
      <Switch>
        <Route path="/login">
          <PublicGuard>
            <Login />
          </PublicGuard>
        </Route>

        <Route path="/register">
          <PublicGuard>
            <Register />
          </PublicGuard>
        </Route>

        <Route path="/inviteUserRegister">
          <PublicGuard>
            <UserInviteRegister />
          </PublicGuard>
        </Route>

        <Route path="/forgot-password">
          <PublicGuard>
            <ForgotPassword />
          </PublicGuard>
        </Route>

        <Route path="/reset-password">
          <PublicGuard>
            <ResetPassword />
          </PublicGuard>
        </Route>

        <Route path="/otp-verification">
          <PublicGuard>
            <OTPVerification />
          </PublicGuard>
        </Route>

        <AuthGuard>
          <Dashboard />
        </AuthGuard>
      </Switch>
    </BrowserRouter>
  );
}

export default App;
