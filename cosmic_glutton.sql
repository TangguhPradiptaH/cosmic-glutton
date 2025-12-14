-- Membuat tabel leaderboard
CREATE TABLE IF NOT EXISTS leaderboard (
    id INT(11) AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    score INT(11) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Menyisakan hanya 10 skor terbaik
DELETE FROM leaderboard
WHERE id NOT IN (
    SELECT id FROM (
        SELECT id
        FROM leaderboard
        ORDER BY score DESC, created_at ASC
        LIMIT 10
    ) AS top_scores
);
