import React, {useEffect, useState} from "react";
import {useQueryClient, useQuery} from "@tanstack/react-query";
import axios from "axios";
import {ToastContainer, toast} from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import Sidebar from "#/components/Sidebar";
import MessageSidebar from "#/components/MessageSidebar.jsx";
import MessageBox from "#/components/MessageBox.jsx";

export default function Messages() {
        const [user, setUser] = useState(JSON.parse(localStorage.getItem('twitter_user')));
        const [users, setUsers] = useState(null);
        const [conversations, setConversation] = useState(null);
        const [showConvBox, setShowConvBox] = useState(false);
        const [convBoxMessages, setConvBoxMessages] = useState(null);
        const [messageInput, setMessageInput] = useState("")
        const [openCreateMessageModal, setOpenCreateMessageModal] = useState(false);
        const [convBox, setConvBox] = useState(null);
        const [currentConv, setCurrentConv] = useState(null);

        useEffect(() => {
                if (localStorage.getItem('twitter_theme')) {
                        document.body.classList.add(localStorage.getItem('twitter_theme'));
                } else {
                        document.body.classList.remove('dark');
                }
        }, []);

        if (!localStorage.getItem('twitter_user')) {
                toast.error("Vous devez être connecté pour accéder à cette page");
                setTimeout(() => {
                        window.location.href = "/login";
                }, 1500);
        }

        const queryClient = useQueryClient();

        const handleCloseCreateMessageModal = () => {
                setOpenCreateMessageModal(false);
        }

        const handleOpenCreateMessageModal = () => {
                setOpenCreateMessageModal(true);
        }

        const handleShowConvBox = async id => {
                const messages = await handleFetchConvBoxMessages(id);
                setConvBoxMessages(messages);
                setCurrentConv(message[0].username);
                if (messages) {
                        setShowConvBox(true);
                } else {
                        toast.error("Error while fetching messages");
                }
        }

        const handleFetchConvBoxMessages = async (id) => {
                return await axios.get(
                    '/Message/GetMessage.php?sender_id=' +
                    user.id + '&recipient_id=' + id)
                    .then(res => {
                            return res.data;
                    })
        }

        const fetchUser = async () => {
                let username = JSON.parse(
                    localStorage.getItem('twitter_user')
                ).username

                return await axios.get("/users/GetOne.php" + "?username="
                    + username)
                    .then((res) => res)
                    .then((data) => {
                            setUser(data.data);
                            return data.data
                    })
        }

        const fetchConversations = async () => {
                return await axios.get("/Message/boxconv.php?recipient_id="
                    + user.id)
                    .then((res) => res)
                    .then((data) => {
                            setConversation(data.data);
                            return data.data
                    })
        }

        const fetchUsers = async () => {
                return await axios.get('/users/GetAll.php')
                    .then(data => {
                            setUsers(data.data);
                            return data.data;
                    })
        }

        const refreshSidebar = async () => {
                await fetchConversations();
                await fetchUsers();
        };

        const onCreatePlaceNewConversationAsCurrent = async (id) => {
                await handleShowConvBox(id)
        }

        const handleCreateMessage = async (e) => {
                e.preventDefault();
                let form = e.target;
                let formData = new FormData(form);
                let data = {
                        sender_id: user.id,
                        recipient_id: formData.get("recipient_id"),
                        messages: formData.get("message"),
                }
                return await axios.post("/Message/CreateMessage.php", data)
                    .then(async (res) => {
                            res.status === 200 ? toast('Message sent', {type: 'success'}) : toast.error('Error while sending message');
                            await refreshSidebar();
                            // select the new conversation has the current conversation
                            await onCreatePlaceNewConversationAsCurrent(data.recipient_id);
                            handleCloseCreateMessageModal();
                            setMessageInput("");
                            return res.data;
                    }) }

        const handleSendButton = async (e) => {
                e.preventDefault();
                if (messageInput === "") {
                        toast.error('Message cannot be empty');
                        return;
                }

                // this will prevent from sending to the same user
                if(convBox[0].sender_id === user.id) {
                        convBox[0].sender_id = convBox[0].recipient_id;
                }

                let data = {
                        sender_id: user.id,
                        recipient_id: convBox[0].sender_id,
                        messages: messageInput,
                }

                await axios.post("/Message/CreateMessage.php", data)
                    .then((res) => {
                            return res.data;
                    })

                await fetchConversations();
                const messages = await handleFetchConvBoxMessages(convBox[0].sender_id);
                setConvBoxMessages(messages);
                setMessageInput("");

                toast('Message sent', {type: 'success'});
        }

        const handleChangeMessageInput = (e, convBox) => {
                setConvBox(convBox);
                setMessageInput(e.target.value);
        }

        const {isLoading, error, data} = useQuery({
                queryKey: ["user"], queryFn: fetchUser,
        }, queryClient);

        const refreshMessages = async () => {
                // Check if conversation box is open
                if (showConvBox) {
                        // Loop through conversations
                        conversations.map(async (conv) => {
                                if (conv.recipient_id === convBox[0].sender_id) {
                                        const messages = await handleFetchConvBoxMessages(conv.recipient_id);
                                        setConvBoxMessages(messages);
                                }
                        });
                }
        };

        useEffect(() => {
                if (error) {
                        toast.error("Error while reaching server, try later");
                }
        }, [error]);

        useEffect(() => {
                if (data && data.id) {
                        setUser(data);
                        (async () => toast.promise(fetchConversations, {
                                error: "Error while fetching conversations",
                        }))()
                }

                (async () => toast.promise(fetchUsers, {
                        error: "Error while fetching users",
                }))()
        }, [data]);

        // when conversations is up set the latest messages in the conversation box
        useEffect(() => {
                // this will be execute once for prevent future re-execution
                if (conversations && !showConvBox && conversations[0]) {
                        (async () => {
                                if (conversations[0]) {
                                        await handleShowConvBox(conversations[0].recipient_id);
                                }
                        })()
                }
        }, [conversations]);

        // when user is in a conversation box refresh automatically the messages each 5 seconds
        useEffect(() => {
                if (showConvBox) {
                        const interval = setInterval(async () => {
                                await refreshMessages();
                        }, 5000);
                        return () => clearInterval(interval);
                }
        }, [showConvBox]);



        return (<div className={"flex h-full dark:bg-black dark:text-slate-500"}>
                    <div className={"flex-none max-w-[275px]"}>
                            <Sidebar />
                    </div>
                    <div className={"flex-1 dark:bg-dark dark:text-white h-full"}>
                            <MessageBox showConvBox={showConvBox} conversations={conversations} convBoxMessages={convBoxMessages} handleChangeMessageInput={handleChangeMessageInput} messageInput={messageInput} handleSendButton={handleSendButton} />
                    </div>
                    <div className={"flex max-w-[480px]"}>
                            <MessageSidebar handleShowConvBox={handleShowConvBox}
                                            conversations={conversations}
                                            handleCreateMessage={handleCreateMessage}
                                            openCreateMessageModal={openCreateMessageModal}
                                            handleclose={handleCloseCreateMessageModal}
                                            handleOpenCreateMessageModal={handleOpenCreateMessageModal}
                                            users={users}
                            />
                    </div>
                    <ToastContainer />
            </div>);
}