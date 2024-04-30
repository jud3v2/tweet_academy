import React from 'react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import Tweets from '../components/Tweets';
import Profile from './Profile.jsx';

function HomePage() {
    return (
        <div className="flex justify-center items-start h-screen bg-gray-200">
            <div className="w-64 flex-shrink-0">
                <Sidebar />
            </div>
            <div className="w-full max-w-md">
                <Navbar />
                <Tweets />
            </div>
            <div className="w-full max-w-md">
                <Profile />
            </div>
        </div>
    );
}

export default HomePage;