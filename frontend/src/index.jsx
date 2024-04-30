import React from 'react';
import ReactDOM from 'react-dom/client';
import Layout from "./components/Layout"
import UserLayout from "./components/UserLayout"
import {createBrowserRouter, RouterProvider} from "react-router-dom";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Profile from "./pages/Profile.jsx";
import Settings from "./components/Settings";
import Logout from "./components/Logout";
import axios from 'axios';
import config from './config'
import Home from "./pages/Home.jsx";
import {QueryClientProvider, QueryClient} from "@tanstack/react-query";
import Follower from "src/pages/Follower.jsx";
import MessageLayout from "#/components/MessageBox.jsx";
import Messages from "#/pages/Messages.jsx";
import Tweet from "#/pages/Tweet.jsx";
import { StrictMode } from 'react';
import './assets/styles/output.css';
import Explore from "#/pages/Explore.jsx";

// axios baseURL config
axios.defaults.baseURL = config.apiUrl;

const root = ReactDOM.createRoot(document.getElementById('root'));

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            refetchOnWindowFocus: false,
        },
    },
});

const router = createBrowserRouter([
    {
        path: "/register",
        element: <Layout>
            <Register/>
        </Layout>,
    },
    {
        path: "/login",
        element: <Layout>
            <Login/>
        </Layout>,
    },
    {
        path: "/profile/:username",
        element: <UserLayout>
            <Profile/>
        </UserLayout>,
    },
    {
        path: "/settings",
        element: <UserLayout>
            <Settings/>
        </UserLayout>,
    },
    {
        path: "/",
        element: <UserLayout>
            <Home/>
        </UserLayout>,
    },
    {
        path: "/tweet/:id",
        element: <UserLayout>
            <Tweet/>
        </UserLayout>,
    },
    {
        path: "/notifications",
        element: <UserLayout>
            <Home/>
        </UserLayout>,
    },
    {
        path: "/messages",
        element: <Messages />,
    },
    {
        path: "/bookmarks",
        element: <UserLayout>
            <Home/>
        </UserLayout>,
    },
    {
        path: "/lists",
        element: <UserLayout>
            <Home/>
        </UserLayout>,
    },
    {
        path: "/Logout",
        element: <UserLayout>
            <Logout/>
        </UserLayout>,
    },
    {
        path: "follower/:id",
        element: <UserLayout>
            <Follower/>
        </UserLayout>,
    },
    {
        path: '/explore/:hashtag',
        element: <UserLayout>
            <Explore />
        </UserLayout>
    },
    {
        path: "*",
        element: <Layout>
            <h1>404 Not Found</h1>
        </Layout>,
    },
]);

function App() {
    return (
        <QueryClientProvider client={queryClient}>
            <RouterProvider router={router}/>
        </QueryClientProvider>
    );
}

root.render(<StrictMode><App/></StrictMode>);