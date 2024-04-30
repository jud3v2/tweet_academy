<?php
require_once $_SERVER['DOCUMENT_ROOT'] . '/app/Error.php';
require_once $_SERVER['DOCUMENT_ROOT'] . '/app/Request.php';
require_once $_SERVER['DOCUMENT_ROOT'] . '/app/Response.php';
require_once $_SERVER['DOCUMENT_ROOT'] . '/Model/User.php';
require_once $_SERVER['DOCUMENT_ROOT'] . '/security/middleware/cors.php';
require_once $_SERVER['DOCUMENT_ROOT'] . '/Model/Comment.php';
require_once $_SERVER['DOCUMENT_ROOT'] . '/Model/Tweet.php';

class GetCommentByTweet
{
        private Comment $comment;
        private Tweet $tweet;

        public function __construct()
    {
        $this->comment = new Comment();
        $this->tweet = new Tweet();
    }

    public function getCommentByTweet(): void
    {
        $data = $_GET;
        if (isset($data['tweet_id'])) {
            $tweet = $this->tweet->getTweet($data['tweet_id']);
            if ($tweet) {
                $comments = $this->comment->getCommentsByTweetId($data['tweet_id']);
                if ($comments) {
                    (new Response())->sendJSON($comments, 200);
                } else {
                    (new Response())->sendJSON([], 404);
                }
            } else {
                (new Response())->sendJSON(["message" => "Tweet not found"], 404);
            }
        } else {
            (new Response())->sendJSON(["message" => "Invalid request"], 400);
        }
    }
}
$_POST = (new Request($_GET, $_POST))->getPost();
(new GetCommentByTweet())->getCommentByTweet();