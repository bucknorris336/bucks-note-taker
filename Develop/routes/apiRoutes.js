const router = require("express").Router();
const util = require("util");
const fs = require("fs");

// This package will be used to generate our unique ids. https://www.npmjs.com/package/uuid
const { v4: uuidv4 } = require("uuid");

const readFileAsync = util.promisify(fs.readFile);
const writeFileAsync = util.promisify(fs.writeFile);

// GET "/api/notes" responds with all notes from the database
router.get("/notes", (req, res) => {
  getNotes()
    .then((notes) => {
      return res.json(notes);
    })
    .catch((err) => res.status(500).json(err));
});
//
router.post("/notes", (req, res) => {
  // log
  addNote(req.body)
    .then((note) => res.json(note))
    .catch((err) => res.status(500).json(err));
});

// DELETE "/api/notes" deletes the note with an id equal to req.params.id
router.delete("/notes/:id", (req, res) => {
  removeNote(req.params.id)
    .then(() => res.json({ ok: true }))
    .catch((err) => res.status(500).json(err));
});

module.exports = router;
