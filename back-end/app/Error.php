<?php

class ResponseError
{
        private int $status;
        private array $message;

        /**
         * @param int $status
         * @param array $message
         */
        public function __construct(int $status, array $message)
        {
                $this->status = $status;
                $this->message = $message;
        }

        /**
         * @return string
         */
        public function __toString(): string
        {
                return json_encode([
                        "status" => $this->status,
                        "message" => $this->message
                ]);
        }

        /**
         * @return array
         */
        public function getMessage(): array
        {
                return $this->message;
        }

        /**
         * @return int
         */
        public function getStatus(): int
        {
                return $this->status;
        }

        /**
         * @param array $message
         * @return ResponseError
         */
        public function setMessage(array $message): ResponseError
        {
                $this->message = $message;
                return $this;
        }

        /**
         * @param int $status
         * @return ResponseError
         */
        public function setStatus(int $status): ResponseError
        {
                $this->status = $status;
                return $this;
        }

        /**
         * @param array $message
         * @param int $status
         * @return ResponseError
         */
        public function set(array $message, int $status): ResponseError
        {
                $this->message = $message;
                $this->status = $status;
                return $this;
        }

        /**
         * @return void
         */
        public function giveResponse(): void
        {
                ob_start();

                if(file_exists($_SERVER['DOCUMENT_ROOT'] . '/pages/errors/index.php')) {
                        $status = $this->status;
                        $message = json_encode($this->message);
                        http_response_code($status);
                        require_once $_SERVER['DOCUMENT_ROOT'] . '/pages/errors/index.php';
                }

                ob_end_flush();
        }

        public function giveJsonResponse(): void
        {
                if(headers_sent() === false) {
                        header('Content-Type: application/json');
                        http_response_code($this->status);
                }

                echo json_encode($this->message);
        }
}