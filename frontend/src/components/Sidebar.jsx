import * as React from "react";
import { Link } from "react-router-dom";
import { SlLogout } from "react-icons/sl";

export default function Sidebar() {
  const user = JSON.parse(localStorage.getItem("twitter_user"));

        return (

            <div className="flex flex-col px-3 pb-3 text-xl font-bold whitespace-nowrap dark:bg-black dark:text-white max-w-[275px] h-full">
                    <img
                        loading="lazy"
                        src="https://cdn.builder.io/api/v1/image/assets/TEMP/ce58aec201aecf5080e071a1b13bedcf0a7de7ed13c39b1bd19f50be5899ee82?"
                        className="mt-1 aspect-square w-[50px]"
                        alt="..."
                    />
                    <Link to={"/"} className={"dark:hover:bg-gray-500 hover:bg-black hover:text-white rounded "}>
                            <div className="flex gap-5 justify-between p-3.5 mt-2 rounded-[50px] text-zinc-300">
                                    <img
                                        loading="lazy"
                                        src="https://cdn.builder.io/api/v1/image/assets/TEMP/31afc888704eb9cfed6a6ad8547c15b2ddd0cb76e6c47c1f1c0fa20afe970fcd?"
                                        className="w-6 aspect-square"
                                        alt="..."
                                    />
                                    <div className="flex-auto my-auto text-black dark:text-white hover:text-white relative">
                                            Home
                                    </div>
                            </div>
                    </Link>
                    <Link to={"/explore/all"} className="dark:hover:bg-gray-500 hover:bg-black hover:text-white text-black rounded">
                            <div className="flex gap-5 justify-between p-3.5 mt-2 rounded-[50px] text-zinc-300">
                                    <img
                                        loading="lazy"
                                        src="https://cdn.builder.io/api/v1/image/assets/TEMP/6ef9638b8438754f6936e3cb597de503bc87a119c60e5ae35c36dcc7aa3aa836?"
                                        className="w-6 aspect-square"
                                        alt="..."
                                    />
                                    <div
                                        className="flex-auto text-black dark:text-white hover:text-white relative">Explore
                                    </div>
                            </div>
                    </Link>
                    <Link to={"/messages"}
                          className="dark:hover:bg-gray-500 hover:bg-black hover:text-white text-black rounded">
                            <div className="flex gap-5 justify-between p-3.5 mt-2 rounded-[50px] text-zinc-300">
                                    <img
                                        loading="lazy"
                                        src="https://cdn.builder.io/api/v1/image/assets/TEMP/c837c6208cfb27e45b2eecf5f82c1e7f215f1911d2df5d2ea3b66ed6cc22496f?"
                                        className="aspect-[0.93] w-[29px]"
                                        alt="..."
                                    />
                                    <div className="flex-auto text-black dark:text-white hover:text-white relative">Messages</div>
                            </div>
                    </Link>
                    <Link to={"/profile/" + user.username} className="dark:hover:bg-gray-500 hover:bg-black hover:text-white text-black rounded">
                            <div className="flex gap-5 justify-between p-3.5 mt-2 rounded-[50px] text-zinc-300">
                                    <img
                                        loading="lazy"
                                        src="https://cdn.builder.io/api/v1/image/assets/TEMP/5ca148543dff62c5000e5f6e596b3a96bb0ea882d320f2e5fac07112d6e764ff?"
                                        className="w-6 aspect-square"
                                        alt="..."
                                    />
                                    <div className="flex-auto my-auto text-black dark:text-white hover:text-white relative">Profile</div>
                            </div>
                    </Link>
                    <Link to={"/logout"} className="dark:hover:bg-gray-500 hover:bg-black hover:text-white text-black rounded">
                            <div className="flex gap-5 justify-between p-3.5 mt-2 rounded-[50px] text-zinc-300 items-center">
                                    <SlLogout />
                                    <div className="flex-auto my-auto text-black dark:text-white hover:text-white relative">Logout</div>
                            </div>
                    </Link>
                    <Link to={"/"}
                          className="justify-center items-center px-16 py-5 my-4 text-lg text-white bg-sky-500 rounded-[52px]">
                            <span className={"flex justify-center w-full relative text-center"}>Post</span>
                    </Link>
                    <Link to={"/profile/"+user?.username}>
                            <div
                                className="flex gap-3 justify-between items-center p-3 mt-10 text-base bg-black rounded-[64px]">
                                    <img
                                        loading="lazy"
                                        src={user?.preferences?.profile_picture ? user?.preferences?.profile_picture : "https://thispersondoesnotexist.com"}
                                        className="self-stretch w-10 aspect-square rounded-full"
                                        alt="..."
                                    />
                                    <div className="flex flex-col flex-1 self-stretch my-auto">
                                            <div className="flex gap-0.5 justify-between text-zinc-300">
                                                    <div className="grow">{user?.firstname + ' ' + user?.lastname}</div>
                                                    <img
                                                        loading="lazy"
                                                        src="https://cdn.builder.io/api/v1/image/assets/TEMP/0973d46f336574917f84bd389e0e04ed007ffd4ee4d6b6fb1745d87de7d23df7?"
                                                        className="w-5 aspect-square rounded-full"
                                                        alt="..."
                                                    />
                                            </div>
                                            <div className="z-10 text-gray-500">@{user?.username}</div>
                                    </div>
                            </div>
                    </Link>
            </div>
  );
}
