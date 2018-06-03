const permissions = {
  manager: {
    can: ['read', 'write', 'publish'],
    inherits: ['writer']
  },
  writer: {
    can: ['read', 'write'],
    inherits: ['guest']
  },
  guest: {
    can: ['read']
  }
}

export default class RBAC {
  constructor(roles) {
    if (typeof roles !== 'object') {
      throw new TypeError('Expected an object as input')
    }
    this.roles = roles
  }

  static can(role, operation) {
    if (!this.roles[role]) {
      // this role is not exist in permissions
      return false
    }
    let $role = this.roles[role]

    if ($role.can.indexOf(operation !== -1)) {
      // this role can perform this operation
      return true
    }

    if($role.inherits || $role.inherits.length === 0) {
      // no inheritance
      return false
    }

    return $role.inherits.some((childRole) => this.can(childRole, operation))
  }
}