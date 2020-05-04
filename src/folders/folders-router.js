const express = require('express')
//const xss = require('xss')
//const path = require('path')
const FoldersService = require('./folders-service.js')

const foldersRouter = express.Router()
const jsonParser = express.json()

/*const serializeFolder = folder =>({

})*/

foldersRouter
    .route('/')
    .get((req, res)=>{
        //res.send('Hello, world!')
        FoldersService.getAllFolders(
            req.app.get('db')
        )
        .then(folders=>{
            res.json(folders)
        })
        //.catch(next)
    })

    module.exports = foldersRouter