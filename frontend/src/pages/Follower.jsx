import React from "react";
import FollowerTabs from "#/components/FollowerTabs";

export default function Follower() {
        return (
                <div className={"min-h-screen"}>
                        <div>
                                <h1 className={"p-5 font-black text-2xl"}>Followers</h1>
                        </div>
                        <div>
                                <FollowerTabs/>
                        </div>
                </div>
        );
}