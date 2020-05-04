const express = require('express');

//const xss = require('xss');
//const path = require('path');

const NotesService = require('./notes-service');

const notesRouter = express.Router()
const jsonParser = express.json()

/*const serializeNote = note =>({

})*/

notesRouter
    .route('/')
    .get((req, res, next)=>{
        //res.send('Hello, world!')
        NotesService.getAllNotes(
            req.app.get('db')
        )
        .then(notes =>{
            res.json(notes)
        })
        .catch(next)
    })

module.exports = notesRouter