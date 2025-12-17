-- 羽毛球比赛管理系统数据库设计

-- 比赛表
CREATE TABLE matches (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL DEFAULT '6人多人轮转赛',
    date VARCHAR(50) NOT NULL,
    time VARCHAR(100) NOT NULL,
    location VARCHAR(255) NOT NULL,
    organizer VARCHAR(100) NOT NULL,
    type VARCHAR(50) NOT NULL DEFAULT '多人轮转赛',
    status VARCHAR(20) NOT NULL DEFAULT 'preparing', -- preparing, ongoing, finished
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 选手表
CREATE TABLE players (
    id SERIAL PRIMARY KEY,
    match_id INTEGER REFERENCES matches(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    avatar VARCHAR(10) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 比赛场次表
CREATE TABLE games (
    id SERIAL PRIMARY KEY,
    match_id INTEGER REFERENCES matches(id) ON DELETE CASCADE,
    round_number INTEGER NOT NULL,
    round_name VARCHAR(50) NOT NULL,
    team1_player1_id INTEGER REFERENCES players(id),
    team1_player2_id INTEGER REFERENCES players(id),
    team2_player1_id INTEGER REFERENCES players(id),
    team2_player2_id INTEGER REFERENCES players(id),
    score1 INTEGER DEFAULT 0,
    score2 INTEGER DEFAULT 0,
    status VARCHAR(20) DEFAULT 'pending', -- pending, finished
    winner INTEGER, -- 1 for team1, 2 for team2, null for tie
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 比赛结果统计表（可以通过查询生成，也可以缓存）
CREATE TABLE player_stats (
    id SERIAL PRIMARY KEY,
    match_id INTEGER REFERENCES matches(id) ON DELETE CASCADE,
    player_id INTEGER REFERENCES players(id) ON DELETE CASCADE,
    wins INTEGER DEFAULT 0,
    losses INTEGER DEFAULT 0,
    total_score INTEGER DEFAULT 0,
    opponent_score INTEGER DEFAULT 0,
    score_diff INTEGER DEFAULT 0,
    games_played INTEGER DEFAULT 0,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(match_id, player_id)
);

-- 组合使用统计表
CREATE TABLE pair_stats (
    id SERIAL PRIMARY KEY,
    match_id INTEGER REFERENCES matches(id) ON DELETE CASCADE,
    player1_id INTEGER REFERENCES players(id),
    player2_id INTEGER REFERENCES players(id),
    usage_count INTEGER DEFAULT 0,
    last_used_round INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(match_id, player1_id, player2_id)
);

-- 创建索引
CREATE INDEX idx_players_match_id ON players(match_id);
CREATE INDEX idx_games_match_id ON games(match_id);
CREATE INDEX idx_games_round ON games(match_id, round_number);
CREATE INDEX idx_player_stats_match ON player_stats(match_id);
CREATE INDEX idx_pair_stats_match ON pair_stats(match_id);

-- 插入示例数据
INSERT INTO matches (title, date, time, location, organizer, type) VALUES
('6人多人轮转赛', '12-13发布', '12月13日 上周六 (2小时21:00-23:00)', '钱塘区·钱塘文体中心', 'cy', '多人轮转赛');