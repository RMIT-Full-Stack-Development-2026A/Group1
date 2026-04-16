import { React, useEffect } from "react";
import { Toaster } from "react-hot-toast";
import Layout from "./Layout";
import AppRouter from "./routes/AppRouter";
import { useAuthStore } from "./stores/AuthStore";

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
            <AppRouter />
            <Toaster position="bottom-right" reverseOrder={false} />
        </Layout>
    );
}

export default App;