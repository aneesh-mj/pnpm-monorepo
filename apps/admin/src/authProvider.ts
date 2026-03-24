import { AuthProvider } from 'react-admin'

/**
 * Dev stub — replace with ra-keycloak in production:
 *
 * import Keycloak from 'keycloak-js'
 * import { keycloakAuthProvider } from 'ra-keycloak'
 *
 * const keycloak = new Keycloak({
 *   url:      'https://your-keycloak/auth',
 *   realm:    'your-realm',
 *   clientId: 'admin-app',
 * })
 * export const authProvider = keycloakAuthProvider(keycloak)
 */
export const authProvider: AuthProvider = {
  login:          async () => {},
  logout:         async () => {},
  checkAuth:      async () => {},
  checkError:     async () => {},
  getPermissions: async () => [],
  getIdentity:    async () => ({ id: 'dev-user', fullName: 'Dev User' }),
}
