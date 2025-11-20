import React, { useState, useEffect, useRef } from "react";
import { doVerifyOTP } from "../state/slice/registerSlice.js";
import { useDispatch } from "react-redux";
import { useToasts } from "react-toast-notifications";
import { useHistory, useLocation } from "react-router-dom";
import { resetPassword } from "aws-amplify/auth";

const OTPVerification = () => {
  const history = useHistory();
  const { addToast } = useToasts();
  const dispatch = useDispatch();
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [timer, setTimer] = useState(60);
  const [isResendActive, setIsResendActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const inputRefs = [
    useRef(),
    useRef(),
    useRef(),
    useRef(),
    useRef(),
    useRef(),
  ];
  const timerRef = useRef(null);
  const location = useLocation();
  const email = location.state?.email;
  const isPasswordReset = location.state?.isPasswordReset;

  useEffect(() => {
    // Redirect to appropriate page if email is missing
    if (!email) {
      if (isPasswordReset) {
        history.replace("/forgot-password");
      } else {
        history.replace("/register");
      }
      return;
    }

    startTimer();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const startTimer = () => {
    setIsResendActive(false);
    setTimer(60);
    if (timerRef.current) clearInterval(timerRef.current);

    timerRef.current = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          setIsResendActive(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleInput = (index, value) => {
    // Allow only numbers
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs[index + 1].current.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    // Handle backspace
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs[index - 1].current.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").slice(0, 6).split("");
    if (pastedData.every((char) => /^\d$/.test(char))) {
      const newOtp = pastedData.concat(Array(6 - pastedData.length).fill(""));
      setOtp(newOtp);

      // Focus on the next empty input or the last one if all filled
      const nextEmptyIndex = newOtp.findIndex((digit) => digit === "");
      const focusIndex = nextEmptyIndex === -1 ? 5 : nextEmptyIndex;
      inputRefs[focusIndex].current.focus();
    }
  };

  const handleContinue = async () => {
    if (otp.some((digit) => digit === "")) {
      addToast("Please enter the complete verification code", {
        appearance: "error",
      });
      return;
    }

    setLoading(true);
    const otpCode = otp.join("");

    try {
      if (isPasswordReset) {
        // For password reset flow - redirect to reset password page
        history.push("/reset-password", {
          email: email,
          code: otpCode,
        });
        addToast("Verification successful", { appearance: "success" });
      } else {
        // For registration flow - verify OTP and redirect to login
        await dispatch(
          doVerifyOTP({
            username: email,
            otp: otpCode,
          })
        );

        history.push("/login");
        addToast("Account verification successful. Please login.", {
          appearance: "success",
        });
      }
    } catch (error) {
      addToast(error.message || "Verification failed. Please try again.", {
        appearance: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (isResendActive) {
      try {
        setLoading(true);

        if (isPasswordReset) {
          // Resend password reset code
          await resetPassword({
            username: email,
          });
        } else {
          // For registration flow - implement your resend OTP logic here
          // This will depend on your backend implementation
          // You may need to add a resend endpoint to your API

          // This is a placeholder - replace with your actual implementation
          await dispatch(
            // Replace with your resend OTP action
            doVerifyOTP({ username: email, resend: true })
          );
        }

        addToast("New verification code has been sent", {
          appearance: "success",
        });
        startTimer();
      } catch (error) {
        addToast(
          "Failed to resend code: " + (error.message || "Unknown error"),
          {
            appearance: "error",
          }
        );
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full mx-auto">
        <h4 className="text-2xl font-semibold text-center text-gray-800 mb-4">
          OTP Verification
        </h4>

        <p className="text-center text-gray-600 mb-2">
          Enter the OTP sent to your email address
        </p>
        <p className="text-center text-gray-600 mb-2">
          <strong>{email}</strong>
        </p>

        <p className="text-center text-gray-600 mb-4">
          {isPasswordReset
            ? "To reset your password"
            : "To complete your registration"}
        </p>

        <p className="text-center text-pink-500 mb-6">
          {String(Math.floor(timer / 60)).padStart(2, "0")}:
          {String(timer % 60).padStart(2, "0")} sec
        </p>

        <div className="flex justify-center gap-4 mb-6">
          {otp.map((digit, index) => (
            <input
              key={index}
              ref={inputRefs[index]}
              type="text"
              maxLength={1}
              value={digit}
              onChange={(e) => handleInput(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              onPaste={index === 0 ? handlePaste : undefined}
              className="w-12 h-12 border-2 rounded-lg text-center text-xl font-semibold
                            focus:border-pink-500 focus:outline-none transition-colors"
            />
          ))}
        </div>

        <button
          onClick={handleContinue}
          disabled={loading}
          className="w-full bg-pink-500 text-white py-3 rounded-lg hover:bg-pink-600
                    transition-colors mb-4 font-medium disabled:bg-pink-300"
        >
          {loading ? "Verifying..." : "Continue"}
        </button>

        <p className="text-center text-gray-600">
          OTP Not Received?{" "}
          <button
            onClick={handleResend}
            disabled={!isResendActive || loading}
            className={`${
              isResendActive && !loading
                ? "text-pink-500 hover:text-pink-600"
                : "text-gray-400 cursor-not-allowed"
            } font-medium`}
          >
            Resend
          </button>
        </p>
      </div>
    </div>
  );
};

export default OTPVerification;
