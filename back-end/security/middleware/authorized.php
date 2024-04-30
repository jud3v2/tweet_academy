<?php

include_once $_SERVER['DOCUMENT_ROOT'] . '/security/middleware/session.php';

class authorized extends session
{

        /**
         * @var array|string[]
         */
        protected array $authorizedURL;
        private string $currentURL;
        public function __construct()
        {
                parent::__construct();

                /**
                 * @description : Obligatoire de vérifier si la session est lancé ou pas si elle ne l'est pas on la lance,
                 * car .on a besoin de vérifier si l'utilisateur est connecté ou pas.
                 * */
                if(session_status() !== PHP_SESSION_ACTIVE && !headers_sent()) {
                        session_start();
                }

                // set the authorized url
                $this->authorizedURL = [
                    "/pages/connexion.php" => "public",
                    "/pages/errors/400.php" => "public",
                    "/pages/errors/404.php" => "public",
                    "/pages/errors/500.php" => "public",
                    "/pages/inscription.php" => "public",
                    "/pages/meetic.php" => "private",
                    "/pages/messenger.php" => "public",
                    "/pages/password-reset.php" => "public",
                    "/pages/my-account.php" => "private",
                    "/" => "private",
                    "/index.php" => "private",
                    "/pages/home.php" => "private",
                    "/Controller/Users/Meetic.php" => "public",
                ];
                // si il n'y a pas de session utilisateur qui est actif, il faut vérifier sur qu'elle url l'utilisateur est.
                // Si l'utilisateur est sur une url qui est autorisé, alors on bypass le middleware.
                // Sinon, on le redirige vers la page de connexion.

                // on récupère l'url courante
                $this->currentURL = $_SERVER['REQUEST_URI'];

                // on vérifie si l'url courante est autorisé
                if(!$this->isURLAuthorized($this->currentURL)) {
                        $this->redirectToConnexion();
                }
        }

        private function redirectToConnexion(): void
        {
                // on redirige vers la page de connexion.
                header('Location: /pages/connexion.php');
                exit();
        }

        private function isURLAuthorized(string $currentURL): bool
        {
                // Check si l'url existe dans le tableau des url autorisé
                if(array_key_exists($currentURL, $this->authorizedURL)) {
                        // check type of url
                        if($this->authorizedURL[$this->currentURL] === "public") { // si l'url est public, on autorise l'accès.
                                return true;
                        } else if($this->authorizedURL[$this->currentURL] === "private") { // si l'url est privé, on vérifie si l'utilisateur est connecté sinon on lui refuse l'accès.
                                if($this->isConnected()) {
                                        return true;
                                }
                        }
                }

                return false;
        }
}