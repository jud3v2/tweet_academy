import React, {useState, useEffect} from "react";
import {toast} from 'react-toastify';
import {QueryClient, useQuery, useMutation} from "@tanstack/react-query";
import axios from "axios";
import Skeleton from '@mui/material/Skeleton';
import TweetBox from "src/components/TweetBox/index.jsx";
import {useNavigate} from "react-router-dom";

export default function Home() {
        const user = JSON.parse(localStorage.getItem('twitter_user'));

        const [tweets, setTweets] = useState([]);
        const [message, setMessage] = useState('');
        const [charsCountReverse, setCharsCountRevers] = useState(140);
        const [file, setFile] = useState(null);
        const [countSuggestion, setCountSuggestion] = useState(0);
        const [previousSuggestion, setPreviousSuggestion] = useState([]);

        const queryClient = new QueryClient();

        const handleChange = event => {
                const message = event.target.value;
                if (message.length <= 140) {
                        setMessage(event.target.value);
                        setCharsCountRevers(140 - message.length);
                }
        }

        const reset = () => {
                setMessage('');
                setCharsCountRevers(140);
        }

        const createTweet = async () => {
                if (!file) {
                        const body = {
                                user_id: user.id,
                                message
                        }
                        return await axios.post('/tweet/CreateTweet.php', body)
                } else {
                        const formData = new FormData();
                        formData.append('file', file);
                        formData.append('user_id', user.id);
                        formData.append('message', message);

                        return await axios.post('/tweet/CreateTweet.php', formData, {
                                headers: {
                                        'Content-Type': 'multipart/form-data'
                                }
                        }).then(() => {
                                setFile(null);
                                const showImages = document.getElementById('showImages');
                                showImages.src = "https://cdn.builder.io/api/v1/image/assets/TEMP/aca51493763757267654a6367ebf784b55668827fd063e8d5bec3050593e8044?";
                        });
                }
        }

        const fetchTweet = async () => {
                return await axios.get('/tweet/GetTweets.php?parameter=all')
                    .then(response => response.data)
                    .then(data => data);
        }

        const revalidateTweets = async () => {
                const tweetsWithNewTweet = await fetchTweet();
                await queryClient.invalidateQueries({queryKey: ['tweets']});
                queryClient.setQueriesData({queryKey: ['tweets']}, tweetsWithNewTweet);
                setTweets([...tweetsWithNewTweet]);
        }

        const mutateOnPushTweet = useMutation({
                mutationFn: createTweet,
                onSuccess: async () => {
                        // Live update of the tweets
                        reset();
                        toast.dismiss();
                        toast.success("Your tweet has been sent successfully.");
                        await revalidateTweets();
                },
                onError: () => {
                        reset();
                        toast.error("Error while sending your tweet, try later...");
                }
        });

        const pushTweet = async (event) => {
                event.preventDefault();
                if (message.length > 0) {
                        const toastId = toast.loading("Sending your tweet...", {autoClose: false});
                        await mutateOnPushTweet.mutate(toastId);
                } else {
                        toast.error("You can't send empty tweet.")
                }
        }

        const {data, status} = useQuery({
                queryKey: ['tweets'],
                queryFn: fetchTweet,
                config: {
                        refetchOnWindowFocus: true,
                        refetchOnMount: true,
                        refetchOnReconnect: true,
                        refetchIntervalInBackground: 10,
                        networkMode: 'online',
                        staleTime: 5 // 5 minutes avant expiration de la requete,
                }
        });

        useEffect(() => {
                if (status === "success") {
                        setTweets([...data]);
                }
        }, [status, data])

        // automatically refresh the tweets every 2 minutes
        useEffect(() => {
                const interval = setInterval(async () => {
                        await revalidateTweets();
                }, 5 * 1000); //5 secondes
                return () => clearInterval(interval);
        }, [tweets])

        const showFileExplorer = () => {
                const fileExplorer = document.getElementById('fileExplorer');
                fileExplorer.click();
        }

        const handleChangeFiles = (event) => {
                event.preventDefault();
                const showImages = document.getElementById('showImages');
                showImages.src = URL.createObjectURL(event.target.files[0]);
                setFile(event.target.files[0]);
        }

        useEffect(() => {
                (async () => await handleSuggestion())();
        }, [message])

        const fetchUsersByUsername = async username => {
                return await axios.get(`/users/GetListByUsername.php?username=${username}`)
                    .then(response => response.data)
                    .then(data => data);
        }

        // TODO FIX LE BUG DES SUGGESTIONS QUI VIENNENT DEUX FOIS
        const handleSuggestion = async () => {
                // 1. Create Suggestion Element and Container (Improved Efficiency)
                const suggestionBox = document.getElementById('add-suggestion');
                if (!suggestionBox) return; // Handle missing element gracefully

                // 2. Check for Minimum Message Length and Presence of "@" Symbol
                if (message.length <= 1 || !message.includes('@')) {
                        suggestionBox.innerHTML = ''; // Clear suggestions if not applicable
                        return;
                }

                // 3. Extract Usernames with Regular Expression (Enhanced Accuracy)
                const usernames = message.match(/\B@\w+/g) || []; // Match @-separated words
                const uniqueUsernames = new Set(usernames); // Remove duplicates efficiently

                // 4. Clear Previous Suggestions and Initialize Empty Array (Clearer State Management)
                suggestionBox.innerHTML = '';
                const previousSuggestion = []; // Initialize empty array for tracking

                // 5. Fetch Users and Create Suggestions (Optimized and Refactored with Filtering)
                for (const username of uniqueUsernames) {
                        if (!previousSuggestion.includes(username)) {
                                try {
                                        const users = await fetchUsersByUsername(username.replace('@', '')); // Fetch users by username
                                        if (await users.length > 0) {
                                                // Filter unique users (not already suggested)
                                                const filteredUsers = await users.filter(user => !previousSuggestion.includes(user.username));

                                                filteredUsers.forEach(user => {
                                                        const suggestionItem = createSuggestionItem(username, user);
                                                        suggestionBox.appendChild(suggestionItem);
                                                        // prevent same user to be suggested
                                                        suggestionBox.childNodes.forEach((child) => {
                                                                //c normal faut changer ici pour le bug des suggestions qui viennent deux fois
                                                                if (child.childNodes[1].childNodes[1].innerText === user.username) {
                                                                        child.remove();
                                                                }
                                                        });
                                                        setPreviousSuggestion([...previousSuggestion, user.username]); // Track suggested usernames
                                                });
                                        } else {
                                                suggestionBox.innerHTML = "No users matching your search.";
                                        }
                                } catch (error) {
                                        console.error("Error fetching users:", error); // Handle fetch errors gracefully
                                        suggestionBox.innerHTML = "An error occurred while fetching suggestions.";
                                }
                        }
                }
        };

        const navigate = useNavigate();

        useEffect(() => {
                if(!user || !user.preferences) {
                        //navigate('/login');
                }
        }, [user])

// Helper Function to Create Suggestion Item (Improved Reusability and Readability)
        const createSuggestionItem = (username, user) => {
                const div = document.createElement('div');
                div.className = "flex gap-1 items-center cursor-pointer";
                div.innerHTML = `
    <div>
      <img
        loading="lazy"
        src="${user?.profile_picture ? user.profile_picture : "https://thispersondoesnotexist.com"}"
        class="w-8 aspect-square rounded-full"
        alt="${user.username}"
      />
    </div>
    <div>
      <p>${user.username}</p>
    </div>
  `;
                div.onclick = () => {
                        setMessage(message.replace(`${username}`, `@${user.username} `));
                        setCountSuggestion(countSuggestion + 1); // Assuming countSuggestion exists
                        const userIndex = previousSuggestion.indexOf(user.username);
                        if (userIndex !== -1) {
                                previousSuggestion.splice(userIndex, 1); // Remove user from suggestions
                        }
                };
                return div;
        }

        if (status === 'pending') {
                return (
                    <div className="flex gap-0 pr-20 dark:dark:bg-black max-md:flex-wrap max-md:pr-5">
                            <div className="flex flex-col w-full max-md:max-w-full">
                                    <div
                                        className="flex flex-col pt-2.5 w-full text-xl font-bold text-dark dark:text-white whitespace-nowrap dark:bg-black max-md:max-w-full">
                                            <div
                                                className="flex gap-5 justify-between px-px mx-4 max-md:flex-wrap max-md:mr-2.5 max-md:max-w-full">
                                                    <div className="my-auto text-dark">Home</div>
                                                    <img
                                                        alt={""}
                                                        loading="lazy"
                                                        src="https://cdn.builder.io/api/v1/image/assets/TEMP/aa1257bccfd61876083da12bad5ea69dcfc757d26aa971bceb71e9b4319d57a9?"
                                                        className="aspect-square w-[34px] rounded-full"
                                                    />
                                            </div>
                                            <div className="mt-2.5 w-full bg-zinc-800 min-h-[1px] max-md:max-w-full"/>
                                    </div>
                                    <div
                                        className="flex flex-col py-0.5 w-full whitespace-nowrap dark:bg-black max-md:max-w-full">
                                            <div className="flex flex-col px-4 w-full max-md:max-w-full">
                                                    <div className={'flex items-center gap-4'}>
                                                            <img
                                                                loading="lazy"
                                                                src={user.preferences?.profile_picture ? user.preferences?.profile_picture : "https://thispersondoesnotexist.com"}
                                                                className="w-12 aspect-square rounded-full"
                                                                alt={""}
                                                            />
                                                            <div className={'flex items-center gap-1'}>
                                                                    <div
                                                                        className="grow font-bold dark:text-white text-zinc-500">@{user?.username}
                                                                    </div>
                                                                    <img
                                                                        loading="lazy"
                                                                        src="https://cdn.builder.io/api/v1/image/assets/TEMP/c76d421b98389240b8d68a201a5f96df23b9599e475feadcaa5b29e12ddf7f81?"
                                                                        className="w-5 aspect-square"
                                                                        alt={""}
                                                                    />
                                                            </div>
                                                    </div>
                                                    <div className="flex gap-3 self-start text-xl text-gray-500 mt-3">
                                                            <form action="#">
                                                                    <label htmlFor="message">
                                                                    <textarea name="message"
                                                                              onChange={handleChange}
                                                                              value={message}
                                                                              placeholder="What's happening?"
                                                                              className={"block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"}
                                                                              id="message" cols="10000"
                                                                              rows="3"></textarea>
                                                                    </label>
                                                                    <div
                                                                        className={'flex items-center justify-between'}>
                                                                            <div
                                                                                className="flex gap-5 justify-between self-center px-0.5 pt-3 mt-4 w-full text-base font-bold text-white dark:bg-black max-w-[520px] max-md:flex-wrap max-md:max-w-full">
                                                                                    <img
                                                                                        loading="lazy"
                                                                                        src="https://cdn.builder.io/api/v1/image/assets/TEMP/aca51493763757267654a6367ebf784b55668827fd063e8d5bec3050593e8044?"
                                                                                        className="self-start max-w-full aspect-[5] w-[170px]"
                                                                                        alt={""}
                                                                                    />
                                                                            </div>
                                                                            <div
                                                                                className={"flex gap-5 justify-between self-center px-0.5 pt-3 mt-4 w-full text-base font-bold text-white dark:bg-black max-w-[520px] max-md:flex-wrap max-md:max-w-full"}>
                                                                                    <button
                                                                                        onClick={pushTweet}
                                                                                        className="justify-center px-4 py-2.5 bg-sky-500 rounded-[36px] mb-3">
                                                                                            Tweet
                                                                                    </button>
                                                                            </div>
                                                                    </div>

                                                                    <div
                                                                        className={"flex justify-between items-center"}>
                                                                            <div></div>
                                                                            <div>
                                                                                    <p className={"text-sm"}>{charsCountReverse} Chars left.</p>
                                                                            </div>
                                                                    </div>
                                                            </form>
                                                    </div>
                                            </div>
                                            <div className="w-full bg-zinc-800 min-h-[1px] max-md:max-w-full"/>
                                    </div>
                                    <div className="flex gap-0 justify-between max-md:flex-wrap max-md:max-w-full">
                                            <div className="flex flex-col w-full max-md:max-w-full">
                                                    <div
                                                        className="flex gap-3 justify-between px-4 py-3 text-base font-light dark:bg-black max-md:flex-wrap max-md:max-w-full">
                                                            <img
                                                                loading="lazy"
                                                                src={user.preferences?.profile_picture ?  user.preferences?.profile_picture : "https://thispersondoesnotexist.com"}
                                                                className="self-start w-12 aspect-square rounded-full"
                                                                alt={"..."}
                                                            />
                                                            <div className="flex flex-col flex-1 max-md:max-w-full">
                                                                    <div
                                                                        className="flex gap-1 self-start whitespace-nowrap">
                                                                            <div
                                                                                className="flex gap-0.5 justify-between font-bold dark:dark:text-zinc-300 text-zinc-600">
                                                                                    <div className="grow"><Skeleton
                                                                                        sx={{bgcolor: 'grey.900'}}
                                                                                        animation={"wave"} width={100}/>
                                                                                    </div>
                                                                                    <img
                                                                                        loading="lazy"
                                                                                        src="https://cdn.builder.io/api/v1/image/assets/TEMP/c76d421b98389240b8d68a201a5f96df23b9599e475feadcaa5b29e12ddf7f81?"
                                                                                        className="w-5 aspect-square"
                                                                                        alt={""}
                                                                                    />
                                                                            </div>
                                                                            <div><Skeleton sx={{bgcolor: 'grey.900'}}
                                                                                           animation={"wave"}
                                                                                           width={100}/></div>
                                                                            <div>.</div>
                                                                            <div className="grow"><Skeleton
                                                                                sx={{bgcolor: 'grey.900'}}
                                                                                animation={"wave"} width={50}/></div>
                                                                    </div>
                                                                    <div
                                                                        className="mt-1.5 dark:dark:text-zinc-300 text-zinc-600 max-md:max-w-full">
                                                                            <Skeleton sx={{bgcolor: 'grey.900'}}
                                                                                      animation={"wave"}
                                                                                      variant={"text"}/>
                                                                            <Skeleton sx={{bgcolor: 'grey.900'}}
                                                                                      animation={"wave"}
                                                                                      variant={"text"}/>
                                                                            <Skeleton sx={{bgcolor: 'grey.900'}}
                                                                                      animation={"wave"}
                                                                                      variant={"text"}/>
                                                                            <Skeleton sx={{bgcolor: 'grey.900'}}
                                                                                      animation={"wave"}
                                                                                      variant={"text"}/>
                                                                    </div>
                                                                    <div
                                                                        className="flex gap-5 justify-between pr-14 mt-3 w-full text-sm text-gray-500 whitespace-nowrap max-md:flex-wrap max-md:pr-5 max-md:max-w-full">
                                                                            <div
                                                                                className="flex gap-0 justify-between px-px dark:bg-black">
                                                                                    <img
                                                                                        loading="lazy"
                                                                                        src="https://cdn.builder.io/api/v1/image/assets/TEMP/14d255f91d6f870810109c552bb10fae564a731d0a54087367bd8cfe7027f95c?"
                                                                                        className="aspect-square w-[34px]"
                                                                                        alt={""}
                                                                                    />
                                                                                    <div
                                                                                        className="justify-center px-3 my-auto dark:bg-black aspect-[2.5]">
                                                                                            57
                                                                                    </div>
                                                                            </div>
                                                                            <div
                                                                                className="flex gap-0 justify-between dark:bg-black">
                                                                                    <img
                                                                                        loading="lazy"
                                                                                        src="https://cdn.builder.io/api/v1/image/assets/TEMP/66dc36e4a86975b47f21a4c7ff6bdecd2812f756bf292fdedf2ab3a76ee1e25f?"
                                                                                        className="aspect-square w-[34px]"
                                                                                        alt={""}

                                                                                    />
                                                                                    <div
                                                                                        className="justify-center px-3 my-auto dark:bg-black aspect-[2.94]">
                                                                                            144
                                                                                    </div>
                                                                            </div>
                                                                            <div
                                                                                className="flex gap-0 justify-between dark:bg-black">
                                                                                    <img
                                                                                        loading="lazy"
                                                                                        src="https://cdn.builder.io/api/v1/image/assets/TEMP/863e71144182e1d2c977f5c69c42d1058ce5ba1c6898288ca0e22431215afc2f?"
                                                                                        className="aspect-square w-[34px]"
                                                                                        alt={""}

                                                                                    />
                                                                                    <div
                                                                                        className="justify-center px-3 my-auto dark:bg-black aspect-[2.94]">
                                                                                            184
                                                                                    </div>
                                                                            </div>
                                                                            <img
                                                                                loading="lazy"
                                                                                src="https://cdn.builder.io/api/v1/image/assets/TEMP/4ff5f0c33126ae389b02c14b1a92736231be91be2a07007bd4c53a0319e19adf?"
                                                                                className="self-start w-12 aspect-square rounded-full"
                                                                                alt={""}

                                                                            />
                                                                    </div>
                                                            </div>
                                                    </div>
                                            </div>
                                    </div>
                            </div>
                    </div>
                );
        } else if (status === 'error') {
                return (
                    <div>
                            <h1>Error while fetching tweets</h1>
                    </div>
                )
        } else {
                return (
                    <div className="flex gap-0 pr-20 dark:dark:bg-black max-md:flex-wrap max-md:pr-5">
                            <div className="flex flex-col w-full max-md:max-w-full">
                                    <div
                                        className="flex flex-col pt-2.5 w-full text-xl font-bold text-dark dark:text-white whitespace-nowrap dark:bg-black max-md:max-w-full">
                                            <div
                                                className="flex gap-5 justify-between px-px mx-4 max-md:flex-wrap max-md:mr-2.5 max-md:max-w-full">
                                                    <div className="my-auto text-dark">Home</div>
                                                    <img
                                                        alt={""}
                                                        loading="lazy"
                                                        src="https://cdn.builder.io/api/v1/image/assets/TEMP/aa1257bccfd61876083da12bad5ea69dcfc757d26aa971bceb71e9b4319d57a9?"
                                                        className="aspect-square w-[34px] rounded-full"
                                                    />
                                            </div>
                                            <div className="mt-2.5 w-full bg-zinc-800 min-h-[1px] max-md:max-w-full"/>
                                    </div>
                                    <div
                                        className="flex flex-col py-0.5 w-full whitespace-nowrap dark:bg-black max-md:max-w-full">
                                            <div className="flex flex-col px-4 w-full max-md:max-w-full">
                                                    <div className={'flex items-center gap-4'}>
                                                            <img
                                                                loading="lazy"
                                                                src={user.preferences?.profile_picture ? user.preferences?.profile_picture : "https://thispersondoesnotexist.com"}
                                                                className="w-12 aspect-square rounded-full"
                                                                alt={""}
                                                            />
                                                            <div className={'flex items-center gap-1'}>
                                                                    <div
                                                                        className="grow font-bold dark:text-white text-zinc-500">@{user?.username}
                                                                    </div>
                                                                    <img
                                                                        loading="lazy"
                                                                        src="https://cdn.builder.io/api/v1/image/assets/TEMP/c76d421b98389240b8d68a201a5f96df23b9599e475feadcaa5b29e12ddf7f81?"
                                                                        className="w-5 aspect-square"
                                                                        alt={""}
                                                                    />
                                                            </div>
                                                    </div>
                                                    <div
                                                        className="flex gap-3 self-start text-xl dark:text-white-500 text-gray-500 mt-3">
                                                            <form action="#">
                                                                    <label htmlFor="message">
                                                                    <textarea name="message"
                                                                              onChange={handleChange}
                                                                              value={message}
                                                                              placeholder="What's happening?"
                                                                              className={"block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"}
                                                                              id="message" cols="10000"
                                                                              rows="3"></textarea>
                                                                    </label>
                                                                    <div
                                                                        className={'flex items-center justify-between'}>
                                                                            <div
                                                                                className="flex cursor-pointer gap-5 justify-between self-center px-0.5 pt-3 mt-4 w-full text-base font-bold text-white dark:bg-black max-w-[520px] max-md:flex-wrap max-md:max-w-full">
                                                                                    <img
                                                                                        loading="lazy"
                                                                                        onClick={showFileExplorer}
                                                                                        id={"showImages"}
                                                                                        src="https://cdn.builder.io/api/v1/image/assets/TEMP/aca51493763757267654a6367ebf784b55668827fd063e8d5bec3050593e8044?"
                                                                                        className="self-start rounded  w-auto"
                                                                                        alt={""}
                                                                                    />
                                                                                    <input type="file"
                                                                                           className={"hidden"}
                                                                                           id={"fileExplorer"}
                                                                                           onChange={handleChangeFiles}
                                                                                           accept="image/x-png,image/jpeg,image/webp,image/png,image/gif"/>
                                                                            </div>
                                                                            <div
                                                                                className={"flex gap-5 float-right self-center px-0.5 pt-3 mt-4 w-full text-base font-bold text-white dark:bg-black max-w-[520px] max-md:flex-wrap max-md:max-w-full"}>
                                                                                    <button
                                                                                        onClick={pushTweet}
                                                                                        className="justify-center px-4 py-2.5 bg-sky-500 rounded-[36px] mb-3">
                                                                                            Tweet
                                                                                    </button>
                                                                            </div>
                                                                    </div>
                                                                    <div
                                                                        className={"flex justify-between items-center"}>
                                                                            <div></div>
                                                                            <div>
                                                                                    <p className={"text-sm"}>{charsCountReverse} Caractère(s)
                                                                                            restant(s)</p>
                                                                            </div>
                                                                    </div>
                                                            </form>
                                                    </div>
                                            </div>
                                            <div className="w-full bg-zinc-800 min-h-[1px] max-md:max-w-full"/>
                                    </div>
                                    <div id={'add-suggestion'}></div>
                                    {tweets?.map((tweet, index) => {
                                            // TODO NE PLUS TOUCHER CETTE LIGNE !!!
                                            return <TweetBox tweet={tweet} key={'tweet-' + index + 'id_' + tweet.id} user={user}/>
                                    })}
                            </div>
                    </div>
                );
        }
}