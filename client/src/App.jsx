import { React, useEffect } from "react";
import { Toaster } from "react-hot-toast";
import Layout from "./Layout";
import AppRouter from "./routes/AppRouter";
import { useAuthStore } from "./stores/AuthStore";
import BackgroundMusicController from "@/components/reusable/BackgroundMusicController";

function App() {
    const checkAuth = useAuthStore((state) => state.checkAuth);
    const isCheckingAuth = useAuthStore((state) => state.isCheckingAuth);

    // checkAuth once time when running the web
    useEffect(() => {
        checkAuth();
    }, [checkAuth]);

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