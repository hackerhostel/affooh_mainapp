import React, { useRef, useState } from "react";
import { Link, useHistory } from "react-router-dom";
import { resetPassword } from "aws-amplify/auth";
import FormInput from "../components/FormInput.jsx";
import useValidation from "../utils/use-validation.jsx";
import { ForgotPasswordSchema } from "../state/domains/authModels.js";
import { toast } from "react-toastify";
import Spinner from '../components/Spinner.jsx';

const ForgotPassword = () => {
  const history = useHistory();
  const [forgotPasswordDetails, setForgotPasswordDetails] = useState({
    email: "",
  });
  const [isValidationErrorsShown, setIsValidationErrorsShown] = useState(false);
  const [loading, setLoading] = useState(false);
  const formRef = useRef(null);
  const [formErrors] = useValidation(
    ForgotPasswordSchema,
    forgotPasswordDetails
  );

  const handleFormChange = (name, value) => {
    const newForm = { ...forgotPasswordDetails, [name]: value };
    setForgotPasswordDetails(newForm);
  };

  const handleForgotPassword = async (event) => {
    event.preventDefault();
    if (formErrors) {
      setIsValidationErrorsShown(true);
      return;
    }

    setIsValidationErrorsShown(false);
    setLoading(true);

    try {
      // Using AWS Amplify Auth to send verification code
      await resetPassword({
        username: forgotPasswordDetails.email,
      });

      toast.success('Verification code has been sent to your email')
      // Redirect to OTP verification page with email and reset password flow indicator
      history.push("/otp-verification", {
        email: forgotPasswordDetails.email,
        isPasswordReset: true,
      });
    } catch (error) {
      toast.error(error.message)
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-[650px] bg-white text-center shadow-2xl rounded-2xl p-10 flex flex-col justify-center min-h-[500px]">
        <h3 className="text-4xl font-bold mb-3">Forgot Password</h3>
        <span className="block mt-2 text-lg text-text-color font-light">
          Enter your email to receive a verification code
        </span>
        <form
          className="mt-4 space-y-6"
          ref={formRef}
          onSubmit={handleForgotPassword}
        >
          <div className="mx-auto w-full max-w-md pt-4">
            <FormInput
              type="email"
              name="email"
              formValues={forgotPasswordDetails}
              placeholder="Email Address"
              onChange={({ target: { name, value } }) =>
                handleFormChange(name, value)
              }
              formErrors={formErrors}
              showErrors={isValidationErrorsShown}
            />
          </div>
          <button
            type="submit"
            className="btn-login flex justify-center items-center h-12 mx-auto w-full max-w-md"
            disabled={loading}
          >
            {loading ? <Spinner className="w-6 h-6 text-white animate-spin fill-white" /> : "Send Code"}
          </button>
        </form>
        <div className="text-center mt-5 text-text-color">
          <Link to="/login" className="text-primary-pink">
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
