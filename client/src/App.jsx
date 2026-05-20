import { React, useEffect } from "react";
import { Toaster } from "react-hot-toast";
import { toast } from "react-hot-toast";
import Layout from "./Layout";
import AppRouter from "./routes/AppRouter";
import { useAuthStore } from "./stores/auth/AuthStore";
import BackgroundMusicController from "@/components/reusable/sound/BackgroundMusicController";

function App() {
    const checkAuth = useAuthStore((state) => state.checkAuth);
    const isCheckingAuth = useAuthStore((state) => state.isCheckingAuth);
    // checkAuth once time when running the web
    useEffect(() => {
        checkAuth();
    }, [checkAuth]);

    // Handle account deactivation
    useEffect(() => {
        const handleAccountDeactivated = (event) => {
            const payload = event.detail || {};
            const message = payload.message || 'Your account has been deactivated by an administrator.';

            toast.error(message);
        };

        window.addEventListener('account:deactivated', handleAccountDeactivated);

        return () => {
            window.removeEventListener('account:deactivated', handleAccountDeactivated);
        };
    }, []);

    // Handle force logout (duplicate login)
    useEffect(() => {
        const handleForceLogout = (event) => {
            const payload = event.detail || {};
            const message = payload.message || 'Your account was logged in from another location.';
            // Show toast notification with slightly longer duration for readability
            toast.error(message, { duration: 5000 });
        };

        window.addEventListener('auth:force_logout', handleForceLogout);

        return () => {
            window.removeEventListener('auth:force_logout', handleForceLogout);
        };
    }, []);
    
    // When checking auth, show loading screen
    if (isCheckingAuth) {
        return <div className="loading-screen">Validating system...</div>;
    }

    return (
        <Layout>
            <BackgroundMusicController />
            <AppRouter />
            <Toaster
                position="bottom-right"
                reverseOrder={false}
                toastOptions={{
                    duration: 4000,
                    style: {
                        background: '#1a1a2e',
                        color: '#e3e0f4',
                        border: '1px solid #3d484d',
                    },
                    success: {
                        iconTheme: {
                            primary: '#4cc9f0',
                            secondary: '#1a1a2e',
                        },
                    },
                    error: {
                        iconTheme: {
                            primary: '#ffb4ab',
                            secondary: '#1a1a2e',
                        },
                    },
                }}
            />
        </Layout>
    );
}

export default App;