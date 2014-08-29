/*jslint node: true, plusplus: true */
/*global surfCaptain,angular*/

'use strict';

angular.module('surfCaptain').service('UtilityService', function () {

    /**
     *
     * @param {string} name
     * @param {array} tags
     * @returns {string}
     */
    this.getDeployedTag = function (name, tags) {
        var length = tags.length,
            i = 0,
            commit;
        for (i; i < length; i++) {
            if (tags[i].name === 'server-' + name) {
                commit = tags[i].commit;
            }
        }
        if (angular.isUndefined(commit)) {
            return 'No deployed tag found.';
        }
        i = 0;
        for (i; i < length; i++) {
            if (tags[i].commit.id === commit.id && tags[i].name !== 'server-' + name) {
                return tags[i].type + ' ' + tags[i].name + ' - ' + commit.committerName + ': "' + commit.message + '"';
            }
        }
        return commit.id + ' - ' + commit.committerName + ': "' + commit.message + '"';
    };
});
