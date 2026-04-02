import {defineConfig} from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from "path";


export default defineConfig({
    plugins: [react(), tailwindcss()],
    build: {
        outDir: "dist",
        assetsDir: "assets",
        minify: "terser",
    },
    resolve: {
        alias: {
            // Define the root alias "@" -> "src"
            "@": path.resolve(__dirname, "./src"),
            // Define shortcut
            "assets": path.resolve(__dirname, "./src/assets"),
            "common": path.resolve(__dirname, "./src/common"),
            "components": path.resolve(__dirname, "./src/components"),
            "config": path.resolve(__dirname, "./src/config"),
            "hooks": path.resolve(__dirname, "./src/hooks"),
            "models": path.resolve(__dirname, "./src/models"),
            "pages": path.resolve(__dirname, "./src/pages"),
            "routes": path.resolve(__dirname, "./src/routes"),
            "services": path.resolve(__dirname, "./src/services"),
            "stores": path.resolve(__dirname, "./src/stores"),
            "utils": path.resolve(__dirname, "./src/utils"),
        }
    },
    server: {
        port: 8000,
        host: "0.0.0.0",
    }
})
