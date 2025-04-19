const express = require("express");
const cors = require("cors");
const app = express();
const path = require("path");
const Joi = require("joi");
const multer = require("multer");
const mongoose = require("mongoose");
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

mongoose
  .connect("mongodb+srv://cdd7:xu9Q35gxCNM5sb5i@cluster0.31l9vfp.mongodb.net/")
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((error) => {
    console.log("Couldn't connect to MongoDB", error);
  });

const gameSchema = new mongoose.Schema({
  title: String,
  genre: String,
  about: String,
  rating: String,
  release_year: Number,
  external_link: String,
  img_name: String,
});

const Game = mongoose.model("Game", gameSchema);

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "index.html"));
});

//let games = require("./data/games.json");

app.get("/api/games", async (req, res) => {
  const games = await Game.find();
  res.send(games);
});

app.get("/api/games/:id", async (req, res) => {
  const game = await Game.findById(req.params.id);
  if (!game) return res.status(404).send("Game not found.");
  res.send(game);
});

app.post("/api/games", upload.single("img"), async (req, res) => {
  const result = validateGame(req.body);

  if (result.error) {
    return res.status(400).send(result.error.details[0].message);
  }

  const game = new Game ({
    title: req.body.title,
    genre: req.body.genre,
    about: req.body.about,
    rating: req.body.rating,
    release_year: req.body.release_year,
    external_link: req.body.external_link,
  });

  if (req.file) {
    game.img_name = req.file.filename;
  }

  const newGame = await game.save();
  res.send(newGame);
});

app.put("/api/games/:id", upload.single("img"), async (req, res) => {
  const result = validateGame(req.body);
  
  if (result.error) {
    return res.status(400).send(result.error.details[0].message);
  }

let fieldsToUpdate = {
  title: req.body.title,
  genre: req.body.genre,
  about: req.body.about,
  rating: req.body.rating,
  release_year: req.body.release_year,
  external_link: req.body.external_link,
};

  if (req.file) {
    fieldsToUpdate.img_name = req.file.filename;
  }

  await Game.updateOne({ _id: req.params.id }, filedsToUpdate);
  const updatedGame = await Game.findById(req.params.id);
  res.send(updatedGame);
});

app.delete("/api/games/:id", async (req, res) => {
  const deletedGame = await Game.findByIdAndDelete(req.params.id);
  if (!deletedGame) return res.status(404).send("The game with the given ID was not found.");
  res.send(deletedGame);
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
