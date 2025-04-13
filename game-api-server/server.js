const express = require("express");
const cors = require("cors");
const app = express();
const path = require("path");
const Joi = require("joi");
const multer = require("multer");
const PORT = process.env.PORT || 3001;

app.use(express.static("public"));
app.use("/uploads", express.static("uploads"));
app.use(express.json());
app.use(cors());
app.use("/images", express.static(path.join(__dirname, "public/images")));

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./public/images/");
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});
const upload = multer({ storage: storage });

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "index.html"));
});

let games = require("./data/games.json");

app.get("/api/games", (req, res) => {
  res.send(games);
});

app.get("/api/games/:id", (req, res) => {
  const game = games.find((g) => g._id === parseInt(req.params.id));
  if (!game) return res.status(404).send("Game not found.");
  res.send(game);
});

app.post("/api/games", upload.single("img"), (req, res) => {
  const result = validateGame(req.body);

  if (result.error) {
    return res.status(400).send(result.error.details[0].message);
  }

  const game = {
    _id: games.length + 1,
    title: req.body.title,
    genre: req.body.genre,
    about: req.body.about,
    rating: req.body.rating,
    release_year: req.body.release_year,
    external_link: req.body.external_link,
  };

  if (req.file) {
    game.img_name = req.file.filename;
  }

  games.push(game);
  res.status(200).send(game);
});

app.put("/api/games/:id", upload.single("img"), (req, res) => {
  let game = games.find((g) => g._id === parseInt(req.params.id));
  if (!game) return res.status(404).send("Game with given ID was not found.");

  const result = validateGame(req.body);
  if (result.error) {
    return res.status(400).send(result.error.details[0].message);
  }

  game.title = req.body.title;
  game.genre = req.body.genre;
  game.about = req.body.about;
  game.rating = req.body.rating;
  game.release_year = req.body.release_year;
  game.external_link = req.body.external_link;

  if (req.file) {
    game.img_name = req.file.filename;
  }

  res.send(game);
});

app.delete("/api/games/:id", (req, res) => {
  const game = games.find((g) => g._id === parseInt(req.params.id));
  if (!game) return res.status(404).send("The game with the given ID was not found.");

  const index = games.indexOf(game);
  games.splice(index, 1);
  res.send(game);
});

const validateGame = (game) => {
  const schema = Joi.object({
    _id: Joi.allow(""),
    title: Joi.string().min(3).required(),
    genre: Joi.string().required(),
    about: Joi.string().required(),
    rating: Joi.string().required(),
    release_year: Joi.number().required(),
    external_link: Joi.string().required(),
  });

  return schema.validate(game);
};

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
