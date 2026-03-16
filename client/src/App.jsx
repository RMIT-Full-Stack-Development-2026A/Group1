import React from "react";
import { Toaster } from "react-hot-toast";
import Layout from "./Layout";
import AppRouter from "./routes/AppRouter";

function App() {
    return (
        <Layout>
            <AppRouter />
            <Toaster position="bottom-right" reverseOrder={false} />
        </Layout>
    );
}

export default App;