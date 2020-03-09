// implement your API here
const helpers = require('./data/db.js')
// we will write our API with Express (barebones lib for building web servers - Sinatra)
// STEP 1, install express
// STEP 2, import express, commonjs syntax instead of native ES modules
const express = require('express')
// STEP 3 instantiate app
const app = express()
// STEP 4 "turn on" the ability of the app to read req.body as json
app.use(express.json())
// STEP 5 decide a port number
const PORT = 3333
// STEP 6 make an endpoint on "/hello" [GET] that sends back a json { "message": "hello" }
app.get('/hello', (
  req, // req is the "objectified" version of the actual http request (piece of paper with 3 parts...)
  res, // res is the toolbox that allows to shape a response and send it back to the client
) => {
  // set a success code of 200
  // send back a json response
  console.log(req.headers);
  res
    .status(200)
    .json({ message: 'hello' })
})
// STEP 6.5: build an endpoint [GET] "/users" and returns ALL users in the database
// we will take advantage of the "find" helper from the db.js file inside of data
app.get('/users', async (req, res) => {
  const users = await helpers.find()
  console.log(users);
  res
    .status(200)
    .json({ users })
})
// STEP 6.6 build and endpoint [GET] "/users/:id"
// sends back the user with the given id
// we can find the id inside the req object
// the id can be found inside req.params.id
app.get("/users/:id", (req, res) => {
  const { id } = req.params
  helpers.findById(id)
    .then(user => {
      if (!user) {
        res.status(404).json({ message: 'No user with id ' + id })
      } else {
        console.log(user)
        res.status(200).json(user)
      }
      // IMPORTANT COMMENT
      // if we forget to res.json at some point
      // the client will be left hanging
      // until it times out
      // ANOTHER IMPORTANT COMMENT
      // if we res.json twice, that'll be an error
    })
    .catch(error => {
      console.log(error);
    })
  // the id can be found inside req.params.id
})
// STEP 6.7 build a [POST] on "/users"
// to create a new user using the body of the request
// app.post('/users', (req, res) => {
//   // when a client does 
//   // axios.post('http://localhost:3333/users', user).then().catch()
//   const payload = req.body
// })
// ? creates new user
app.post('/users', (req, res) => {
    // create a user
    const newUser = req.body
    if (!newUser.name || !newUser.bio) {
         //respond with HTTP status code 400(Bad Request)
    //return the JSON error response
    res.status(400).json({ errorMessage: 'Please provide name and bio for the user.' })
    }else{
        helpers.insert(newUser)
        .then( result => {
        res.status(201).json(result)
    })
        .catch( err => res.status(500).json({ errorMessage: "There was an error while saving the user to the database" }))
    }

})
// ? deletes user
app.delete('/users/:id', (req, res) => {
    const {id} = req.params
    helpers.remove(id)
    .then(results => {
        if(results){
        res.status(200).json({ message: "Delete successful. "})
    } else{
        res.status(400).json({ message: "The user with the specified ID does not exist. "})
    }})
    .catch(err => res.status(500).json({message: 'Error deleting user'}))
})
// ? updates user
app.put('/users/:id', (req, res) => {
    const {id} = req.params
    const userInfo = req.body
    if(!userInfo.name || !userInfo.bio){
        res.status(400).json({ errorMessage: "Please provide name and bio for the user." })
    } else {
        helpers.update(id, userInfo)
        .then(updateUser => {
            if(updatedUser){
                res.status(200).json(updateUser)
            }else{
                res.status(404).json({ error: "The user could not be removed" })
            }
        })
        .catch( err => res.status(500).json({ error: "The user information could not be modified"}))
    }
})
// STEP 7 make the express app listen on PORT
app.listen(PORT, () => {
  console.log(`Great! Listening on ${PORT}`)
})


