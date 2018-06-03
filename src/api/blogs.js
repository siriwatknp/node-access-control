import express from 'express'
import RBAC, { permissions } from '../lib/rbac'

const rbac = new RBAC(permissions)

const app = express()

app.get('/', (req, res) => {
  res.send(rbac.can('writer', 'edit', { user: { id: 1 }, post: { owner: 2 }}))
})

export default app