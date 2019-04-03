const { events } = require('./common')
const bcryptjs = require('bcryptjs')
const jwt = require('jsonwebtoken')
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

  login: async ({ email, password }) => {
    try {
      const user = await User.findOne({ email: email})
      if (!user) {
        throw new Error('User does not exist')
      }
      console.log({user})
      const isEqual = await bcryptjs.compare(password, user.password)
      if (!isEqual) {
        throw new Error('Password is incorrect')
      }
      const token = jwt.sign(
        {
          userId: user.id, 
          email: user.email
        },
        'mysupersecretkey',
        {
          expiresIn: '1h'
        }
      )
      return { userId: user.id, token: token,tokenExpiration: 1 }
    } catch (error) {
      throw error
    }
  }
}