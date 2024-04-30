<?php

require_once $_SERVER['DOCUMENT_ROOT'] . '/app/Error.php';
require_once $_SERVER['DOCUMENT_ROOT'] . '/app/Request.php';
require_once $_SERVER['DOCUMENT_ROOT'] . '/app/Response.php';
require_once $_SERVER['DOCUMENT_ROOT'] . '/security/middleware/cors.php';

class GetAll
{
        /**
         * @return void
         */
        static function index(): void
        {
                require_once $_SERVER['DOCUMENT_ROOT'] . '/Model/User.php';
                $user = new User();
                $users = $user->getUsers(limit: $_GET['limit'] ?? null);
                (new Response())->sendJSON($users);
        }
      
}


GetAll::index();
