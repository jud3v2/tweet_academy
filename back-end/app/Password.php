<?php

require_once $_SERVER['DOCUMENT_ROOT']. '/functions.php';
class Password
{
        private string $password;
        private string $hashed_password;

        /**
         * @param string|null $password
         */
        public function __construct(string $password = null)
        {
                $this->password = $password;

                if($this->password) {
                        $this->setHashPassword();
                }
        }

        /**
         * @return string get hashed password
         */
        public function getPassword(): string
        {
                return $this->hashed_password;
        }

        /**
         * @description set hashed password
         * @return void
         */
        public function setHashPassword(): void
        {
                $this->hashed_password = password_hash(
                    $this->password,
                    PASSWORD_BCRYPT,
                    ['cost' => 12]
                );
        }

        /**
         * @description verify password match
         * @param $password
         * @param $hash
         * @return bool
         */
        public function verify($password, $hash): bool
        {
                return password_verify($password, $hash);
        }

        /**
         * @description set password if is not set from constructor
         * @param string $password
         * @return void
         */
        public function setPassword(string $password): void
        {
                $this->password = $password;
                $this->setHashPassword();
        }

        /**
         * @description return hashed password as string
         * @return string
         */
        public function __toString(): string
        {
                  return $this->hashed_password;
        }

        /**
         * @description remove password from memory this will prevent password leak
         * @security
         */
        public function __destruct()
        {
                // remove password from memory
                unset($this->password);
        }

}