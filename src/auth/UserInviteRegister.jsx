import React, {useEffect, useRef, useState} from 'react';
import {Link, useHistory, useLocation} from 'react-router-dom';
import {useDispatch} from "react-redux";
import useValidation from "../utils/use-validation.jsx";
import FormInput from "../components/FormInput.jsx";
import LoginImage from '../images/register.jpg';
import {RegisterSchema} from "../state/domains/authModels.js";
import {confirmSignIn} from "aws-amplify/auth";
import {doGetWhoAmI} from "../state/slice/authSlice.js";
import {fetchUserInvitedOrganization, registerInvitedUser} from "../state/slice/registerSlice.js";
import {useToasts} from "react-toast-notifications";

const RegisterForm = () => {
  const { addToast } = useToasts();
  const history = useHistory();
  const dispatch = useDispatch();
  const [registerDetails, setRegisterDetails] = useState({ username: '', organization: '', firstName: '', lastName: '', password: '', confirmPassword: '' });
  const [isValidationErrorsShown, setIsValidationErrorsShown] = useState(false);
  const [organization, setOrganization] = useState('');
  const formRef = useRef(null);
  const [formErrors] = useValidation(RegisterSchema, registerDetails);
  const location = useLocation();
  const email = location.state?.email;

  const handleFetchData = async () => {
    try {
      const inviteDetails = await dispatch(fetchUserInvitedOrganization(email)).unwrap();
      setOrganization(inviteDetails?.name || '')
    } catch (error) {
      console.error("Error:", error);
    }
  };

  useEffect(() => {
    if (email && email !== '') {
      handleFetchData()
    }
  }, [email]);

  useEffect(() => {
    setRegisterDetails({...registerDetails, username: email});
  }, []);

  const handleFormChange = (name, value) => {
    const newForm = { ...registerDetails, [name]: value };
    setRegisterDetails(newForm);
  };

  const register = async (event) => {
    event.preventDefault();
    if (formErrors) {
      setIsValidationErrorsShown(true);
      return;
    }

    if (registerDetails.password !== registerDetails.confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    setIsValidationErrorsShown(false);

    try {
      event.preventDefault();
      try {
        const { isSignedIn } = await confirmSignIn({
          challengeResponse: registerDetails.password,
          options: {}
        });

        if (isSignedIn) {
          addToast('Successfully signed in and set new password', {appearance: 'success', autoDismiss: true});
          dispatch(doGetWhoAmI());
          dispatch(registerInvitedUser(registerDetails))
          history.push('/dashboard');
        }
      } catch (error) {
        addToast('Error setting new password:', {appearance: 'error'});
      }
    } catch (e) {
      addToast(e.message, {appearance: 'error'});
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className='flex flex-col md:flex-row bg-white shadow-2xl rounded-2xl m-24'>
        {/* Left side */}
        <div className='flex flex-col pt-24 pl-28' style={{ width: '650px', height: '797px' }}>
          <div className='w-3/4'>
            <div>
              <h2 className="mb-3 text-4xl font-bold">Register</h2>
              <span className="font-light text-lg text-textColor">Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore</span>
            </div>
            <form className="mt-4 space-y-6" ref={formRef} onSubmit={register}>
              <div className="mb-6">
                <FormInput
                  type="text"
                  name="organization"
                  formValues={{organization: organization}}
                  placeholder="Organization"
                  disabled={true}
                  formErrors={formErrors}
                  showErrors={isValidationErrorsShown}
                />
              </div>
              <div className="mb-6 flex">
                <div className="mr-4 w-1/2">
                  <FormInput
                      type="text"
                      name="firstName"
                      formValues={registerDetails}
                      placeholder="First Name"
                      onChange={({target: {name, value}}) => handleFormChange(name, value)}
                      formErrors={formErrors}
                      showErrors={isValidationErrorsShown}
                  />
                </div>
                <div className="w-1/2">
                  <FormInput
                      type="text"
                      name="lastName"
                      formValues={registerDetails}
                      placeholder="Last Name"
                      onChange={({target: {name, value}}) => handleFormChange(name, value)}
                      formErrors={formErrors}
                      showErrors={isValidationErrorsShown}
                  />
                </div>
              </div>
              <div className="mb-6">
                <FormInput
                    type="text"
                    name="username"
                    formValues={registerDetails}
                    placeholder="Email"
                    onChange={({ target: { name, value } }) =>
                        handleFormChange(name, value)
                    }
                    formErrors={formErrors}
                    showErrors={isValidationErrorsShown}
                />
              </div>
              <div className="mb-6">
                <FormInput
                    type="password"
                    name="password"
                    formValues={registerDetails}
                    placeholder="Password"
                    onChange={({target: {name, value}}) => handleFormChange(name, value)}
                    formErrors={formErrors}
                    showErrors={isValidationErrorsShown}
                />
              </div>
              <div className="mb-6">
                <FormInput
                    type="password"
                    name="confirmPassword"
                    formValues={registerDetails}
                    placeholder="Confirm Password"
                    onChange={({target: {name, value}}) => handleFormChange(name, value)}
                    formErrors={formErrors}
                    showErrors={isValidationErrorsShown}
                />
              </div>
              <input
                type="submit"
                value="Sign In"
                className="btn-login"
              />
            </form>
            <div className="text-center mt-5 text-textColor">
              Already have an account?
              <Link
                  to={{
                    pathname: "/login",
                    state: {from: location}
                  }}
                  className="text-primary-pink"
              >
                Login
              </Link>
            </div>
          </div>
        </div>
        {/* Right side */}
        <div className="hidden md:block" style={{ width: '520px' }}>
          <img className='w-full h-full rounded-r-2xl object-cover' src={LoginImage} alt="Register" />
        </div>
      </div>
    </div>
  );
};

export default RegisterForm;
