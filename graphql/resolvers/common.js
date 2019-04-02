const { dateToString } = require('../../helpers/date')
const User = require('../../models/user')
const Event = require('../../models/event')

const transformEvent = event => {
  return {
    ...event._doc,
    _id: event.id,
    creator: user.bind(this, event._doc.creator),
    date: dateToString(event._doc.date),
  }
}

const events = eventIds => {
  return Event.find({ _id: { $in: eventIds } })
    .then(events => {
      return events.map(event => {
        return transformEvent(event)
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

const  singleEvent = async eventId => {
  const event = await Event.findById(eventId)
  return transformEvent(event)
}

exports.user = user
exports.events = events
exports.singleEvent = singleEvent
exports.transformEvent = transformEvent
