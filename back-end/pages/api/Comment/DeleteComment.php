<?php
require_once $_SERVER['DOCUMENT_ROOT'] . '/app/Error.php';
require_once $_SERVER['DOCUMENT_ROOT'] . '/app/Request.php';
require_once $_SERVER['DOCUMENT_ROOT'] . '/app/Response.php';
require_once $_SERVER['DOCUMENT_ROOT'] . '/Model/User.php';
require_once $_SERVER['DOCUMENT_ROOT'] . '/security/middleware/cors.php';
require_once $_SERVER['DOCUMENT_ROOT'] . '/Model/Comment.php';
require_once $_SERVER['DOCUMENT_ROOT'] . '/Model/Tweet.php';

class DeleteComment
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
        $requestData = $_GET;
        $this->comment->validateData($requestData, "delete");
        $user = (new User())->getUserById($requestData['user_id']);
        if (!$user) {
            (new Response())->sendJSON(["message" => "User not found."], 404);
        }
        $comment = $this->comment->getComment($requestData['comment_id']);
        if (!$comment) {
            (new Response())->sendJSON(["message" => "Comment not found."], 404);
        }
        $comment = $this->comment->commentDelete($requestData['comment_id'], $requestData['user_id']);
        if ($comment) {
            (new Response())->sendJSON(["message" => "Comment deleted."], 200);
        } else {
            (new Response())->sendJSON(["message" => "Your not the owner of the comment or comment not found."], 404);
        }
    }
}


$_POST = (new Request($_GET, $_POST))->getPost();
(new DeleteComment(new Comment(), new Tweet()))->index();
