const express = require('express')
const bodyParser = require('body-parser')
const graphqlHttp = require('express-graphql')
const { buildSchema } = require('graphql')
const { v4 } = require('uuid')
const mongoose = require('mongoose')

// import { v4 } from 'node-uuid'

const app = express()

app.use(bodyParser.json())

const events = []

app.use('/graphql', graphqlHttp({
  schema: buildSchema(`

    type Event {
      _id: ID!
      title: String!
      description: String!
      price: Float!
      date: String!
    }

    input EventInput {
      title: String!
      description: String!
      price: Float!
      date: String!
    }

    type RootQuery {
      events: [Event!]!
    }

    type RootMutation {
      createEvent(eventInput: EventInput): Event
    }

    schema {
      query: RootQuery
      mutation: RootMutation
    }
  `),

  rootValue: {
    events: () => {
     return events
    },
    createEvent: (args) => {
      const {eventInput} = args
      const event = {
        _id: v4(),
        title: eventInput.title,
        description: eventInput.description,
        price: +eventInput.price, // ensures to return a number
        date: eventInput.date
      }
      console.log(args)
      events.push(event)

      return event
    }
  },

  graphiql: true

}))
const connectionString = `mongodb+srv://${
  process.env.MONGO_USER}:${
    process.env.MONGO_PASSWORD}@cluster0-ptvua.mongodb.net/test?retryWrites=true`

mongoose.connect(connectionString
).then(() => {
  app.listen(3000)
},(err) => {
  console.log(err)
})