import express from 'express'
import session from 'express-session'
import eSession from 'easy-session'
import cookieParser from 'cookie-parser'
import RBAC, { permissions } from '../lib/rbac'

const rbac = new RBAC(permissions)

const app = express()
app.use(cookieParser())
app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true,
}))
app.use(eSession.main(session, {
  rbac: (cb) => {
    setImmediate(cb, null, {
      guest: {
        can: ['blog:read'],
      },
      writer: {
        can: ['blog:create'],
        inherits: ['guest']
      }
    })
  }
}))

app.get('/login/:role', (req, res) => {
  req.session.login(req.params.role)
    .then(() => res.send('logged in'))
})

app.get('/logout', (req, res) => {
  req.session.logout()
    .then(() => res.send('logged out'))
})

app.get('/create', (req, res) => {
  // if(!req.session.hasRole('writer')) {
  //   res.sendStatus(403)
  //   return
  // }
  // return res.send('Blog Edit')
  req.session.can('blog:create')
    .then(() => res.send('Blog created'))
    .catch(() => res.sendStatus(403))
})

app.get('/', (req, res) => {
  res.send('Current role is ' + req.session.getRole())
})

export default app