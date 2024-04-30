<?php
require_once $_SERVER['DOCUMENT_ROOT'] . '/Model/Tweet.php';
require_once $_SERVER['DOCUMENT_ROOT'] . '/app/Error.php';
require_once $_SERVER['DOCUMENT_ROOT'] . '/app/Request.php';
require_once $_SERVER['DOCUMENT_ROOT'] . '/app/Response.php';
require_once $_SERVER['DOCUMENT_ROOT'] . '/Model/User.php';
require_once $_SERVER['DOCUMENT_ROOT'] . '/security/middleware/cors.php';

class GetOneTweet
{
    private Tweet $tweet;

    public function __construct()
    {
        $this->tweet = new Tweet();
    }

    public function index(): Response
    {
        $tweet = $this->tweet->getTweet($_GET['tweet']);

        if ($tweet) {
            (new Response())->sendJSON($tweet);
        } else {
            (new Response())->sendJSON([
                "message" => "Tweet not found."
            ], 404);
        }
    }
}

$_POST = (new Request($_GET, $_POST))->getPost();
(new GetOneTweet())->index();