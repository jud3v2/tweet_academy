<?php
require_once $_SERVER['DOCUMENT_ROOT'] . '/app/Error.php';
require_once $_SERVER['DOCUMENT_ROOT'] . '/app/Request.php';
require_once $_SERVER['DOCUMENT_ROOT'] . '/app/Response.php';
require_once $_SERVER['DOCUMENT_ROOT'] . '/Model/User.php';
require_once $_SERVER['DOCUMENT_ROOT'] . '/security/middleware/cors.php';

class Delete
{
        private User $user;

        public function __construct()
        {
                $this->user = new User();
        }

        /**
         * @description make the user field onDelete to true
         * @param $data
         * @return Response
         */
        public function index($data): Response
        {
                extract($data);
                if ($this->validateData($data)) {
                        if ($user = $this->user->getUserByUsername($username)) {
                                if ($this->user->delete($username)) {
                                        (new Response())->sendJSON([
                                            "message" => "L'utilisateur a bien été supprimé.",
                                            "user" => $this->user->getUserByUsername($username)
                                        ], 200);
                                } else {
                                        (new Response())->sendJSON([
                                            "message" => "L'utilisateur n'a pas été supprimé."
                                        ], 400);
                                }
                        } else {
                                (new Response())->sendJSON([
                                    "message" => "User doesn't exist."
                                ], 404);
                        }
                } else {
                        (new Response())->sendJSON([
                            "message" => "Invalid data."
                        ], 404);
                }
        }

        public function validateData($data): array|bool
        {
                extract($data);

                $error = [];

                if (!empty($username)) {
                        $error['username'] = 'Username is required';
                }

                if(count($error) > 0) {
                        return $error;
                }

                return true;
        }
}


(new Delete())->index($_GET);