import React, {useEffect, useState} from "react";
import TNYT from "../assets/images/TNYT.png";
import twitter from "../assets/images/twitter.png";
import CNN from "../assets/images/CNN.png";
import {useQuery, QueryClient, useMutation} from "@tanstack/react-query";
import axios from 'axios';
import {Link} from "react-router-dom";
import {Modal} from "@mui/material";
import Box from "@mui/material/Box";
import {toast} from "react-toastify";

export default function RightSidebar() {
        const [searchModalIsOpen, setSearchModalIsOpen] = useState(false);
        const [search, setSearch] = useState('');
        const [hashtags, setHashtags] = useState([]);
        const queryClient = new QueryClient();

        const fetchHashtag = async () => {
                return await axios.get('/tweet/hashtag/getAllHashtag.php?limit=5')
                    .then(response => {
                            return response.data.hashtags;
                    });
        }

        const fetchLatestUser = async () => {
                return await axios.get('/users/GetAll.php?limit=5')
                    .then(response => {
                            return response.data;
                    });
        }

        const {data: hashtagData, isLoading: hashtagLoading, isError: hashtagError, status} = useQuery({
                queryKey: ['latest-hashtag'],
                queryFn: fetchHashtag
        });

        const {data: latestUserData, isLoading: latestUserLoading, isError: latestUserError, status: userStatus} = useQuery({
                queryKey: ['latest-user'],
                queryFn: fetchLatestUser
        });

        const handleClickInput = () => {
                // this will be open the search modal for the twitter project.
                setSearchModalIsOpen(!searchModalIsOpen);
        }

        const handleClose = () => {
                setSearchModalIsOpen(false);
        }

        const style = {
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: 800,
                bgcolor: 'background.paper',
                border: '2px solid #000',
                boxShadow: 24,
                p: 4,
                borderRadius: 2,
        };

        const fetchSearch = async () => {
                return await axios.get('/tweet/hashtag/getAllHashtag.php?hashtag=%23' + search)
                    .then(response => {
                            return response.data;
                    });
        }

        const {searchData} = useQuery({
                queryKey: ['search'],
                queryFn: fetchSearch
        }, queryClient)

        const mutate = useMutation({
                mutationFn: fetchSearch,
                mutationKey: ['search'],
                onSuccess: (data) => {
                        // The mutation was successful!
                        // Optionally return a context containing data to use when the query succeeds
                        setHashtags(data.hashtags);
                        const result = document.getElementById('result');
                        result.innerText = data.count;

                        const resultFromServer = document.getElementById('result-from-server');
                        resultFromServer.innerHTML = '';

                        data.hashtags.map((hashtag) => {
                                const div = document.createElement('div');
                                div.innerHTML = `<a href="/explore/${hashtag.name.replace('#', '')}" class="text-blue-500">${hashtag.name}</a>`;
                                resultFromServer.appendChild(div);
                        })

                        return data;
                },
                onError: () => {
                        toast.error('Error while fetching hashtags from server');
                },
        })

        useEffect(() => {
                // bounce search request from client to server.
                if (search.length > 0) {
                        setTimeout(() => {
                                mutate.mutate();
                        }, 500) // each 500 ms we will send a request to the server this will prevent overcharge of server.
                }
        }, [search]);

        return (
                    <div className="flex flex-col pt-1.5 pl-2.5 pr-2.5 pb-12 dark:bg-black max-w-[480px] h-full">
                            <div
                                className="flex gap-3 justify-between text-base dark:text-gray-500 dark:bg-neutral-800 rounded border p-1">
                                    <img
                                        loading="lazy"
                                        src="https://cdn.builder.io/api/v1/image/assets/TEMP/e2f9e9c3d2c79ece99b4757ae39f039e76dac4f8011aafac4465030bacd08671?"
                                        className="aspect-square w-[42px] rounded-full"
                                        alt="..."/>
                                    <input className="flex-auto my-auto relative p-4 rounded dark:bg-dark" onClick={handleClickInput} name={"search"} placeholder={"Search tags in Twitter"} />
                            </div>
                            <div className="flex gap-5 justify-between py-3.5 pl-4 mt-3 dark:bg-neutral-800 rounded mb-1">
                                    <div className="flex-auto text-xl font-bold text-black dark:text-zinc-300">
                                            Latest HashTags
                                    </div>
                            </div>
                            {status === 'success' ? hashtagData?.map((hashtag) => {
                                    return (
                                        <Link
                                            to={'/explore/' + hashtag.name.replace('#', '')}
                                            key={hashtag.id}
                                            className="flex gap-0 justify-between dark:bg-neutral-800 rounded mb-1">
                                                <div
                                                    className="flex flex-col flex-1 items-start py-3 pr-20 pl-4 text-sm text-gray-500">
                                                        <div className="whitespace-nowrap">Trending in French
                                                        </div>
                                                        <div
                                                            className="mt-1 text-base font-bold dark:text-zinc-300 text-blue-500">{hashtag.name}
                                                        </div>
                                                        <div className="mt-1">{parseInt(Math.random() * 2000)} Tweets</div>
                                                </div>
                                        </Link>
                                    )
                            }) : <>
                                    <div className="flex gap-0 justify-between dark:bg-neutral-800 rounded mb-1">
                                            <div
                                                className="flex flex-col flex-1 items-start py-3 pr-20 pl-4 text-sm text-gray-500">
                                                    <div className="whitespace-nowrap">Trending in French</div>
                                                    <div
                                                        className="mt-1 text-base font-bold dark:text-zinc-300 text-blue-500">#SQUID
                                                    </div>
                                                    <div className="mt-1">2,066 Tweets</div>
                                            </div>
                                    </div>
                                    <div className="flex gap-0 justify-between dark:bg-neutral-800 rounded mb-1">
                                            <div
                                                className="flex flex-col flex-1 items-start py-3 pr-20 pl-4 text-sm text-gray-500">
                                                    <div className="whitespace-nowrap">Trending in French</div>
                                                    <div
                                                        className="mt-1 text-base font-bold dark:text-zinc-300 text-blue-500">#SQUID
                                                    </div>
                                                    <div className="mt-1">2,066 Tweets</div>
                                            </div>
                                    </div>
                                    <div className="flex gap-0 justify-between dark:bg-neutral-800 rounded mb-1">
                                            <div
                                                className="flex flex-col flex-1 items-start py-3 pr-20 pl-4 text-sm text-gray-500">
                                                    <div className="whitespace-nowrap">Trending in French</div>
                                                    <div
                                                        className="mt-1 text-base font-bold dark:text-zinc-300 text-blue-500">#SQUID
                                                    </div>
                                                    <div className="mt-1">2,066 Tweets</div>
                                            </div>
                                    </div>
                                    <div className="flex gap-0 justify-between dark:bg-neutral-800 rounded mb-1">
                                            <div
                                                className="flex flex-col flex-1 items-start py-3 pr-20 pl-4 text-sm text-gray-500">
                                                    <div className="whitespace-nowrap">Trending in French</div>
                                                    <div
                                                        className="mt-1 text-base font-bold dark:text-zinc-300 text-blue-500">#SQUID
                                                    </div>
                                                    <div className="mt-1">2,066 Tweets</div>
                                            </div>
                                    </div>
                                    <div
                                        className="justify-center items-start py-4 pr-16 pl-4 text-base font-bold text-sky-500 whitespace-nowrap dark:bg-neutral-800 rounded mb-1">
                                            Show more
                                    </div>
                            </>}
                            <div
                                className="justify-center items-start py-3 pr-16 pl-4 mt-4 text-xl font-bold text-black whitespace-nowrap dark:bg-neutral-800 dark:text-zinc-300 rounded mb-1">
                                    Who to follow
                            </div>
                            {userStatus === 'success' ? latestUserData?.map((user) => {
                                    return (
                                        <Link
                                            to={'/profile/' + user.username}
                                            key={user.id}
                                            className="flex gap-3.5 justify-center px-4 py-3 whitespace-nowrap dark:bg-neutral-800 rounded mb-1">
                                                <img
                                                    loading="lazy"
                                                    src={user.profile_picture ?? "https://thispersondoesnotexist.com"}
                                                    className="w-12 object-fill rounded-full"
                                                    alt="..."
                                                />
                                                <div className="flex flex-col flex-1 py-1.5 text-base">
                                                        <div
                                                            className="flex gap-1 justify-between dark:text-zinc-300 text-zinc-500">
                                                                <div className="grow">{user.firstname} {user.lastname}</div>
                                                                <img
                                                                    loading="lazy"
                                                                    src="https://cdn.builder.io/api/v1/image/assets/TEMP/d13be9df60e3200f77ea5439d1e0dffb8bad7c821c0fd8f0569683f291f7547c?"
                                                                    className="w-5 aspect-square rounded-full"
                                                                    alt="..."
                                                                />
                                                        </div>
                                                        <div className="font-light text-gray-500">@{user.username}</div>
                                                </div>
                                        </Link>
                                    )
                            }) : <>
                                    <div
                                        className="flex gap-3.5 justify-center px-4 py-3 whitespace-nowrap dark:bg-neutral-800 rounded mb-1">
                                            <img
                                                loading="lazy"
                                                src={TNYT}
                                                className="w-12 aspect-square rounded-full"
                                                alt="..."
                                            />
                                            <div className="flex flex-col flex-1 py-1.5 text-base">
                                                    <div
                                                        className="flex gap-1 justify-between dark:text-zinc-300 text-zinc-500">
                                                            <div className="grow">The New York Times</div>
                                                            <img
                                                                loading="lazy"
                                                                src="https://cdn.builder.io/api/v1/image/assets/TEMP/d13be9df60e3200f77ea5439d1e0dffb8bad7c821c0fd8f0569683f291f7547c?"
                                                                className="w-5 aspect-square rounded-full"
                                                                alt="..."
                                                            />
                                                    </div>
                                                    <div className="font-light text-gray-500">@nytimes</div>
                                            </div>
                                            <div
                                                className="justify-center px-4 py-2 my-auto text-sm bg-gray-100 aspect-[2.35] rounded-[32px] text-neutral-900">
                                                    Follow
                                            </div>
                                    </div>
                                    <div
                                        className="flex gap-5 justify-between px-4 py-3 w-full whitespace-nowrap dark:bg-neutral-800 rounded mb-1">

                                            <div className="flex gap-3 justify-between text-base">
                                                    <img
                                                        loading="lazy"
                                                        src={CNN} alt="..."
                                                        className="w-12 aspect-square rounded-full"
                                                    />
                                                    <div className="flex flex-col flex-1 py-1.5">
                                                            <div
                                                                className="flex gap-1 justify-between dark:text-zinc-300 text-zinc-5000">
                                                                    <div className="grow">CNN</div>
                                                                    <img
                                                                        loading="lazy"
                                                                        src="https://cdn.builder.io/api/v1/image/assets/TEMP/d13be9df60e3200f77ea5439d1e0dffb8bad7c821c0fd8f0569683f291f7547c?"
                                                                        className="w-5 aspect-square rounded-full"
                                                                        alt="..."
                                                                    />
                                                            </div>
                                                            <div className="font-light text-gray-500">@CNN</div>
                                                    </div>
                                            </div>
                                            <div
                                                className="justify-center px-4 py-2 my-auto text-sm bg-gray-100 aspect-[2.35] rounded-[32px] text-neutral-900">
                                                    Follow
                                            </div>
                                    </div>
                                    <div
                                        className="flex gap-5 justify-between px-4 py-3 w-full whitespace-nowrap dark:bg-neutral-800 rounded mb-1">
                                            <div className="flex gap-3 justify-between text-base">
                                                    <img
                                                        loading="lazy"
                                                        src={twitter} alt="..."
                                                        className="w-10 h-10 rounded-full"
                                                    />
                                                    <div className="flex flex-col flex-1 py-1.5">
                                                            <div
                                                                className="flex gap-1 justify-between dark:text-zinc-300 text-zinc-500">
                                                                    <div className="grow">Twitter</div>
                                                                    <img
                                                                        loading="lazy"
                                                                        src="https://cdn.builder.io/api/v1/image/assets/TEMP/d13be9df60e3200f77ea5439d1e0dffb8bad7c821c0fd8f0569683f291f7547c?"
                                                                        className="w-5 aspect-square rounded-full"
                                                                        alt="..."
                                                                    />
                                                            </div>
                                                            <div className="font-light text-gray-500">@Twitter</div>
                                                    </div>
                                            </div>
                                            <div
                                                className="justify-center px-4 py-2 my-auto text-sm bg-gray-100 aspect-[2.35] rounded-[32px] text-neutral-900">
                                                    Follow
                                            </div>
                                    </div>
                                    <div
                                        className="justify-center items-start py-4 pr-16 pl-4 text-base font-bold text-sky-500 whitespace-nowrap dark:bg-neutral-800 rounded mb-1">
                                            Show more
                                    </div>
                            </>}
                            <Modal
                                open={searchModalIsOpen}
                                onClose={handleClose}
                                aria-labelledby="modal-modal-title"
                                aria-describedby="modal-modal-description"
                            >
                                    <Box sx={style}>
                                                <h2 className={'mb-3 mt-0 font-extrabold text-xl'}>Search any tags in twitter</h2>
                                                <div>
                                                        <input className={'border mt-0.5 mb-2 py-4 px-4 w-full rounded'}
                                                               value={search}
                                                               placeholder={'Search in Twitter'}
                                                               onChange={e => setSearch(e.target.value)} />
                                                </div>
                                                <div className={'flex items-center justify-between gap-1 text-sm font-bold'}>
                                                        <span>Number of result:</span>
                                                        <span id={"result"}>0</span>
                                                </div>
                                            <div className={'mt-3'}>
                                                    <div id={'result-from-server'}>

                                                    </div>
                                            </div>
                                    </Box>
                            </Modal>
                    </div>
        );
}