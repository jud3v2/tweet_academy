<?php

require_once $_SERVER['DOCUMENT_ROOT'] . '/app/Error.php';
require_once $_SERVER['DOCUMENT_ROOT'] . '/app/Request.php';
require_once $_SERVER['DOCUMENT_ROOT'] . '/app/Response.php';
require_once $_SERVER['DOCUMENT_ROOT'] . '/security/middleware/cors.php';

class Register extends Response
{
    /**
     * @param $username
     * @param $email
     * @param $password
     * @param $firstname
     * @param $lastname
     * @param $birthdate
     * @param $genre
     * @return void
     */
    static function index($username, $email, $password, $firstname, $lastname, $birthdate, $genre): void
    {
        // before to register the user, we need to check if the user already exist.
        // if the user already exist, we need to redirect the user to the login page.
        // if the user doesn't exist, we need to register the user and redirect the user to the home page and connect him to session.
        require_once $_SERVER['DOCUMENT_ROOT'] . '/Model/User.php';
        $user = new User();

        if ($user->getUserByEmail($email)) {
            // HTTP 409 Conflict because the user already exist.
            http_response_code(409);

            exit();
        } else {
            try {
                (new Register)->sendJSON(
                    $user->register(
                        $username,
                        $email,
                        $password,
                        $firstname,
                        $lastname,
                        $birthdate,
                        $genre
                    ), 201);
            } catch (Exception $e) {
                // HTTP 500 Internal Server Error because the user can't be registered.
                (new Response())->sendJSON([
                    "message" => "Internal Server Error $e->getMessage()",
                ], 500);
            }
        }
    }

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

        // Check if the password is valid
        if (strlen($password) < 8) {
            $errors['password'] = "Password does not match the requirements of minimum 8 characters";
        }

        // Check if the birthday is valid and the age is more than 18
        if (empty($birthdate) || (new DateTime())->diff(new DateTime($birthdate))->y < 18) {
            $errors['birthday'] = "La date de naissance est obligatoire et vous devez être majeur";
        }

        // Check if the genre is valid enum value (homme, femme, autre)
        if (!in_array($genre, ['man', 'woman', 'other'])) {
            $errors['genre'] = "Gender is not a valid gender";
        }

        if (empty($firstname)) {
            $errors['firstname'] = "Your firstname is required";
        }

        if (empty($lastname)) {
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
    $username = $_POST['username'];
    $lastname = $_POST['lastname'];
    $firstname = $_POST['firstname'];
    $email = $_POST['email'];
    $password = $_POST['password'];
    $birthdate = $_POST['birthdate'];
    $genre = $_POST['genre'];

    if (Register::validateData($_POST) === true) {
        Register::index($username, $email, $password, $firstname, $lastname, $birthdate, $genre);
    } else {
        // display errors to users
        (new Response())->sendJSON([
            "message" => "Invalid data",
            "errors" => Register::validateData($_POST)
        ], 400);
    }
} else {
    // display errors to users
    (new Response())->sendJSON([
        "message" => "Invalid request",
    ], 400);
}