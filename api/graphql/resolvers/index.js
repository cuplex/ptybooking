const authResolver = require('./auth')
const bookingesolver = require('./booking')
const eventResolver = require('./events')

const rootResolver = {
  ...authResolver,
  ...bookingesolver,
  ...eventResolver,
}

module.exports = rootResolver