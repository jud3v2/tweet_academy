<?php

class CDN
{
        protected string $path;
        private string $REGION;
        /**
         * @var mixed|string
         */
        private mixed $HOSTNAME;
        private string $BASE_HOSTNAME;
        private string $STORAGE_ZONE_NAME;
        private string $FILENAME_TO_UPLOAD;
        private string $ACCESS_KEY;
        private string $FILE_PATH;
        private string $url;

        public function __construct(string $path)
        {
                $this->REGION = '';  // If German region, set this to an empty string: ''
                $this->BASE_HOSTNAME = 'storage.bunnycdn.com';
                $this->HOSTNAME = (!empty($REGION)) ? "{$REGION}.{$this->BASE_HOSTNAME}" : $this->BASE_HOSTNAME;
                $this->STORAGE_ZONE_NAME = 'yoker';
                $this->ACCESS_KEY = '2d78c32f-683b-4bec-8a751b76a523-2142-4e09';
                $this->FILE_PATH = realpath($_SERVER['DOCUMENT_ROOT'].$path);
                if (!$this->FILE_PATH) {
                        throw new Exception("Invalid file path provided: $path");
                }
                $this->FILENAME_TO_UPLOAD = basename($this->FILE_PATH);
                $this->url = "https://{$this->HOSTNAME}/{$this->STORAGE_ZONE_NAME}/{$this->FILENAME_TO_UPLOAD}";
        }

        public function store()
        {
                $ch = curl_init();

                $options = array(
                    CURLOPT_URL => $this->url,
                    CURLOPT_RETURNTRANSFER => true,
                    CURLOPT_PUT => true,
                    CURLOPT_INFILE => fopen($this->FILE_PATH, 'r'),
                    CURLOPT_INFILESIZE => filesize($this->FILE_PATH),
                    CURLOPT_HTTPHEADER => array(
                        "AccessKey: {$this->ACCESS_KEY}",
                        'Content-Type: '.mime_content_type($this->FILE_PATH),
                    )
                );

                curl_setopt_array($ch, $options);

                $response = curl_exec($ch);

                if (!$response) {
                        die("Error: " . curl_error($ch));
                }

                curl_close($ch);
        }
}