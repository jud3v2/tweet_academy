import React, { useState } from "react";

export default function TweetForm() {
    const [tweet, setTweet] = useState("");

    const handleSubmit = (e) => {
        e.preventDefault();
        setTweet("");
    };

    return (
        <div className="bg-gray-100 p-8">
            <form onSubmit={handleSubmit} className="bg-white p-8 rounded shadow-md w-full max-w-md mx-auto">
                <h1 className="text-2xl font-bold mb-8 text-gray-700 justify-center text-center">Tweet&Sweet</h1>
                <textarea
                    className="w-full p-2 rounded border-gray-300 bg-gray-200 text-gray-700"
                    rows="4"
                    value={tweet}
                    onChange={(e) => setTweet(e.target.value)}
                    placeholder="Quoi de neuf ?"
                />
                <button type="submit" className="mt-4 text-black hover:bg-blue-400 rounded px-4 py-2">
                    Tweeter
                </button>
            </form>
        </div>
    );
}