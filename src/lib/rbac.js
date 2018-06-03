import Q from 'q'

export const permissions = {
  manager: {
    can: ['read', 'write', 'publish'],
    inherits: ['writer'],
  },
  writer: {
    can: [
      'write',
      {
        name: 'edit',
        when: (params) => params.user.id === params.post.owner,
      }],
    inherits: ['guest'],
  },
  guest: {
    can: ['read'],
  },
}

export default class RBAC {
  constructor(roles) {
    this.init(roles)
  }

  init(roles) {
    if (typeof roles !== 'object') {
      throw new TypeError('Expected an object as input')
    }

    if(typeof roles === 'function') {
      this._init = Q.nfcall(roles).then(data => this.init(data))
      this._inited = true
      return
    }

    this.roles = roles
    let map = {}
    Object.keys(roles).forEach(role => {
      map[role] = {
        can: {}
      }
      if(roles[role].inherits) {
        map[role].inherits = roles[role].inherits
      }

      roles[role].can.forEach(operation => {
        if(typeof operation === 'string') {
          map[role].can[operation] = 1
        }else if(typeof operation.name === 'string' && typeof operation.when === 'function') {
          map[role].can[operation.name] = operation.when
        }

        //ignore definition we don't understand
      })

    })

    this.roles = map
  }

  can(role, operation, params, cb) {
    if (!this._inited) {
      return this._init.then(() => this.can(role, operation, params, cb))
    }
    if (typeof params === 'function') {
      cb = params
      params = undefined
    }

    let callback = cb || (() => {})

    return Q.Promise((resolvePromise, rejectPromise) => {
      const resolve = (value) => {
        resolvePromise(value)
        callback(undefined, value)
      }

      const reject = (err) => {
        rejectPromise(err)
        callback(undefined, err)
      }

      let $role = this.roles[role]

      if (!$role.can[operation]) {
        if (!$role.inherits) {
          return reject(false)
        }

        return Q.any($role.inherits.map(parent => this.can(parent, operation, params)))
          .then(resolve, reject)
      }

      if ($role.can[operation] === 1) {
        return resolve(true)
      }

      if (typeof $role.can[operation] === 'function') {
        $role.can[operation](params, (err, result) => {
          if (err) {
            return reject(err)
          }

          if (!result) {
            return reject(false)
          }
          resolve(true)
        })
        return
      }

      reject(false)
    })
  }
}