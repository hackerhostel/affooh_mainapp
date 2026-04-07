import {useEffect} from "react";
import {getCurrentUser, signOut} from "aws-amplify/auth";

/**
 * Custom Hook to listen for global logout events across different tabs/subdomains.
 * It uses window focus events and a periodic interval to verify session validity.
 */
export const useGlobalLogout = () => {
    useEffect(() => {
        const checkAuthStatus = async () => {
            const publicPaths = [
                "/auth",
                "/login",
                "/register",
                "/forgot-password",
                "/reset-password" ,
                "/otp-verification",
                "/inviteUserRegister"
            ];
            const currentPath = window.location.pathname;

            // If we are already on an auth-related public page, we don't need to force logout/redirect
            if (publicPaths.some(path => currentPath.startsWith(path))) {
                return;
            }

            try {
                // Amplify getCurrentUser() checks if a user is technically logged in locally.
                // For a more robust check in a global logout scenario, we could use fetchAuthSession({ forceRefresh: true })
                // but checking getCurrentUser is usually sufficient if the local tokens were cleared or session revoked.
                await getCurrentUser();
            } catch (err) {
                // If getCurrentUser fails, it means the user is no longer authenticated.
                console.warn("Global logout detected or session expired. Logging out...");
                
                // Clear local storage and session storage just in case
                localStorage.clear();
                sessionStorage.clear();
                
                // Redirect to the auth page
                window.location.href = "/auth";
            }
        };

        // 1. Check status when the user switches back to this tab (most immediate for user)
        window.addEventListener("focus", checkAuthStatus);
        
        // 2. Listen for storage changes in case of same-origin (dev environments on same port)
        const handleStorageChange = (e) => {
            if (e.key === "logout-event") {
                window.location.reload();
            }
        };
        window.addEventListener('storage', handleStorageChange);

        // 3. Periodic check every 10 seconds to detect logout even if tab is in background
        const interval = setInterval(checkAuthStatus, 10000);

        return () => {
            window.removeEventListener("focus", checkAuthStatus);
            window.removeEventListener("storage", handleStorageChange);
            clearInterval(interval);
        };
    }, []);
};
