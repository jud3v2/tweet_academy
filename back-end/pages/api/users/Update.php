<?php

require_once $_SERVER['DOCUMENT_ROOT'] . '/app/Error.php';
require_once $_SERVER['DOCUMENT_ROOT'] . '/app/Request.php';
require_once $_SERVER['DOCUMENT_ROOT'] . '/app/Response.php';
require_once $_SERVER['DOCUMENT_ROOT'] . '/security/middleware/cors.php';

class Update
{
        /**
         * @param array $data
         * @return void
         */
        public static function index(array $data): void
        {
                extract($data);
                // before to register the user, we need to check if the user already exist.
                // if the user already exist, we need to redirect the user to the login page.
                // if the user doesn't exist, we need to register the user and redirect the user to the home page and connect him to session.
                require_once $_SERVER['DOCUMENT_ROOT'] . '/Model/User.php';
                $user = new User();

                require_once $_SERVER['DOCUMENT_ROOT'] . '/security/middleware/session.php';
                $s = new Session();

/*                if (!$s->isConnected()) {
                        http_response_code(401);
                        echo json_encode(['message' => "Vous devez être connecté pour effectuer cette action"]);
                        exit();
                }*/

                // check if tuser exist
                if ($user->getUserByUsername($username)) {
                        $validateData = self::validateData($data);
                        if ($validateData === true) {
                                if ($user->update($data)) {
                                        $s->renewUserSession(
                                        // get the updated user by email
                                            $user->getUserByUsername($username)
                                        );

                                        (new Response())->sendJSON([
                                            "message" => "L'utilisateur a été modifié avec succès",
                                            "user" => User::userWithoutPassword($user->getUserByUsername($username)),
                                                "preferences" => $user->getRelation($user->getUserByUsername($username)['id'], "users_preferences")
                                        ]);
                                } else {
                                        (new Response())->sendJSON([
                                            "message" => "User cannot be updated",
                                        ], 500);
                                }
                        } else {
                                (new Response())->sendJSON([
                                    "message" => "Invalid data",
                                    "errors" => $validateData
                                ], 400);
                        }
                } else {
                        (new Response())->sendJSON([
                            "message" => "User not found",
                        ], 404);
                }

                ob_clean(); // clean the buffer
        }

        /**
         */
        static function validateData($data): bool|array
        {
                extract($data);
                $errors = [];

                if (empty($username)) {
                        $errors['username'] = "Your username is required";
                }

                // Check if the mail is valid
                if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
                        $errors['email'] = "Email is not valid";
                }

                // Check if the birthday is valid and the age is more than 18
                if (empty($birthdate) || (new DateTime())->diff(new DateTime($birthdate))->y < 18) {
                        $errors['birthday'] = "La date de naissance est obligatoire et vous devez être majeur";
                }

                // Check if the genre is valid enum value (homme, femme, autre)
                if (!in_array($genre, ['man', 'woman', 'other'])) {
                        $errors['genre'] = "Gender is not a valid gender";
                }

                if(empty($firstname)) {
                        $errors['firstname'] = "Your firstname is required";
                }

                if(empty($lastname)) {
                        $errors['lastname'] = "Your lastname is required";
                }
                
                if (count($errors) > 0) {
                        return $errors;
                }

                return true;
        }
}

$r = new Request($_GET, $_POST);
$_POST = $r->getPost();

if (count($_POST) > 0) {
        Update::index($_POST);
} else {
        http_response_code(400);
        echo "Bad request";
}
