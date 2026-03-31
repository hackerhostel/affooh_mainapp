import { useEffect } from "react";
import { signOut } from "aws-amplify/auth";

// This page is the Cognito redirectSignOut target.
// When Cognito redirects here after global logout, we clear everything locally.
const LogoutPage = () => {
    useEffect(() => {
        const cleanup = async () => {
            try {
                // Ensure Amplify local session is cleared
                await signOut();
            } catch (_) {
                // ignore
            } finally {
                localStorage.clear();
                sessionStorage.clear();
                window.location.replace("/auth");
            }
        };
        cleanup();
    }, []);

    return null;
};

export default LogoutPage;
