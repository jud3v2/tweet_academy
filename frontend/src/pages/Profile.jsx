import React, { useEffect, useState } from "react";
import { QueryClient, useQuery } from "@tanstack/react-query";
import axios from "axios";
import TwitterTabs from "../components/Tabs/index.jsx";
import { Link } from "react-router-dom";
import UpdateProfileModal from "#/components/UpdateProfileModal/index.jsx";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

export default function Profile() {
  const [user, setUser] = useState(
    JSON.parse(localStorage.getItem("twitter_user")) ?? {}
  );
  const [localUser] = useState(
    JSON.parse(localStorage.getItem("twitter_user")) ?? {}
  );

  const [tabsValue, setTabsValue] = useState(0);
  const [tweets, setTweets] = useState([]);
  const [retweets, setRetweets] = useState([]);
  const [open, setOpen] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const queryClient = new QueryClient();
  const { username } = useParams();
  const [isFollowing, setIsFollowing] = useState(false);
  const [followers, setFollowers] = useState([]);

  const navigate = useNavigate();

  const fetchUser = async () => {
    return axios
      .get("users/GetOne.php?parameter=username&username=" + username)
      .then((reponse) => reponse)
      .then((response) => {
        setUser(response.data);
        return response.data;
      })
      .catch(() => {
        toast.error("User not found : " + username);
      });
  };

  const fetchTweet = async () => {
    if (username === user.username) {
      return axios
        .get("/tweet/GetTweets.php?parameter=user&id=" + user.id)
        .then((response) => response)
        .then((response) => {
          setTweets(response.data);
          toast.dismiss();
          return response.data;
        });
    } else {
      return [];
    }
  };

  const fetchRetweet = async () => {
    return axios
      .get("/retweet/GetRetweetByUser.php?user_id=" + user.id)
      .then((response) => response)
      .then((response) => {
        setRetweets(response.data);
        toast.dismiss();
        return response.data;
      });
  };

  const { data: retweetsData, isLoading: retweetsIsLoading } = useQuery({
    queryKey: ["retweets", user.id],
    queryFn: fetchRetweet,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const handleClose = () => {
    setOpen(false);
  };

  const handleOpen = () => {
    setOpen(true);
  };

  const handleFollow = () => {
    axios
      .post("users/follower/Follow.php", {
        following_id: user.id,
        follower_id: localUser.id,
      })
      .then(() => {
        setIsFollowing(!isFollowing);
      })
      .catch((error) => {
        toast.error(
          "Une erreur s'est produite lors de la récupération des données: " +
            error
        );
      });
  };

  const { isLoading } = useQuery(
    {
      queryKey: ["tweets", user.id],
      queryFn: fetchTweet,
      staleTime: 1000 * 60 * 5, // 5 minutes
    },
    queryClient
  );

  const navigateBack = (e) => {
      e.preventDefault();
      navigate(-1); // navigate to the previous page
  }

  useEffect(() => {
    if (username !== user.username) {
      toast
        .promise(
          (async () => {
            await fetchUser().then((fetchedUser) => {
              if (!fetchedUser || !fetchedUser.id) {
                toast.error("User not found : " + username);
              }
              setNotFound(true);
            });
          })(),
          {
            loading: "Loading user...",
            success: "User data retreived successfully",
            error: "User not found : " + username,
          }
        )
        .then(() => setTimeout(() => toast.dismiss(), 3000));
    }
  }, [username]);

  useEffect(() => {
    queryClient.refetchQueries({ queryKey: ["tweets"] }).then(() => {});
  }, [user]);

  const fetchFollow = async () => {
    return await axios
      .get("/users/follower/GetFollower.php?user_id=" + user.id)
      .then((response) => {
        setFollowers(response.data.followers);
       return response.data.followers;
      });
  };

  const {
    error,
    status,
  } = useQuery(
    {
      queryKey: ["follow", user.id],
      queryFn: fetchFollow,
      staleTime: 1000 * 60 * 5, // 5 minutes
    },
    queryClient
  );

  useEffect(() => {
    if (status === "success" && followers.length > 0) {
      followers?.map((follower) => {
        if (follower.follower_id == localUser.id) {
          setIsFollowing(true);
        }
      });
    }
  }, [followers]);

  useEffect(() => {
    setIsFollowing(false);
  }, [username]);

  if (user) {
    return (
      <div className="w-full relative h-full">
        <div className=" relative mx-auto flex h-full w-full items-start justify-center  text-sm text-gray-900 antialiased dark:bg-black dark:text-white">
          <div className="relative mx-auto w-full border-x border-gray-100 dark:border-gray-500">
            <div className="flex items-center space-x-4 p-1.5">
              <button onClick={navigateBack} className="inline-flex items-center justify-center rounded-full p-2 transition duration-150 ease-in-out hover:bg-gray-200 hover:dark:bg-gray-800">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                  className="h-5 w-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19.5 12h-15m0 0l6.75 6.75M4.5 12l6.75-6.75"
                  />
                </svg>
              </button>
              <div className="flex flex-col items-start">
                <h2 className="text-xl font-bold tracking-tight">
                  {user?.firstname + " " + user?.lastname}
                </h2>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  1,329 Tweets
                </span>
              </div>
            </div>
            <div className="flex items-start justify-between p-5 mt-5">
              <img
                className="-mt-[1.5rem] h-32 w-32 cursor-pointer rounded-full"
                loading={"lazy"}
                src={
                  user.preferences?.profile_picture
                    ? user.preferences?.profile_picture
                    : "https://thispersondoesnotexist.com"
                }
                alt={"..."}
              />
              {!notFound &&
              JSON.parse(localStorage.getItem("twitter_user")).id ===
                user.id ? (
                <button
                  onClick={handleOpen}
                  className="rounded-full border border-gray-300 px-4 py-1.5 font-bold transition duration-150 ease-in-out hover:bg-gray-200 dark:border-gray-500 dark:hover:bg-gray-700"
                >
                  Edit profile
                </button>
              ) : !isFollowing ? (
                <button
                  onClick={handleFollow}
                  className="rounded-full border border-gray-300 px-4 py-1.5 font-bold transition duration-150 ease-in-out hover:bg-gray-200 dark:border-gray-500 dark:hover:bg-gray-700"
                >
                  Follow
                </button>
              ) : (
                <button
                onClick={handleFollow}
                className="rounded-full border border-gray-300 px-4 py-1.5 font-bold transition duration-150 ease-in-out hover:bg-gray-200 dark:border-gray-500 dark:hover:bg-gray-700"
              >
                Unfollow
              </button>
              )}
            </div>

            <div className="mt-2 px-4">
              <h2 className="text-xl font-bold tracking-tight">
                {user?.firstname + " " + user?.lastname}
              </h2>
              <span className="text-gray-500 dark:text-gray-400">
                @{user?.username}
              </span>
            </div>

            <div className="mt-4 px-4">
              <span>{user?.preferences.bio}</span>
            </div>

            <div className="mt-3 flex items-center space-x-4 px-4">
              <div className="flex items-center space-x-1">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                  className="h-4 w-4 dark:text-gray-400"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"
                  />
                </svg>
                <span className="text-gray-500 dark:text-gray-400">
                  {user?.preferences.localisation}
                </span>
                <span> </span>
                <span className="text-gray-500 dark:text-gray-400">
                  ⚥ : {user?.genre}
                </span>
              </div>
              <div className="flex items-center space-x-1">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                  className="h-4 w-4 dark:text-gray-400"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244"
                  />
                </svg>
                <a
                  className="text-sky-500 hover:underline cursor-pointer"
                  href={user?.website}
                  target="_blank"
                >
                  {user?.preferences.website}
                </a>
              </div>
              <div className="flex items-center space-x-1">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                  className="h-4 w-4 dark:text-gray-400"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5"
                  />
                </svg>

                {/*Parse date to a human date*/}
                <span className="text-gray-700 dark:text-gray-400">
                  {new Date(user?.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>

            <div className="mt-3 flex items-center space-x-4 px-4">
              <div className="cursor-pointer hover:underline">
                <span className="font-bold">
                  {user?.following ? user?.following.length : 0}{" "}
                </span>
                <Link
                  to={"/follower/"+user.id}
                  className="text-gray-700 dark:text-gray-400"
                >
                  Following
                </Link>
              </div>
              <div className="cursor-pointer hover:underline">
                <span className="font-bold">
                  {user?.follower ? user?.follower.length : 0}{" "}
                </span>
                <Link
                  to={"/follower/"+user.id}
                  className="text-gray-700 dark:text-gray-400"
                >
                  Followers
                </Link>
              </div>
            </div>
            <div className="mt-3">
              <TwitterTabs
                retweets={retweetsData}
                retweetsLoading={retweetsIsLoading}
                tabsValue={tabsValue}
                tweets={tweets}
                user={user}
                setTabsValue={setTabsValue}
                username={username}
                isLoading={isLoading}
              />
            </div>
          </div>
        </div>
        <UpdateProfileModal
          open={open}
          setUser={setUser}
          handleclose={handleClose}
          user={user}
        />
      </div>
    );
  } else {
    return <p>Veuillez vous connecter afin d'acceder a votre profile</p>;
  }
}
