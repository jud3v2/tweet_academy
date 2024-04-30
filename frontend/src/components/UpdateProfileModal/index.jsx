import React from 'react';
import Box from "@mui/material/Box";
import {Modal} from "@mui/material";
import axios from "axios";
import {toast} from "react-toastify";

export default function UpdateProfileModal(props) {
        const revalidate = async () => {
                await axios.get('/users/GetOne.php?username=' + props.user.username)
                    .then(response => response.data)
                    .then(data => {
                            props.setUser(data);
                            localStorage.setItem('twitter_user', JSON.stringify(data));
                    });
        };
        const handleChange = (event) => {
                const datum = ['bio', 'localisation', 'website']
                if(datum.includes(event.target.name)) {
                        props.setUser({...props.user, preferences: {...props.user.preferences, [event.target.name]: event.target.value}});
                        return;
                }
                props.setUser({...props.user, [event.target.name]: event.target.value});
        };

        const handleSubmit = (event) => {
                event.preventDefault();
                axios.post("/users/Update.php", props.user)
                    .then(async response => {
                            toast.success('Profile updated successfully!');
                            await revalidate();
                            props.handleclose();
                            return response;
                    })
                    .catch(error => {
                            toast.error(error.response.data.message);
                    });
        }

        const handleClick = (event) => {
                event.preventDefault();
                handleSubmit(event);
        }

        const handleShowFileExplorer = () => {
                document.getElementById('file').click();

                document.getElementById('file').addEventListener('change', (event) => {
                        // beffore we will update the image with id profileImage

                        const image = document.getElementById('profileImage');
                        image.src = URL.createObjectURL(event.target.files[0]);

                        event.preventDefault();
                        const formData = new FormData();
                        formData.append('file', event.target.files[0]);
                        formData.append('user_id', props.user.id);
                        axios.post("/media/create.php", formData)
                            .then(async response => {
                                    props.setUser({
                                            ...props.user,
                                            preferences: {
                                                    ...props.user.preferences,
                                                    profile_picture: response.data.url
                                            }
                                    });

                                    await revalidate();
                            })
                            .catch(error => {
                                    toast.error(error.response.data.message);
                            });
                });
        }

        const handleToggleDarkMode = e => {
                e.preventDefault();
                if (localStorage.getItem('twitter_theme') === 'dark') {
                        localStorage.setItem('twitter_theme', 'light');
                        document.body.classList.remove('dark');
                } else {
                        localStorage.setItem('twitter_theme', 'dark');
                        document.body.classList.add('dark');
                }

        }

        return (
            <Modal open={props.open} handleclose={props.handleclose}>
                    <Box sx={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            width: 720,
                            bgcolor: 'background.paper',
                            border: '2px solid lightgray',
                            borderRadius: "10px",
                            boxShadow: 24,
                            p: 4,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 5
                    }}>
                            <Box>
                                    <div className="mx-auto w-32 text-center ">
                                            <div className="relative w-32">
                                                    <img className="w-32 h-32 rounded-full cursor-pointer object-cover"
                                                         onClick={handleShowFileExplorer}
                                                         id={"profileImage"}
                                                         src={props.user.preferences.profile_picture ? props.user.preferences.profile_picture : "https://images.pexels.com/photos/2690323/pexels-photo-2690323.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500"}
                                                         alt=""/>
                                                    <input type="file" className={"hidden"} id={"file"} accept="image/x-png,image/jpeg,image/webp,image/png,image/gif"/>
                                            </div>
                                    </div>
                            </Box>
                            <form className="w-full max-w-sm bg-white p-6 rounded-lg">
                                    <h2 className="text-2xl font-bold mb-5 text-gray-900">Edit Profile</h2>
                                    <div className="mb-4">
                                            <label className="block text-gray-700 text-sm font-bold mb-2"
                                                   htmlFor="name">
                                                    Name
                                            </label>
                                            <input
                                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                                type="text" name="username" value={props.user.username}
                                                onChange={handleChange}/>
                                    </div>
                                    <div className="mb-4">
                                            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="bio">
                                                    Bio
                                            </label>
                                            <textarea
                                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                                name="bio" value={props.user.preferences.bio} onChange={handleChange}/>
                                    </div>
                                    <div className="mb-4">
                                            <label className="block text-gray-700 text-sm font-bold mb-2"
                                                   htmlFor="location">
                                                    Location
                                            </label>
                                            <input
                                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                                type="text" name="localisation"
                                                value={props.user.preferences.localisation} onChange={handleChange}/>
                                    </div>
                                    <div className="mb-4">
                                            <label className="block text-gray-700 text-sm font-bold mb-2"
                                                   htmlFor="website">
                                                    Website
                                            </label>
                                            <input
                                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                                type="text" name="website" value={props.user.preferences.website}
                                                onChange={handleChange}/>
                                    </div>
                                    <div className="flex items-center justify-between">
                                            <button
                                                onClick={(event) => handleClick(event)}
                                                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                                                type="submit">
                                                    Save
                                            </button>
                                            <button
                                                onClick={props.handleclose}
                                                className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                                                type="submit">
                                                    Close
                                            </button>
                                    </div>
                                    <hr className={'my-5'}/>
                                    <Box>
                                            <h1 className={"text-3xl font-extrabold"}>Thème</h1>
                                            <div>
                                                    <button
                                                        onClick={handleToggleDarkMode}
                                                        className="bg-blue-500 mt-3 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                                                        type="submit">
                                                            Toggle Dark Mode
                                                    </button>
                                            </div>
                                    </Box>
                            </form>
                    </Box>
            </Modal>
        )
}