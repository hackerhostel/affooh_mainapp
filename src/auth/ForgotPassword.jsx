import React, { useRef, useState } from "react";
import { Link, useHistory } from "react-router-dom";
import { resetPassword } from "aws-amplify/auth";
import FormInput from "../components/FormInput.jsx";
import useValidation from "../utils/use-validation.jsx";
import { ForgotPasswordSchema } from "../state/domains/authModels.js";
import { toast } from "react-toastify";
import Spinner from "../components/Spinner.jsx";

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
      <div
        style={{ width: "650px", height: "450px" }}
        className="bg-white text-center shadow-2xl rounded-2xl p-10"
      >
        <p className="text-4xl font-bold mt-10">Forgot Password</p>
        <span className="block mt-6 text-text-color font-light">
          Enter your email to receive a verification code
        </span>
        <form
          className="mt-4 space-y-6"
          ref={formRef}
          onSubmit={handleForgotPassword}
        >
          <div className="m-auto pt-8" style={{ width: "420px" }}>
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
            style={{ width: "420px" }}
            className="btn-login flex items-center justify-center m-auto"
            disabled={loading}
          >
            {loading ? <Spinner className="w-5 h-5 text-white" /> : "Send Code"}
          </button>
        </form>
        <div className="text-center mt-8 text-text-color">
          <Link to="/auth" className="text-primary-pink">
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
