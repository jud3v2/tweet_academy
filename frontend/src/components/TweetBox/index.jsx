import * as React from "react";
import Parser from "html-react-parser";
import dayjs from "dayjs";
import {FaRegHeart} from "react-icons/fa6";
import {FaRetweet} from "react-icons/fa6";
import {FaRegComment} from "react-icons/fa6";
import {Link} from "react-router-dom";
import PropTypes from 'prop-types';
import { BsThreeDots } from "react-icons/bs";
import axios from "axios";
import {useState} from "react";
import { toast } from 'react-toastify';
import {useQuery, QueryClient} from '@tanstack/react-query';

const Tweet = ({tweet}) => {

        const HASHTAG_FORMATTER = string => {
                return string?.replace(/(^|\s)(#[a-z\d-]+)/ig, (m, g1, g2) => {
                        return `<span class="text-blue-500">${g1}${g2}</span>`;
                });
        }
        const formatMention = string => {
                return string?.replace(/(^|\s)@([a-z\d-]+)/ig, (m, g1, g2) => {
                        return `<a href="/profile/${g2}" class="text-blue-400">@${g2} </a>`;
                });
        };

        return (
            <div>
                    {Parser(HASHTAG_FORMATTER(formatMention(tweet?.message)))}
            </div>
        );
};

export default function TweetBox(props) {
        const [isPopoverOpen, setIsPopoverOpen] = React.useState(false);
        const [isOnUpdate, setIsOnUpdate] = React.useState(false);
        const [tweet, setTweet] = React.useState(props.tweet);
        const [charsCountReverse, setCharsCountRevers] = useState(140);
        const queryClient = new QueryClient();
        function Popover() {
                return (
                    <div className="absolute right-0 top-0 bg-white border border-gray-200 dark:border-gray-700 dark:bg-black rounded">
                            <div className="flex flex-col">
                                    <button className="p-2 w-full text-left hover:bg-zinc-500 hover:text-white rounded clearfix" onClick={() => {
                                            if(tweet.user_id === props.user.id) {
                                                    setIsOnUpdate(true);
                                                    setIsPopoverOpen(false);
                                            } else {
                                                    setIsPopoverOpen(false);
                                                    toast.error('You are not allowed to update this tweet');
                                            }
                                    }}>Update Tweet</button>
                                    <button  className="p-2 w-full text-left hover:bg-zinc-500 hover:text-white rounded clearfix" onClick={(event) => {
                                            if(tweet.user_id === props.user.id) {
                                                    deleteTweet(event);
                                            } else {
                                                    toast.error('You are not the owner of this tweet');
                                            }
                                            setIsPopoverOpen(false);
                                    }}>Delete Tweet</button>
                            </div>
                    </div>
                );
        }

        const deleteTweet = event => {
                event.preventDefault();
                axios.get(`/tweet/DeletedTweet.php?tweet=${tweet.id}&user_id=${props.user.id}`)
                    .then(response => {
                            response.data
                            toast.success('Tweet deleted successfully');
                    })
                    .then(() => {
                            // this will prevent the tweet from being displayed and error while using the .remove() method
                            // i think this is called twice.
                            const el = document.getElementById("tweet-" + tweet.id)
                            if(el) {
                                    el.style.display = "none";
                            }
                    })
                    .catch(error => {
                            console.log(error);
                            toast.error('An error occurred while deleting the tweet');
                    })
        }

        const updateTweet = async (event) => {
                event.preventDefault();
                 await axios.post('/tweet/UpdateTweet.php', {
                        tweet: tweet.id,
                        message: tweet.message,
                        user_id: props.user.id
                })
                    .then(response => {
                            response.data
                            toast.success('Tweet updated successfully');
                    })
                    .then(() => {
                            setIsOnUpdate(false);
                    })
                     .catch(error => {
                        console.log(error);
                        toast.error('An error occurred while updating the tweet');
                })
        }

        const retweet = async (event) => {
                event.preventDefault();

                const body = {
                        user_id: props.user.id,
                        tweet_id: tweet.id
                }
                const promise =  axios.post('/retweet/Retweet.php', body);
                await toast.promise(promise, {
                        success: "Retweeted successfully",
                        error: "An error occurred while retweeting",
                        pending: "Retweeting..."
                })
                    .then(() => {
                            setTweet({
                                    ...tweet,
                                    retweet_count: tweet.retweet_count + 1
                            })
                    })
        }

        const like = async (event) => {

        }

        return (
            <div
                id={"tweet-" + tweet.id} key={tweet.id}
                className="flex gap-0 justify-between max-md:flex-wrap max-md:max-w-full">
                    <div className="flex flex-col w-full max-md:max-w-full">
                            <div
                                className="flex gap-3 justify-between px-4 py-3 text-base font-light dark:bg-black max-md:flex-wrap max-md:max-w-full">
                                    <img
                                        loading="lazy"
                                        src={tweet.profile_picture ? tweet.profile_picture : "https://thispersondoesnotexist.com"}
                                        className="self-start w-12 aspect-square rounded-full"
                                        alt={"..."}
                                    />
                                    <div
                                        className="flex flex-col flex-1 max-md:max-w-full">
                                            <div
                                                className="flex gap-1 self-start whitespace-nowrap relative justify-between items-center">
                                                    <div className={"flex items-center justify-between relative"}>
                                                            <div
                                                                className="flex gap-0.5 justify-between font-bold dark:dark:text-zinc-300 text-zinc-600">
                                                                    <Link to={"/profile/" + tweet?.username}
                                                                          className="grow">
                                                                            @{tweet?.username}
                                                                    </Link>
                                                                    <img
                                                                        loading="lazy"
                                                                        src="https://cdn.builder.io/api/v1/image/assets/TEMP/c76d421b98389240b8d68a201a5f96df23b9599e475feadcaa5b29e12ddf7f81?"
                                                                        className="w-5 aspect-square"
                                                                        alt={""}
                                                                    />
                                                                    <div className="grow">
                                                                            <p className={"font-bold dark:text-zinc-300 text-zinc-600"}>{dayjs(tweet?.created_at).format("DD MMM")}</p>
                                                                    </div>
                                                            </div>
                                                    </div>
                                                    <div className={"relative"} onClick={() => {
                                                            setIsPopoverOpen(!isPopoverOpen)
                                                            setCharsCountRevers(140 - tweet?.message.length);
                                                    }} onMouseLeave={() => setIsPopoverOpen(false)}>
                                                            <BsThreeDots/>
                                                            {isPopoverOpen && (<Popover/>)}
                                                    </div>
                                            </div>
                                            <div
                                                className="mt-1.5 dark:dark:text-zinc-300 text-zinc-600 max-md:max-w-full">
                                                    {isOnUpdate ? (
                                                        <div>
                                                                <form action="#">
                                                                        <label htmlFor="tweet">
                                                                                <input
                                                                                    className={"mb-2 shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"}
                                                                                    type="text" id={props.isRetweet ? tweet.tweet_id : tweet?.id} value={tweet?.message} name={'message'}
                                                                                    onChange={event => {
                                                                                            if(event.target.value.length <= 140) {
                                                                                                    setTweet({
                                                                                                            ...tweet,
                                                                                                            message: event.target.value
                                                                                                    })
                                                                                            }

                                                                                            setCharsCountRevers(140 - event.target.value.length);
                                                                                    }}
                                                                                />
                                                                        </label>
                                                                        <div className={"flex gap-1 mb-5"}>
                                                                                <button className={"bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"}
                                                                                        onClick={updateTweet}
                                                                                >Submit</button>
                                                                                <button className={"bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"}
                                                                                        onClick={event => {
                                                                                                event.preventDefault();
                                                                                                setIsOnUpdate(false);
                                                                                        }}>Cancel</button>
                                                                        </div>
                                                                </form>
                                                                <p>{charsCountReverse} caractère(s) restant(s)</p>
                                                        </div>
                                                    ) : <Tweet tweet={tweet}/>}
                                            </div>
                                            <div>
                                                    {props.isRetweet ? tweet?.tweet_media && (
                                                        <img
                                                            loading="lazy"
                                                            src={tweet?.tweet_media}
                                                            className="w-auto h-auto object-fit rounded-lg"
                                                            alt={"..."}
                                                        />
                                                    )  : tweet?.media && (
                                                        <img
                                                            loading="lazy"
                                                            src={tweet?.media}
                                                            className="w-auto h-auto object-fit rounded-lg"
                                                            alt={"..."}
                                                        />
                                                    )}
                                            </div>
                                            <div
                                                className="flex gap-5 justify-between pr-14 mt-3 w-full text-sm text-gray-500 whitespace-nowrap max-md:flex-wrap max-md:pr-5 max-md:max-w-full">
                                                    <Link to={`/tweet/${props.isRetweet ? tweet.tweet_id : tweet.id}`}>
                                                            <div
                                                                className="flex gap-0 justify-between px-px dark:bg-black items-center cursor-pointer">
                                                                    <FaRegComment/>

                                                                    <div
                                                                        className="justify-center px-3 my-auto dark:bg-black aspect-[2.5]">
                                                                            {tweet.comment_count}
                                                                    </div>
                                                            </div>
                                                    </Link>
                                                    <div
                                                        onClick={retweet}
                                                        className="flex gap-0 justify-between dark:bg-black items-center cursor-pointer">
                                                            <FaRetweet/>
                                                            <div
                                                                className="justify-center px-3 my-auto dark:bg-black aspect-[2.94]">
                                                                    {tweet.retweet_count ?? 0}
                                                            </div>
                                                    </div>
                                                    <div
                                                        className="flex gap-0 justify-between dark:bg-black items-center cursor-pointer">
                                                            <FaRegHeart/>
                                                            <div
                                                                className="justify-center px-3 my-auto dark:bg-black aspect-[2.94]">
                                                                    184
                                                            </div>
                                                    </div>
                                            </div>
                                    </div>
                            </div>
                    </div>
            </div>
        )
}

TweetBox.propTypes = {
        tweet: PropTypes.object.isRequired,
}