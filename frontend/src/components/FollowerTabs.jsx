import React, {useState, useEffect} from 'react';
import PropTypes from 'prop-types';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import axios  from "axios";
import {useQuery, QueryClient, useMutation} from "@tanstack/react-query";
import {toast} from "react-toastify";
import {Link, useParams} from "react-router-dom";

function TabPanel(props) {
        const { children, value, index, ...other } = props;

        return (
            <div
                role="tabpanel"
                hidden={value !== index}
                id={`simple-tabpanel-${index}`}
                aria-labelledby={`simple-tab-${index}`}
                className={"dark:bg-dark dark:text-white"}
                {...other}
            >
                    {value === index && (
                        <Box sx={{ p: 3 }}>
                                <Typography>{children}</Typography>
                        </Box>
                    )}
            </div>
        );
}

TabPanel.propTypes = {
        children: PropTypes.node,
        index: PropTypes.number.isRequired,
        value: PropTypes.number.isRequired,
};

function a11yProps(index) {
        return {
                id: `simple-tab-${index}`,
                'aria-controls': `simple-tabpanel-${index}`,
        };
}

//TODO: Bug quand on follow et unfollow et qu'on veut follow une autre personne ça vas prendre la personne précédente qu'on as unfollow ou follow
export default function FollowerTabs() {
        const [value, setValue] = useState(0);

        const [followers, setFollowers] = useState([]);
        const [following, setFollowing] = useState([]);

        const { id } = useParams();

        const handleChange = (event, newValue) => {
                setValue(newValue);
        };

        const user = JSON.parse(localStorage.getItem('twitter_user'));

        const queryClient = new QueryClient();

        const fetchFollowers = async () => {
                return axios.get('/users/follower/GetFollower.php?user_id=' + id)
                    .then(response => response)
                    .then(response => {
                        return response.data.followers
                    })
        };

        const fetchFollowing = async () => {
                return axios.get('/users/follower/GetFollowing.php?user_id=' + id)
                    .then(response => response)
                    .then(response => {
                        return response.data.following
                    })
        };

        const refetchFollower =  useMutation({
                queryFn: fetchFollowers,
                queryKey: ['followers', id],
                onSuccess: async () => {
                        await queryClient.invalidateQueries({
                                queryKey: ['followers', id]
                        })

                        const newFollowers = await fetchFollowers();

                        setFollowers([...newFollowers]);

                        queryClient.setQueryData(['followers', id], followers);
                }
        })

        const refetchFollowing =  useMutation({
                queryFn: fetchFollowing,
                queryKey: ['following', id],
                onSuccess: async () => {
                        await queryClient.invalidateQueries({
                                queryKey: ['following', id]
                        })

                        const newFollowing = await fetchFollowing();

                        setFollowing([...newFollowing]);
                        queryClient.setQueryData(['following', id], following);
                }
        });

        const {isLoading: isLoadingFollowers, error: errorFollowers, data: dataFollowers} = useQuery({
                queryKey: ['followers', id],
                queryFn: fetchFollowers,
        }, queryClient);

        const {isLoading: isLoadingFollowing, error: errorFollowing, data: dataFollowing} = useQuery({
                queryKey: ['following', id],
                queryFn: fetchFollowing,
        }, queryClient);

        useEffect(() => {
                setFollowers(dataFollowers);
                setFollowing(dataFollowing);
        }, [dataFollowing, dataFollowers])

        if(isLoadingFollowers || isLoadingFollowing) {
                return (
                    <div>
                            <p>Loading...</p>
                    </div>
                )
        }

        if(errorFollowers || errorFollowing) {
                return (
                    <div>
                            <p>Error while fetching data</p>
                    </div>
                )
        }

        async function revalidateFollowerAndFollowing() {
                await queryClient.invalidateQueries({
                        queryKey: ['followers', id]
                })

                await queryClient.invalidateQueries({
                        queryKey: ['following', id]
                })

                queryClient.setQueriesData({queryKey: ['followers', id]}, await fetchFollowers());
                queryClient.setQueriesData({queryKey: ['following', id]}, await fetchFollowing());

                setFollowers(await fetchFollowers());
                setFollowing(await fetchFollowing());
        }

        async function followUser(userId, followingId, following) {
                if(following) {
                        toast.info('You have unfollow this user')
                } else {
                        toast.info('You have follow this user')
                }

                await refetchFollowing.mutate();
                await refetchFollower.mutate();

                await revalidateFollowerAndFollowing();

                return await axios.post('/users/follower/Follow.php', {
                        follower_id: userId,
                        following_id: followingId
                })
        }

        return (
            <Box sx={{ width: '100%' }}>
                    <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                            <Tabs textColor="primary" sx={{
                                    "& .MuiTab-textColorPrimary": {
                                            color: "#1976d2", // Ou une autre couleur de votre choix
                                    },
                            }}
                                  centered
                                  indicatorColor="primary" value={value} onChange={handleChange} aria-label="basic tabs example">
                                    <Tab  textColor="primary"  label="Followers" {...a11yProps(0)} />
                                    <Tab  textColor="primary" label="Following" {...a11yProps(1)} />
                            </Tabs>
                    </Box>
                    <TabPanel value={value} index={0}>
                            {followers?.map((follower, index) => {
                                    return (
                                        <div key={index}>
                                                <div className={"flex p-5 justify-between items-center gap-5"}>
                                                        <Link to={'/profile/'+follower.username} className={"flex justify-between items-center gap-5"}>
                                                                <div>
                                                                        <img
                                                                            src={follower.profile_picture ?? 'https://thispersondoesnotexist.com'}
                                                                            className={"w-20 h-20 rounded-full"}
                                                                            alt="profile_picture"/>
                                                                </div>
                                                                <div className={"flex-1"}>
                                                                        <div className={"flex"}>
                                                                                <p className={"font-bold"}>{follower.firstname + " " + follower.lastname}</p>
                                                                                &nbsp;
                                                                                {follower.following_id === JSON.parse(localStorage.getItem('twitter_user')).id ?
                                                                                    <span
                                                                                        className={"bg-zinc-200 px-0.5 rounded"}>Following you</span> : ''}
                                                                        </div>
                                                                </div>
                                                        </Link>
                                                        <div>
                                                                {follower.is_following ? (
                                                                    <button key={"following" + index}
                                                                            onClick={async (event) => {
                                                                                    event.preventDefault();
                                                                                    await followUser(id, follower.id, true)
                                                                            }}
                                                                            className={"justify-center items-center px-16 py-5 mt-2 text-lg  border dark:bg-zinc-400 dark:text-dark  rounded-[52px]"}>
                                                                            Following
                                                                    </button>
                                                                ) : (
                                                                    <button key={"follower-" + index}
                                                                            onClick={async (event) => {
                                                                                    event.preventDefault();
                                                                            await followUser(id, follower.id, false)
                                                                    }}
                                                                        className={"justify-center items-center px-16 py-5 mt-2 text-lg  border dark:bg-zinc-400 dark:text-dark  rounded-[52px]"}>
                                                                            Follow
                                                                    </button>
                                                                )}
                                                        </div>
                                                </div>
                                        </div>
                                    )
                            })}
                    </TabPanel>
                    <TabPanel value={value} index={1}>
                            {following?.map((following, index) => {
                                    return (
                                        <div key={index}>
                                                <div className={"flex p-5 justify-between items-center gap-5"}>
                                                        <Link to={"/profile/"+ following.username} className={"flex justify-between items-center gap-5"}>
                                                                <div>
                                                                        <img
                                                                            src={following.profile_picture ?? "https://thispersondoesnotexist.com"}
                                                                            className={"w-20 h-20 rounded-full"}
                                                                            alt="profile_picture"/>
                                                                </div>
                                                                <div className={"flex-1"}>
                                                                        <div className={"flex"}>
                                                                                <p className={"font-bold"}>{following.firstname + " " + following.lastname}</p>
                                                                                &nbsp;
                                                                        </div>
                                                                </div>
                                                        </Link>
                                                        <div>
                                                                <button key={"index-" + index}
                                                                        onClick={async (event) => {
                                                                                event.preventDefault();
                                                                                await followUser(id, following.id, true)
                                                                        }}
                                                                        className={"justify-center items-center px-16 py-5 mt-2 text-lg  border dark:bg-zinc-400 dark:text-dark  rounded-[52px]"}>
                                                                        Following
                                                                </button>
                                                        </div>
                                                </div>
                                        </div>
                                    )
                            })}
                    </TabPanel>
            </Box>
        );
}