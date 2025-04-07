const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3001;

const games = require('./data/games.json');

app.use(cors());

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

app.get('/api/games', (req, res) => {
  res.json(games);
});

app.get('/api/games/:id', (req, res) => {
  const game = games.find(g => g._id === parseInt(req.params.id));
  if (game) res.json(game);
  else res.status(404).json({ error: "Game not found" });
});

app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
