const express = require('express')
const bodyParser = require('body-parser')
const graphqlHttp = require('express-graphql')
const { buildSchema } = require('graphql')
const mongoose = require('mongoose')
const bcryptjs = require('bcryptjs')

const Event = require('./models/event')
const User = require('./models/user')

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

    type User {
      _id: ID!
      email: String!
      password: String
    }

    input EventInput {
      title: String!
      description: String!
      price: Float!
      date: String!
    }

    input UserInput {
      email: String!
      password: String!
    }

    type RootQuery {
      events: [Event!]!
      users: [User!]!
    }

    type RootMutation {
      createEvent(eventInput: EventInput): Event
      createUser(userInput: UserInput): User
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
      let createdEvent
      const event = new Event({
        title: eventInput.title,
        description: eventInput.description,
        price: +eventInput.price, // ensures to return a number
        date: eventInput.date,
        creator: '5c9e5765afa55618865c2ec4',
      })

      return event.save()
        .then(result => {
          // _id: event._doc._id.toString() handles the id object from MongoDB
          createdEvent = { ...result._doc, _id: event._doc._id.toString() }
          return User.findById('5c9e5765afa55618865c2ec4')
        })
        .then(user => {
          if (!user) {
            throw new Error('Users does not exist')
          }
          user.createdEvents.push(event)
          return user.save()
        })
        .then(result => {
          console.log({result})
          return createdEvent
        })
        .catch(error => {
          console.log(error)
          throw error
        })
    },

    createUser: args => {
      const { userInput } = args

      return User.findOne({ email: userInput.email })
        .then(user => {
          if (user) {
            throw new Error('user already exist')
          }
          return bcryptjs.hash(userInput.password, 12)
        })
        .then(hashedPassword => {
          const user = new User({
            email: userInput.email,
            password: hashedPassword
          })
          return user.save()
        })
        .then(result => {
          return { ...result._doc, _id: result.id, password: null }
        })
        .catch(error => {
          console.log(error)
          throw error
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