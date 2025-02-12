import path from "path"
import tailwindcss from '@tailwindcss/vite'
import Unfonts from 'unplugin-fonts/vite'
import react from '@vitejs/plugin-react-swc'
import {defineConfig} from 'vite'

// https://vite.dev/config/
export default defineConfig({
    plugins: [
        react(),
        tailwindcss(),
        Unfonts({
            custom: {
                families: [
                    {
                        name: 'Geist',
                        src: './src/assets/fonts/geist/*.woff2',
                    },
                    {
                        name: 'Geist Mono',
                        src: './src/assets/fonts/geistmono/*.woff2',
                    },
                ],
            },
        })
    ],
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./src"),
        },
    },
    server: {
        host: '0.0.0.0',
        port: 5173,
        proxy: {
            // 字符串简写写法：
            // http://localhost:5173/foo
            // -> http://localhost:4567/foo
            '/api': {
                target: 'http://172.18.19.50:8000',
                changeOrigin: true
            },
        },
    },
})
