const router = require("express").Router();
const util = require("util");
const fs = require("fs");

// This package will be used to generate our unique ids. https://www.npmjs.com/package/uuid
const { v4: uuidv4 } = require("uuid");

const readFileAsync = util.promisify(fs.readFile);
const writeFileAsync = util.promisify(fs.writeFile);
function read() {
  return readFileAsync("db/db.json", "utf8");
}
function write(note) {
  return writeFileAsync("db/db.json", JSON.stringify(note));
}
function getNotes() {
  return read().then((notes) => {
    let parsedNotes;

    // If notes isn't an array or can't be turned into one, send back a new empty array
    try {
      parsedNotes = [].concat(JSON.parse(notes));
    } catch (err) {
      parsedNotes = [];
    }

    return parsedNotes;
  });
}
function addNote(note) {
  const { title, text } = note;

  if (!title || !text) {
    throw new Error("Note 'title' and 'text' cannot be blank");
  }

  // Add a unique id to the note using uuid package
  const newNote = { title, text, id: uuidv4() };

  // Get all notes, add the new note, write all the updated notes, return the newNote
  return getNotes()
    .then((notes) => [...notes, newNote])
    .then((updatedNotes) => write(updatedNotes))
    .then(() => newNote);
}
function removeNote(id) {
  // Get all notes, remove the note with the given id, write the filtered notes
  return getNotes()
    .then((notes) => notes.filter((note) => note.id !== id))
    .then((filteredNotes) => write(filteredNotes));
}

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
