<?php

require_once $_SERVER['DOCUMENT_ROOT'] . '/Model/Hashtag.php';
require_once $_SERVER['DOCUMENT_ROOT'] . '/app/Error.php';
require_once $_SERVER['DOCUMENT_ROOT'] . '/app/Request.php';
require_once $_SERVER['DOCUMENT_ROOT'] . '/app/Response.php';
require_once $_SERVER['DOCUMENT_ROOT'] . '/Model/User.php';
require_once $_SERVER['DOCUMENT_ROOT'] . '/security/middleware/cors.php';

class getAllTweetsFromHashtag extends Hashtag
{

        public function __construct()
        {
                parent::__construct();
        }

        public function index(array $data): void
        {
               if(!empty($data['hashtag']) && $data['hashtag'] === "all") {
                        goto all;
                }

               if(empty($data['hashtag'])) {
                       (new Response())->sendJSON([
                           'error' => 'Hashtag is required'
                       ], 400);
               }

                if (!empty($data['hashtag']) && $h = $this->getAllTweetsFromHashtag($data['hashtag'])) {
                        // return all tweets that references the hashtag
                        (new Response())->sendJSON([
                            "count" => count($h),
                            'tweets' => $h
                        ]);
                } else {
                        all:
                        // return all latest tweet
                        (new Response())->sendJSON([
                            "count" => count($this->getAllTweetsFromHashtag($_GET['hashtag'])),
                            'tweets' => $this->getAllTweetsFromHashtag($_GET['hashtag'])
                        ]);
                }

                (new Response())->sendJSON([
                    'error' => 'SERVER ERROR',
                ], 500);
        }
}

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        $getAllHashTag = new getAllTweetsFromHashtag();
        $getAllHashTag->index($_GET);
} else {
        (new Response())->sendJSON([
            'error' => 'Invalid request method'
        ], 400);
}