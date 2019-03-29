const express = require('express')
const bodyParser = require('body-parser')
const graphqlHttp = require('express-graphql')
const { buildSchema } = require('graphql')
const mongoose = require('mongoose')

const Event = require('./models/event')

const app = express()

app.use(bodyParser.json())

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
     return Event.find()
     .then(events => {
       console.log(events)
       return events.map(event => {
        //  special id getter from MongoDB
         return { ...event._doc, _id: event.id }
       })
     })
     .catch(error => {
        console.log({error})
        throw error
     })
    },

    createEvent: (args) => {
      const { eventInput } = args

      const event = new Event({
        title: eventInput.title,
        description: eventInput.description,
        price: +eventInput.price, // ensures to return a number
        date: eventInput.date
      })

      return event.save()
      .then(result => {
        // _id: event._doc._id.toString() handles the id object from MongoDB
        return { ...result._doc, _id: event._doc._id.toString() }
      })
      .catch(error => {
        console.log(error)
        throw new Error('Error ocurred while saving event')
      })
    }
  },

  graphiql: true

}))

const connectionString = `mongodb+srv://${
  process.env.MONGO_USER}:${
    process.env.MONGO_PASSWORD}@cluster0-ptvua.mongodb.net/${process.env.MONGO_DB}?retryWrites=true`

mongoose.connect(connectionString
).then(() => {
  app.listen(3000)
},(err) => {
  console.log(err)
})