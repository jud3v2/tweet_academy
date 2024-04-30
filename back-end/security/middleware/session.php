<?php

class session {
        /**
         * @var array
         */
        protected array $session;

        public function __construct()
        {
                if(session_status() !== PHP_SESSION_ACTIVE && !headers_sent()) {
                        session_start();
                }
                $this->session = $_SESSION;
        }

        /**
         * @description permet de récupérer la session
         * @return array
         */
        public function getSession(): array
        {
                return $this->session;
        }

        /**
         * @param string $key
         * @param mixed  $value
         * @return void
         * @description permet de sauvegarder une variable dans la session
         */
        public function setSession(string $key, mixed $value): void
        {
                $this->session[$key] = $value;
        }

        /**
         * @return void
         * @description permet de détruire la session
         */
        public function destroySession(): void
        {
                session_destroy();
        }

        public function getUSer(): array
        {
                return $this->session['user'];
        }

        public function isConnected(): bool
        {
                if(isset($this->session['user'])) {
                        return true;
                }

                return false;
        }

        /**
         * @deprecated utiliser la class authorized afin de redirect l'utilisateur vers la page de connexion.
         */
        public function checkIfIsConnectedOrKillSession(): void
        {
                if(!$this->isConnected()) {
                        header('Location: /Controller/Users/Logout.php');
                        exit();
                }
        }

        /**
         * @return void
         * @description destructeur de la classe, permet de sauvegarder la session dans la variable $_SESSION
         */
        public function __destruct()
        {
                $_SESSION = $this->session;
        }

        /**
         * @description met à jour la session de l'utilisateur quand il vas mettre à jour ces informations utilisateur.
         * @param mixed $data
         * @return array
         */
        public function renewUserSession(array $data): array
        {
                $this->session['user'] = $data;

                return $this->session['user'];
        }
}