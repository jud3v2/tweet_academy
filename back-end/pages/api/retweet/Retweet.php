<?php
require_once $_SERVER['DOCUMENT_ROOT'] . '/Model/ReTweet.php';
require_once $_SERVER['DOCUMENT_ROOT'] . '/app/Error.php';
require_once $_SERVER['DOCUMENT_ROOT'] . '/app/Request.php';
require_once $_SERVER['DOCUMENT_ROOT'] . '/app/Response.php';
require_once $_SERVER['DOCUMENT_ROOT'] . '/Model/User.php';
require_once $_SERVER['DOCUMENT_ROOT'] . '/security/middleware/cors.php';

class createReTweet
{
    private ReTweet $retweet;

    public function __construct()
    {
        $this->retweet = new ReTweet();
    }

    public function index(): Response
    {
        $data = $_POST;
        $user = (new User())->getUserById($data['user_id']);
        if (!$user) {
            (new Response())->sendJSON([
                "message" => "User not found."
            ], 404);
        }
        if (empty($data['tweet_id'])) {
            (new Response())->sendJSON([
                "message" => "Tweet id is required."
            ], 404);
        }

        $data['user_id'] = $user['id'];
        $retweet = $this->retweet->getReTweetByUserIdAndTweetId($data['user_id'], $data['tweet_id']);
        if ($retweet) {
            $retweetId = $retweet['id'];
            $userId = $retweet['user_id'];
            $deleted = $this->retweet->retweetDelete($retweetId, $userId);
            if ($deleted) {
                (new Response())->sendJSON([
                    "message" => "ReTweet deleted.",
                ], 200);
            } else {
                (new Response())->sendJSON([
                    "message" => "ReTweet not deleted."
                ], 404);
            }
        } else {
            $retweet = $this->retweet->createReTweet($data);
            if ($retweet) {
                (new Response())->sendJSON([
                    "message" => "ReTweet created.",
                ], 201);
            } else {
                (new Response())->sendJSON([
                    "message" => "ReTweet not created."
                ], 404);
            }
        }
    }
}
$_POST = (new Request($_GET, $_POST))->getPost();
(new createReTweet())->index();