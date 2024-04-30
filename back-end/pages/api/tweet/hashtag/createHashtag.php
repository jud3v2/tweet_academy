<?php

require_once $_SERVER['DOCUMENT_ROOT'] . '/Model/Hashtag.php';
require_once $_SERVER['DOCUMENT_ROOT'] . '/app/Error.php';
require_once $_SERVER['DOCUMENT_ROOT'] . '/app/Request.php';
require_once $_SERVER['DOCUMENT_ROOT'] . '/app/Response.php';
require_once $_SERVER['DOCUMENT_ROOT'] . '/Model/User.php';
require_once $_SERVER['DOCUMENT_ROOT'] . '/security/middleware/cors.php';

class createHashtag extends Hashtag
{

        public function __construct()
        {
                parent::__construct();
        }

        public function index(array $data): Response
        {
                // If one of the fields is empty (tweet_id || rtweet_id) and no name, we return an error
                if ((empty($data['tweet_id']) || empty($data['rtweet_id'])) && empty($data['name'])) {
                        (new Response())->sendJSON([
                            'error' => 'Tweet id or retweet id or name is required',
                            'message' => 'Tweet id or retweet id  or name is required'
                        ], 400);
                }

                if (is_string($data['name']) && !str_starts_with($data['name'], '#')) {
                        (new Response())->sendJSON([
                            'error' => 'Hashtag must start with #',
                            'message' => 'Hashtag must start with #'
                        ], 400);
                }

                if ($h = $this->getHashtagByName($data['name'])) {
                        (new Response())->sendJSON([
                            'error' => 'Hashtag already exists',
                            'hashtag' => $h
                        ], 409);
                } else {
                        (new Response())->sendJSON([
                            'data' => $this->createHashtag($data)
                        ]);
                }

                (new Response())->sendJSON([
                    'error' => 'SERVER ERROR',
                ], 500);
        }
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $request = new Request($_GET, $_POST);
        $data = $request->getPost();
        $createHashtag = new createHashtag();
        $response = new Response();
        $createHashtag->index($data);
} else {
        (new Response())->sendJSON([
            'error' => 'Invalid request method'
        ], 400);
}