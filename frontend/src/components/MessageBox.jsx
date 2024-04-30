import React, {useState, useEffect} from "react";
import 'react-toastify/dist/ReactToastify.css';
import PropTypes from "prop-types";

export default function MessageBox(props) {
        const [user] = useState(JSON.parse(localStorage.getItem('twitter_user')));
        const [recipient, setRecipient] = useState(null);

        useEffect(() => {
                if(props.convBoxMessages) {
                        const filterData = props.conversations.filter((conv) => {
                                return conv.recipient_id === props.convBoxMessages[0].recipient_id
                        })

                        if(filterData[0]) {
                                setRecipient(filterData[0]);
                        }
                }
        }, [props.convBoxMessages, props.showConvBox, recipient]);

        return (
            <div className={"min-h-screen"}>
                    <div>
                            <div className="flex flex-col w-full max-md:max-w-full">
                                    <div
                                        className="flex flex-col pt-2.5 w-full text-xl font-bold text-dark dark:text-white whitespace-nowrap dark:bg-black max-md:max-w-full">
                                            <div
                                                className="flex gap-5 justify-between px-px mx-4 max-md:flex-wrap max-md:mr-2.5 max-md:max-w-full">
                                                    <div className="my-auto text-dark">{recipient ? "Message to : " + recipient.recipient_username : "Message"}</div>
                                                    <img
                                                        alt={""}
                                                        loading="lazy"
                                                        src="https://cdn.builder.io/api/v1/image/assets/TEMP/aa1257bccfd61876083da12bad5ea69dcfc757d26aa971bceb71e9b4319d57a9?"
                                                        className="aspect-square w-[34px] rounded-full"
                                                    />
                                            </div>
                                            <div className="mt-2.5 w-full bg-zinc-800 min-h-[1px] max-md:max-w-full"/>
                                    </div>
                            </div>
                    </div>
                    <div className="flex h-screen antialiased text-gray-800">
                            <div className="flex flex-row h-full w-full overflow-x-hidden">
                                    <div className="flex flex-col flex-auto h-full p-6">
                                            {/* TODO: Maek the dark mode handle here.*/}
                                            <div
                                                className="flex flex-col flex-auto flex-shrink-0 rounded-2xl dark:bg-dark bg-gray-100 h-full p-4"
                                            >
                                                    <div className="flex flex-col h-full overflow-x-auto mb-4">
                                                            <div className="flex flex-col h-full">
                                                                    <div className="grid grid-cols-12 gap-y-2">
                                                                            {props.showConvBox && props.convBoxMessages?.map((message) => {
                                                                                    if(message?.sender_username === user?.username) {
                                                                                            return (<div
                                                                                                key={message.id} id={message.id + '-' + message.sender_username}
                                                                                                className="col-start-6 col-end-13 p-3 rounded-lg">
                                                                                                    <div
                                                                                                        className="flex items-center justify-start flex-row-reverse">
                                                                                                            <div
                                                                                                                className="flex items-center justify-center h-10 w-10 rounded-full bg-indigo-500 flex-shrink-0"
                                                                                                            >
                                                                                                                    {message?.sender_username?.charAt(0)}
                                                                                                            </div>
                                                                                                            <div
                                                                                                                className="relative mr-3 text-sm bg-indigo-100 py-2 px-4 shadow rounded-xl"
                                                                                                            >
                                                                                                                    <div>{message?.messages}</div>
                                                                                                            </div>
                                                                                                    </div>
                                                                                            </div>)
                                                                                    } else {
                                                                                            return (
                                                                                                <div
                                                                                                    key={message?.id}
                                                                                                    className="col-start-1 col-end-8 p-3 rounded-lg">
                                                                                                        <div
                                                                                                            className="flex flex-row items-center">
                                                                                                                <div
                                                                                                                    className="flex items-center justify-center h-10 w-10 rounded-full bg-indigo-500 flex-shrink-0">
                                                                                                                        {message?.sender_username?.charAt(0)}
                                                                                                                </div>
                                                                                                                <div
                                                                                                                    className="relative ml-3 text-sm bg-white py-2 px-4 shadow rounded-xl">
                                                                                                                        <div>{message?.messages}</div>
                                                                                                                </div>
                                                                                                        </div>
                                                                                                </div>
                                                                                            )
                                                                                    }
                                                                            })}
                                                                    </div>
                                                            </div>
                                                    </div>
                                                    <div className="flex flex-row items-center h-16 rounded-xl bg-white w-full px-4">
                                                            <div>
                                                                    <button className="flex items-center justify-center text-gray-400 hover:text-gray-600">
                                                                            <svg className="w-5 h-5"
                                                                                fill="none"
                                                                                stroke="currentColor"
                                                                                viewBox="0 0 24 24"
                                                                                xmlns="http://www.w3.org/2000/svg">
                                                                                    <path strokeLinecap="round"
                                                                                        strokeLinejoin="round"
                                                                                        strokeWidth="2"
                                                                                        d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                                                                            </svg>
                                                                    </button>
                                                            </div>
                                                            <div className="flex-grow ml-4">
                                                                    <div className="relative w-full">
                                                                            <input
                                                                                type="text"
                                                                                value={props.messageInput}
                                                                                onChange={(e) => props.handleChangeMessageInput(e, props.convBoxMessages)}
                                                                                className="flex w-full border rounded-xl focus:outline-none focus:border-indigo-300 pl-4 h-10"/>
                                                                            <button className="absolute flex items-center justify-center h-full w-12 right-0 top-0 text-gray-400 hover:text-gray-600">
                                                                                    <svg
                                                                                        className="w-6 h-6"
                                                                                        fill="none"
                                                                                        stroke="currentColor"
                                                                                        viewBox="0 0 24 24"
                                                                                        xmlns="http://www.w3.org/2000/svg">
                                                                                            <path
                                                                                                strokeLinecap="round"
                                                                                                strokeLinejoin="round"
                                                                                                strokeWidth="2"
                                                                                                d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                                                                    </svg>
                                                                            </button>
                                                                    </div>
                                                            </div>
                                                            <div className="ml-4">
                                                                    <button className="cursor-pointer flex items-center justify-center bg-blue-500 hover:bg-blue-600 rounded-xl text-white px-4 py-1 flex-shrink-0"
                                                                    onClick={props.handleSendButton}>
                                                                            <span>Send</span>
                                                                            <span className="ml-2">
                                                                          <svg
                                                                              className="w-4 h-4 transform rotate-45 -mt-px"
                                                                              fill="none"
                                                                              stroke="currentColor"
                                                                              viewBox="0 0 24 24"
                                                                              xmlns="http://www.w3.org/2000/svg"
                                                                          >
                                                                            <path
                                                                                strokeLinecap="round"
                                                                                strokeLinejoin="round"
                                                                                strokeWidth="2"
                                                                                d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                                                                            ></path>
                                                                          </svg>
                                                                        </span>
                                                                    </button>
                                                            </div>
                                                    </div>
                                            </div>
                                    </div>
                            </div>
                    </div>
            </div>
        );
}

MessageBox.prototype = {
        showConvBox: PropTypes.bool,
        convBoxMessages: PropTypes.array
}