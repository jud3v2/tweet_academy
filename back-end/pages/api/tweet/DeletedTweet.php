<?php
require_once $_SERVER['DOCUMENT_ROOT'] . '/Model/Tweet.php';
require_once $_SERVER['DOCUMENT_ROOT'] . '/app/Error.php';
require_once $_SERVER['DOCUMENT_ROOT'] . '/app/Request.php';
require_once $_SERVER['DOCUMENT_ROOT'] . '/app/Response.php';
require_once $_SERVER['DOCUMENT_ROOT'] . '/Model/User.php';
require_once $_SERVER['DOCUMENT_ROOT'] . '/security/middleware/cors.php';

class DeletedTweet
{
    private Tweet $tweet;

    public function __construct()
    {
        $this->tweet = new Tweet();
    }

    public function index(): void
    {
        $data = $_GET;

        if (isset($data['tweet']) && isset($data['user_id'])) {
            $tweetData = $this->tweet->getTweet($data['tweet']);

            if ($tweetData) {
                if ($tweetData['user_id'] == $data['user_id']) {;
                     (new Response())->sendJSON([
                        "data" => $this->tweet->tweetDelete($data['tweet'], $data['user_id'])
                    ], 200);
                } else {
                     (new Response())->sendJSON([
                        "message" => "Unauthorized: You are not allowed to delete this tweet."
                    ], 401);
                }
            } else {

                 (new Response())->sendJSON([
                    "message" => "Tweet not found."
                ], 404);
            }
        } else {
             (new Response())->sendJSON([
                "message" => "Bad Request: Tweet ID or User ID is missing."
            ], 400);
        }
    }
}

$_POST = (new Request($_GET, $_POST))->getPost();
(new DeletedTweet())->index();