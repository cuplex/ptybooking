const { events } = require('./common')
const bcryptjs = require('bcryptjs')

const User = require('../../models/user')

module.exports = {
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
}