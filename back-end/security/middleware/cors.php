<?php

class cors
{
        protected mixed $method;
        protected array|false $headers;
        protected mixed $origin;

        public function __construct()
        {
                $this->method = $_SERVER['REQUEST_METHOD'];
                $this->headers = getallheaders();

                if (isset($this->headers['Origin'])) {
                        $this->origin = $this->headers['Origin'];
                }
                else {
                        $this->origin = '*';
                }

                $this->index();
        }

        public function index(): void
        {
                // Allow from any origin
                if (isset($_SERVER['HTTP_ORIGIN'])) {
                        // Decide if the origin in $_SERVER['HTTP_ORIGIN'] is one
                        // you want to allow, and if so:
                        header("Access-Control-Allow-Origin: {$_SERVER['HTTP_ORIGIN']}");
                        header('Access-Control-Allow-Credentials: true');
                        header('Access-Control-Max-Age: 86400');    // cache for 1 day
                } else {
                        header("Access-Control-Allow-Origin: *");
                        header('Access-Control-Allow-Credentials: true');
                        header('Access-Control-Max-Age: 86400');    // cache for 1 da
                }

                // Access-Control headers are received during OPTIONS requests
                if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {

                        if (isset($_SERVER['HTTP_ACCESS_CONTROL_REQUEST_METHOD']))
                                // may also be using PUT, PATCH, HEAD etc
                                header("Access-Control-Allow-Methods: GET, POST, OPTIONS, PUT, DELETE, PATCH, HEAD");

                        if (isset($_SERVER['HTTP_ACCESS_CONTROL_REQUEST_HEADERS']))
                                header("Access-Control-Allow-Headers: {$_SERVER['HTTP_ACCESS_CONTROL_REQUEST_HEADERS']}");

                        exit(0);
                }
        }
}

(new cors());