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
            '/api': 'http://localhost:9999'
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
    ],
    css: {
        preprocessorOptions: {
            scss: {
                loadPaths: ['node_modules']
            }
        }
    }
})
