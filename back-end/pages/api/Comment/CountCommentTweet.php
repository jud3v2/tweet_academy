<?php
require_once $_SERVER['DOCUMENT_ROOT'] . '/app/Error.php';
require_once $_SERVER['DOCUMENT_ROOT'] . '/app/Request.php';
require_once $_SERVER['DOCUMENT_ROOT'] . '/app/Response.php';
require_once $_SERVER['DOCUMENT_ROOT'] . '/Model/User.php';
require_once $_SERVER['DOCUMENT_ROOT'] . '/security/middleware/cors.php';
require_once $_SERVER['DOCUMENT_ROOT'] . '/Model/Comment.php';
require_once $_SERVER['DOCUMENT_ROOT'] . '/Model/Tweet.php';

class CountCommentTweet
{
    private Comment $comment;
    private Tweet $tweet;

    public function __construct(Comment $comment, Tweet $tweet)
    {
        $this->comment = $comment;
        $this->tweet = $tweet;
    }

    public function index(): void
    {
        $requestData = $_GET;
        $tweet = $this->tweet->getTweet($requestData['tweet_id']);
        if (!$tweet) {
            (new Response())->sendJSON(["message" => "Tweet not found."], 404);
        }
        $comment = $this->comment->getCommentsByTweetId($requestData['tweet_id']);
        if ($comment) {
            (new Response())->sendJSON(["message" => "Comment count.", "count" => count($comment)], 200);
        } else {
            (new Response())->sendJSON(["message" => "No comments found.", "count" => 0], 200);
        }
    }
}
$_POST = (new Request($_GET, $_POST))->getPost();
(new CountCommentTweet(new Comment(), new Tweet()))->index();