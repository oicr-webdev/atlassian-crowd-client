import 'core-js/shim';

import CrowdApi from './api';
import Attributes from './models/attributes';
import Group from './models/group';
import User from './models/user';
import Session from './models/session';

export default class CrowdClient extends CrowdApi {
  constructor(settings) {
    // Refer to `test/helpers/settings-example.js` for configurable settings.
    super(settings);

    /**
     * User Resource
     */
    this.user = {
      /**
       * Retrieves a user by its username.
       *
       * @param {string} username
       * @param {boolean} withAttributes - Include attributes in returned user
       * @return {Promise.<User>} Resolves to the found user on success
       */
      get: (username, withAttributes = false) => {
        username = encodeURIComponent(username);
        return this.request('GET', `/user?username=${username}${withAttributes ? '&expand=attributes' : ''}`)
          .then(data => {
            if (withAttributes) {
              data.attributes = Attributes.fromCrowd(data.attributes.attributes, this.settings.attributesParser);
            }
            return data;
          })
          .then(User.fromCrowd);
      },

      /**
       * Creates a new user.
       *
       * @param {User} user - The user to be created in Crowd
       * @return {Promise.<User>} Resolves to the newly created user on success
       */
      create: (user) => {
        return this.request('POST', '/user', user.toCrowd())
          .then(User.fromCrowd);
      },

      /**
       * Updates a user.
       *
       * @param {string} username - Username of the user to update
       * @param {User} user - The new user object
       * @return {Promise.<User>} Resolves to the updated user on success
       */
      update: (username, user) => {
        // Crowd returns a 204 No Content. Return the original object for consistency.
        return this.request('PUT', `/user?username=${encodeURIComponent(username)}`, user.toCrowd())
          .then(() => this.user.get(username));
      },

      /**
       * Renames a user.
       *
       * @param {string} oldname - Original name
       * @param {string} newname - New name
       * @return {Promise} Resolves to nothing
       */
      rename: (oldname, newname) => {
        oldname = encodeURIComponent(oldname);
        return this.request('POST', `/user/rename?username=${oldname}`, { 'new-name': newname });
      },

      /**
       * Deletes a user.
       *
       * @param {string} username
       * @return {Promise} Resolves to nothing
       */
      remove: (username) => {
        username = encodeURIComponent(username);
        return this.request('DELETE', `/user?username=${username}`);
      },

      attributes: {
        /**
         * Retrieves a set of user attributes.
         *
         * @param {string} username
         * @return {Promise.<Attributes>} Resolves to a set of attributes
         */
        list: (username) => {
          username = encodeURIComponent(username);
          return this.request('GET', `/user/attribute?username=${username}`)
            .then(res => Attributes.fromCrowd(res.attributes, this.settings.attributesParser));
        },

        /**
         * Stores all the user attributes for an existing user.
         *
         * @param {string} username
         * @param {Attributes} attributes - The new set of attributes
         * @return {Promise.<Attributes>} Resolves to the new set of attributes
         */
        set: (username, attributes) => {
          try {
            return this.request('POST', `/user/attribute?username=${encodeURIComponent(username)}`, {
              attributes: attributes.toCrowd(this.settings.attributesEncoder)
            }).then(() => this.user.attributes.list(username));
          } catch (e) {
            return Promise.reject(e);
          }
        },

        /**
         * Deletes a user attribute.
         *
         * @param {string} username
         * @param {string} attributename - Name of the attribute
         * @return {Promise} Resolves to nothing
         */
        remove: (username, attributename) => {
          username = encodeURIComponent(username);
          attributename = encodeURIComponent(attributename);
          return this.request('DELETE', `/user/attribute?username=${username}&attributename=${attributename}`);
        }
      },

      password: {
        /**
         * Updates a user's password.
         *
         * @param {string} username
         * @param {string} password - New password
         * @return {Promise} Resolves to nothing
         */
        set: (username, password) => {
          username = encodeURIComponent(username);
          return this.request('PUT', `/user/password?username=${username}`, { value: password });
        },

        /**
         * Sends the user a password reset link.
         *
         * @param {string} username
         * @return {Promise} Resolves to nothing
         */
        reset: (username) => {
          username = encodeURIComponent(username);
          return this.request('POST', `/user/mail/password?username=${username}`);
        }
      },

      username: {
        /**
         * Sends a username reminder to the users associated with the given email address.
         *
         * @param {string} email - Email address
         * @return {Promise} Resolves to nothing
         */
        request: (email) => {
          return this.request('POST', `/user/mail/usernames?email=${email}`);
        }
      },

      groups: {
        /**
         * Retrieves the group that the user is a member of.
         *
         * @param {string} username
         * @param {string} groupname
         * @param {boolean=false} nested - Return nested groups
         * @return {Promise.<string>} Resolves to the group name on success
         */
        get: (username, groupname, nested = false) => {
          username = encodeURIComponent(username);
          groupname = encodeURIComponent(groupname);
          return this.request('GET', `/user/group/${nested ? 'nested' : 'direct'}?username=${username}&groupname=${groupname}`)
            .then(res => res.name);
        },

        /**
         * Retrieves the groups that the user is a member of.
         *
         * @param {string} username
         * @param {boolean=false} nested - Return nested groups
         * @param {number=0} startIndex - Index to start iterating from
         * @param {number=1000} maxResults - Maximum number of results
         * @return {Promise.<string[]>} Resolves to a list of group names on success
         */
        list: (username, nested = false, startIndex = 0, maxResults = 1000) => {
          username = encodeURIComponent(username);
          return this.request('GET', `/user/group/${nested ? 'nested' : 'direct'}?username=${username}&start-index=${startIndex}&max-results=${maxResults}`)
            .then(res => res.groups.map(group => group.name));
        },

        /**
         * Adds the user [username] as a direct member of the group [groupname].
         *
         * @param {string} username
         * @param {string} groupname
         * @return {Promise} Resolves to nothing
         */
        add: (username, groupname) => {
          username = encodeURIComponent(username);
          return this.request('POST', `/user/group/direct?username=${username}`, { name: groupname });
        },

        /**
         * Removes the group membership of the user.
         *
         * @param {string} username
         * @param {string} groupname
         * @return {Promise} Resolves to nothing
         */
        remove: (username, groupname) => {
          username = encodeURIComponent(username);
          groupname = encodeURIComponent(groupname);
          return this.request('DELETE', `/user/group/direct?username=${username}&groupname=${groupname}`);
        }
      }
    };

    /**
     * Group Resource
     */
    this.group = {
      /**
       * Retrieves a group by its name.
       *
       * @param {string} groupname
       * @param {boolean} withAttributes - Include attributes in returned group
       * @return {Promise.<Group>} Resolves to the found group on success
       */
      get: (groupname, withAttributes = false) => {
        groupname = encodeURIComponent(groupname);
        return this.request('GET', `/group?groupname=${groupname}${withAttributes ? '&expand=attributes' : ''}`)
          .then(Group.fromCrowd);
      },

      /**
       * Creates a new group.
       *
       * @param {Group} group - The group to be created in Crowd
       * @return {Promise.<Group>} Resolves to the newly created group on success
       */
      create: (group) => {
        // Crowd returns a 201 Created. Fetch and return the created object for consistency.
        return this.request('POST', '/group', group.toCrowd())
          .then(() => this.group.get(group.groupname));
      },

      /**
       * Updates a group.
       *
       * @param {string} groupname - Name of the group to update
       * @param {Group} group - The new group object
       * @return {Promise.<Group>} Resolves to the updated group on success
       */
      update: (groupname, group) => {
        groupname = encodeURIComponent(groupname);
        return this.request('PUT', `/group?groupname=${groupname}`, group.toCrowd())
          .then(Group.fromCrowd);
      },

      /**
       * Deletes a group.
       *
       * @param {string} groupname
       * @return {Promise} Resolves to nothing
       */
      remove: (groupname) => {
        groupname = encodeURIComponent(groupname);
        return this.request('DELETE', `/group?groupname=${groupname}`);
      },

      attributes: {
        /**
         * Retrieves a list of group attributes.
         *
         * @param {string} groupname
         * @return {Promise.<Attributes>} Resolves to a set of group attributes on success
         */
        list: (groupname) => {
          groupname = encodeURIComponent(groupname);
          return this.request('GET', `/group/attribute?groupname=${groupname}`)
            .then(res => Attributes.fromCrowd(res.attributes, this.settings.attributesParser));
        },

        /**
         * Stores all the group attributes.
         *
         * @param {string} groupname
         * @param {Attributes} attributes - The new set of attributes
         * @return {Promise.<Attributes>} Resolves to the new set of attributes
         */
        set: (groupname, attributes) => {
          try {
            return this.request('POST', `/group/attribute?groupname=${encodeURIComponent(groupname)}`, {
              attributes: attributes.toCrowd(this.settings.attributesEncoder)
            }).then(() => this.group.attributes.list(groupname));
          } catch (e) {
            return Promise.reject(e);
          }
        },

        /**
         * Deletes a group attribute.
         *
         * @param {string} groupname
         * @param {string} attributename - Name of the attribute
         * @return {Promise} Resolves to nothing
         */
        remove: (groupname, attributename) => {
          groupname = encodeURIComponent(groupname);
          attributename = encodeURIComponent(attributename);
          return this.request('DELETE', `/group/attribute?groupname=${groupname}&attributename=${attributename}`);
        }
      },

      users: {
        /**
         * Retrieves the user that is a member of the specified group.
         *
         * @param {string} groupname
         * @param {string} username
         * @param {boolean=false} nested - Return nested members
         * @return {Promise.<string>} Resolves to the username on success
         */
        get: (groupname, username, nested = false) => {
          groupname = encodeURIComponent(groupname);
          username = encodeURIComponent(username);
          return this.request('GET', `/group/user/${nested ? 'nested' : 'direct'}?groupname=${groupname}&username=${username}`)
            .then(res => res.name);
        },

        /**
         * Retrieves the users that are members of the specified group.
         *
         * @param {string} groupname
         * @param {boolean=false} nested - Return nested groups
         * @param {number=0} startIndex - Index to start iterating from
         * @param {number=1000} maxResults - Maximum number of results
         * @param {boolean=false} expand - Expand users to objects
         * @return {(Promise.<string[]>|Promise.<User[]>} Resolves to a list of usernames or user objects on success
         */
        list: (groupname, nested = false, startIndex = 0, maxResults = 1000, expand = false) => {
          groupname = encodeURIComponent(groupname);
          return this.request('GET', `/group/user/${nested ? 'nested' : 'direct'}?groupname=${groupname}&start-index=${startIndex}&max-results=${maxResults}&expand=${expand ? 'user' : 'none'}`)
              .then(res => res.users.map(user => expand ? User.fromCrowd(user) : user.name));
        },

        /**
         * Adds user as direct member of group.
         *
         * @param {string} groupname
         * @param {string} username
         * @return {Promise} Resolves to nothing
         */
        add: (groupname, username) => {
          groupname = encodeURIComponent(groupname);
          return this.request('POST', `/group/user/direct?groupname=${groupname}`, { name: username });
        },

        /**
         * Removes the user membership.
         *
         * @param {string} groupname
         * @param {string} username
         * @return {Promise} Resolves to nothing
         */
        remove: (groupname, username) => {
          groupname = encodeURIComponent(groupname);
          username = encodeURIComponent(username);
          return this.request('DELETE', `/group/user/direct?groupname=${groupname}&username=${username}`);
        }
      },

      // NOTE:
      // Nested groups are not supported in all directory implementations (e.g. OpenLDAP).
      // This functionality can be enabled using the `settings.nesting` option.
      parents: {
        /**
         * Retrieves the group that is a direct parent of the specified group.
         *
         * @param {string} groupname
         * @param {string} parentname
         * @param {boolean=false} nested - Return nested members
         * @return {Promise.<string>} Resolves to the parent group name on success
         */
        get: (groupname, parentname, nested = false) => {
          groupname = encodeURIComponent(groupname);
          parentname = encodeURIComponent(parentname);
          return this.request('GET', `/group/parent-group/${nested ? 'nested' : 'direct'}?groupname=${groupname}&parent-groupname=${parentname}`)
            .then(res => res.name);
        },

        /**
         * Retrieves the groups that are parents of the specified group.
         *
         * @param {string} groupname
         * @param {string} parentname
         * @param {boolean=false} nested - Return nested groups
         * @param {number=0} startIndex - Index to start iterating from
         * @param {number=1000} maxResults - Maximum number of results
         * @return {Promise.<string[]>} Resolves to a list of parent group names on success
         */
        list: (groupname, nested = false, startIndex = 0, maxResults = 1000) => {
          groupname = encodeURIComponent(groupname);
          return this.request('GET', `/group/parent-group/${nested ? 'nested' : 'direct'}?groupname=${groupname}&start-index=${startIndex}&max-results=${maxResults}`)
            .then(res => res.groups.map(group => group.name));
        },

        /**
         * Adds a direct parent group membership.
         *
         * @param {string} groupname
         * @param {string} parentname
         * @return {Promise} Resolves to nothing
         */
        add: (groupname, parentname) => {
          groupname = encodeURIComponent(groupname);
          return this.request('POST', `/group/parent-group/direct?groupname=${groupname}`, { name: parentname });
        }
      },
      children: {
        /**
         * Retrieves the group that is a direct child of the specified group.
         *
         * @param {string} groupname
         * @param {string} childname
         * @param {boolean=false} nested - Return nested groups
         * @return {Promise.<string>} Resolves to the child group name on success
         */
        get: (groupname, childname, nested = false) => {
          groupname = encodeURIComponent(groupname);
          childname = encodeURIComponent(childname);
          return this.request('GET', `/group/child-group/${nested ? 'nested' : 'direct'}?groupname=${groupname}&child-groupname=${childname}`);
        },

        /**
         * Retrieves the groups that are direct children of the specified group.
         *
         * @param {string} groupname
         * @param {string} childname
         * @param {boolean=false} nested - Return nested groups
         * @param {number=0} startIndex - Index to start iterating from
         * @param {number=1000} maxResults - Maximum number of results
         * @return {Promise.<string[]>} Resolves to a list of child group names on success
         */
        list: (groupname, nested = false, startIndex = 0, maxResults = 1000) => {
          groupname = encodeURIComponent(groupname);
          return this.request('GET', `/group/child-group/${nested ? 'nested' : 'direct'}?groupname=${groupname}&start-index=${startIndex}&max-results=${maxResults}`)
            .then(res => res.groups.map(group => group.name));
        },

        /**
         * Adds a direct child group membership.
         *
         * @param {string} groupname
         * @param {string} childname
         * @return {Promise} Resolves to nothing
         */
        add: (groupname, childname) => {
          groupname = encodeURIComponent(groupname);
          return this.request('POST', `/group/child-group/direct?groupname=${groupname}`, { name: childname });
        },

        /**
         * Deletes a child group membership.
         *
         * @param {string} groupname
         * @param {string} childname
         * @return {Promise} Resolves to nothing
         */
        remove: (groupname, childname) => {
          groupname = encodeURIComponent(groupname);
          childname = encodeURIComponent(childname);
          return this.request('DELETE', `/group/child-group/direct?groupname=${groupname}&child-groupname=${childname}`);
        }
      },


      /**
       * Retrieves full details of all group memberships, with users and nested groups.
       *
       * @return {string} The raw XML response, since Crowd does not support JSON for this request
       */
      membership: () => {
        return this.request('GET', '/group/membership');
      }
    };

    /**
     * User Authentication Resource
     */
    this.authentication = {
      /**
       * Authenticates a user.
       *
       * @param {string} username
       * @param {string} password
       * @return {Promise.<User>} Resolves to the authenticated user on success
       */
      authenticate: (username, password) => {
        username = encodeURIComponent(username);
        return this.request('POST', `/authentication?username=${username}`, { value: password })
          .then(User.fromCrowd);
      }
    };

    /**
     * Search Resource
     */
    this.search = {
      /**
       * Searches for users with the specified search restriction.
       *
       * @param {string} restriction - CQL query
       * @param {boolean=false} expand - Expand usernames to user objects
       * @param {number=0} startIndex - Index to start iterating from
       * @param {number=1000} maxResults - Maximum number of results
       * @param {withAttributes=false} withAttributes - Return attributes in user objects
       * @return {(Promise.<string[]>|Promise.<User[]>} Resolves to a list of usernames or user objects which match the restriction
       */
      user: (restriction, expand = false, startIndex = 0, maxResults = 1000, withAttributes = false) => {
        restriction = encodeURIComponent(restriction);
        return this.request('GET', `/search?entity-type=user&restriction=${restriction}&start-index=${startIndex}&max-results=${maxResults}${expand ? '&expand=user' : ''}${withAttributes ? '&expand=attributes' : ''}`)
          .then(res => expand ? res.users.map(User.fromCrowd) : res.users.map(user => user.name));
      },

      /**
       * Searches for groups with the specified search restriction.
       *
       * @param {string} restriction - CQL query
       * @param {boolean=false} expand - Expand group names to group objects
       * @param {number=0} startIndex - Index to start iterating from
       * @param {number=1000} maxResults - Maximum number of results
       * @param {withAttributes=false} withAttributes - Return attributes in group objects
       * @return {(Promise.<string[]>|Promise.<Group[]>} Resolves to a list of group names or group objects which match the restriction
       */
      group: (restriction, expand = false, startIndex = 0, maxResults = 1000, withAttributes = false) => {
        restriction = encodeURIComponent(restriction);
        return this.request('GET', `/search?entity-type=group&restriction=${restriction}&start-index=${startIndex}&max-results=${maxResults}${expand ? '&expand=group' : ''}${withAttributes ? '&expand=attributes' : ''}`)
          .then(res => expand ? res.groups.map(Group.fromCrowd) : res.groups.map(group => group.name));
      }
    };

    /**
     * SSO Token Resource
     */
    this.session = {
      /**
       * Retrieves the user belonging to the provided session token.
       *
       * @param {string} token
       * @return {Promise.<User>} Resolves to the authenticated user on success
       */
      getUser: (token) => {
        return this.request('GET', `/session/${token}`)
          .then(res => User.fromCrowd(res.user));
      },

      /**
       * Validates the session token. Validating the token keeps the SSO session alive.
       *
       * @param {string} token
       * @param {ValidationFactors=undefined} validationFactors
       * @return {Promise.<Session>} Resolves to the authenticated session on success
       */
      validate: (token, validationFactors = undefined) => {
        return this.request('POST', `/session/${token}`, validationFactors ? validationFactors.toCrowd() : {})
          .then(Session.fromCrowd);
      },

      /**
       * Create a new session token.
       *
       * @param {string} username
       * @param {string} password
       * @param {ValidationFactors=undefined} validationFactors
       * @param {Number=undefined} duration - Number of seconds until the session expired, or for the server default
       *  session timeout if no duration is specified or if duration is longer than the server default session timeout
       * @return {Promise.<Session>} Resolves to the newly created session, or if an ongoing session already exists for
       *  the same authentication credentials and validation factors, then that session token is returned
       */
      create: (username, password, validationFactors = undefined, duration = undefined) => {
        let payload = validationFactors ? {
          username, password, 'validation-factors': validationFactors.toCrowd()
        } : { username, password };
        duration = parseInt(duration || this.settings.sessionTimeout) || 600;
        return this.request('POST', `/session?duration=${duration}`, payload)
          .then(Session.fromCrowd);
      },

      /**
       * Create a new unvalidated session token.
       *
       * @param {string} username
       * @param {ValidationFactors=undefined} validationFactors
       * @param {Number=undefined} duration - Number of seconds until the session expired, or for the server default
       *  session timeout if no duration is specified or if duration is longer than the server default session timeout
       * @return {Promise.<Session>} Resolves to the newly created session, or if an ongoing session already exists for
       *  the same authentication credentials and validation factors, then that session token is returned
       */
      createUnvalidated: (username, validationFactors = undefined, duration = undefined) => {
        let payload = validationFactors ? {
          username, 'validation-factors': validationFactors.toCrowd()
        } : { username };
        duration = parseInt(duration || this.settings.sessionTimeout) || 600;
        return this.request('POST', `/session?duration=${duration}&validate-password=false`, payload)
          .then(Session.fromCrowd);
      },

      /**
       * Invalidates a token.
       *
       * @param {string} token
       * @return {Promise} Resolves to nothing
       */
      remove: (token) => {
        return this.request('DELETE', `/session/${token}`);
      },

      /**
       * Invalidate all tokens for a given user name.
       *
       * @param {string} username - Username for which to remove all tokens
       * @param {string=undefined} exclude - Token to save from invalidation
       * @return {Promise} Resolves to nothing
       */
      removeAll: (username, exclude = undefined) => {
        username = encodeURIComponent(username);
        return this.request('DELETE', `/session?username=${username}${exclude ? '&exclude=' + exclude : ''}`);
      }
    };

    /**
     * Cookie Configuration Resource
     */
    this.config = {
      /**
       * Retrieves cookie configuration.
       * Also useful to test or 'ping' the API since it's the simplest call you can make.
       *
       * @return {Object} Cookie configuration object
       */
      cookie: () => this.request('GET', '/config/cookie')
    };


    /**
     * User Model
     */
    this.userModel = User,

    /**
      * Attributes Model
      */
    this.attributesModel = Attributes,


    /**
     * Attributes Model
     */
    this.groupModel = Group,

    /**
     * Session Model
     */
    this.sessionModel = Session

  }
}
