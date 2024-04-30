import  {useEffect} from "react";
import {toast} from "react-toastify";

export default function Logout() {
    useEffect(() => {
            toast.info('⚠️ Carefull, you are being logged out!');
            setTimeout(() => {
                localStorage.removeItem('twitter_user');
                window.location.href = "/login";
            }, 1000);
        }, []
    );

    return null;
}