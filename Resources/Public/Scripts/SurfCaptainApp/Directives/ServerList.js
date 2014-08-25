/*global surfCaptain,angular*/
/*jslint node: true, plusplus:true */

'use strict';
surfCaptain.directive('serverList', [
    'PresetRepository',
    'ValidationService',
    'FlashMessageService',
    'SEVERITY',
    'SettingsRepository',
    function (PresetRepository, ValidationService, FlashMessageService, SEVERITY, SettingsRepository) {
        var linker = function (scope, element, attrs) {
            scope.toggleSpinnerAndOverlay = function () {
                scope.finished = !scope.finished;
                scope.$parent.finished = !scope.$parent.finished;
            };

            SettingsRepository.getSettings().then(
                function (response) {
                    scope.contexts = '';
                    if (angular.isDefined(response.contexts)) {
                        scope.contexts = response.contexts.split(',');
                    }
                }
            );

            /**
             * Stores a preset object in a scope variable
             *
             * @param {object} preset
             * @return void
             */
            scope.setCurrentPreset = function (preset) {
                scope.currentPreset = preset;
            };

            /**
             * Wrapper for PresetRepository.deleteServer(server)
             *
             * @param {object} server
             * @return void
             */
            scope.deleteServer = function (server) {
                scope.toggleSpinnerAndOverlay();
                PresetRepository.deleteServer(server).then(
                    function (response) {
                        scope.$parent.getAllServers();
                        scope.messages = FlashMessageService.addFlashMessage(
                            'Server deleted!',
                            'The Server "' + server.applications[0].nodes[0].name + '" was successfully removed.',
                            SEVERITY.ok
                        );
                    },
                    function (response) {
                        scope.toggleSpinnerAndOverlay();
                        scope.messages = FlashMessageService.addFlashMessage(
                            'Deletion failed!',
                            'The Server "' + server.applications[0].nodes[0].name + '" could not be removed.',
                            SEVERITY.error
                        );
                    }
                );
            };

            /**
             * Wrapper for PresetRepository.updateServer(server)
             *
             * @param {object} server
             * @return void
             */
            scope.updateServer = function (server) {
                scope.toggleSpinnerAndOverlay();
                PresetRepository.updateServer(server.applications[0]).then(
                    function () {
                        server.changed = false;
                        scope.toggleSpinnerAndOverlay();
                        scope.messages = FlashMessageService.addFlashMessage(
                            'Update successful!',
                            'The Server "' + server.applications[0].nodes[0].name + '" was updated successfully.',
                            SEVERITY.ok
                        );
                    },
                    function () {
                        scope.toggleSpinnerAndOverlay();
                        scope.messages = FlashMessageService.addFlashMessage(
                            'Update failed!',
                            'The Server "' + server.applications[0].nodes[0].name + '" could not be updated.',
                            SEVERITY.error
                        );
                    }
                );
            };

            /**
             * Validates the updated Host string before submitting to Server
             *
             * @param data
             * @return {string | boolean} ErrorMessage or True if valid
             */
            scope.updateHost = function (data) {
                return ValidationService.hasLength(data, 1, 'Host must not be empty!');
            };

            /**
             * Validates the updated DeploymentPath string before submitting to Server
             *
             * @param data
             * @return {string | boolean} ErrorMessage or True if valid
             */
            scope.updateDeploymentPath = function (data) {
                var res = ValidationService.hasLength(data, 1, 'DeploymentPath is required!');
                if (res === true) {
                    return ValidationService.doesLastCharacterMatch(data, '/', 'DeploymentPath must end with "/"!');
                }
                return res;
            };

            /**
             * Validates the updated Username string before submitting to Server
             *
             * @param data
             * @return {string | boolean} ErrorMessage or True if valid
             */
            scope.updateUsername = function (data) {
                return ValidationService.hasLength(data, 1, 'User must not be empty!');
            };

            /**
             * Validates the updated Context string before submitting to Server
             *
             * @param data
             * @return {string | boolean} ErrorMessage or True if valid
             */
            scope.updateContext = function (data) {
                var i = 0,
                    length = scope.context.length;
                for (i; i < length; i++) {
                    if (ValidationService.doesStringStartWithSubstring(data, scope.contexts[i])) {
                        return true;
                    }
                }
                return 'Context must start with either Development, Testing or Production!';
            };

        };

        return {
            restrict: 'E',
            templateUrl: '/_Resources/Static/Packages/Lightwerk.SurfCaptain/Scripts/SurfCaptainApp/Partials/ServerList.html',
            scope: {
                servers: '=',
                getAllServers: '&',
                finished: '=',
                messages: '='
            },
            link: linker
        };
    }
]);