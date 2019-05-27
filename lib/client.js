'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _get = function get(_x32, _x33, _x34) { var _again = true; _function: while (_again) { var object = _x32, property = _x33, receiver = _x34; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x32 = parent; _x33 = property; _x34 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

require('core-js/shim');

var _api = require('./api');

var _api2 = _interopRequireDefault(_api);

var _modelsAttributes = require('./models/attributes');

var _modelsAttributes2 = _interopRequireDefault(_modelsAttributes);

var _modelsGroup = require('./models/group');

var _modelsGroup2 = _interopRequireDefault(_modelsGroup);

var _modelsUser = require('./models/user');

var _modelsUser2 = _interopRequireDefault(_modelsUser);

var _modelsSession = require('./models/session');

var _modelsSession2 = _interopRequireDefault(_modelsSession);

var CrowdClient = (function (_CrowdApi) {
  _inherits(CrowdClient, _CrowdApi);

  function CrowdClient(settings) {
    var _this = this;

    _classCallCheck(this, CrowdClient);

    // Refer to `test/helpers/settings-example.js` for configurable settings.
    _get(Object.getPrototypeOf(CrowdClient.prototype), 'constructor', this).call(this, settings);

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
      get: function get(username) {
        var withAttributes = arguments.length <= 1 || arguments[1] === undefined ? false : arguments[1];

        username = encodeURIComponent(username);
        return _this.request('GET', '/user?username=' + username + (withAttributes ? '&expand=attributes' : '')).then(function (data) {
          if (withAttributes) {
            data.attributes = _modelsAttributes2['default'].fromCrowd(data.attributes.attributes, _this.settings.attributesParser);
          }
          return data;
        }).then(_modelsUser2['default'].fromCrowd);
      },

      /**
       * Creates a new user.
       *
       * @param {User} user - The user to be created in Crowd
       * @return {Promise.<User>} Resolves to the newly created user on success
       */
      create: function create(user) {
        return _this.request('POST', '/user', user.toCrowd()).then(_modelsUser2['default'].fromCrowd);
      },

      /**
       * Updates a user.
       *
       * @param {string} username - Username of the user to update
       * @param {User} user - The new user object
       * @return {Promise.<User>} Resolves to the updated user on success
       */
      update: function update(username, user) {
        // Crowd returns a 204 No Content. Return the original object for consistency.
        return _this.request('PUT', '/user?username=' + encodeURIComponent(username), user.toCrowd()).then(function () {
          return _this.user.get(username);
        });
      },

      /**
       * Renames a user.
       *
       * @param {string} oldname - Original name
       * @param {string} newname - New name
       * @return {Promise} Resolves to nothing
       */
      rename: function rename(oldname, newname) {
        oldname = encodeURIComponent(oldname);
        return _this.request('POST', '/user/rename?username=' + oldname, { 'new-name': newname });
      },

      /**
       * Deletes a user.
       *
       * @param {string} username
       * @return {Promise} Resolves to nothing
       */
      remove: function remove(username) {
        username = encodeURIComponent(username);
        return _this.request('DELETE', '/user?username=' + username);
      },

      attributes: {
        /**
         * Retrieves a set of user attributes.
         *
         * @param {string} username
         * @return {Promise.<Attributes>} Resolves to a set of attributes
         */
        list: function list(username) {
          username = encodeURIComponent(username);
          return _this.request('GET', '/user/attribute?username=' + username).then(function (res) {
            return _modelsAttributes2['default'].fromCrowd(res.attributes, _this.settings.attributesParser);
          });
        },

        /**
         * Stores all the user attributes for an existing user.
         *
         * @param {string} username
         * @param {Attributes} attributes - The new set of attributes
         * @return {Promise.<Attributes>} Resolves to the new set of attributes
         */
        set: function set(username, attributes) {
          try {
            return _this.request('POST', '/user/attribute?username=' + encodeURIComponent(username), {
              attributes: attributes.toCrowd(_this.settings.attributesEncoder)
            }).then(function () {
              return _this.user.attributes.list(username);
            });
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
        remove: function remove(username, attributename) {
          username = encodeURIComponent(username);
          attributename = encodeURIComponent(attributename);
          return _this.request('DELETE', '/user/attribute?username=' + username + '&attributename=' + attributename);
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
        set: function set(username, password) {
          username = encodeURIComponent(username);
          return _this.request('PUT', '/user/password?username=' + username, { value: password });
        },

        /**
         * Sends the user a password reset link.
         *
         * @param {string} username
         * @return {Promise} Resolves to nothing
         */
        reset: function reset(username) {
          username = encodeURIComponent(username);
          return _this.request('POST', '/user/mail/password?username=' + username);
        }
      },

      username: {
        /**
         * Sends a username reminder to the users associated with the given email address.
         *
         * @param {string} email - Email address
         * @return {Promise} Resolves to nothing
         */
        request: function request(email) {
          return _this.request('POST', '/user/mail/usernames?email=' + email);
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
        get: function get(username, groupname) {
          var nested = arguments.length <= 2 || arguments[2] === undefined ? false : arguments[2];

          username = encodeURIComponent(username);
          groupname = encodeURIComponent(groupname);
          return _this.request('GET', '/user/group/' + (nested ? 'nested' : 'direct') + '?username=' + username + '&groupname=' + groupname).then(function (res) {
            return res.name;
          });
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
        list: function list(username) {
          var nested = arguments.length <= 1 || arguments[1] === undefined ? false : arguments[1];
          var startIndex = arguments.length <= 2 || arguments[2] === undefined ? 0 : arguments[2];
          var maxResults = arguments.length <= 3 || arguments[3] === undefined ? 1000 : arguments[3];

          username = encodeURIComponent(username);
          return _this.request('GET', '/user/group/' + (nested ? 'nested' : 'direct') + '?username=' + username + '&start-index=' + startIndex + '&max-results=' + maxResults).then(function (res) {
            return res.groups.map(function (group) {
              return group.name;
            });
          });
        },

        /**
         * Adds the user [username] as a direct member of the group [groupname].
         *
         * @param {string} username
         * @param {string} groupname
         * @return {Promise} Resolves to nothing
         */
        add: function add(username, groupname) {
          username = encodeURIComponent(username);
          return _this.request('POST', '/user/group/direct?username=' + username, { name: groupname });
        },

        /**
         * Removes the group membership of the user.
         *
         * @param {string} username
         * @param {string} groupname
         * @return {Promise} Resolves to nothing
         */
        remove: function remove(username, groupname) {
          username = encodeURIComponent(username);
          groupname = encodeURIComponent(groupname);
          return _this.request('DELETE', '/user/group/direct?username=' + username + '&groupname=' + groupname);
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
      get: function get(groupname) {
        var withAttributes = arguments.length <= 1 || arguments[1] === undefined ? false : arguments[1];

        groupname = encodeURIComponent(groupname);
        return _this.request('GET', '/group?groupname=' + groupname + (withAttributes ? '&expand=attributes' : '')).then(_modelsGroup2['default'].fromCrowd);
      },

      /**
       * Creates a new group.
       *
       * @param {Group} group - The group to be created in Crowd
       * @return {Promise.<Group>} Resolves to the newly created group on success
       */
      create: function create(group) {
        // Crowd returns a 201 Created. Fetch and return the created object for consistency.
        return _this.request('POST', '/group', group.toCrowd()).then(function () {
          return _this.group.get(group.groupname);
        });
      },

      /**
       * Updates a group.
       *
       * @param {string} groupname - Name of the group to update
       * @param {Group} group - The new group object
       * @return {Promise.<Group>} Resolves to the updated group on success
       */
      update: function update(groupname, group) {
        groupname = encodeURIComponent(groupname);
        return _this.request('PUT', '/group?groupname=' + groupname, group.toCrowd()).then(_modelsGroup2['default'].fromCrowd);
      },

      /**
       * Deletes a group.
       *
       * @param {string} groupname
       * @return {Promise} Resolves to nothing
       */
      remove: function remove(groupname) {
        groupname = encodeURIComponent(groupname);
        return _this.request('DELETE', '/group?groupname=' + groupname);
      },

      attributes: {
        /**
         * Retrieves a list of group attributes.
         *
         * @param {string} groupname
         * @return {Promise.<Attributes>} Resolves to a set of group attributes on success
         */
        list: function list(groupname) {
          groupname = encodeURIComponent(groupname);
          return _this.request('GET', '/group/attribute?groupname=' + groupname).then(function (res) {
            return _modelsAttributes2['default'].fromCrowd(res.attributes, _this.settings.attributesParser);
          });
        },

        /**
         * Stores all the group attributes.
         *
         * @param {string} groupname
         * @param {Attributes} attributes - The new set of attributes
         * @return {Promise.<Attributes>} Resolves to the new set of attributes
         */
        set: function set(groupname, attributes) {
          try {
            return _this.request('POST', '/group/attribute?groupname=' + encodeURIComponent(groupname), {
              attributes: attributes.toCrowd(_this.settings.attributesEncoder)
            }).then(function () {
              return _this.group.attributes.list(groupname);
            });
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
        remove: function remove(groupname, attributename) {
          groupname = encodeURIComponent(groupname);
          attributename = encodeURIComponent(attributename);
          return _this.request('DELETE', '/group/attribute?groupname=' + groupname + '&attributename=' + attributename);
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
        get: function get(groupname, username) {
          var nested = arguments.length <= 2 || arguments[2] === undefined ? false : arguments[2];

          groupname = encodeURIComponent(groupname);
          username = encodeURIComponent(username);
          return _this.request('GET', '/group/user/' + (nested ? 'nested' : 'direct') + '?groupname=' + groupname + '&username=' + username).then(function (res) {
            return res.name;
          });
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
        list: function list(groupname) {
          var nested = arguments.length <= 1 || arguments[1] === undefined ? false : arguments[1];
          var startIndex = arguments.length <= 2 || arguments[2] === undefined ? 0 : arguments[2];
          var maxResults = arguments.length <= 3 || arguments[3] === undefined ? 1000 : arguments[3];
          var expand = arguments.length <= 4 || arguments[4] === undefined ? false : arguments[4];

          groupname = encodeURIComponent(groupname);
          return _this.request('GET', '/group/user/' + (nested ? 'nested' : 'direct') + '?groupname=' + groupname + '&start-index=' + startIndex + '&max-results=' + maxResults + '&expand=' + (expand ? 'user' : 'none')).then(function (res) {
            return res.users.map(function (user) {
              return expand ? _modelsUser2['default'].fromCrowd(user) : user.name;
            });
          });
        },

        /**
         * Adds user as direct member of group.
         *
         * @param {string} groupname
         * @param {string} username
         * @return {Promise} Resolves to nothing
         */
        add: function add(groupname, username) {
          groupname = encodeURIComponent(groupname);
          return _this.request('POST', '/group/user/direct?groupname=' + groupname, { name: username });
        },

        /**
         * Removes the user membership.
         *
         * @param {string} groupname
         * @param {string} username
         * @return {Promise} Resolves to nothing
         */
        remove: function remove(groupname, username) {
          groupname = encodeURIComponent(groupname);
          username = encodeURIComponent(username);
          return _this.request('DELETE', '/group/user/direct?groupname=' + groupname + '&username=' + username);
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
        get: function get(groupname, parentname) {
          var nested = arguments.length <= 2 || arguments[2] === undefined ? false : arguments[2];

          groupname = encodeURIComponent(groupname);
          parentname = encodeURIComponent(parentname);
          return _this.request('GET', '/group/parent-group/' + (nested ? 'nested' : 'direct') + '?groupname=' + groupname + '&parent-groupname=' + parentname).then(function (res) {
            return res.name;
          });
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
        list: function list(groupname) {
          var nested = arguments.length <= 1 || arguments[1] === undefined ? false : arguments[1];
          var startIndex = arguments.length <= 2 || arguments[2] === undefined ? 0 : arguments[2];
          var maxResults = arguments.length <= 3 || arguments[3] === undefined ? 1000 : arguments[3];

          groupname = encodeURIComponent(groupname);
          return _this.request('GET', '/group/parent-group/' + (nested ? 'nested' : 'direct') + '?groupname=' + groupname + '&start-index=' + startIndex + '&max-results=' + maxResults).then(function (res) {
            return res.groups.map(function (group) {
              return group.name;
            });
          });
        },

        /**
         * Adds a direct parent group membership.
         *
         * @param {string} groupname
         * @param {string} parentname
         * @return {Promise} Resolves to nothing
         */
        add: function add(groupname, parentname) {
          groupname = encodeURIComponent(groupname);
          return _this.request('POST', '/group/parent-group/direct?groupname=' + groupname, { name: parentname });
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
        get: function get(groupname, childname) {
          var nested = arguments.length <= 2 || arguments[2] === undefined ? false : arguments[2];

          groupname = encodeURIComponent(groupname);
          childname = encodeURIComponent(childname);
          return _this.request('GET', '/group/child-group/' + (nested ? 'nested' : 'direct') + '?groupname=' + groupname + '&child-groupname=' + childname);
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
        list: function list(groupname) {
          var nested = arguments.length <= 1 || arguments[1] === undefined ? false : arguments[1];
          var startIndex = arguments.length <= 2 || arguments[2] === undefined ? 0 : arguments[2];
          var maxResults = arguments.length <= 3 || arguments[3] === undefined ? 1000 : arguments[3];

          groupname = encodeURIComponent(groupname);
          return _this.request('GET', '/group/child-group/' + (nested ? 'nested' : 'direct') + '?groupname=' + groupname + '&start-index=' + startIndex + '&max-results=' + maxResults).then(function (res) {
            return res.groups.map(function (group) {
              return group.name;
            });
          });
        },

        /**
         * Adds a direct child group membership.
         *
         * @param {string} groupname
         * @param {string} childname
         * @return {Promise} Resolves to nothing
         */
        add: function add(groupname, childname) {
          groupname = encodeURIComponent(groupname);
          return _this.request('POST', '/group/child-group/direct?groupname=' + groupname, { name: childname });
        },

        /**
         * Deletes a child group membership.
         *
         * @param {string} groupname
         * @param {string} childname
         * @return {Promise} Resolves to nothing
         */
        remove: function remove(groupname, childname) {
          groupname = encodeURIComponent(groupname);
          childname = encodeURIComponent(childname);
          return _this.request('DELETE', '/group/child-group/direct?groupname=' + groupname + '&child-groupname=' + childname);
        }
      },

      /**
       * Retrieves full details of all group memberships, with users and nested groups.
       *
       * @return {string} The raw XML response, since Crowd does not support JSON for this request
       */
      membership: function membership() {
        return _this.request('GET', '/group/membership');
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
      authenticate: function authenticate(username, password) {
        username = encodeURIComponent(username);
        return _this.request('POST', '/authentication?username=' + username, { value: password }).then(_modelsUser2['default'].fromCrowd);
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
       * @return {(Promise.<string[]>|Promise.<User[]>} Resolves to a list of usernames or user objects which match the restriction
       */
      user: function user(restriction) {
        var expand = arguments.length <= 1 || arguments[1] === undefined ? false : arguments[1];
        var startIndex = arguments.length <= 2 || arguments[2] === undefined ? 0 : arguments[2];
        var maxResults = arguments.length <= 3 || arguments[3] === undefined ? 1000 : arguments[3];

        restriction = encodeURIComponent(restriction);
        return _this.request('GET', '/search?entity-type=user&restriction=' + restriction + '&start-index=' + startIndex + '&max-results=' + maxResults + (expand ? '&expand=user' : '')).then(function (res) {
          return expand ? res.users.map(_modelsUser2['default'].fromCrowd) : res.users.map(function (user) {
            return user.name;
          });
        });
      },

      /**
       * Searches for groups with the specified search restriction.
       *
       * @param {string} restriction - CQL query
       * @param {boolean=false} expand - Expand group names to group objects
       * @param {number=0} startIndex - Index to start iterating from
       * @param {number=1000} maxResults - Maximum number of results
       * @return {(Promise.<string[]>|Promise.<Group[]>} Resolves to a list of group names or group objects which match the restriction
       */
      group: function group(restriction) {
        var expand = arguments.length <= 1 || arguments[1] === undefined ? false : arguments[1];
        var startIndex = arguments.length <= 2 || arguments[2] === undefined ? 0 : arguments[2];
        var maxResults = arguments.length <= 3 || arguments[3] === undefined ? 1000 : arguments[3];

        restriction = encodeURIComponent(restriction);
        return _this.request('GET', '/search?entity-type=group&restriction=' + restriction + '&start-index=' + startIndex + '&max-results=' + maxResults + (expand ? '&expand=group' : '')).then(function (res) {
          return expand ? res.groups.map(_modelsGroup2['default'].fromCrowd) : res.groups.map(function (group) {
            return group.name;
          });
        });
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
      getUser: function getUser(token) {
        return _this.request('GET', '/session/' + token).then(function (res) {
          return _modelsUser2['default'].fromCrowd(res.user);
        });
      },

      /**
       * Validates the session token. Validating the token keeps the SSO session alive.
       *
       * @param {string} token
       * @param {ValidationFactors=undefined} validationFactors
       * @return {Promise.<Session>} Resolves to the authenticated session on success
       */
      validate: function validate(token) {
        var validationFactors = arguments.length <= 1 || arguments[1] === undefined ? undefined : arguments[1];

        return _this.request('POST', '/session/' + token, validationFactors ? validationFactors.toCrowd() : {}).then(_modelsSession2['default'].fromCrowd);
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
      create: function create(username, password) {
        var validationFactors = arguments.length <= 2 || arguments[2] === undefined ? undefined : arguments[2];
        var duration = arguments.length <= 3 || arguments[3] === undefined ? undefined : arguments[3];

        var payload = validationFactors ? {
          username: username, password: password, 'validation-factors': validationFactors.toCrowd()
        } : { username: username, password: password };
        duration = parseInt(duration || _this.settings.sessionTimeout) || 600;
        return _this.request('POST', '/session?duration=' + duration, payload).then(_modelsSession2['default'].fromCrowd);
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
      createUnvalidated: function createUnvalidated(username) {
        var validationFactors = arguments.length <= 1 || arguments[1] === undefined ? undefined : arguments[1];
        var duration = arguments.length <= 2 || arguments[2] === undefined ? undefined : arguments[2];

        var payload = validationFactors ? {
          username: username, 'validation-factors': validationFactors.toCrowd()
        } : { username: username };
        duration = parseInt(duration || _this.settings.sessionTimeout) || 600;
        return _this.request('POST', '/session?duration=' + duration + '&validate-password=false', payload).then(_modelsSession2['default'].fromCrowd);
      },

      /**
       * Invalidates a token.
       *
       * @param {string} token
       * @return {Promise} Resolves to nothing
       */
      remove: function remove(token) {
        return _this.request('DELETE', '/session/' + token);
      },

      /**
       * Invalidate all tokens for a given user name.
       *
       * @param {string} username - Username for which to remove all tokens
       * @param {string=undefined} exclude - Token to save from invalidation
       * @return {Promise} Resolves to nothing
       */
      removeAll: function removeAll(username) {
        var exclude = arguments.length <= 1 || arguments[1] === undefined ? undefined : arguments[1];

        username = encodeURIComponent(username);
        return _this.request('DELETE', '/session?username=' + username + (exclude ? '&exclude=' + exclude : ''));
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
      cookie: function cookie() {
        return _this.request('GET', '/config/cookie');
      }
    };

    /**
     * User Model
     */
    this.userModel = _modelsUser2['default'],

    /**
      * Attributes Model
      */
    this.attributesModel = _modelsAttributes2['default'],

    /**
     * Attributes Model
     */
    this.groupModel = _modelsGroup2['default'],

    /**
     * Session Model
     */
    this.sessionModel = _modelsSession2['default'];
  }

  return CrowdClient;
})(_api2['default']);

exports['default'] = CrowdClient;
module.exports = exports['default'];