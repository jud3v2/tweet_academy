import * as React from "react";
import Parser from "html-react-parser";
import dayjs from "dayjs";
import {FaRegHeart} from "react-icons/fa6";
import {FaRetweet} from "react-icons/fa6";
import {FaRegComment} from "react-icons/fa6";
import {Link} from "react-router-dom";
import PropTypes from 'prop-types';
import { BsThreeDots } from "react-icons/bs";
import axios from "axios";
import {useState} from "react";
import { toast } from 'react-toastify';
import {useQuery, QueryClient} from '@tanstack/react-query';

export default function CommentBox(props) {
        const [isPopoverOpen, setIsPopoverOpen] = React.useState(false);
        const [isOnUpdate, setIsOnUpdate] = React.useState(false);
        const [comment, setComment] = React.useState(props.comment);
        const [charsCountReverse, setCharsCountRevers] = useState(140);

        function Popover() {
                return (
                    <div className="absolute right-0 top-0 bg-white border border-gray-200 dark:border-gray-700 dark:bg-black rounded">
                            <div className="flex flex-col">
                                    <button className="p-2 w-full text-left hover:bg-zinc-500 hover:text-white rounded clearfix" onClick={() => {
                                            if(comment.user_id === props.user.id) {
                                                    setIsOnUpdate(true);
                                                    setIsPopoverOpen(false);
                                            } else {
                                                    setIsPopoverOpen(false);
                                                    toast.error('You are not allowed to update this tweet');
                                            }
                                    }}>Update Comment</button>
                                    <button  className="p-2 w-full text-left hover:bg-zinc-500 hover:text-white rounded clearfix" onClick={(event) => {
                                            if(comment.user_id === props.user.id) {
                                                    deleteComment(event);
                                            } else {
                                                    toast.error('You are not allowed to delete this tweet');
                                            }
                                            setIsPopoverOpen(false);
                                    }}>Delete Comment</button>
                            </div>
                    </div>
                );
        }

        const deleteComment = event => {
                event.preventDefault();
                //TODO: update here for delete the commnet
                axios.get(`/Comment/DeleteComment.php?comment_id=${comment.id}&user_id=${props.user.id}`)
                    .then(response => {
                            response.data
                            toast.success('Comment deleted successfully');
                    })
                    .then(() => {
                            // this will prevent the tweet from being displayed and error while using the .remove() method
                            // i think this is called twice.
                            const el = document.getElementById("comment-" + comment.id)
                            if(el) {
                                    el.style.display = "none";
                            }
                    })
                    .catch(error => {
                            console.log(error);
                            toast.error('An error occurred while deleting the tweet');
                    })
        }

        const updateComment = async (event) => {
                event.preventDefault();
                 await axios.post('/Comment/UpdateComment.php', {
                        message: comment.message,
                        comment_id: comment.id,
                        user_id: props.user.id
                })
                    .then(response => {
                            response.data
                            toast.success('Comment updated successfully');
                    })
                    .then(() => {
                            setIsOnUpdate(false);
                    })
                     .catch(error => {
                        console.log(error);
                        toast.error('An error occurred while updating the tweet');
                })
        }

        const like = async (event) => {

        }

        return (
            <div
                id={"comment-" + comment.id} key={comment.id}
                className="flex gap-0 justify-between max-md:flex-wrap max-md:max-w-full">
                    <div className="flex flex-col w-full max-md:max-w-full">
                            <div
                                className="flex gap-3 justify-between px-4 py-3 text-base font-light dark:bg-black max-md:flex-wrap max-md:max-w-full">
                                    <img
                                        loading="lazy"
                                        src={comment.profile_picture ? comment.profile_picture : "https://thispersondoesnotexist.com"}
                                        className="self-start w-12 aspect-square rounded-full"
                                        alt={"..."}
                                    />
                                    <div
                                        className="flex flex-col flex-1 max-md:max-w-full">
                                            <div
                                                className="flex gap-1 self-start whitespace-nowrap relative justify-between items-center">
                                                    <div className={"flex items-center justify-between relative"}>
                                                            <div
                                                                className="flex gap-0.5 justify-between font-bold dark:dark:text-zinc-300 text-zinc-600">
                                                                    <Link to={"/profile/" + comment?.username}
                                                                          className="grow">
                                                                            @{comment?.username}
                                                                    </Link>
                                                                    <img
                                                                        loading="lazy"
                                                                        src="https://cdn.builder.io/api/v1/image/assets/TEMP/c76d421b98389240b8d68a201a5f96df23b9599e475feadcaa5b29e12ddf7f81?"
                                                                        className="w-5 aspect-square"
                                                                        alt={""}
                                                                    />
                                                                    <div className="grow">
                                                                            <p className={"font-bold dark:text-zinc-300 text-zinc-600"}>{dayjs(comment?.created_at).format("DD MMM")}</p>
                                                                    </div>
                                                            </div>
                                                    </div>
                                                    <div className={"relative"} onClick={() => {
                                                            setIsPopoverOpen(!isPopoverOpen)
                                                            setCharsCountRevers(140 - comment?.message.length);
                                                    }} onMouseLeave={() => setIsPopoverOpen(false)}>
                                                            <BsThreeDots/>
                                                            {isPopoverOpen && (<Popover/>)}
                                                    </div>
                                            </div>
                                            <div
                                                className="mt-1.5 dark:dark:text-zinc-300 text-zinc-600 max-md:max-w-full">
                                                    {isOnUpdate ? (
                                                        <div>
                                                                <form action="#">
                                                                        <label htmlFor="tweet">
                                                                                <input
                                                                                    className={"mb-2 shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"}
                                                                                    type="text" id={props.isRetweet ? comment.tweet_id : comment?.id} value={comment?.message} name={'message'}
                                                                                    onChange={event => {
                                                                                            if(event.target.value.length <= 140) {
                                                                                                    setComment({
                                                                                                            ...comment,
                                                                                                            message: event.target.value
                                                                                                    })
                                                                                            }

                                                                                            setCharsCountRevers(140 - event.target.value.length);
                                                                                    }}
                                                                                />
                                                                        </label>
                                                                        <div className={"flex gap-1 mb-5"}>
                                                                                <button className={"bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"}
                                                                                        onClick={updateComment}
                                                                                >Submit</button>
                                                                                <button className={"bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"}
                                                                                        onClick={event => {
                                                                                                event.preventDefault();
                                                                                                setIsOnUpdate(false);
                                                                                        }}>Cancel</button>
                                                                        </div>
                                                                </form>
                                                                <p>{charsCountReverse} chars left.</p>
                                                        </div>
                                                    ) : <p>{comment.message}</p>}
                                            </div>
                                            <div
                                                className="flex gap-5 justify-between pr-14 mt-3 w-full text-sm text-gray-500 whitespace-nowrap max-md:flex-wrap max-md:pr-5 max-md:max-w-full">
                                                    <Link to={`/tweet/${props.isRetweet ? comment.tweet_id : comment.id}`}>
                                                            <div
                                                                className="flex gap-0 justify-between px-px dark:bg-black items-center cursor-pointer">
                                                                    <FaRegComment/>

                                                                    <div
                                                                        className="justify-center px-3 my-auto dark:bg-black aspect-[2.5]">
                                                                            0
                                                                    </div>
                                                            </div>
                                                    </Link>
                                                    <div
                                                        className="flex gap-0 justify-between dark:bg-black items-center cursor-pointer">
                                                            <FaRetweet/>
                                                            <div
                                                                className="justify-center px-3 my-auto dark:bg-black aspect-[2.94]">
                                                                    0
                                                            </div>
                                                    </div>
                                                    <div
                                                        className="flex gap-0 justify-between dark:bg-black items-center cursor-pointer">
                                                            <FaRegHeart/>
                                                            <div
                                                                className="justify-center px-3 my-auto dark:bg-black aspect-[2.94]">
                                                                    0
                                                            </div>
                                                    </div>
                                            </div>
                                    </div>
                            </div>
                    </div>
            </div>
        )
}

CommentBox.propTypes = {
        comment: PropTypes.object.isRequired,
        user: PropTypes.object.isRequired
}