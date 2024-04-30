import React from 'react';
import {useParams} from 'react-router-dom';
import {useQuery} from '@tanstack/react-query';
import axios from 'axios';
import TweetBox from "#/components/TweetBox/index.jsx";
export default function Explore(props) {
        const [user] = React.useState(JSON.parse(localStorage.getItem('twitter_user')));
        const {hashtag} = useParams();
        const [tweets, setTweets] = React.useState([]);
        const fetchTweetFromHastag = async () => {
                return await axios.get('/tweet/hashtag/getAllTweetsFromHashtag.php?hashtag=' + hashtag)
                    .then(response => {
                            setTweets(response.data.tweets);
                            return response.data.tweets;
                    })
        }

        const {data, error, status, isLoading} = useQuery({
                queryKey: ['tweet', hashtag],
                queryFn: fetchTweetFromHastag,
        })

        React.useEffect(() => {
                if(!error && !isLoading && data && status === 'success') {
                        setTweets(data);
                }
        }, [data])

        return (
            <>
                    <div className={"flex gap-0 pr-20 dark:dark:bg-black max-md:flex-wrap max-md:pr-5 m-3"}>
                            <div className="flex flex-col w-full max-md:max-w-full">
                                    <div
                                        className="flex flex-col pt-2.5 w-full text-xl font-bold text-dark dark:text-white whitespace-nowrap dark:bg-black max-md:max-w-full">
                                            <div
                                                className="flex gap-5 justify-between px-px mx-4 max-md:flex-wrap max-md:mr-2.5 max-md:max-w-full">
                                                    <div className="my-auto text-dark">Explore latest hashtag</div>
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
                    <div className={'flex-none'}>
                            {status === "success" && tweets.map((tweet, index) => {
                                    return (
                                        <TweetBox
                                            key={index}
                                            tweet={tweet}
                                            user={user}
                                        />
                                    )
                            })}
                    </div>
            </>
        )
}