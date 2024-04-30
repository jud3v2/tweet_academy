<?php

if(!function_exists('env')) {
        function env($key, $default = null): string|null
        {
                foreach(
                    explode("\n",
                        file_get_contents(__DIR__ . '/.env'))
                    as $line
                ) {
                        $data = explode('=', $line);
                        if($data[0] === $key) {
                                // Search for ( '  & " ) and remove it
                                return str_replace(["'", '"'], '', $data[1]);
                        }
                }
                // return default value if not found
                return $default;
        }
}