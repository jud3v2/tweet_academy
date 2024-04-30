<?php

class Request
{
        private mixed $_get;
        private mixed $_post;
        private mixed $_files;
        private mixed $_cookie;
        private mixed $_session;
        private mixed $_server;
        private mixed $_env;
        private mixed $_request;

        public function __construct($_get, $_post)
        {

                $this->_get = $_get;
                $this->_post = $_post;
        }

        public function getGet(): mixed
        {
                return $this->_get;
        }

        public function setGet(mixed $get): void
        {
                $this->_get = $get;
        }

        /**
         * Ensure $_POST not empty
         */
        public function getPost(): mixed
        {
                if($this->_post === null || count($this->_post) === 0) {
                        return json_decode(file_get_contents('php://input'), true);
                } else {
                        return $this->_post;
                }
        }

        public function setPost(mixed $post): void
        {
                $this->_post = $post;
        }

        public function getFiles(): mixed
        {
                return $this->_files;
        }

        public function setFiles(mixed $files): void
        {
                $this->_files = $files;
        }

        public function getCookie(): mixed
        {
                return $this->_cookie;
        }

        public function setCookie(mixed $cookie): void
        {
                $this->_cookie = $cookie;
        }

        public function getSession(): mixed
        {
                return $this->_session;
        }

        public function setSession(mixed $session): void
        {
                $this->_session = $session;
        }

        public function getServer(): mixed
        {
                return $this->_server;
        }

        public function setServer(mixed $server): void
        {
                $this->_server = $server;
        }

        public function getEnv(): mixed
        {
                return $this->_env;
        }

        public function setEnv(mixed $env): void
        {
                $this->_env = $env;
        }

        /**
         * @return mixed
         */
        public function getRequest(): mixed
        {
                return $this->_request;
        }

        /**
         * @param mixed $request
         */
        public function setRequest(mixed $request): void
        {
                $this->_request = $request;
        }
}