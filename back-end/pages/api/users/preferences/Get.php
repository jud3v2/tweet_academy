<?php

require_once $_SERVER['DOCUMENT_ROOT'] . '/app/Error.php';
require_once $_SERVER['DOCUMENT_ROOT'] . '/app/Request.php';
require_once $_SERVER['DOCUMENT_ROOT'] . '/app/Response.php';
require_once $_SERVER['DOCUMENT_ROOT'] . '/Model/UserPreferences.php';
require_once $_SERVER['DOCUMENT_ROOT'] . '/security/middleware/cors.php';


class Get
{
        public UserPreferences $user;

        public function __construct() {
                $this->user = new UserPreferences();
        }

        /**
         * @param string $username
         * @return Response
         */
        public function index(string $username): Response
         {
                $preferences = $this->user->getPreferences($username);

                if(!$preferences) {
                        (new Response())->sendJSON([
                                'message' => 'User not found'
                        ], 404);
                }

                (new Response())->sendJSON([
                        'preferences' => $preferences
                ]);
        }
}

(new Get())->index($_GET['username']);