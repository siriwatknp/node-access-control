const roles = {
  manager: {
    can: ['read', 'write', 'publish']
  },
  writer: {
    can: ['read', 'write']
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
    return roles[role] && roles[role].can.indexOf(operation) !== -1
  }
}