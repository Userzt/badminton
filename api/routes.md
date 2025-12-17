# 羽毛球比赛管理系统 API 接口文档

## 基础信息
- 基础URL: `http://localhost:3001/api`
- 数据格式: JSON
- 认证方式: 暂无（后续可添加JWT）

## 比赛管理

### 1. 创建比赛
```
POST /matches
Content-Type: application/json

{
  "title": "6人多人轮转赛",
  "date": "12-13发布",
  "time": "12月13日 上周六 (2小时21:00-23:00)",
  "location": "钱塘区·钱塘文体中心",
  "organizer": "cy",
  "type": "多人轮转赛"
}

Response:
{
  "success": true,
  "data": {
    "id": 1,
    "title": "6人多人轮转赛",
    ...
  }
}
```

### 2. 获取比赛信息
```
GET /matches/:id

Response:
{
  "success": true,
  "data": {
    "id": 1,
    "title": "6人多人轮转赛",
    "players": [...],
    "games": [...],
    "status": "preparing"
  }
}
```

## 选手管理

### 3. 添加选手
```
POST /matches/:matchId/players
Content-Type: application/json

{
  "name": "33",
  "avatar": "🏸"
}

Response:
{
  "success": true,
  "data": {
    "id": 1,
    "name": "33",
    "avatar": "🏸"
  }
}
```

### 4. 删除选手
```
DELETE /matches/:matchId/players/:playerId

Response:
{
  "success": true,
  "message": "选手删除成功"
}
```

### 5. 编辑选手
```
PUT /matches/:matchId/players/:playerId
Content-Type: application/json

{
  "name": "新名字",
  "avatar": "🎯"
}

Response:
{
  "success": true,
  "data": {
    "id": 1,
    "name": "新名字",
    "avatar": "🎯"
  }
}
```

### 6. 获取选手列表
```
GET /matches/:matchId/players

Response:
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "33",
      "avatar": "🏸"
    },
    ...
  ]
}
```

## 比赛对阵

### 7. 生成比赛对阵
```
POST /matches/:matchId/generate-games

Response:
{
  "success": true,
  "data": {
    "games": [...],
    "stats": {
      "totalGames": 12,
      "playersStats": {...}
    }
  }
}
```

### 8. 获取比赛对阵
```
GET /matches/:matchId/games

Response:
{
  "success": true,
  "data": [
    {
      "id": 1,
      "roundNumber": 1,
      "roundName": "第1场",
      "team1": [
        {"id": 1, "name": "33", "avatar": "🏸"},
        {"id": 2, "name": "左手", "avatar": "🎯"}
      ],
      "team2": [
        {"id": 3, "name": "大哥", "avatar": "⭐"},
        {"id": 4, "name": "腰子", "avatar": "🔥"}
      ],
      "score1": 0,
      "score2": 0,
      "status": "pending",
      "winner": null
    },
    ...
  ]
}
```

## 比分管理

### 9. 更新比分
```
PUT /matches/:matchId/games/:gameId/score
Content-Type: application/json

{
  "score1": 21,
  "score2": 18
}

Response:
{
  "success": true,
  "data": {
    "id": 1,
    "score1": 21,
    "score2": 18,
    "status": "finished",
    "winner": 1
  }
}
```

## 比赛结果

### 10. 获取比赛结果
```
GET /matches/:matchId/results

Response:
{
  "success": true,
  "data": [
    {
      "playerId": 1,
      "name": "33",
      "avatar": "🏸",
      "wins": 4,
      "losses": 2,
      "totalScore": 126,
      "opponentScore": 108,
      "scoreDiff": 18,
      "gamesPlayed": 8,
      "rank": 1
    },
    ...
  ]
}
```

### 11. 获取统计信息
```
GET /matches/:matchId/stats

Response:
{
  "success": true,
  "data": {
    "playerStats": [...],
    "pairStats": [
      {
        "player1": "33",
        "player2": "左手",
        "usageCount": 2,
        "lastUsedRound": 8
      },
      ...
    ],
    "gameProgress": {
      "total": 12,
      "finished": 8,
      "pending": 4
    }
  }
}
```

## 错误响应格式
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "选手姓名不能为空",
    "details": {...}
  }
}
```

## 状态码
- 200: 成功
- 201: 创建成功
- 400: 请求参数错误
- 404: 资源不存在
- 500: 服务器内部错误