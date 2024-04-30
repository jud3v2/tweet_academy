<?php

require_once $_SERVER['DOCUMENT_ROOT'] . '/app/Error.php';
require_once $_SERVER['DOCUMENT_ROOT'] . '/app/Request.php';
require_once $_SERVER['DOCUMENT_ROOT'] . '/app/Response.php';
require_once $_SERVER['DOCUMENT_ROOT'] . '/security/middleware/cors.php';

class GetListByUsername
{
        /**
         * @return void
         */
        static function index(): void
        {
                require_once $_SERVER['DOCUMENT_ROOT'] . '/Model/User.php';
                $user = new User();
                $users = $user->getUsers($_GET['username']);
                (new Response())->sendJSON($users);
        }
      
}


GetListByUsername::index();