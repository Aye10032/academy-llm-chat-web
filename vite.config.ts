import path from "path"
import {defineConfig} from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vite.dev/config/
export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./src"),
        },
    },
    server: {
        proxy: {
            // 字符串简写写法：
            // http://localhost:5173/foo
            // -> http://localhost:4567/foo
            '/api': 'http://localhost:8000',
        },
    },
})
