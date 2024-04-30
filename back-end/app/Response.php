<?php

class Response
{
        /**
         * @param string $url
         * @param int $httpCode
         * @return void
         * @deprecated use sendJSON for api response
         */
        public function send(string $url, int $httpCode = 200) : void
        {
                http_response_code($httpCode);
                header('Location: '.$url);
                exit;
        }

        /**
         * @param array $data
         * @param int $httpCode
         * @return void
         */
        public function sendJSON(array $data, int $httpCode = 200) : void
        {
                if($httpCode > 199 && $httpCode <= 500) {
                        http_response_code($httpCode);
                        echo json_encode($data);
                        exit;
                } else {
                        throw new Error("Invalid HTTP Code: [$httpCode] is invalid. The HTTP Code must be between 200 and 500.");
                }
        }

        /**
         * @deprecated use sendJSON for api response
         * @param $url
         * @return void
         */
        public function redirect($url): void
        {
                http_response_code(302);
                header('Location: ' . $url);
                exit;
        }
}