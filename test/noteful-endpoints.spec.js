const knex = require('knex')
const app = require('../src/app')

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
                .get('api/folders')
                .expect(200,[])
            })
        })//end context no artciles
    })//end of GET /folders
})//end describe noteful endpoints
