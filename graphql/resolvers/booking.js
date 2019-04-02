const { dateToString } = require('../../helpers/date')
const { transformEvent, user, singleEvent } = require('./common')
const Booking = require('../../models/booking')
const Event = require('../../models/event')


const transformBooking = booking =>  {
  return {
    ...booking._doc,
    _id: booking.id,
    event: singleEvent.bind(this, booking._doc.event),
    user: user.bind(this, booking._doc.user),
    createdAt: dateToString(booking._doc.createdAt),
    updatedAt: dateToString(booking._doc.updatedAt)
  }
}

module.exports = {
  bookings: async () => {
    try {
      const bookings = await Booking.find()
      return bookings.map(booking => {
        return transformBooking(booking)
      })
    } catch (error) {
      throw error
    }
  },

  bookEvent: async (args) => {
    try {
      const event = await Event.findOne({ _id: args.eventId })
      const booking = new Booking({
        event,
        user: '5c9e5b5399e0151a9fe9610d',
      })
      const result = await booking.save()
      return transformBooking(result)
    } catch (error) {
      throw error
    }
  },

  cancelBooking: async args => {
    try {
      const booking = await Booking.findById(args.bookingId).populate('event')
      const event = transformEvent(booking.event)
      await Booking.deleteOne({ _id: args.bookingId })
      return event  

    } catch (error) {
      throw error 
    }
  }  
}