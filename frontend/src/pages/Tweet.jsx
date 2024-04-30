import React, { useState, useEffect } from "react";
import CommentBox from "#/components/CommentBox/index.jsx";
import TweetBox from "#/components/TweetBox/index.jsx";
import axios from "axios";
import { useParams } from "react-router-dom";
import { useQuery, QueryClient, useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";
import BackArrow from "#/components/backArrow.jsx";

// TODO: récupérer les commentaires et les likes (bonus) pour les afficher
export default function Tweet() {
  const [tweet, setTweet] = useState({});
  const [user] = useState(JSON.parse(localStorage.getItem("twitter_user")));
  const { id } = useParams();
  const [message, setMessage] = useState("");
  const [charsCountReverse, setCharsCountRevers] = useState(140);
  const [comments, setComments] = useState([]);

  const handleChange = (event) => {
    const message = event.target.value;
    if (message.length <= 140) {
      setMessage(event.target.value);
      setCharsCountRevers(140 - message.length);
    }
  };

  const queryClient = new QueryClient();

  const { isLoading, error } = useQuery(
    {
      queryKey: ["tweet", id],
      queryFn: async () => {
        return await axios
          .get(`/tweet/GetOneTweet.php?tweet=${id}`)
          .then((response) => {
            return response.data;
          })
          .then((data) => {
            setTweet(data); // set tweet when data is available.
            return data;
          });
      },
    },
    queryClient
  );

  const getComments = async () => {
    return await axios
      .get(`/Comment/GetCommentByTweet.php?tweet_id=${tweet.id}`)
      .then((response) => {
        setComments(response.data); // set comments when data is available.
        return response.data;
      })
      .then((data) => {
        return data;
      });
  };

  let { isLoading: isCommentLoading, error: errorComment } = useQuery(
    {
      queryKey: ["comments-of-tweet", tweet.id],
      queryFn: getComments,
    },
    queryClient
  );

  const pushComment = async () => {
    return await axios.post(`/Comment/CreateComment.php`, {
      tweet_id: tweet.id,
      user_id: user.id,
      comment: message,
    });
  };

  const mutation = useMutation(
    {
      mutationFn: pushComment,
      mutationKey: "create-comment",
      onSuccess: async () => {
        toast.success("Comment added successfully.");
        await queryClient.invalidateQueries({
          queryKey: ["comments-of-tweet", tweet.id],
        });
        const newComments = await getComments();
        setComments([...newComments]);
        setMessage("");
        setCharsCountRevers(140);
      },
    },
    queryClient
  );

  useEffect(() => {
    if (comments.length > 0) {
      errorComment = false;
    }
  }, [comments]);

  if (isLoading) return "Loading...";
  if (error) return "An error has occurred: " + error.message;

  return (
    <div className={"min-h-screen"}>
      <div>
        <h1 className={"p-5 font-black text-2xl"}>Tweet Details</h1>
      </div>
      <div>
        <BackArrow />
      </div>
      <div className={"mb-5"}>
        <TweetBox tweet={tweet} key={tweet.id} user={user} />
      </div>
      <hr />
      <div className={"mt-5"}>
        <div className="flex flex-col px-4 w-full max-md:max-w-full">
          <div className={"flex items-center gap-4"}>
            <img
              loading="lazy"
              src={
                user.preferences?.profile_picture
                  ? user.preferences?.profile_picture
                  : "https://thispersondoesnotexist.com"
              }
              className="w-12 aspect-square rounded-full"
              alt={""}
            />
            <div className={"flex items-center gap-1"}>
              <div className="grow font-bold dark:text-white text-zinc-500">
                @{user?.username}
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
                <textarea
                  name="message"
                  onChange={handleChange}
                  value={message}
                  placeholder="What's happening?"
                  className={
                    "block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                  }
                  id="message"
                  cols="10000"
                  rows="3"
                ></textarea>
              </label>
              <div className={"flex items-center justify-between"}>
                <div
                  className={
                    "flex gap-5 justify-between self-center px-0.5 pt-3 mt-4 w-full text-base font-bold text-white dark:bg-black max-w-[520px] max-md:flex-wrap max-md:max-w-full"
                  }
                >
                  <button
                    type={"button"}
                    onClick={(e) => {
                      e.preventDefault();
                      mutation.mutate();
                    }}
                    className="justify-center px-4 py-2.5 bg-sky-500 rounded-[36px] mb-3"
                  >
                    Comment
                  </button>
                </div>
                <div className={"flex justify-between items-center"}>
                  <div>
                    <p className={"text-sm"}>{charsCountReverse} Chars left.</p>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
      <div>
        <h1 className={"p-5 font-black text-2xl"}>Comments</h1>
        <hr />
        {isCommentLoading ? (
          "Loading comments..."
        ) : errorComment ? (
          "No comments found."
        ) : comments?.length > 0 ? (
          comments.map((comment) => (
            <CommentBox
              key={"comment-" + comment.id}
              isRetweet={false}
              comment={comment}
              user={user}
            />
          ))
        ) : (
          <div>No comments found.</div>
        )}
      </div>
    </div>
  );
}
