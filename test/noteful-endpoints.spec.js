const knex = require('knex')
const app = require('../src/app')
const { makeFoldersArray } = require('./folders.fixtures.js')
const { makeNotesArray, makeMaliciousNotes } = require('./notes.fixtures')

describe('Noteful endpoints', ()=>{
    let db

    before('make knex instance', () => {
        db = knex({
          client: 'pg',
          connection: process.env.TEST_DB_URL,
        })
        app.set('db', db)
      })
    
    after('disconnect from db',()=>db.destroy())

    before('clean the table', () => db.raw('TRUNCATE noteful_notes, noteful_folders RESTART IDENTITY CASCADE'))

    afterEach('cleanup',() => db.raw('TRUNCATE noteful_notes, noteful_folders RESTART IDENTITY CASCADE'))

    describe(`GET /`,()=>{
        context(`initial test of endpoint`,()=>{
            it(`responds with Hello, World`,()=>{
                return supertest(app)
                .get('/')
                .expect('Hello, world!')
            })
        })//end context GET/
    })//end describe GET/

    describe(`GET /api/folders`,()=>{
        context(`Given no folders`,()=>{
            it(`responds with 200 and an empty list`,()=>{
                return supertest(app)
                .get('/api/folders')
                .expect(200,[])
            })
        })//end context no folders

        context('Given there are folders in the database',()=>{
            const testFolders = makeFoldersArray()

            beforeEach('insert folder',()=>{
                return db 
                    .into('noteful_folders')
                    .insert(testFolders)
            })//end beforeEach

            it(`responsds with 200 and all of the folders`,()=>{
                return supertest(app)
                    .get('/api/folders')
                    .expect(200, testFolders)
            })//end it responds all folders

        })//end of context Given folders

        context(`Given an XSS attack article`,()=>{
       
            const maliciousFolder = {
                id:911,
                folder_name: 'Naughty naughty very naughty <script>alert("xss");</script>',
                date_created: new Date().toISOString()
            }
            const expectedFolder = {
                ...maliciousFolder, folder_name:'Naughty naughty very naughty &lt;script&gt;alert(\"xss\");&lt;/script&gt;'
            }

            beforeEach('insert malicious folder',()=>{
                return db
                    .into('noteful_folders')
                    .insert([maliciousFolder])
            })//end of beforeEach

            it(`removes XSS attack content from response`,()=>{
            return supertest(app)
                .get('/api/folders')
                .expect(200)
                .expect(res=>{
                    expect(res.body[0].folder_name).to.eql(expectedFolder.folder_name)
                })
             })//end of it XSS
        })//end of context XSS

    })//end of GET /folders

    describe(`GET /api/folder/:folder_id`,()=>{
        context(`Given no folders in db`,()=>{
            it(`responds with 404`,()=>{
                const folderId = 12345
                return supertest(app)
                    .get(`/api/folders/${folderId}`)
                    .expect(404, { error: { message: `Folder doesn't exist` } })
            })//end it responds with 404
        })//end context no folders in db

        context(`Given folders in the db`,()=>{
            const testFolders = makeFoldersArray()

            beforeEach(`insert folders`,()=>{
                return db   
                    .into('noteful_folders')
                    .insert(testFolders)
            })//end beforeEach

            it(`responds with a 200 and the specified folder`,()=>{
                const folderId = 1
                const expectedFolder = testFolders[folderId - 1]

                return supertest(app)
                    .get(`/api/folders/${folderId}`)
                    .expect(200, expectedFolder)
            })//end of it with 200
        })//end context folders in db

        context(`Given an XSS attack`,()=>{
            const maliciousFolder = {
                id:911,
                folder_name: 'Naughty naughty very naughty <script>alert("xss");</script>',
                date_created: new Date().toISOString()
            }
            const expectedFolder = {
                ...maliciousFolder, folder_name:'Naughty naughty very naughty &lt;script&gt;alert(\"xss\");&lt;/script&gt;'
            }

            beforeEach('insert malicious folder',()=>{
                return db
                    .into('noteful_folders')
                    .insert([maliciousFolder])
            })//end of beforeEach

            it(`removes the XSS attack content`,()=>{
                return supertest(app)
                .get(`/api/folders/${maliciousFolder.id}`)
                .expect(200)
                .expect(res=>{
                    expect(res.body.folder_name).to.eql(expectedFolder.folder_name)
                })
            })//end it XSS folder_id
        })//end context XSS folder_id
    })//end GET by folder_id

    describe(`GET /api/notes`,()=>{
        
        context(`Given no notes`,()=>{
            it(`responds with 200 and an empty list`,()=>{
                return supertest(app)
                .get('/api/notes')
                .expect(200,[])
            })
        })//end context no notes

        context(`Given notes in the db`,()=>{
            const testFolders = makeFoldersArray()
            const testNotes = makeNotesArray()

            beforeEach(`insert notes`,()=>{
                return db
                    .into('noteful_folders')
                    .insert(testFolders)
                    .then(()=>{
                        return db 
                            .into('noteful_notes')
                            .insert(testNotes)
                    })
            })//end beforeEach

            it(`responds with all notes`,()=>{
                return supertest(app)
                    .get('/api/notes')
                    .expect(200, testNotes)
            })//end it responds with all notes
        })//end context notes in  db

        context(`Given an XSS attack note`,()=>{
            const testFolders = makeFoldersArray();
            const { maliciousNote, expectedNote } = makeMaliciousNotes()

            beforeEach(`insert malicious note`,()=>{
                return db
                    .into('noteful_folders')
                    .insert(testFolders)
                    .then(()=>{
                        return db
                            .into('noteful_notes')
                            .insert([maliciousNote])
                    })
            })//end of beforeEach

            it(`removes XSS attach content`,()=>{
                return supertest(app)
                    .get(`/api/notes`)
                    .expect(200)
                    .expect(res=>{
                        expect(res.body[0].note_name).to.eql(expectedNote.note_name)
                        expect(res.body[0].content).to.eql(expectedNote.content)
                    })
            })//end of it XSS
        })//end context GET XSS

    })//end of GET /notes

    describe.only(`GET /api/notes/:note_id`,()=>{
        context(`Given no notes`,()=>{
            it(`returns a 404 with error message`,()=>{
                noteId = 1234

                return supertest(app)
                    .get(`/api/notes/${noteId}`)
                    .expect(404, {error:{message:`Note doesn't exist`}})
            })//end of it 404
        })//end of context no notes in db

        context(`Given notes in db`,()=>{
            const testFolders = makeFoldersArray()
            const testNotes = makeNotesArray()

            beforeEach(`insert notes into db`,()=>{
                return db
                    .into('noteful_folders')
                    .insert(testFolders)
                    .then(()=>{
                        return db
                            .into('noteful_notes')
                            .insert(testNotes)
                    })
            })//end beforeEach

            it(`responds with the specified note`,()=>{
                const noteId = 1

                const expectedNote = testNotes[noteId - 1]

                return supertest(app)
                    .get(`/api/notes/${noteId}`)
                    .expect(200, expectedNote)
            })//end of it responds with note
        })//end of context notes in db

        context(`Given an XSS attack note`,()=>{
            const testFolders = makeFoldersArray()
            const {maliciousNote, expectedNote } = makeMaliciousNotes()

            beforeEach('insert malicious note', () => {
                return db
                  .into('noteful_folders')
                  .insert(testFolders)
                  .then(() => {
                    return db
                      .into('noteful_notes')
                      .insert([ maliciousNote ])
                  })
              })

              it('removes XSS attack content', () => {
                return supertest(app)
                .get(`/api/notes/${maliciousNote.id}`)
                .expect(200)
                .expect(res => {
                    expect(res.body.content).to.eql(expectedNote.content)
                    expect(res.body.note_name).to.eql(expectedNote.note_name)
                })
            })//end it removes XSS
        })//end of context XSS note_id

    })//end describe GET by note id

    describe(`POST /api/folders endpoint`,()=>{

        it(`creates a folder, responding with 201 and the new folder`,function(){
            this.retries(3)
            const newFolder = {
                folder_name: 'Newest Test Folder',
            }
            return supertest(app)
                .post('/api/folders')
                .send(newFolder)
                .expect(res=>{
                    expect(res.body.folder_name).to.eql(newFolder.folder_name)
                    expect(res.body).to.have.property('id')
                    expect(res.headers.location).to.eql(`/api/folders/${res.body.id}`)
                    const expected  = new Date().toLocaleString()
                    const actual = new Date(res.body.date_created).toLocaleString()
                    expect(actual).to.equal(expected)
                })
                .then(postRes=>{
                    supertest(app)
                    .get(`/api/folders/${postRes.body.id}`)
                    .expect(postRes.body)
                })
        })//end it create folder, res 201

        
        it(`responds with 400 and error message when the folder name is missing`,()=>{
            return supertest(app)
                .post('/api/folders')
                .send({
                })
                .expect(400, {
                    error:{message: `Missing folder_name in request body`}
                })
        })//end of it no folder_name

        it(`removes XSS attack content from response`,()=>{
            const maliciousFolder = {
                folder_name: 'Naughty naughty very naughty <script>alert("xss");</script>'
            }
            const expectedName = 'Naughty naughty very naughty &lt;script&gt;alert(\"xss\");&lt;/script&gt;'

            return supertest(app)
                .post('/api/folders')
                .send(maliciousFolder)
                .expect(201)
                .expect(res=>{
                    expect(res.body.folder_name).to.eql(expectedName)
                })
        })

    })//end POST /folders

    describe(`POST /api/notes`,()=>{
        const testFolders = makeFoldersArray();
        beforeEach(`insert folders`,()=>{
            return db
                .into('noteful_folders')
                .insert(testFolders)
        })//end beforeEach

        it(`create a note, responds with a 201 and the new note`,function(){
            this.retries(3)
            const newNote={
                note_name:"Brand New Freaking Note",
                content:"a whole lot of interesting stuff",
                folder_id:2,
            }
            return supertest(app)
                .post('/api/notes')
                .send(newNote)
                .expect(res=>{
                    expect(res.body.content).to.eql(newNote.content)
                    expect(res.body.note_name).to.eql(newNote.note_name)
                    expect(res.body.folder_id).to.eql(newNote.folder_id)
                    expect(res.body).to.have.property('id')
                    expect(res.headers.location).to.eql(`/api/notes/${res.body.id}`)
                   // const expected  = new Date().toLocaleString()
                   // const actual = new Date(res.body.date_modified).toLocaleString()
                   // expect(actual).to.equal(expected)
                })
        })//end it create note

        const requiredFields = ['note_name', 'content', 'folder_id']

        requiredFields.forEach(field=>{
            const newNote = {
                note_name:"Some New Note",
                folder_id:"2",
                content:"some new amazing filler content to read"
            }
        
            it(`responds with a 400 an error message when the ${field} is missing`,()=>{
                delete newNote[field]

                return supertest(app)
                    .post(`/api/notes`)
                    .send(newNote)
                    .expect(400, {
                        error: { message: `Missing '${field}' in request body` }
                    })
            })//end of it 400
        })//end of forEach


    })//end describe POST /notes

})//end describe noteful endpoints
