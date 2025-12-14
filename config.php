<?php
$host = "localhost";
$user = "root";
$pass = "";
$db   = "cosmic_glutton";

$conn = new mysqli($host, $user, $pass, $db);

if ($conn->connect_error) {
    die(json_encode([
        "status" => "error",
        "message" => "Database connection failed"
    ]));
}

$conn->set_charset("utf8");
?>
