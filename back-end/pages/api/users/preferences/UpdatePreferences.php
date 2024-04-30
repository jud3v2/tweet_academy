<?php

require_once $_SERVER['DOCUMENT_ROOT'] . '/app/Error.php';
require_once $_SERVER['DOCUMENT_ROOT'] . '/app/Request.php';
require_once $_SERVER['DOCUMENT_ROOT'] . '/app/Response.php';
require_once $_SERVER['DOCUMENT_ROOT'] . '/Model/UserPreferences.php';
require_once $_SERVER['DOCUMENT_ROOT'] . '/Model/User.php';
require_once $_SERVER['DOCUMENT_ROOT'] . '/security/middleware/cors.php';

class UpdatePreferences
{
        public function index($username, array $preferences): void
        {
                $user = new User();

                if(!$user->getUserByUsername($username)) {
                        (new Response())->sendJSON([
                                'message' => 'User not found'
                        ], 404);
                }

                $userPreferences = new UserPreferences();

                if(!$this->validatePartialUpdate($preferences)) {
                        (new Response())->sendJSON([
                                'message' => 'Invalid data'
                        ], 400);
                }

                if($userPreferences->updatePreferences($username, $preferences)) {
                        (new Response())->sendJSON([
                                'message' => 'Preferences updated'
                        ]);
                } else {
                        (new Response())->sendJSON([
                                'message' => 'User not found'
                        ], 404);
                }
        }

        public function validatePreferences(array $preferences): array
        {
                $errors = [];

                // Define validation rules for each expected preference key
                $validationRules = [
                    "bio" => function ($value) {
                            return is_string($value) && strlen($value) <= 255;
                    },
                        // Add more validation rules as needed for other preferences
                ];

                // Validate each preference
                foreach ($preferences as $key => $value) {
                        if (!isset($validationRules[$key])) {
                                $errors[$key] = "Invalid preference key.";
                                continue;
                        }

                        $validator = $validationRules[$key];
                        if (!$validator($value)) {
                                $errors[$key] = "Invalid value for preference.";
                        }
                }

                return $errors;
        }

        public function validatePartialUpdate(array $data): array|true
        {
                $errors = [];
                $allowedFields = ["bio", "theme", "profile_picture", "profile_banner"]; // Champs possibles

                // Vérifier si tous les champs sont valides
                foreach ($data as $key => $value) {
                        if (!in_array($key, $allowedFields)) {
                                $errors[$key] = "Champ invalide.";
                                continue;
                        }

                        // Validation spécifique à chaque champ (similaire à "validatePreferences")
                        switch ($key) {
                                case "bio":
                                        if (!is_string($value) || strlen($value) > 255) {
                                                $errors[$key] = "Valeur invalide pour la bio.";
                                        }
                                        break;
                                case "theme":
                                        if (!is_string($value) || empty($value)) {
                                                $errors[$key] = "Valeur invalide pour le thème.";
                                        }
                                        break;
                                // Ajouter des cas pour d'autres champs
                        }
                }

                return count($errors) > 0 ? $errors : true;
        }
}

if (isset($_GET['username']) && $_SERVER['REQUEST_METHOD'] === 'POST') {
        $r = new Request($_GET, $_POST);
        $_POST = $r->getPOST();
        (new UpdatePreferences())->index($_GET['username'], $_POST);
} else {
        (new Response())->sendJSON([
                'message' => 'Invalid request'
        ], 400);
}