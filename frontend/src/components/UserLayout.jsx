import React, {useEffect} from "react";
import {useQueryClient, useQuery} from "@tanstack/react-query";
import axios from "axios";
import {ToastContainer, toast} from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import Sidebar from "./Sidebar";
import RightSidebar from "./RightSidebar";

export default function UserLayout({children}) {

        if (!localStorage.getItem('twitter_user')) {
                toast.error("Vous devez être connecté pour accéder à cette page");
                window.location.href = "/login";
        }

        const queryClient = useQueryClient();

        const fetchUser = async () => {
                let username = JSON.parse(localStorage.getItem('twitter_user')).username
                return await axios.get("/users/GetOne.php" + "?parameter=user&username=" + username)
                    .then((res) => res)
                    .then((data) => data.data)
        }

        const {isLoading, error, data} = useQuery({
                queryKey: ["user"],
                queryFn: fetchUser,
        }, queryClient);

        useEffect(() => {
                if (data && data.id) {
                        localStorage.setItem('twitter_user', JSON.stringify(data));
                }
        }, [data]);

        useEffect(() => {
                if (error) {
                        toast.error("Error while reaching server, try later");
                }
        }, [error]);

        useEffect(() => {
                if (localStorage.getItem('twitter_theme')) {
                        document.body.classList.add(localStorage.getItem('twitter_theme'));
                } else {
                        document.body.classList.remove('dark');
                }
        }, []);

        return (
            <div className={"flex h-full dark:bg-black dark:text-slate-500"}>
                    <div className={"flex-none max-w-[275px]"}>
                            <Sidebar/>
                    </div>
                    <div className={"flex-1 dark:bg-dark dark:text-white h-full"}>
                            {children}
                    </div>
                    <div className={"flex max-w-[480px]"}>
                            <RightSidebar />
                    </div>
                    <ToastContainer/>
            </div>
        );
}