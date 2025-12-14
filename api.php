<?php
// api.php - FINAL CRUD LEADERBOARD TOP 10

require_once 'config.php';

$LIMIT = 10;
$action = isset($_GET['action']) ? $_GET['action'] : '';

header('Content-Type: application/json');

/* =========================
   CREATE + UPDATE + DELETE
   ========================= */
if ($_SERVER['REQUEST_METHOD'] === 'POST' && $action === 'save') {

    $data = json_decode(file_get_contents('php://input'), true);
    $name  = isset($data['name']) ? trim($data['name']) : '';
    $score = isset($data['score']) ? (int)$data['score'] : 0;

    if ($name === '' || $score < 0) {
        echo json_encode([
            "status" => "error",
            "message" => "Data tidak valid"
        ]);
        exit;
    }

    /* CREATE */
    $stmt = $conn->prepare(
        "INSERT INTO leaderboard (name, score) VALUES (?, ?)"
    );
    $stmt->bind_param("si", $name, $score);
    $stmt->execute();
    $stmt->close();

    /* UPDATE + DELETE
       hanya simpan 10 skor tertinggi */
    $cleanup_sql = "
        DELETE l1
        FROM leaderboard l1
        LEFT JOIN (
            SELECT id
            FROM leaderboard
            ORDER BY score DESC, created_at ASC
            LIMIT $LIMIT
        ) l2 ON l1.id = l2.id
        WHERE l2.id IS NULL
    ";
    $conn->query($cleanup_sql);

    echo json_encode([
        "status" => "success",
        "message" => "Skor disimpan dan leaderboard diperbarui"
    ]);
    exit;
}

/* =====
   READ
   ===== */
if ($action === 'load') {

    $sql = "
        SELECT name, score
        FROM leaderboard
        ORDER BY score DESC, created_at ASC
        LIMIT $LIMIT
    ";

    $result = $conn->query($sql);
    $data = [];

    while ($row = $result->fetch_assoc()) {
        $data[] = $row;
    }

    echo json_encode([
        "status" => "success",
        "data" => $data
    ]);
    exit;
}

$conn->close();
?>
