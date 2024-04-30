<?php
require_once $_SERVER['DOCUMENT_ROOT'] . '/Model/Tweet.php';
require_once $_SERVER['DOCUMENT_ROOT'] . '/Model/Hashtag.php';
require_once $_SERVER['DOCUMENT_ROOT'] . '/app/Error.php';
require_once $_SERVER['DOCUMENT_ROOT'] . '/app/Request.php';
require_once $_SERVER['DOCUMENT_ROOT'] . '/app/FileUpload.php';
require_once $_SERVER['DOCUMENT_ROOT'] . '/app/Response.php';
require_once $_SERVER['DOCUMENT_ROOT'] . '/Model/User.php';
require_once $_SERVER['DOCUMENT_ROOT'] . '/security/middleware/cors.php';

class createTweet
{
    private Tweet $tweet;

    public function __construct()
    {
        $this->tweet = new Tweet();
    }
    public function index(): void
    {
        $data = $_POST;
        $user = (new User())->getUserById($data['user_id']);

        if(!$user) {
            (new Response())->sendJSON([
                "message" => "User not found."
            ], 404);
        }

        $data['user_id'] = $user['id'];

        $data['file'] = $_FILES;

        if(isset($data['file'])) {
                // create with the creation of a media
                $tweet = $this->tweet->createTweet($data);
                $data['post']['tweet_id'] = $tweet['tweet']['id'];
                FileUpload::store($data);
        } else {
                $tweet = $this->tweet->createTweet($data);
        }

        if ($tweet) {
                if($tweet['hashtag']) {
                    (new Hashtag())->createHashtags($tweet['hashtag'], $tweet['tweet']['id']);
                }
            (new Response())->sendJSON($tweet, 201);
        } else {
            (new Response())->sendJSON([
                "message" => "Tweet not created."
            ], 404);
        }
    }

    public function validatedate(array $data): array|bool
{
    extract($data);

    $error = [];

    if (empty($user_id)) {
        $error['user_id'] = 'User id is required';
    }

    if ((new User())->getUserById($user_id) === false) {
        $error['user_id'] = 'User id is invalid or unknown.';
    }

    if (empty($message)) {
        $error['message'] = 'Message is required';
    }

    if (!empty($error)) {
        (new Response())->sendJSON([
            "error" => $error
        ], 400);
        return false;
    } else {
        return $data;
    }
}

}

$_POST = (new Request($_GET, $_POST))->getPost();
(new createTweet())->index();
