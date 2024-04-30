<?php
require_once $_SERVER['DOCUMENT_ROOT'] . '/app/Error.php';
require_once $_SERVER['DOCUMENT_ROOT'] . '/app/Request.php';
require_once $_SERVER['DOCUMENT_ROOT'] . '/app/Response.php';
require_once $_SERVER['DOCUMENT_ROOT'] . '/Model/User.php';
require_once $_SERVER['DOCUMENT_ROOT'] . '/security/middleware/cors.php';
require_once $_SERVER['DOCUMENT_ROOT'] . '/Model/Comment.php';
require_once $_SERVER['DOCUMENT_ROOT'] . '/Model/Tweet.php';

class CreateComment
{
    private Comment $comment;
    private Tweet $tweet;

    public function __construct(Comment $comment, Tweet $tweet)
    {
        $this->comment = $comment;
        $this->tweet = $tweet;
    }

    public function index()
    {
        try {
            $requestData = $_POST;
            $this->validateInput($requestData);

            $user = (new User())->getUserById($requestData['user_id']);
            if (!$user) {
                (new Response())->sendJSON(["message" => "User not found."], 404);
            }

            $tweet = $this->tweet->getTweet($requestData['tweet_id']);
            if (!$tweet) {
                (new Response())->sendJSON(["message" => "Tweet not found."], 404);
            }

            $requestData['user_id'] = $user['id'];

            $comment = $this->comment->createComment($requestData);
            if ($comment) {
                (new Response())->sendJSON(["message" => "Comment created."], 200);
            } else {
                (new Response())->sendJSON(["message" => "Failed to create comment."], 500);
            }
        } catch (Exception $e) {
            (new Response())->sendJSON(["message" => $e->getMessage()], $e->getCode());
        }
    }

    private function validateInput($data)
    {
        if (empty($data['user_id']) || empty($data['tweet_id']) || empty($data['comment'])) {
            (new Response())->sendJSON(["message" => "User_id, tweet_id or comment required"], 400);
        }
    }
}

$_POST = (new Request($_GET, $_POST))->getPost();
(new CreateComment(new Comment(), new Tweet()))->index();
