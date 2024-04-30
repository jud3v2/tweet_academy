<?php

require $_SERVER['DOCUMENT_ROOT'] . '/Model/User.php';
require_once $_SERVER['DOCUMENT_ROOT'] . '/app/Error.php';

class PasswordReset
{
        protected User $user;
        private string $accessKey;
        private string $newPassword;
        private string $emailServiceURL;

        public function __construct()
        {
                $this->user = new User();
                $this->accessKey = "aaa15b01-ba6b-4458-827b-49c2703d6410";
                $this->emailServiceURL = "https://api.web3forms.com/submit";
                $this->newPassword = $this->generatePassword(32);
        }

        public function generatePassword($len): string
        {
                $az = range("a", "z");
                $AZ = range("A", "Z");
                $num = range(0, 9);
                $password = array_merge($az, $AZ, $num);
                return substr(str_shuffle(implode("", $password)), 0, $len);
        }

        public function index($data): void
        {
                // extract $_POST data
                extract($data);

                // check if data is valid
                if (is_array($this->validateData($data))) {
                        echo json_encode($this->validateData($data));
                }

                // check if user exists
                $user = $this->user->getUserByEmail($email);

                if (!$user) {
                        echo json_encode(['status' => 'error', 'message' => 'Aucun utilisateur trouvé avec cet email']);
                }

                if ($this->user->passwordReset($email, $birthday, $this->newPassword)) {
                        $data = [
                            'access_key' => $this->accessKey,
                            'email' => $email,
                            'subject' => 'Réinitialisation du mot de passe my meetic',
                            'message' => "Votre nouveau mot de passe est : " . $this->newPassword
                        ];

                        // send reset password email
                        $this->sendResetPassword($data, $email);
                } else {
                        (new ResponseError(
                            500,
                            message: ["Erreur serveur l'envoie du mail de réinitialisation du mot de passe a échoué."]
                        ))->giveResponse();
                        exit();
                }
        }

        public function sendResetPassword($data, $email): void
        {
                // make post request to the endpoint for send email.
                $ch = curl_init($this->emailServiceURL);
                curl_setopt($ch, CURLOPT_POST, 1);
                curl_setopt($ch, CURLOPT_POSTFIELDS, $data);
                curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
                curl_exec($ch);
                curl_close($ch);
                http_response_code(200);

                // logout user
                header('Location: /Controller/Users/Logout.php');
        }

        public function validateData($data): bool|array
        {
                extract($data);

                if (empty($email)) {
                        return ['status' => 'error', 'message' => 'Veuillez renseigner votre email'];
                }

                if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
                        return ['status' => 'error', 'message' => 'Veuillez renseigner un email valide'];
                }

                if (!empty($birthday) && strtotime($birthday) > strtotime(date('Y-m-d'))) {
                        return ['status' => 'error', 'message' => 'Veuillez renseigner une date de naissance valide'];
                }

                return true;
        }

}

(new PasswordReset())->index($_POST);