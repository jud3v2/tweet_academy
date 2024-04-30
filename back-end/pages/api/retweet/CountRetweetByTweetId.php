<?php
require_once $_SERVER['DOCUMENT_ROOT'] . '/Model/ReTweet.php';
require_once $_SERVER['DOCUMENT_ROOT'] . '/app/Error.php';
require_once $_SERVER['DOCUMENT_ROOT'] . '/app/Request.php';
require_once $_SERVER['DOCUMENT_ROOT'] . '/app/Response.php';
require_once $_SERVER['DOCUMENT_ROOT'] . '/Model/User.php';
require_once $_SERVER['DOCUMENT_ROOT'] . '/security/middleware/cors.php';

class CountRetweetByTweetId
{
    private ReTweet $retweet;

    public function __construct()
    {
        $this->retweet = new ReTweet();
    }

    public function index(): Response
    {
        $data = $_POST;
        if (empty($data['tweet_id'])) {
            (new Response())->sendJSON([
                "message" => "Tweet id is required."
            ], 404);
        }else{
            $retweet = $this->retweet->countRetweetById($data['tweet_id']);
            if ($retweet) {
                (new Response())->sendJSON([
                    "message" => "ReTweet found.",
                    "retweet" => $retweet,
                ], 200);
            } else {
                (new Response())->sendJSON([
                    "message" => "ReTweet not found.",
                    "retweet" => 0
                ], 200);
            }
        }
    }
}

$_POST = (new Request($_GET, $_POST))->getPost();
(new CountRetweetByTweetId())->index();