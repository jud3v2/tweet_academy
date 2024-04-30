<?php

require_once $_SERVER['DOCUMENT_ROOT'] . '/app/Error.php';
require_once $_SERVER['DOCUMENT_ROOT'] . '/app/Request.php';
require_once $_SERVER['DOCUMENT_ROOT'] . '/app/Response.php';
require_once $_SERVER['DOCUMENT_ROOT'] . '/security/middleware/cors.php';

class Login
{

        /**
         * @param string $username
         * @param string $password
         * @return void
         */
        static function index(string $username, string $password): void
        {
                // before to register the user, we need to check if the user already exist.
                // if the user already exist, we need to redirect the user to the login page.
                // if the user doesn't exist, we need to register the user and redirect the user to the home page and connect him to session.
                require_once $_SERVER['DOCUMENT_ROOT'] . '/Model/User.php';
                $user = new User();

                if ($user->getUserByUsername($username)) {
                        try {
                                // Check if credentials is valid, if is invalid redirect to connexion.
                                if (!$user->login($username, $password)) {
                                        // HTTP 400 Conflict because the credentials does not match.
                                        (new Response())->sendJSON([
                                            "message" => "Les identifiants ne correspondent pas."
                                        ], 400);

                                        exit();
                                }

                                // If exit the user has the right credentials, redirect to home page.
                        } catch (Exception $e) {
                                // HTTP 500 Internal Server Error because the user can't be registered.
                                (new Response())->sendJSON([
                                    "message" => $e->getMessage()
                                ], 500);
                                exit();
                        }

                        // connect the user to the session
                        require_once $_SERVER['DOCUMENT_ROOT'] . '/security/middleware/session.php';
                        $s = new session();
                        $s->setSession('user', array_unique($user->getUserByUsername($username)));

                        // HTTP 200 OK because the user has the right credentials.
                        // Send the user data to the client.
                        (new Response())->sendJSON([
                            "user" => self::userWithoutPassword($user->getUserByUsername($username)),
                            "message" => "You are connected.",
                            "status" => "success",
                        ]);
                } else {
                        // HTTP 400 Conflict because the credentials does not match..
                        (new Response())->sendJSON([
                            "message" => "User does not exist."
                        ], 404);
                }
                exit();
        }

        static public function validateData($data): bool|array
        {
                extract($data);
                $errors = [];

                // Check if the mail is valid
                if (strlen($username) < 4) {
                        $errors['username'] = "[$username] is not a valid username";
                }

                // Check if the password is valid
                if (strlen($password) < 8) {
                        $errors['password'] = "Password need to be at least 8 characters long.";
                }

                if (count($errors) > 0) {
                        return $errors;
                }

                return true;
        }

        static private function userWithoutPassword(array $user): array
        {
                unset($user['password_hash']);
                return $user;
        }
}

$r = new Request($_GET, $_POST);
$_POST = $r->getPost();

if (count($_POST) > 0) {
        $username = $_POST['username'];
        $password = $_POST['password'];

        if (Login::validateData($_POST) === true) {
                Login::index($username, $password);
        } else {
                // display errors to users
                (new ResponseError(
                    400,
                    message: Login::validateData($_POST)
                ))->giveResponse();
        }
} else {
        (new ResponseError(
            409,
            message: ["Request does not contain any data."]
        ))->giveResponse();
}
exit();