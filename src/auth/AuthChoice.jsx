import React from "react";
import {useHistory} from "react-router-dom";
import Logo from "../assets/affooh_logo.png";
import {signInWithRedirect} from "aws-amplify/auth";

const AuthChoice = () => {
    const history = useHistory();

    const handleLogin = async () => {
        await signInWithRedirect();
    }

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            {/* Floating Card */}
            <div className="bg-white rounded-2xl shadow-2xl px-10 py-12 w-full max-w-md text-center">
                <div className="flex justify-center mb-6">
                    <img
                        src={Logo}
                        alt="Affooh Logo"
                        className="h-16 object-contain"
                    />
                </div>

                <p className="text-3xl font-bold  text-gray-800">
                    Welcome to
                </p>
                <p className="text-2xl font-bold mb-6 text-gray-800">
                    Affooh
                </p>

                <p className="text-gray-500 mb-8">
                    If you already have an account, please log in.
                    If you are new here, create an account to get started.
                </p>

                <div className="flex flex-col gap-4">
                    <button
                        onClick={handleLogin}
                        className="w-full py-3 rounded-xl bg-primary-pink text-black font-semibold hover:opacity-90 transition"
                    >
                        Login
                    </button>

                    <button
                        onClick={() => history.push("/register")}
                        className="w-full py-3 rounded-xl border-2 bg-secondary-pink border-primary-pink text-text-color font-semibold hover:bg-mainColor hover:text-black transition"
                    >
                        Register
                    </button>
                </div>

                <p className="text-sm text-gray-400 mt-6">
                    Choose an option to continue
                </p>
            </div>
        </div>
    );
};

export default AuthChoice;