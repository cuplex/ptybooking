const jwt = require('jsonwebtoken')

module.exports = (req, res, next) => {
  const authHeader = req.get('Authorization')

  if (!authHeader) {
    req.isAuthenicated = false
    return next()
  }

  const token = authHeader.split(' ')[1]
  if (!token || token === '') {
    req.isAuthenicated = false
    return next()
  }

  let decodedToken
  try {
    decodedToken = jwt.decode(token, 'mysupersecretkey')
  } catch (error) {
    req.isAuthenicated = false
    return next()
  }

  if (!decodedToken) {
    req.isAuthenicated = false
    return next()
  }
  req.isAuthenicated = true
  req.userId = decodedToken.userId
  next()
}