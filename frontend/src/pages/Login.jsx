import React, {useState} from "react";
import axios from "axios";
import {toast} from 'react-toastify';
import {useNavigate} from "react-router-dom";

function Login() {

    const [data, setData] = useState({
        username: "",
        password: ""
    });

    const navigate = useNavigate();

    const handleChange = e => {
        setData({
            ...data,
            [e.target.name]: e.target.value
        });
    }

    const handleSubmit = async e => {
        e.preventDefault();
        await handleLogin();
    };

    const handleLogin = async () => {
        await axios.post('/users/Login.php', data)
            .then(response => {
                if (response.data.status === "success") {
                    toast.success("Connexion réussie");
                    localStorage.setItem('twitter_user', JSON.stringify(response.data.user));
                    navigate('/');
                } else {
                    toast.error("Nom d'utilisateur ou mot de passe incorrect");

                    // Reset password field
                    setData({
                        ...data,
                        password: ""
                    })
                }
            })
            .catch(() => {
                toast.error("Une erreur est survenue lors de la connexion");
            })
    }

    return (
        <div className="w-full max-w-xs mx-auto mt-20">
            <h1 className="mb-6 text-3xl text-center">Connexion</h1>
            <form action="" method="post" className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="username">Nom
                        d'utilisateur:</label>
                    <input
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        type="text" id="username" name="username" value={data.username} onChange={handleChange}/>
                </div>
                <div className="mb-6">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">Mot de
                        passe:</label>
                    <input
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
                        type="password" id="password" name="password" value={data.password} onChange={handleChange}/>
                </div>
                <div className="flex items-center justify-between">
                    <input
                        className="hover:bg-blue-500  font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                        type="submit" value="Se connecter" onClick={handleSubmit}/>
                    <input
                        className="hover:bg-blue-500   font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                        type="submit" onClick={e => {
                            e.preventDefault();
                            window.location.href = "/register";
                    }} value="S'inscrire"/>
                </div>
            </form>
        </div>
    );
}

export default Login;