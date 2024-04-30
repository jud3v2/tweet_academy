import {defineConfig} from 'vite';
import simpleHtmlPlugin from 'vite-plugin-simple-html';
import react from "@vitejs/plugin-react";
import path from 'path';

export default defineConfig({
        server: {
                port: 3000,
        },
        build: {
                outDir: '../dist',
        },
        root: 'src',
        plugins: [
                simpleHtmlPlugin({
                        inject: {
                                data: {
                                        title: "Tweet - Academy",
                                },
                        },
                }),
            react({
                    // Use React plugin in all *.jsx and *.tsx files
                    include: '**/*.{jsx,tsx}',
            }),
        ],
        resolve: {
                alias: {
                        src: path.resolve(__dirname, 'src'),
                        "#": path.resolve(__dirname, 'src'),
                }
        },
        optimizeDeps: {
                include: [
                        "axios",
                        "@tanstack/react-query",
                        "react-router-dom",
                        "react",
                        "@mui/material",
                        "react-toastify",
                        "react-icons",
                ],
        }
});