require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const MOVIEDEX = require('./moviedex.json')
const cors = require('cors')
const helmet = require ('helmet')

//console.log(process.env.API_TOKEN)

const app = express()

const morganSetting = process.env.NODE_ENV === 'production' ? 'tiny' : 'common'
app.use(morgan(morganSetting))

app.use(cors())
app.use(helmet())

app.use(function validateBearerToken(req, res, next) {
    const apiToken = process.env.API_TOKEN
    const authToken = req.get('Authorization')

    //console.log('validate bearer token middleware')
    
    if (!authToken || authToken.split(' ')[1] !== apiToken) {
          return res.status(401).json({ error: 'Unauthorized request' })
        }
  next()
})

app.get('/movie', function handleGetMovie(req, res) {
  let response = MOVIEDEX;

  // filter our movie by genre, country, and/or average vote param is present
  if (req.query.genre) {
    response = response.filter(movie =>
      // case insensitive searching
      movie.genre.toLowerCase().includes(req.query.genre.toLowerCase())
    )
  }

  if (req.query.country) {
    response = response.filter(movie =>
      // case insensitive searching
      movie.country.toLowerCase().includes(req.query.country.toLowerCase())
    )
  }

  if (req.query.avg_vote) {
    response = response.filter(movie =>
      // case insensitive searching
      Number(movie.avg_vote) >= Number(req.query.avg_vote)
    )
  }
  
  res.json(response)

})

app.use((error, req, res, next) => {
  let response
  if (process.env.NODE_ENV === 'production') {
    response = { error: { message: 'server error' }}
  } else {
    response = { error }
  }
  res.status(500).json(response)
})

const PORT = process.env.PORT || 8000

app.listen(PORT, () => {
  //console.log(`Server listening at http://localhost:${PORT}`)
})

