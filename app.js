const express = require('express')
const bodyParser = require('body-parser')
const graphqlHttp = require('express-graphql')
const mongoose = require('mongoose')
const isAuth = require('./middleware/is-auth')
const graphqlSchema = require('./graphql/schema')
const graphqlResolvers = require('./graphql/resolvers')

const app = express()

app.use(bodyParser.json())

app.use(isAuth)

app.use('/graphql', graphqlHttp({
  schema: graphqlSchema,
  rootValue: graphqlResolvers,
  graphiql: true

}))

const connectionString = `mongodb+srv://${
  process.env.MONGO_USER}:${
    process.env.MONGO_PASSWORD}@cluster0-ptvua.mongodb.net/${process.env.MONGO_DB}?retryWrites=true`

mongoose.connect(connectionString)
  .then(() => {
    app.listen(3000)
  },(err) => {
    console.log(err)
})