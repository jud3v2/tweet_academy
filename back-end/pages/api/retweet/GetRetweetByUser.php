<?php
require_once $_SERVER['DOCUMENT_ROOT'] . '/Model/ReTweet.php';
require_once $_SERVER['DOCUMENT_ROOT'] . '/app/Error.php';
require_once $_SERVER['DOCUMENT_ROOT'] . '/app/Request.php';
require_once $_SERVER['DOCUMENT_ROOT'] . '/app/Response.php';
require_once $_SERVER['DOCUMENT_ROOT'] . '/Model/User.php';
require_once $_SERVER['DOCUMENT_ROOT'] . '/security/middleware/cors.php';

class GetRetweetByUser
{
    private ReTweet $retweet;

    public function __construct()
    {
        $this->retweet = new ReTweet();
    }

    public function index(): void
    {
        $data = $_GET;
        $user = (new User())->getUserById($data['user_id']);
        if (!$user) {
            (new Response())->sendJSON([
                "message" => "User not found."
            ], 404);
        } else {
            $retweet = $this->retweet->getretweetByuserid($data['user_id']);
            if ($retweet) {
                (new Response())->sendJSON([
                    "message" => "ReTweet found.",
                    "retweet" => $retweet,
                    "count" => count($retweet)
                ], 200);
            } else {
                (new Response())->sendJSON([
                    "message" => "ReTweet not found."
                ], 404);
            }
        }
    }
}

$_POST = (new Request($_GET, $_POST))->getPost();
(new GetRetweetByUser())->index();