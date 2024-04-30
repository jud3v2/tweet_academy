<?php

require_once $_SERVER['DOCUMENT_ROOT'] . '/Model/Tweet.php';
require_once $_SERVER['DOCUMENT_ROOT'] . '/app/Response.php';
require_once $_SERVER['DOCUMENT_ROOT'] . '/Model/User.php';
require_once $_SERVER['DOCUMENT_ROOT'] . '/security/middleware/cors.php';

// TODO: get all tweets
// TODO: get all tweets from a tweet_id (thread)


class GetTweets extends Tweet
{
        public function index(): void
        {
                $parameter = $_GET['parameter'];
                if ($parameter === 'all') {
                        $tweets = $this->getAllTweets();
                        (new Response())->sendJSON($tweets, 200);
                } /*else if ($parameter === 'thread') {
                        $tweet_id = $_GET['id'];
                        $tweets = $this->getTweets($tweet_id);
                        (new Response())->sendJSON($tweets, 200);
                } */ elseif($parameter === 'user') {
                        if(isset($_GET['id'])) {
                                $user_id = $_GET['id'];
                                $tweets = $this->getTweetsByUser($user_id);
                                (new Response())->sendJSON($tweets, 200);
                        } else {
                                (new Response())->sendJSON(['error' => 'Invalid parameter'], 400);
                        }
                } else {
                        (new Response())->sendJSON(['error' => 'Invalid parameter'], 400);
                }

        }
}

(new GetTweets())->index();