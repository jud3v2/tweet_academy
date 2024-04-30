<?php
require_once $_SERVER['DOCUMENT_ROOT'] . '/Model/Tweet.php';
require_once $_SERVER['DOCUMENT_ROOT'] . '/app/Error.php';
require_once $_SERVER['DOCUMENT_ROOT'] . '/app/Request.php';
require_once $_SERVER['DOCUMENT_ROOT'] . '/app/Response.php';
require_once $_SERVER['DOCUMENT_ROOT'] . '/Model/User.php';
require_once $_SERVER['DOCUMENT_ROOT'] . '/security/middleware/cors.php';

class UpdateTweet {
    private Tweet $tweet;

    public function __construct() {
        $this->tweet = new Tweet();
    }

    public function index(): void {
        $data = $_POST;

        if (isset($data['tweet']) && isset($data['message']) && isset($data['user_id'])) {
            $tweetId = $data['tweet'];

            $updatedTweet = $this->tweet->updateTweet($tweetId, $data);

            if ($updatedTweet) {
                 (new Response())->sendJSON([
                    "tweet" => "tweet modified successfully"
                ], 200);
            } else {
                 (new Response())->sendJSON([
                    "message" => "Failed to update tweet."
                ], 500);
            }
        } else {
            (new Response())->sendJSON([
                "message" => "Missing required data.",
                "data" => $data
            ], 400);
        }
    }
}
$_POST = (new Request($_GET, $_POST))->getPost();
(new updateTweet())->index();