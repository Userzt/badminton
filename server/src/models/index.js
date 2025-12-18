const { DataTypes } = require('sequelize')
const { sequelize } = require('../database/connection')

// 比赛模型
const Match = sequelize.define('Match', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  title: {
    type: DataTypes.STRING(255),
    allowNull: false,
    defaultValue: '6人多人轮转赛'
  },
  date: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  time: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  location: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  organizer: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  type: {
    type: DataTypes.STRING(50),
    allowNull: false,
    defaultValue: '多人轮转赛'
  },
  status: {
    type: DataTypes.STRING(20),
    allowNull: false,
    defaultValue: 'preparing'
  }
}, {
  tableName: 'matches',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
})

// 选手模型
const Player = sequelize.define('Player', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  matchId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'match_id'
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  avatar: {
    type: DataTypes.STRING(255),
    allowNull: false
  }
}, {
  tableName: 'players',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false
})

// 比赛场次模型
const Game = sequelize.define('Game', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  matchId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'match_id'
  },
  roundNumber: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'round_number'
  },
  roundName: {
    type: DataTypes.STRING(50),
    allowNull: false,
    field: 'round_name'
  },
  team1Player1Id: {
    type: DataTypes.INTEGER,
    field: 'team1_player1_id'
  },
  team1Player2Id: {
    type: DataTypes.INTEGER,
    field: 'team1_player2_id'
  },
  team2Player1Id: {
    type: DataTypes.INTEGER,
    field: 'team2_player1_id'
  },
  team2Player2Id: {
    type: DataTypes.INTEGER,
    field: 'team2_player2_id'
  },
  score1: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  score2: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  status: {
    type: DataTypes.STRING(20),
    defaultValue: 'pending'
  },
  winner: {
    type: DataTypes.INTEGER,
    allowNull: true
  }
}, {
  tableName: 'games',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
})

// 选手统计模型
const PlayerStat = sequelize.define('PlayerStat', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  matchId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'match_id'
  },
  playerId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'player_id'
  },
  wins: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  losses: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  totalScore: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'total_score'
  },
  opponentScore: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'opponent_score'
  },
  scoreDiff: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'score_diff'
  },
  gamesPlayed: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'games_played'
  }
}, {
  tableName: 'player_stats',
  timestamps: true,
  createdAt: false,
  updatedAt: 'updated_at'
})

// 定义关联关系
Match.hasMany(Player, { foreignKey: 'matchId', as: 'players', onDelete: 'CASCADE' })
Player.belongsTo(Match, { foreignKey: 'matchId' })

Match.hasMany(Game, { foreignKey: 'matchId', as: 'games', onDelete: 'CASCADE' })
Game.belongsTo(Match, { foreignKey: 'matchId' })

Match.hasMany(PlayerStat, { foreignKey: 'matchId', as: 'playerStats', onDelete: 'CASCADE' })
PlayerStat.belongsTo(Match, { foreignKey: 'matchId' })
PlayerStat.belongsTo(Player, { foreignKey: 'playerId', onDelete: 'CASCADE' })

// 游戏与选手的关联
Game.belongsTo(Player, { foreignKey: 'team1Player1Id', as: 'team1Player1' })
Game.belongsTo(Player, { foreignKey: 'team1Player2Id', as: 'team1Player2' })
Game.belongsTo(Player, { foreignKey: 'team2Player1Id', as: 'team2Player1' })
Game.belongsTo(Player, { foreignKey: 'team2Player2Id', as: 'team2Player2' })

module.exports = {
  sequelize,
  Match,
  Player,
  Game,
  PlayerStat
}