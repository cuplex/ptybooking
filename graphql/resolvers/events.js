const { dateToString } = require('../../helpers/date')
const Event = require('../../models/event')
const User = require('../../models/user')

const { transformEvent } = require('./common')

module.exports = {
  events: () => {
    return Event.find()
    .then(events => {
      return events.map(event => {
      //  special id getter from MongoDB
        return transformEvent(event)
      })
    })
    .catch(error => {
      console.log({error})
      throw error
    })
  },

  createEvent: (args,req) => {
    if (!req.isAuth) {
      throw new Error('Unauthorized!')
    }
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
        createdEvent = transformEvent(result)
        return User.findById('5c9e5765afa55618865c2ec4')
      })
      .then(user => {
        if (!user) {
          throw new Error('Users does not exist')
        }
        user.createdEvents.push(event)
        return user.save()
      })
      .then(() => {
        return createdEvent
      })
      .catch(error => {
        console.log(error)
        throw error
      })
  },
}
