import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
    server: {
        host: true,
        port: 8989,
        watch: {
            usePolling: true,
        },
        hmr: {
            clientPort: 8989,
        },
        proxy: {
            '/api': 'http://localhost:8888'
        }
    },
    plugins: [
        react({
            babel: {
                plugins: [
                    ['babel-plugin-react-compiler', { target: '19' }]
                ]
            }
        })
    ]
})

