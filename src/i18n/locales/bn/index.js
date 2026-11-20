import shell from './shell'
import landing from './landing'
import auth from './auth'
import dashboard from './dashboard'
import properties from './properties'
import units from './units'
import leases from './leases'
import tenants from './tenants'
import rentCharges from './rentCharges'
import payments from './payments'
import proposals from './proposals'
import maintenance from './maintenance'
import users from './users'
import roles from './roles'
import settings from './settings'

export default {
  ...shell,
  ...landing,
  ...auth,
  ...dashboard,
  ...properties,
  ...units,
  ...leases,
  ...tenants,
  ...rentCharges,
  ...payments,
  ...proposals,
  ...maintenance,
  ...users,
  ...roles,
  ...settings,
}
