import React from "react";
import { ToastContainer} from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

export default function Layout({ children }) {
    return (
        <div>
            <div>
                {children}
            </div>
            <ToastContainer
                position="top-right"
                autoClose={5000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="light"
            />
        </div>
    );
}