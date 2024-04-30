import * as React from "react";
import PropTypes from "prop-types";
import {useNavigate} from "react-router-dom";
import {Modal} from "@mui/material";
import Box from "@mui/material/Box";

export default function MessageSidebar(props) {
        const localUser = JSON.parse(localStorage.getItem('twitter_user'));
        const navigate = useNavigate();
        return (
            <div className="flex flex-col pt-1.5 pl-2.5 pr-2.5 pb-12 dark:bg-black max-w-[480px] h-full">
                    <div
                        className="flex gap-5 justify-between items-center pr-3 py-3.5 pl-4 mt-3 dark:bg-black rounded mb-1">
                            <div className="flex-auto text-xl font-bold text-black dark:text-zinc-300">
                                    Latest Messages
                            </div>
                            <div
                                className="justify-center px-4 py-2 my-auto text-sm bg-gray-100 aspect-[2.35] rounded-[32px] text-neutral-900 cursor-pointer"
                                onClick={props.handleOpenCreateMessageModal}>
                                    New
                            </div>
                    </div>
                    {props.conversations ? props.conversations?.map((conversation) => {
                            return (
                                <div key={conversation.id}
                                     className={"px-4 py-3 whitespace-nowrap dark:bg-neutral-800 rounded mb-1"}>
                                        <div
                                            className="flex gap-3.5 justify-center px-4 py-3 whitespace-nowrap dark:bg-neutral-800 rounded mb-1">
                                                <img
                                                    loading="lazy"
                                                    src={conversation.recipient_profile_picture}
                                                    className="w-12 aspect-square rounded-full"
                                                    alt="..."
                                                />
                                                <div className="flex flex-col flex-1 py-1.5 text-base cursor-pointer"
                                                     onClick={(e) => {
                                                             e.preventDefault();
                                                             navigate("/profile/" + conversation.recipient_username)
                                                     }}>
                                                        <div
                                                            className="flex gap-1 justify-between dark:text-zinc-300 text-zinc-500">
                                                                <div
                                                                    className="grow">{conversation.recipient_firstname + ' ' + conversation.recipient_lastname}</div>
                                                                <img
                                                                    loading="lazy"
                                                                    src="https://cdn.builder.io/api/v1/image/assets/TEMP/d13be9df60e3200f77ea5439d1e0dffb8bad7c821c0fd8f0569683f291f7547c?"
                                                                    className="w-5 aspect-square rounded-full"
                                                                    alt="..."
                                                                />
                                                        </div>
                                                        <div
                                                            className="font-light text-gray-500">@{conversation.recipient_username}</div>
                                                </div>
                                                <div
                                                    className="justify-center px-4 py-2 my-auto text-sm bg-gray-100 aspect-[2.35] rounded-[32px] text-neutral-900 cursor-pointer"
                                                    onClick={(e) => props.handleShowConvBox(conversation.recipient_id)}>
                                                        Chat
                                                </div>
                                        </div>
                                        <div className={"px-3 py-2"}>
                                               <span className={"text-zinc-500 border p-3 rounded"}>{conversation?.messages?.substring(0, 40) + '...'}</span>
                                        </div>
                                </div>
                            )
                    }) : ''}

                    <Modal open={props.openCreateMessageModal}>
                            <Box sx={{
                                    width: "50%",
                                    bgcolor: "background.paper",
                                    border: "2px solid #000",
                                    boxShadow: 24,
                                    top: "0",
                                    left: "0",
                                    transform: "translate(50%, 50%)",
                                    borderRadius: 2,
                            }}>
                                    <div className={'relative'}>
                                            <div className="w-full max-w-full">
                                                    <form action="#" onSubmit={props.handleCreateMessage}
                                                          className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
                                                            <div
                                                                className={"mb-4"}>
                                                                    <label htmlFor="recipient_id" className={"block text-gray-700 text-sm font-bold mb-2"}>
                                                                            The user you want to send a message to
                                                                            <select name="recipient_id"
                                                                                    id="recipient_id"
                                                                                    required={true}
                                                                                    className={'shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline'}>
                                                                                    {props?.users?.map((user) => {
                                                                                            return user.username !== localUser.username
                                                                                                ? <option key={user.id}
                                                                                                        value={user.id}>{user.firstname + ' ' + user.lastname + ' | @' + user.username}</option>
                                                                                                : ''
                                                                                    })}
                                                                            </select>
                                                                    </label>
                                                            </div>
                                                            <div className="mb-6">
                                                                    <label
                                                                        className="block text-gray-700 text-sm font-bold mb-2"
                                                                        htmlFor="message">
                                                                            Message
                                                                    </label>
                                                                    <input
                                                                        className="shadow appearance-none border border-red-500 rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
                                                                        id="message" type="text"
                                                                        name={"message"}
                                                                        placeholder="Enter your message here"/>
                                                            </div>
                                                            <div className="flex items-center justify-between">
                                                                    <button
                                                                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                                                                        type="submit">
                                                                            Send
                                                                    </button>
                                                                    <button type={'button'} className="inline-block align-baseline font-bold text-sm text-blue-500 hover:text-blue-800" onClick={props.handleclose}>
                                                                            Close modal
                                                                    </button>
                                                            </div>
                                                    </form>
                                            </div>
                                    </div>
                            </Box>
                    </Modal>
            </div>
        );
}

MessageSidebar.propTypes = {
        conversations: PropTypes.array,
}