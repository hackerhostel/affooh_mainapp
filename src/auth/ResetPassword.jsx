import React, { useState, useRef, useEffect } from "react";
import { confirmResetPassword } from "aws-amplify/auth";
import { useHistory, useLocation } from "react-router-dom";
import { useToasts } from "react-toast-notifications";
import FormInput from "../components/FormInput.jsx";
import useValidation from "../utils/use-validation.jsx";
import * as yup from "yup";

const ResetPasswordSchema = yup.object({
  newPassword: yup
    .string()
    .required("New password is required")
    .min(8, "Password must be at least 8 characters"),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref("newPassword"), null], "Passwords must match")
    .required("Confirm password is required"),
});

const ResetPassword = () => {
  const history = useHistory();
  const location = useLocation();
  const { addToast } = useToasts();
  const email = location.state?.email;
  const verificationCode = location.state?.code;
  const formRef = useRef(null);

  const [resetDetails, setResetDetails] = useState({
    newPassword: "",
    confirmPassword: "",
  });
  const [isValidationErrorsShown, setIsValidationErrorsShown] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formErrors] = useValidation(ResetPasswordSchema, resetDetails);

  useEffect(() => {
    // Redirect to forgot password if no email or verification code is provided
    if (!email || !verificationCode) {
      history.replace("/forgot-password");
    }
  }, [email, verificationCode, history]);

  const handleFormChange = (name, value) => {
    const newForm = { ...resetDetails, [name]: value };
    setResetDetails(newForm);
  };

  const handleResetPassword = async (event) => {
    event.preventDefault();

    if (formErrors) {
      setIsValidationErrorsShown(true);
      return;
    }

    setIsValidationErrorsShown(false);
    setLoading(true);

    try {
      // Using AWS Amplify Auth to reset password with verification code
      await confirmResetPassword({
        username: email,
        confirmationCode: verificationCode,
        newPassword: resetDetails.newPassword,
      });

      addToast("Password has been reset successfully", {
        appearance: "success",
        autoDismiss: true,
      });
      history.push("/login");
    } catch (error) {
      addToast(error.message, { appearance: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div
        className="bg-white text-center shadow-xl rounded-lg p-6"
        style={{ width: "650px" }}
      >
        <p className="text-4xl font-medium mt-10">Reset Password</p>
        <span className="block mt-4 text-gray-600">
          Enter your new password for <strong>{email}</strong>
        </span>

        <form
          className="mt-6 space-y-4"
          ref={formRef}
          onSubmit={handleResetPassword}
        >
          <div className="m-auto" style={{ width: "420px" }}>
            <FormInput
              type="password"
              name="newPassword"
              formValues={resetDetails}
              placeholder="New Password"
              onChange={({ target: { name, value } }) =>
                handleFormChange(name, value)
              }
              formErrors={formErrors}
              showErrors={isValidationErrorsShown}
            />
          </div>

          <div className="m-auto" style={{ width: "420px" }}>
            <FormInput
              type="password"
              name="confirmPassword"
              formValues={resetDetails}
              placeholder="Confirm New Password"
              onChange={({ target: { name, value } }) =>
                handleFormChange(name, value)
              }
              formErrors={formErrors}
              showErrors={isValidationErrorsShown}
            />
          </div>

          <div className="m-auto pt-4" style={{ width: "420px" }}>
            <button
              type="submit"
              className="btn-login w-full"
              disabled={loading}
            >
              {loading ? "Resetting..." : "Reset Password"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
