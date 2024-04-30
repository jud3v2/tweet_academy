import React, {useState, useEffect} from "react";
import axios from "axios";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';



export default function Settings() {
    const [user, setUser] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: ""
    });

    const [localUser, setLocalUser] = useState(null)

    const fetchData = async () => {
        const user = JSON.parse(localStorage.getItem('twitter_user'));

        if (user) {
            setLocalUser(user)
            await axios.get('/users/preferences/Get.php?username=' + user.username)
                .then(response => {
                    setLocalUser({
                        ...localUser,
                        ...response.data
                    })
                })
    }
        }

    useEffect(() => fetchData, []);
    const handleChange = (event) => {
        setUser({...user, [event.target.name]: event.target.value});
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        axios.put("/api/user", user)
            .then(() => {
                toast.success('Profile updated successfully!');
            })
            .catch(error => {
                toast.error(error.response.data.message);
            });
    }
    return (
        <div className="flex justify-center items-center h-screen bg-gray-200">
            <form onSubmit={handleSubmit} className="w-full max-w-sm bg-white p-6 rounded-lg">
                <h2 className="text-2xl font-bold mb-5 text-gray-900">Edit Profile</h2>
                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">
                        Name
                    </label>
                    <input className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" type="text" name="name" value={user.name} onChange={handleChange} />
                </div>
                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="bio">
                        Bio
                    </label>
                    <textarea className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" name="bio" value={user.bio} onChange={handleChange} />
                </div>
                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="location">
                        Location
                    </label>
                    <input className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" type="text" name="location" value={user.location} onChange={handleChange} />
                </div>
                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="website">
                        Website
                    </label>
                    <input className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" type="text" name="website" value={user.website} onChange={handleChange} />
                </div>
                <div className="flex items-center justify-between">
                    <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline" type="submit">
                        Save
                    </button>
                </div>
            </form>
        </div>
    );
}