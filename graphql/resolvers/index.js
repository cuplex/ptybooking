const bcryptjs = require('bcryptjs')

const Event = require('../../models/event')
const User = require('../../models/user')
const Booking = require('../../models/booking')

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
const  singleEvent = async eventId => {
  const event = await Event.findById(eventId)
  return {
    ...event._doc,
    _id: event.id,
    creator: user.bind(this, event._doc.creator)
  }
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

  bookings: async () => {
    try {
      const bookings = await Booking.find()
      return bookings.map(booking => {
        return {
          ...booking._doc,
          _id: booking.id,
          event: singleEvent.bind(this, booking._doc.event),
          user: user.bind(this, booking._doc.user),
          createdAt: new Date(booking._doc.createdAt).toISOString(),
          updatedAt: new Date(booking._doc.updatedAt).toISOString(),
        }
      })
    } catch (error) {
      throw error
    }
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
  },

  bookEvent: async (args) => {
    try {
      const event = await Event.findOne({ _id: args.eventId })
      const booking = new Booking({
        event,
        user: '5c9e5b5399e0151a9fe9610d',
      })
      const result = await booking.save()
      return {
        ...result._doc,
        _id: result.id,
        event: singleEvent.bind(this, result._doc.event),
        user: user.bind(this, result._doc.user),
        createdAt: new Date(result._doc.createdAt).toISOString(),
        updatedAt: new Date(result._doc.updatedAt).toISOString(),
      }
    } catch (error) {
      throw error
    }
  },

  cancelBooking: async args => {
    try {
      console.log({args})
      const booking = await Booking.findById(args.bookingId).populate('event')
      console.log(booking)
      const event = {
        ...booking.event._doc,
        _id: booking.event.id,
        creator: user.bind(this, booking.event._doc.creator)
      }
      await Booking.deleteOne({ _id: args.bookingId })
      return event  
    } catch (error) {
      throw error 
    }
  }  
}