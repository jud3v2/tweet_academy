import React, {useState}  from "react";
import {Link} from "react-router-dom";
import axios from 'axios';
import { toast } from 'react-toastify';


export default function Register() {

    const [data, setData] = useState({
        username: "",
        email: "",
        password: "",
        confirmPassword: "",
        firstname: "",
        lastname: "",
        birthdate: "",
        genre: "man"
    });

    const handleChange = e => {
        setData({
            // ... = Spread Operator
            // créer un objet, et lui inclus data
            ...data,
            [e.target.name]: e.target.value
        });
    };
    const handleSubmit = async e => {
        e.preventDefault();
        await handleRegister();
    };

    const handleRegister = async () => {
         await axios.post('/users/Register.php', data)
            .then(() => {
                toast("Inscription réussie");
            })
            .catch(() => {
                toast("Une erreur est survenue lors de l'inscription");
            })
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-200 py-5 px-[400px]">
            <div className="bg-white p-8 rounded shadow-md w-full">
                <h2 className="text-2xl font-bold mb-8 text-gray-700">Inscription</h2>
                <form>
                    <div className="mb-5">
                        <label className="block mb-2 text-sm text-gray-600">Nom d'utilisateur</label>
                        <input className="w-full p-2 border border-gray-300 rounded" value={data.username} onChange={handleChange} type="text" name={"username"} id={"username"} />
                    </div>
                    <div className="mb-5">
                        <label className="block mb-2 text-sm text-gray-600">Email</label>
                        <input className="w-full p-2 border border-gray-300 rounded" value={data.email} onChange={handleChange} type="email" name={"email"} id={"email"} />
                    </div>
                    <div className="mb-5">
                        <label className="block mb-2 text-sm text-gray-600">Nom</label>
                        <input className="w-full p-2 border border-gray-300 rounded" value={data.lastname} onChange={handleChange} type="text" name={"lastname"} id={"name"} />
                    </div>
                    <div className="mb-5">
                        <label className="block mb-2 text-sm text-gray-600">Prénom</label>
                        <input className="w-full p-2 border border-gray-300 rounded" value={data.firstname} onChange={handleChange} type="text" name={"firstname"} id={'firstName'}/>
                    </div>
                    <div className="mb-5">
                        <label className="block mb-2 text-sm text-gray-600">Date de naissance</label>
                        <input className="w-full p-2 border border-gray-300 rounded" type="date" value={data.birthdate} onChange={handleChange} name={"birthdate"} id={'dateOfBirth'} />
                    </div>
                    <div className="mb-5">
                        <label className="block mb-2 text-sm text-gray-600">Votre genre</label>
                        <select className="w-full p-2 border border-gray-300 rounded" name={'genre'} defaultValue="man" value={data.genre} onChange={handleChange}>
                            <option value={"man"} id="Male">Homme</option>
                            <option value={"woman"} id={"Women"} >Femme</option>
                            <option value={"other"} id={"Others"} >Others</option>
                        </select>
                    <div className="mb-5">
                        <label className="block mb-2 text-sm text-gray-600">Mot de passe</label>
                        <input className="w-full p-2 border border-gray-300 rounded" type="password" value={data.password} id={"password"} onChange={handleChange} name={"password"} />
                    </div>
                    <div className="mb-5">
                        <label className="block mb-2 text-sm text-gray-600">Confirmer le mot de passe</label>
                        <input className="w-full p-2 border border-gray-300 rounded" type="password" value={data.confirmPassword} id={"confirmPassword"} onChange={handleChange} name={"confirmPassword"}/>
                    </div>
                    <button onClick={handleSubmit} className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold p-3 rounded">S'inscrire</button>
                    <Link className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold p-3 my-1 rounded" to={"/login"}>Se connecter</Link>
                    </div>
                </form>
            </div>
        </div>
    );
}
