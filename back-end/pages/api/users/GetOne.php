<?php

require_once $_SERVER['DOCUMENT_ROOT'] . '/app/Error.php';
require_once $_SERVER['DOCUMENT_ROOT'] . '/app/Request.php';
require_once $_SERVER['DOCUMENT_ROOT'] . '/app/Response.php';
require_once $_SERVER['DOCUMENT_ROOT'] . '/Model/User.php';
require_once $_SERVER['DOCUMENT_ROOT'] . '/security/middleware/cors.php';

class GetOne
{
        /**
         * @return void
         */
        static function username(): void
        {
                $user = new User();
                $username = $_GET['username'];
                $users = $user->getByUsernameAndWithRelations($username, relations: [
                    "preferences",
                    "tweets",
                    "rtweets",
                    "follower",
                    "following",
                    "tweets_comments",
                    "hashtag",
                ]);
                if ($users === false) {
                        (new Response())->sendJSON(['error' => 'User not found'], 404);
                } else {
                        (new Response())->sendJSON(User::userWithoutPassword($users));
                }
        }

        static function email(): void
        {
                $user = new User();
                $email = $_GET['email'];
                $users = $user->getUserByEmail($email);
                if ($users === false) {
                        (new Response())->sendJSON(['error' => 'User not found'], 404);
                } else {
                        (new Response())->sendJSON(User::userWithoutPassword($users));
                }
        }

        static function id(): void
        {
                $user = new User();
                $id = $_GET['id'];
                $users = $user->getUserById($id);
                if ($users === false) {
                        (new Response())->sendJSON(['error' => 'User not found'], 404);
                } else {
                        (new Response())->sendJSON(User::userWithoutPassword($users));
                }
        }

}


if (isset($_GET['username'])) {
        GetOne::username();
} elseif (isset($_GET['email'])) {
        GetOne::email();
} else if (isset($_GET['id'])) {
        GetOne::id();
} else {
        // Handle the case where neither parameter is set
        (new Response())->sendJSON(['error' => 'No search parameter provided'], 400);
}