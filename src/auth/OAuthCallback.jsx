import React, { useEffect } from "react";
import { useHistory } from "react-router-dom";
import { Hub } from "aws-amplify/utils";
import { getCurrentUser } from "aws-amplify/auth";

// This component handles the OAuth redirect callback from Cognito.
// Amplify automatically exchanges the code for tokens when this page loads.
const OAuthCallback = () => {
    const history = useHistory();

    useEffect(() => {
        // Listen for Amplify auth events
        const unsubscribe = Hub.listen("auth", ({ payload }) => {
            switch (payload.event) {
                case "signedIn":
                    history.replace("/");
                    break;
                case "signInWithRedirect_failure":
                    console.error("OAuth sign-in failed:", payload.data);
                    history.replace("/auth");
                    break;
                default:
                    break;
            }
        });

        // In case the user is already signed in (token exchange already done)
        getCurrentUser()
            .then(() => history.replace("/"))
            .catch(() => {
                // Not signed in yet — Hub listener will handle it
            });

        return () => unsubscribe();
    }, [history]);

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-pink mx-auto mb-4" />
                <p className="text-gray-600">Signing you in...</p>
            </div>
        </div>
    );
};

export default OAuthCallback;
