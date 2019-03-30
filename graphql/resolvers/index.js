const bcryptjs = require('bcryptjs')

const Event = require('../../models/event')
const User = require('../../models/user')

const events = eventIds => {
  return Event.find({ _id: { $in: eventIds } })
    .then(events => {
      return events.map(event => {
        return {
          ...event._doc,
          _id: event.id,
          creator: user.bind(this, event._doc.creator)
        }
      })
    })
    .catch(err => {
      throw err
    })
}

const user = userId => {
  return User.findById(userId)
    .then(user =>{
      return {
        ...user._doc,
        _id: user.id,
        createdEvents: events.bind(this, user._doc.createdEvents)
      }
    })
    .catch(err => {
      throw err
    })
}

module.exports = {
  events: () => {
   return Event.find()
   .then(events => {
     return events.map(event => {
      //  special id getter from MongoDB
       return { 
         ...event._doc,
         _id: event.id,
         creator: user.bind(this, event._doc.creator)
        }
     })
   })
   .catch(error => {
      console.log({error})
      throw error
   })
  },

  users: () => {
    return User.find()
      .then(users => {
        return users.map(user => {
          return {
            ...user._doc,
            _id: user.id,
            createdEvents: events.bind(this, user._doc.createdEvents)
          }
        })
      })
      .catch(err => {
        throw err
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
        createdEvent = { 
          ...result._doc, 
          _id: event._doc._id.toString(),
          creator: user.bind(this, result._doc.creator)
         }
         console.log({createdEvent})
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
}