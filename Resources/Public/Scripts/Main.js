/*global angular*/
/*jslint node: true */

'use strict';
angular.module('surfCaptain', ['ngRoute', 'xeditable', 'ngAnimate', 'ngMessages', 'ngBiscuit'])
    .config(['$routeProvider', function ($routeProvider) {
        var templatePath = '/_Resources/Static/Packages/Lightwerk.SurfCaptain/Scripts/SurfCaptainApp/Templates/';
        $routeProvider.
            when('/', {
                templateUrl: templatePath + 'Projects.html',
                controller: 'ProjectsController'
            }).
            when('/project/:projectName', {
                templateUrl: templatePath + 'Project.html',
                controller: 'ProjectController'
            }).
            when('/project/:projectName/deploy', {
                templateUrl: templatePath + 'Deploy.html',
                controller: 'DeployController'
            }).
            when('/project/:projectName/sync', {
                templateUrl: templatePath + 'Sync.html',
                controller: 'SyncController'
            }).
            when('/project/:projectName/server', {
                templateUrl: templatePath + 'Server.html',
                controller: 'ServerController'
            }).
            when('/about', {
                templateUrl: templatePath + 'About.html',
                controller: 'AboutController'
            }).
            when('/globalserver', {
                templateUrl: templatePath + 'GlobalServer.html',
                controller: 'GlobalServerController'
            }).
            when('/extensions', {
                templateUrl: templatePath + 'Extensions.html',
                controller: 'ExtensionsController'
            }).
            when('/deployments', {
                templateUrl: templatePath + 'Deployments.html',
                controller: 'DeploymentsController'
            }).
            when('/project/:projectName/deployment/:deploymentId', {
                templateUrl: templatePath + 'SingleDeployment.html',
                controller: 'SingleDeploymentController'
            }).
            otherwise({
                redirectTo: '/'
            });
    }])
    .value('version', '1.0.0')
    .constant('SEVERITY', {
        ok: 0,
        info: 1,
        warning: 2,
        error: 3
    })
    .constant('CONFIG', {
        applicationTypes: {
            deploy: 'Deploy',
            deployTYPO3: 'TYPO3\\CMS\\Deploy',
            syncTYPO3: 'TYPO3\\CMS\\Shared'
        }
    });

angular.module('surfCaptain').run(['editableOptions', function (editableOptions) {
    editableOptions.theme = 'bs3';
}]);
/*global surfCaptain,angular*/
/*jslint node: true */

'use strict';
angular.module('surfCaptain').controller('AboutController', ['$scope', function ($scope) {
    $scope.techs = [
        {
            name: 'angular',
            url: 'https://angularjs.org/',
            description: {
                headline: 'AngularJS',
                span1: 'JavaScript',
                span2: 'Framework'
            }
        },
        {
            name: 'flow',
            url: 'http://flow.typo3.org/',
            description: {
                headline: 'TYPO3 FLOW',
                span1: 'PHP-Application',
                span2: 'Framework'
            }
        },
        {
            name: 'bootstrap',
            url: 'http://getbootstrap.com/',
            description: {
                headline: 'Bootstrap',
                span1: 'CSS',
                span2: 'Framework'
            }
        }
    ];
    $scope.subtechs = [
        {
            name: 'grunt',
            url: 'http://gruntjs.com/',
            description: {
                headline: 'Grunt'
            }
        },
        {
            name: 'bower',
            url: 'http://bower.io/',
            description: {
                headline: 'Bower'
            }
        },
        {
            name: 'composer',
            url: 'https://getcomposer.org/',
            description: {
                headline: 'Composer'
            }
        },
        {
            name: 'karma',
            url: 'http://karma-runner.github.io',
            description: {
                headline: 'Karma'
            }
        },
        {
            name: 'jasmine',
            url: 'http://jasmine.github.io/',
            description: {
                headline: 'Jasmine'
            }
        },
        {
            name: 'jquery',
            url: 'http://jquery.com/',
            description: {
                headline: 'jQuery'
            }
        },
        {
            name: 'css3',
            url: 'http://en.wikipedia.org/wiki/Cascading_Style_Sheets#CSS_3',
            description: {
                headline: 'CSS 3'
            }
        },
        {
            name: 'git',
            url: 'http://git-scm.com/',
            description: {
                headline: 'git'
            }
        },
        {
            name: 'html5',
            url: 'http://en.wikipedia.org/wiki/HTML5',
            description: {
                headline: 'HTML 5'
            }
        },
        {
            name: 'mysql',
            url: 'http://www.mysql.com/',
            description: {
                headline: 'MySQL'
            }
        },
        {
            name: 'less',
            url: 'http://www.lesscss.de/',
            description: {
                headline: 'LESS'
            }
        }
    ];
}]);
/*global surfCaptain, angular*/
/*jslint node: true */

'use strict';
angular.module('surfCaptain').controller('AbstractSingleProjectController', [
    '$scope',
    '$routeParams',
    'ProjectRepository',
    'FavorService',
    'FlashMessageService',
    'SEVERITY',
    function ($scope, $routeParams, ProjectRepository, FavorService, FlashMessageService, SEVERITY) {
        $scope.name = $routeParams.projectName;
        $scope.project = {};
        $scope.messages = {};
        $scope.error = false;

        this.init = function () {
            ProjectRepository.getProjects().then(
                function (projects) {
                    $scope.project = ProjectRepository.getProjectByName($scope.name, projects);
                    FavorService.addFavoriteProject($scope.project);
                },
                function () {
                    $scope.finished = true;
                    $scope.messages = FlashMessageService.addFlashMessage(
                        'Error!',
                        'API call failed. Please try again later.',
                        SEVERITY.error,
                        'request-error'
                    );
                    $scope.error = true;
                }
            );
        };
        this.init();
    }
]);
/*global surfCaptain, angular, jQuery*/
/*jslint node: true, plusplus:true */

'use strict';
angular.module('surfCaptain').controller('DeployController', [
    '$scope',
    '$controller',
    'ProjectRepository',
    'SEVERITY',
    'FlashMessageService',
    'CONFIG',
    'DeploymentRepository',
    '$location',
    'PresetRepository',
    'ValidationService',
    'SettingsRepository',
    'PresetService',
    'UtilityService',
    function ($scope, $controller, ProjectRepository, SEVERITY, FlashMessageService, CONFIG, DeploymentRepository, $location, PresetRepository, ValidationService, SettingsRepository, PresetService, UtilityService) {

        var loadingString = 'loading ...',
            self = this;

        function DeployControllerException(message) {
            this.name = 'DeployControllerException';
            this.message = message;
        }
        DeployControllerException.prototype = new Error();
        DeployControllerException.prototype.constructor = DeployControllerException;

        // Inherit from AbstractSingleProjectController
        angular.extend(this, $controller('AbstractSingleProjectController', {$scope: $scope}));

        $scope.deployableCommits = [
            {
                name: loadingString,
                group: 'Tags'
            },
            {
                name: loadingString,
                group: 'Branches'
            }
        ];
        $scope.servers = [];
        $scope.error = false;
        $scope.finished = false;
        $scope.currentPreset = {};
        $scope.tags = [];

        /**
         * @param {string} message
         * @param {boolean} unique
         * @return {void}
         */
        this.addFailureFlashMessage = function (message, unique) {
            $scope.finished = true;
            $scope.messages = FlashMessageService.addFlashMessage(
                'Error!',
                message,
                SEVERITY.error,
                unique ? 'deployment-project-call-failed' : undefined
            );
            $scope.error = true;
        };

        /**
         * @returns {object}
         * @throws DeployControllerException
         */
        this.getCurrentCommit = function () {
            var commits = $scope.deployableCommits.filter(function (commit) {
                return commit.identifier === $scope.selectedCommit;
            });
            if (angular.isUndefined(commits[0]) || commits === null || commits.length > 1) {
                throw new DeployControllerException('Something went wrong with the chosen Commit');
            }
            return commits[0];
        };

        /**
         * @param {object} preset
         * @return {void}
         */
        $scope.setCurrentPreset = function (preset) {
            $scope.currentPreset = preset;
            if (angular.isDefined($scope.selectedCommit) && $scope.selectedCommit !== '') {
                $scope.setCommitInCurrentPreset();
            }
        };

        $scope.deploy = function (preset) {
            if (preset === $scope.currentPreset) {
                if (angular.isUndefined($scope.currentPreset.applications[0].type)) {
                    $scope.currentPreset.applications[0].type = CONFIG.applicationTypes.deployTYPO3;
                }
                if (angular.isDefined($scope.currentPreset.applications[0].options.deploymentPathWithMarkers)) {
                    delete $scope.currentPreset.applications[0].options.deploymentPathWithMarkers;
                }
                if (angular.isUndefined($scope.currentPreset.applications[0].options.repositoryUrl) || $scope.currentPreset.applications[0].options.repositoryUrl === '') {
                    $scope.currentPreset.applications[0].options.repositoryUrl = $scope.project.repositoryUrl;
                }
                DeploymentRepository.addDeployment($scope.currentPreset).then(
                    function (response) {
                        $scope.messages = FlashMessageService.addFlashMessage(
                            'OK!',
                            $scope.currentCommit.type + ' ' + $scope.currentCommit.name + ' will be shortly deployed onto '
                                + $scope.currentPreset.applications[0].nodes[0].name + '! You can cancel the deployment while it is still waiting.',
                            SEVERITY.ok
                        );
                        ProjectRepository.updateFullProjectInCache($scope.project.repositoryUrl);
                        $location.path('project/' + $scope.name + '/deployment/' + response.deployment.__identity);
                    },
                    function () {
                        self.addFailureFlashMessage('Deployment configuration could not be submitted successfully. Try again later.', false);
                    }
                );
            }
        };

        /**
         * @return {void}
         */
        $scope.setCommitInCurrentPreset = function () {
            try {
                $scope.currentCommit = self.getCurrentCommit();
                switch ($scope.currentCommit.type) {
                case 'Branch':
                    delete $scope.currentPreset.applications[0].options.tag;
                    $scope.currentPreset.applications[0].options.branch = $scope.currentCommit.name;
                    break;
                case 'Tag':
                    delete $scope.currentPreset.applications[0].options.branch;
                    $scope.currentPreset.applications[0].options.tag = $scope.currentCommit.name;
                    break;
                default:
                    self.addFailureFlashMessage(
                        'Something is wrong with the type of the chosen commit. This should never happen. ' +
                            'In fact, If you see this message, please go ahaed and punch any of the involved developers in the face.',
                        false
                    );
                    $scope.currentCommit = null;
                    return;
                }
                $scope.currentPreset.applications[0].options.sha1 = $scope.currentCommit.commit.id;
            } catch (e) {
                self.addFailureFlashMessage(e.message, false);
                $scope.currentCommit = null;
            }
        };

        /**
         * @param {object} preset
         * @returns {string}
         */
        $scope.presetDisplay = function (preset) {
            if (angular.isUndefined($scope.currentPreset.applications)) {
                return '';
            }
            if ($scope.currentPreset === preset) {
                return '';
            }
            return 'disabled';
        };

        /**
         * @param {string} group
         * @return void
         */
        $scope.unsetLoadingKeyForGroup = function (group) {
            var key;
            for (key in $scope.deployableCommits) {
                if ($scope.deployableCommits.hasOwnProperty(key)) {
                    if (angular.isDefined($scope.deployableCommits[key].name)
                            && angular.isDefined($scope.deployableCommits[key].group)
                            && $scope.deployableCommits[key].name === loadingString
                            && $scope.deployableCommits[key].group === group) {
                        $scope.deployableCommits.splice(key, 1);
                        break;
                    }
                }
            }
        };

        /**
         * @param {string} context
         * @returns {string}
         */
        $scope.getRootContext = function (context) {
            return PresetService.getRootContext(context, $scope.contexts);
        };

        /**
         * @param {string} name
         * @return {string}
         */
        $scope.getDeployedTag = function (name) {
            return UtilityService.getDeployedTag(name, $scope.tags);
        };

        $scope.$watch('project', function (project) {
            if (angular.isUndefined(project.repositoryUrl)) {
                return;
            }

            ProjectRepository.getFullProjectByRepositoryUrl(project.repositoryUrl).then(
                function (response) {
                    var property,
                        presets = response.repository.presets;
                    $scope.repositoryUrl = response.repository.webUrl;
                    response.repository.tags.sort(UtilityService.byCommitDate);
                    response.repository.branches.sort(UtilityService.byCommitDate);
                    $scope.tags = response.repository.tags;
                    $scope.deployableCommits = response.repository.tags;
                    jQuery.merge($scope.deployableCommits, response.repository.branches);

                    for (property in presets) {
                        if (presets.hasOwnProperty(property)) {
                            if (angular.isUndefined(presets[property].applications[0].type) || presets[property].applications[0].type === CONFIG.applicationTypes.deployTYPO3 || presets[property].applications[0].type === CONFIG.applicationTypes.deploy) {
                                $scope.servers.push(presets[property]);
                            }
                        }
                    }
                    $scope.finished = true;
                    if ($scope.servers.length === 0) {
                        $scope.messages = FlashMessageService.addFlashMessage(
                            'No Servers yet!',
                            'FYI: There are no servers for project <span class="uppercase">' + $scope.name  + '</span> yet. Why dont you create one, hmm?',
                            SEVERITY.info,
                            $scope.name + '-no-servers'
                        );
                    }
                },
                function () {
                    self.addFailureFlashMessage('API call failed. Deployment not possible.', true);
                }
            );

            PresetRepository.getGlobalServers('').then(
                function (response) {
                    $scope.globalServers = response.presets;
                },
                function (response) {
                    self.addFailureFlashMessage('API call failed. Deployment not possible.', true);
                }
            );

            SettingsRepository.getSettings().then(
                function (response) {
                    $scope.contexts = [];
                    if (angular.isDefined(response.contexts)) {
                        $scope.contexts = response.contexts.split(',');
                    }
                }
            );
        });
    }]);
/*global surfCaptain, angular*/
/*jslint node: true */

'use strict';
angular.module('surfCaptain').controller('DeploymentsController', [
    '$scope',
    'DeploymentRepository',
    'FlashMessageService',
    'SEVERITY',
    function ($scope, DeploymentRepository, FlashMessageService, SEVERITY) {

        var self = this;

        /**
         * @param deployments
         * @return {void}
         */
        this.setDeployments = function (deployments) {
            $scope.deployments = deployments;
        };

        /**
         * @return {void}
         */
        this.init = function () {
            DeploymentRepository.getAllDeployments().then(
                function (response) {
                    $scope.finished = true;
                    self.setDeployments(response.deployments);
                },
                function () {
                    $scope.finished = true;
                    FlashMessageService.addFlashMessage(
                        'Error!',
                        'The API call failed. Please try again later.',
                        SEVERITY.error,
                        'deployment-list-no-response'
                    );
                }
            );
        };
        this.init();

        $scope.deployments = [];
        $scope.finished = false;
    }
]);
/*global surfCaptain, angular*/
/*jslint node: true */

'use strict';
angular.module('surfCaptain').controller('ExtensionsController', ['$scope', '$controller', function ($scope) {

}]);
/*jslint node: true, plusplus:true */
/*global surfCaptain, angular*/

'use strict';
angular.module('surfCaptain').controller('GlobalServerController', [
    '$scope',
    'PresetRepository',
    'PresetService',
    'FlashMessageService',
    'SEVERITY',
    'SettingsRepository',
    function ($scope, PresetRepository, PresetService, FlashMessageService, SEVERITY, SettingsRepository) {
        var self = this;

        $scope.newPreset = PresetService.getNewPreset();
        $scope.finished = false;
        $scope.messages = [];
        $scope.serverNames = [];

        /**
         * @return void
         */
        this.setServerNames = function () {
            var property;
            for (property in $scope.servers) {
                if ($scope.servers.hasOwnProperty(property)) {
                    $scope.serverNames.push(property);
                }
            }
        };

        /**
         * @return {void}
         */
        this.getSettings = function () {
            SettingsRepository.getSettings().then(
                function (response) {
                    $scope.contexts = '';
                    if (angular.isDefined(response.contexts)) {
                        $scope.contexts = response.contexts.split(',');
                    }
                }
            );
        };

        /**
         * @return {void}
         */
        $scope.getAllServers = function () {
            PresetRepository.getGlobalServers('').then(
                function (response) {
                    $scope.finished = true;
                    $scope.servers = response.presets;
                    self.setServerNames();
                    if ($scope.servers.length === 0) {
                        $scope.messages = FlashMessageService.addFlashMessage(
                            'FYI!',
                            'There are no servers yet. Why dont you create one, hmm?',
                            SEVERITY.info,
                            'global-server-request-no-results'
                        );
                    }
                },
                function (response) {
                    $scope.finished = true;
                    $scope.messages = FlashMessageService.addFlashMessage(
                        'Request failed!',
                        'The global servers could not be received. Please try again later..',
                        SEVERITY.error,
                        'global-server-request-failed'
                    );
                }
            );
        };

        /**
         *
         * @param {object} server
         * @return {void}
         */
        $scope.addServer = function (server) {
            $scope.finished = false;
            PresetRepository.addServer(server).then(
                function (response) {
                    $scope.newPreset = PresetService.getNewPreset();
                    $scope.newServerForm.$setPristine();
                    $scope.getAllServers();
                    $scope.messages = FlashMessageService.addFlashMessage(
                        'Server created!',
                        'The Server ' + server.nodes[0].name + ' was successfully created.',
                        SEVERITY.ok
                    );
                },
                function (response) {
                    $scope.finished = true;
                    $scope.messages = FlashMessageService.addFlashMessage(
                        'Creation failed!',
                        'The Server "' + server.nodes[0].name + '" could not be created.',
                        SEVERITY.error
                    );
                }
            );
        };

        /**
         * Initializes the GlobalServerController
         *
         * @return {void}
         */
        this.init = function () {
            self.getSettings();
            $scope.getAllServers();
        };
        this.init();
    }
]);
/*global surfCaptain, angular*/
/*jslint node: true */

'use strict';
angular.module('surfCaptain').controller('ProjectController', [
    '$scope',
    '$controller',
    'FlashMessageService',
    'ProjectRepository',
    'SEVERITY',
    'PresetService',
    'SettingsRepository',
    'UtilityService',
    function ($scope, $controller, FlashMessageService, ProjectRepository, SEVERITY, PresetService, SettingsRepository, UtilityService) {

        // Inherit from AbstractSingleProjectController
        angular.extend(this, $controller('AbstractSingleProjectController', {$scope: $scope}));

        $scope.ordering = 'date';
        $scope.finished = false;
        $scope.tags = [];

        /**
         * @param {string} context
         * @returns {string}
         */
        $scope.getRootContext = function (context) {
            return PresetService.getRootContext(context, $scope.contexts);
        };

        /**
         *
         * @param {string} name
         * @return {string}
         */
        $scope.getDeployedTag = function (name) {
            return UtilityService.getDeployedTag(name, $scope.tags);
        };

        $scope.$watch('project', function (project) {
            if (angular.isUndefined(project.repositoryUrl)) {
                return;
            }

            SettingsRepository.getSettings().then(
                function (response) {
                    $scope.contexts = [];
                    if (angular.isDefined(response.contexts)) {
                        $scope.contexts = response.contexts.split(',');
                    }
                    ProjectRepository.getFullProjectByRepositoryUrl(project.repositoryUrl).then(
                        function (response) {
                            $scope.finished = true;
                            $scope.deployments = response.repository.deployments;
                            $scope.presets = response.repository.presets;
                            $scope.tags = response.repository.tags;
                        },
                        function () {
                            $scope.finished = true;
                        }
                    );
                }
            );
        });
    }
]);
/*global surfCaptain, angular*/
/*jslint node: true */

'use strict';
angular.module('surfCaptain').controller('ProjectsController', [
    '$scope',
    'ProjectRepository',
    'SettingsRepository',
    'SEVERITY',
    'FlashMessageService',
    'FavorService',
    function ($scope, ProjectRepository, SettingsRepository, SEVERITY, FlashMessageService, FavorService) {
        $scope.settings = {};
        $scope.ordering = 'name';
        $scope.projects = [];
        $scope.finished = false;

        this.init = function () {
            // Retrieve Projects from Factory
            ProjectRepository.getProjects().then(
                function (response) {
                    $scope.finished = true;
                    $scope.projects = response;
                },
                function () {
                    //an error occurred
                    $scope.finished = true;
                    $scope.messages = FlashMessageService.addFlashMessage(
                        'Error!',
                        'API call failed. GitLab is currently not available.',
                        SEVERITY.error,
                        'projects-loaded-error'
                    );
                }
            );
            SettingsRepository.getSettings().then(
                function (response) {
                    $scope.settings = response;
                }
            );
        };
        this.init();
    }
]);
/*jslint node: true, plusplus:true */
/*global surfCaptain, angular*/

// TODO uinittests

'use strict';
angular.module('surfCaptain').controller('ServerController', [
    '$scope',
    '$controller',
    'PresetRepository',
    'ValidationService',
    'SettingsRepository',
    'MarkerService',
    'PresetService',
    'FlashMessageService',
    'SEVERITY',
    'ProjectRepository',
    function ($scope, $controller, PresetRepository, ValidationService, SettingsRepository, MarkerService, PresetService, FlashMessageService, SEVERITY, ProjectRepository) {

        var self = this;

        // Inherit from AbstractSingleProjectController
        angular.extend(this, $controller('AbstractSingleProjectController', {$scope: $scope}));

        function ServerControllerException(message) {
            this.name = 'ServerControllerException';
            this.message = message;
        }
        ServerControllerException.prototype = new Error();
        ServerControllerException.prototype.constructor = ServerControllerException;

        $scope.finished = false;
        $scope.currentPreset = {};
        $scope.messages = [];
        $scope.serverNames = [];


        /**
         * @return void
         */
        this.setServerNames = function () {
            var property;
            $scope.serverNames = [];
            for (property in $scope.servers) {
                if ($scope.servers.hasOwnProperty(property)) {
                    $scope.serverNames.push(property);
                }
            }
        };

        /**
         * Sets all serverNames that are already in use as
         * unavailable in the nameSuggestions array in the $scope
         *
         * @return {void}
         */
        this.setTakenServerNamesAsUnavailableSuggestions = function () {
            var i = 0, numberOfNameSuggestions, serverName;

            if ($scope.serverNames.length) {
                numberOfNameSuggestions = $scope.nameSuggestions.length;

                for (i; i < numberOfNameSuggestions; i++) {
                    serverName = $scope.generateServerName($scope.nameSuggestions[i].suffix);
                    $scope.nameSuggestions[i].available = !ValidationService.doesArrayContainItem($scope.serverNames, serverName);
                }
            }
        };

        /**
         *
         * @param {object} nameSuggestions
         * @return {void}
         */
        this.generateNameSuggestions = function (nameSuggestions) {
            var nameSuggestion, item;
            $scope.nameSuggestions = [];
            for (nameSuggestion in nameSuggestions) {
                if (nameSuggestions.hasOwnProperty(nameSuggestion)) {
                    item = {
                        suffix: nameSuggestion,
                        available: true,
                        context: nameSuggestions[nameSuggestion]
                    };
                    $scope.nameSuggestions.push(item);
                }
            }
        };

        /**
         *
         * @return {void}
         */
        this.handleSettings = function () {
            var docRoot;
            if (angular.isUndefined($scope.settings)) {
                return;
            }
            $scope.contexts = '';
            if (angular.isDefined($scope.settings.contexts)) {
                $scope.contexts = $scope.settings.contexts.split(',');
            }
            if (angular.isDefined($scope.settings.nameSuggestions)) {
                self.generateNameSuggestions($scope.settings.nameSuggestions);
            }
            if (angular.isDefined($scope.settings.defaultDeploymentPath)) {
                docRoot = $scope.settings.defaultDeploymentPath;
                if (ValidationService.doesStringContainSubstring(docRoot, '{{')) {
                    docRoot = MarkerService.replaceMarkers(docRoot, $scope.project);
                }
                if (ValidationService.doesStringContainSubstring(docRoot, '{{')) {
                    $scope.newPreset.options.deploymentPath = MarkerService.getStringBeforeFirstMarker(docRoot);
                    $scope.newPreset.options.deploymentPathWithMarkers = docRoot;
                } else {
                    $scope.newPreset.options.deploymentPath = docRoot;
                }
            }
        };

        this.successCallback = function (response) {
            $scope.finished = true;
            $scope.servers = response.repository.presets;
            self.setServerNames();
            if (angular.isDefined($scope.nameSuggestions)) {
                self.setTakenServerNamesAsUnavailableSuggestions();
            }
            if ($scope.servers.length === 0) {
                $scope.messages = FlashMessageService.addFlashMessage(
                    'No Servers yet!',
                    'FYI: There are no servers for project <span class="uppercase">' + $scope.name  + '</span> yet. Why dont you create one, hmm?',
                    SEVERITY.info,
                    $scope.name + '-no-servers'
                );
            }
        };

        this.failureCallback = function (response) {
            $scope.finished = true;
            $scope.messages = FlashMessageService.addFlashMessage(
                'Request failed!',
                'The servers could not be received. Please try again later..',
                SEVERITY.error,
                'server-request-failed'
            );
        };

        /**
         * @return {void}
         */
        $scope.getAllServers = function (cache) {
            $scope.newPreset.options.repositoryUrl = $scope.project.repositoryUrl;
            if (cache === false) {
                ProjectRepository.getFullProjectByRepositoryUrlFromServer($scope.project.repositoryUrl).then(
                    self.successCallback,
                    self.failureCallback
                );
            } else {
                ProjectRepository.getFullProjectByRepositoryUrl($scope.project.repositoryUrl).then(
                    self.successCallback,
                    self.failureCallback
                );
            }
        };

        /**
         * Takes a suffix and tries to replace a {{suffix}} marker
         * within the document root. Stores the returning string
         * within the deploymentPath property of the newPreset.
         *
         * @param {string} suffix
         * @return {void}
         */
        $scope.setDeploymentPath = function (suffix) {
            var docRoot;
            if (angular.isDefined($scope.newPreset.options.deploymentPathWithMarkers)) {
                docRoot = MarkerService.replaceMarkers(
                    $scope.newPreset.options.deploymentPathWithMarkers,
                    {suffix: suffix}
                );
                $scope.newPreset.options.deploymentPath = docRoot;
            }

        };

        /**
         * Adds a Server (preset) to the collection of presets.
         * Indicates the success or failure with a flashMessage.
         *
         * @param {object} server
         * @return {void}
         */
        $scope.addServer = function (server) {
            $scope.finished = false;
            if (angular.isDefined(server.options.deploymentPathWithMarkers)) {
                delete server.options.deploymentPathWithMarkers;
            }
            PresetRepository.addServer(server).then(
                function (response) {
                    $scope.newPreset = PresetService.getNewPreset($scope.settings);
                    $scope.newServerForm.$setPristine();
                    self.handleSettings();
                    $scope.getAllServers(false);
                    $scope.messages = FlashMessageService.addFlashMessage(
                        'Server created!',
                        'The Server "' + server.nodes[0].name + '" was successfully created.',
                        SEVERITY.ok
                    );
                },
                function (response) {
                    $scope.finished = true;
                    $scope.messages = FlashMessageService.addFlashMessage(
                        'Creation failed!',
                        'The Server "' + server.nodes[0].name + '" could not be created.',
                        SEVERITY.error
                    );
                }
            );
        };

        /**
         * Applies a server suffix to the current project name.
         *
         * @param {string} suffix
         * @returns {string}
         * @throws {ServerControllerException}
         */
        $scope.generateServerName = function (suffix) {
            if (angular.isUndefined($scope.project)) {
                throw new ServerControllerException('No project given.');
            }
            if (angular.isUndefined($scope.project.identifier)) {
                throw new ServerControllerException('Project got no identifier.');
            }
            return $scope.project.identifier + '-' + suffix;
        };

        /**
         * Watches for the project property. If it gets filled,
         * further requests are triggered.
         *
         * @return {void}
         */
        $scope.$watch('project', function (newValue, oldValue) {
            if (angular.isDefined(newValue.name)) {
                SettingsRepository.getSettings().then(
                    function (response) {
                        $scope.settings = response;
                        $scope.newPreset = PresetService.getNewPreset($scope.settings);
                        self.handleSettings();
                        $scope.getAllServers();
                    },
                    function () {
                        $scope.newPreset = PresetService.getNewPreset();
                        $scope.getAllServers();
                    }
                );
            }
        });
    }
]);
/*global surfCaptain, angular*/
/*jslint node: true */

'use strict';
angular.module('surfCaptain').controller('SingleDeploymentController', [
    '$scope',
    'DeploymentRepository',
    '$routeParams',
    '$cacheFactory',
    '$location',
    'FlashMessageService',
    'SEVERITY',
    'ProjectRepository',
    '$controller',
    function ($scope, DeploymentRepository, $routeParams, $cacheFactory, $location, FlashMessageService, SEVERITY, ProjectRepository, $controller) {

        var self = this;

        // Inherit from AbstractSingleProjectController
        angular.extend(this, $controller('AbstractSingleProjectController', {$scope: $scope}));

        /**
         * @return {void}
         */
        this.initLiveLog = function () {
            if ($scope.noLog) {
                return;
            }
            switch ($scope.deployment.status) {
            case 'success':
            case 'failed':
            case 'cancelled':
                if (angular.isUndefined($cacheFactory.get('deploymentCache'))) {
                    $cacheFactory('deploymentCache');
                }
                $cacheFactory.get('deploymentCache').put($scope.deployment.__identity, $scope.deployment);
                ProjectRepository.updateFullProjectInCache($scope.deployment.repositoryUrl);
                return;
            case 'waiting':
            case 'running':
                setTimeout(self.getDeployment, 1000);
                break;
            default:
                return;
            }
        };

        /**
         * @return {void}
         */
        this.getDeployment = function () {
            DeploymentRepository.getSingleDeployment($routeParams.deploymentId).then(
                function (response) {
                    $scope.finished = true;
                    $scope.deployment = response.deployment;
                    self.initLiveLog();
                },
                function () {
                    $scope.finished = true;
                    $scope.noLog = true;
                }
            );
        };

        /**
         * @return {void}
         */
        this.init = function () {
            this.getDeployment();
        };

        this.init();

        $scope.cancelDeployment = function () {
            DeploymentRepository.cancelDeployment($routeParams.deploymentId).then(
                function () {
                    self.getDeployment();
                }
            );
        };

        $scope.deployConfigurationAgain = function () {
            DeploymentRepository.addDeployment($scope.deployment.configuration).then(
                function (response) {
                    $scope.messages = FlashMessageService.addFlashMessage(
                        'OK!',
                        $scope.deployment.referenceName + ' will be shortly deployed onto '
                            + $scope.deployment.configuration.applications[0].nodes[0].name + '! You can cancel the deployment while it is still waiting.',
                        SEVERITY.ok
                    );
                    $location.path('project/' + $scope.name + '/deployment/' + response.deployment.__identity);
                },
                function () {
                    $scope.messages = FlashMessageService.addFlashMessage(
                        'Error!',
                        'Deployment configuration could not be submitted successfully. Try again later.',
                        SEVERITY.error
                    );
                }
            );
        };

        $scope.finished = false;
        $scope.noLog = false;

    }
]);
/*global surfCaptain, angular*/
/*jslint node: true */

'use strict';
angular.module('surfCaptain').controller('SyncController', [
    '$scope',
    '$controller',
    'PresetRepository',
    'CONFIG',
    'FlashMessageService',
    'SEVERITY',
    'ProjectRepository',
    'PresetService',
    'SettingsRepository',
    'DeploymentRepository',
    '$location',
    function ($scope, $controller, PresetRepository, CONFIG, FlashMessageService, SEVERITY, ProjectRepository, PresetService, SettingsRepository, DeploymentRepository, $location) {

        var self = this;

        // Inherit from AbstractSingleProjectController
        angular.extend(this, $controller('AbstractSingleProjectController', {$scope: $scope}));

        /**
         * @return {void}
         */
        this.addFailureFlashMessage = function () {
            $scope.finished = true;
            $scope.messages = FlashMessageService.addFlashMessage(
                'Request failed!',
                'API call failed. Sync not possible.',
                SEVERITY.error,
                $scope.name + '-sync-call-failed'
            );
        };

        /**
         * Fills $scope.contexts with configured contexts if
         * some were configured in frontend settings.
         *
         * @return {void}
         */
        this.setContexts = function () {
            SettingsRepository.getSettings().then(
                function (response) {
                    $scope.contexts = [];
                    if (angular.isDefined(response.contexts)) {
                        $scope.contexts = response.contexts.split(',');
                    }
                }
            );
        };

        /**
         * Requests all global Servers from the API and
         * stores publish them to the scope via $scope.globalServers
         *
         * @return {void}
         */
        this.setGlobalServers = function () {
            PresetRepository.getGlobalServers('').then(
                function (response) {
                    $scope.globalServers = response.presets;
                },
                function (response) {
                    self.addFailureFlashMessage();
                }
            );
        };

        /**
         * Initialization of SyncController. This function is called
         * immediately after creation of the controller.
         *
         * @return {void}
         */
        this.init = function () {
            $scope.servers = [];
            $scope.finished = false;
            $scope.currentSource = {};
            $scope.currentTarget = {};
            self.setContexts();
            self.setGlobalServers();
        };

        this.init();

        /**
         * @param {object} preset
         * @returns {string}
         */
        $scope.sourceDisplay = function (preset) {
            if (angular.isUndefined($scope.currentSource.applications)) {
                return '';
            }
            if ($scope.currentSource === preset) {
                return '';
            }
            return 'disabled';
        };

        /**
         * @param {object} preset
         * @returns {string}
         */
        $scope.targetDisplay = function (preset) {
            if (angular.isUndefined($scope.currentTarget.applications)) {
                return '';
            }
            if ($scope.currentTarget === preset) {
                return '';
            }
            return 'disabled';
        };

        /**
         * @param {string} context
         * @returns {string}
         */
        $scope.getRootContext = function (context) {
            return PresetService.getRootContext(context, $scope.contexts);
        };

        /**
         * @param {object} preset
         * @return {void}
         */
        $scope.setCurrentSource = function (preset) {
            $scope.currentSource = preset;
        };

        /**
         * @param {object} preset
         * @return {void}
         */
        $scope.setCurrentTarget = function (preset) {
            $scope.currentTarget = preset;
        };

        /**
         * @param {object} source - source node
         * @param {object} target - target node
         * @return {void}
         */
        $scope.sync = function (source, target) {
            target.applications[0].type = CONFIG.applicationTypes.syncTYPO3;
            target.applications[0].options.sourceNode = source.applications[0].nodes[0];
            target.applications[0].options.sourceNode.deploymentPath = source.applications[0].options.deploymentPath;
            target.applications[0].options.repositoryUrl = $scope.project.repositoryUrl;
            DeploymentRepository.addDeployment(target).then(
                function (response) {
                    $scope.messages = FlashMessageService.addFlashMessage(
                        'OK!',
                        target.applications[0].nodes[0].name + ' will be synchronized with ' +
                            source.applications[0].nodes[0].name + '.',
                        SEVERITY.ok
                    );
                    ProjectRepository.updateFullProjectInCache($scope.project.repositoryUrl);
                    $location.path('project/' + $scope.name + '/deployment/' + response.deployment.__identity);
                },
                self.addFailureFlashMessage
            );
        };

        /**
         * As soon as we receive the repositoryUrl, we
         * make further requests.
         */
        $scope.$watch('project', function (project) {
            if (angular.isUndefined(project.repositoryUrl)) {
                return;
            }

            ProjectRepository.getFullProjectByRepositoryUrl(project.repositoryUrl).then(
                function (response) {
                    var property,
                        presets = response.repository.presets;
                    for (property in presets) {
                        if (presets.hasOwnProperty(property)) {
                            if (angular.isUndefined(presets[property].applications[0].type) || presets[property].applications[0].type === CONFIG.applicationTypes.syncTYPO3) {
                                $scope.servers.push(presets[property]);
                            }
                        }
                    }
                    $scope.finished = true;
                    if ($scope.servers.length === 0) {
                        $scope.messages = FlashMessageService.addFlashMessage(
                            'No Servers yet!',
                            'FYI: There are no servers for project <span class="uppercase">' + $scope.name  + '</span> yet. Why dont you create one, hmm?',
                            SEVERITY.info,
                            $scope.name + '-no-servers'
                        );
                    }
                },
                function () {
                    self.addFailureFlashMessage();
                }
            );
        });
    }
]);
/*global surfCaptain,angular*/
/*jslint node: true */

'use strict';
angular.module('surfCaptain').directive('chosen', ['$timeout', function ($timeout) {
    var linker = function (scope, element) {

        scope.$watchCollection('chosen', function (value, old) {
            if (angular.isArray(value) && value !== old) {
                $timeout(
                    function () {
                        element.trigger('liszt:updated');
                        element.trigger('chosen:updated');
                    },
                    1000
                );
            }
        });

        element.chosen({
            search_contains: true
        });
    };

    return {
        restrict: 'A',
        link: linker,
        scope: {
            chosen: '='
        }
    };
}]);
/*global surfCaptain, angular*/
/*jslint node: true, plusplus: true */

'use strict';
angular.module('surfCaptain').directive('flashMessages', ['SEVERITY', 'FlashMessageService', function (SEVERITY, FlashMessageService) {
    var linker = function (scope, element, attrs) {

        /**
         *
         * @param {string} severity
         * @returns {string}
         */
        var getSeverityClass = function (severity) {
            switch (severity) {
            case SEVERITY.ok:
                return 'ok';
            case SEVERITY.info:
                return 'info';
            case SEVERITY.warning:
                return 'warning';
            case SEVERITY.error:
                return 'error';
            default:
                return 'info';
            }
        },
            getTimeString = function (time) {
                if (time instanceof Date) {
                    return 'Time: ' + time.getHours() + ':' + time.getMinutes() + ':' + time.getSeconds();
                }
                return '';
            },

            /**
             *
             * @returns {string}
             */
            generateFlashMessage = function (message, id) {
                var idString = id ? ' id="' + id + '">' : '">';
                return '<div class="flash-message"'
                    + idString
                    + '<div class="flash-message-title '
                    + getSeverityClass(message.severity)
                    + '">'
                    + message.title
                    + '<span class="close" onclick="angular.element(this).parent().parent().remove()">&times;</span>'
                    + '</div>'
                    + '<div class="flash-message-message">'
                    + message.message
                    + '</div>'
                    + '<div class="flash-message-footer">'
                    + '<span class="time">'
                    + getTimeString(message.time)
                    + '</span>'
                    + '</div>';
            };

        scope.$watchCollection(attrs.messages, function (messages) {
            var length, i = 0, html = '', message, id;
            if (angular.isDefined(messages)) {
                length = messages.length;
            } else {
                return;
            }
            if (length) {
                for (i; i < length; i++) {
                    message = messages[i];
                    id = '';
                    if (angular.isDefined(message.id)) {
                        id = message.id;
                        if (angular.element('#' + id).length) {
                            html += '';
                        } else {
                            html += generateFlashMessage(message, id);
                        }
                    } else {
                        html += generateFlashMessage(message, id);
                    }
                }
                angular.element('.flash-messages-container').append(html);
                FlashMessageService.flush();
            }
        });
    };

    return {
        restrict: 'E',
        scope: {
            messages: '='
        },
        link: linker
    };
}]);
/*global surfCaptain*/
/*jslint node: true */

'use strict';
angular.module('surfCaptain').directive('lastCharacterValidate', ['ValidationService', function (ValidationService) {
    return {
        restrict: 'A',
        require: 'ngModel',
        scope: {
            character: '@character'
        },
        link: function (scope, elem, attr, ctrl) {
            var character = scope.character || '';
            // add a parser
            ctrl.$parsers.unshift(function (value) {
                var valid = value ? ValidationService.doesLastCharacterMatch(value.slice(-1), character) : false;
                ctrl.$setValidity('last-character-validate', valid);

                // if it's valid, return the value to the model,
                // otherwise return undefined.
                return valid ? value : undefined;
            });

            // add a formatter
            ctrl.$formatters.unshift(function (value) {
                var valid = value ? ValidationService.doesLastCharacterMatch(value.slice(-1), character) : false;
                ctrl.$setValidity('last-character-validate', valid);

                // return the value or nothing will be written to the DOM.
                return value;
            });

        }
    };
}]);
/*global surfCaptain, angular*/
/*jslint node: true */

'use strict';
angular.module('surfCaptain').directive('modal', function () {
    return {
        scope: {
            modal: '@modal'
        },
        link: function (scope, element, attributes) {
            element.bind('click', function () {
                angular.element('.' + scope.modal).modal();
            });
        }
    };
});
/*global surfCaptain*/
/*jslint node: true */

'use strict';
angular.module('surfCaptain').directive('overlay', function () {
    var linker = function (scope, element, attrs) {
    };

    return {
        restrict: 'E',
        template: '<div data-ng-class="{false:\'overlay\'}[finished]"></div>',
        scope: {
            finished: '='
        },
        link: linker
    };
});
/*global surfCaptain,angular*/
/*jslint node: true, plusplus:true */

'use strict';
angular.module('surfCaptain').directive('serverList', [
    'PresetRepository',
    'ValidationService',
    'FlashMessageService',
    'SEVERITY',
    'SettingsRepository',
    'ProjectRepository',
    function (PresetRepository, ValidationService, FlashMessageService, SEVERITY, SettingsRepository, ProjectRepository) {
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
             * @param {string} context
             * @returns {string}
             */
            scope.getRootContext = function (context) {
                var i = 0,
                    length = scope.contexts.length;
                for (i; i < length; i++) {
                    if (ValidationService.doesStringStartWithSubstring(context, scope.contexts[i])) {
                        return scope.contexts[i];
                    }
                }
                return '';
            };

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
                        scope.$parent.getAllServers(false);
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
                        if (angular.isDefined(scope.$parent.project)) {
                            ProjectRepository.updateFullProjectInCache(scope.$parent.project.repositoryUrl);
                        }
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
                    length = scope.contexts.length;
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
                messages: '=',
                project: '='
            },
            link: linker
        };
    }
]);
/*global surfCaptain*/
/*jslint node: true */

'use strict';
angular.module('surfCaptain').directive('serverNameValidate', function () {
    return {
        restrict: 'A',
        require: 'ngModel',
        scope: {
            serverNames: '='
        },
        link: function (scope, elem, attr, ctrl) {
            // add a parser
            ctrl.$parsers.unshift(function (value) {
                var valid = scope.serverNames === undefined || scope.serverNames.indexOf(value) === -1;
                ctrl.$setValidity('server-name-validate', valid);

                // if it's valid, return the value to the model,
                // otherwise return undefined.
                return valid ? value : undefined;
            });

            // add a formatter
            ctrl.$formatters.unshift(function (value) {
                var valid = scope.serverNames === undefined || scope.serverNames.indexOf(value) === -1;
                ctrl.$setValidity('server-name-validate', valid);

                // return the value or nothing will be written to the DOM.
                return value;
            });

        }
    };
});
/*global surfCaptain*/
/*jslint node: true */

'use strict';
angular.module('surfCaptain').directive('spinner', function () {
    var linker = function (scope, element, attrs) {
    };

    return {
        restrict: 'E',
        template: '<i class="fa fa-spinner fa-spin fa-4x"></i>',
        link: linker
    };
});
/*global surfCaptain,angular*/
/*jslint node: true, plusplus: true */

'use strict';
angular.module('surfCaptain').directive('startWithValidate', ['ValidationService', function (ValidationService) {
    return {
        restrict: 'A',
        require: 'ngModel',
        scope: {
            startWithValidate: '='
        },
        link: function (scope, elem, attr, ctrl) {
            // add a parser
            ctrl.$parsers.unshift(function (value) {
                var i = 0,
                    length;

                if (angular.isUndefined(scope.startWithValidate)) {
                    ctrl.$setValidity('start-with-validate', true);
                    return value;
                }
                length = scope.startWithValidate.length;

                for (i; i < length; i++) {
                    if (ValidationService.doesStringStartWithSubstring(value, scope.startWithValidate[i])) {
                        ctrl.$setValidity('start-with-validate', true);
                        return value;
                    }
                }

                ctrl.$setValidity('start-with-validate', false);
                return undefined;
            });

            // add a formatter
            ctrl.$formatters.unshift(function (value) {
                var i = 0,
                    length;

                if (angular.isUndefined(scope.startWithValidate)) {
                    ctrl.$setValidity('start-with-validate', true);
                    return value;
                }
                length = scope.startWithValidate.length;

                for (i; i < length; i++) {
                    if (ValidationService.doesStringStartWithSubstring(value, scope.startWithValidate[i])) {
                        ctrl.$setValidity('start-with-validate', true);
                        return value;
                    }
                }

                ctrl.$setValidity('start-with-validate', false);
                return value;
            });

        }
    };
}]);
/*global surfCaptain*/
/*jslint node: true */

'use strict';
angular.module('surfCaptain').directive('surfcaptainHeader', ['$routeParams', '$location', 'FavorService', function ($routeParams, $location, FavorService) {
    return {
        restrict: 'E',
        templateUrl: '/_Resources/Static/Packages/Lightwerk.SurfCaptain/Scripts/SurfCaptainApp/Partials/Header.html',
        scope: {
            icon: '@icon'
        },
        link: function (scope, element, attributes) {
            var lastUrlPart = $location.path().split('/').pop();
            scope.project = $routeParams.itemName;
            scope.context = lastUrlPart === scope.project ? '' : lastUrlPart;
            scope.favorites = FavorService.getFavoriteProjects();
        }
    };
}]);
/*global surfCaptain*/
/*jslint node: true */

'use strict';
angular.module('surfCaptain').directive('surfcaptainMenu', ['$routeParams', '$location', function ($routeParams, $location) {
    return {
        restrict: 'E',
        templateUrl: '/_Resources/Static/Packages/Lightwerk.SurfCaptain/Scripts/SurfCaptainApp/Partials/Menu.html',
        scope: {},
        link: function (scope, element, attributes) {
            var lastUrlPart = $location.path().split('/').pop();
            scope.project = $routeParams.projectName;
            scope.context = lastUrlPart === scope.project ? 'history' : lastUrlPart;
        }
    };
}]);
/*global surfCaptain,angular*/
/*jslint node: true */

'use strict';
angular.module('surfCaptain').directive('tab', function () {
    return function (scope, element, attributes) {
        element.bind('click', function (e) {
            e.preventDefault();
            angular.element(this).tab('show');
        });
    };
});
/*global surfCaptain*/
/*jslint node: true */

'use strict';
angular.module('surfCaptain').directive('tooltip', function () {
    return function (scope, element, attributes) {
        element.tooltip();
    };
});
/*global surfCaptain*/
/*jslint node: true */

'use strict';
angular.module('surfCaptain').directive('appVersion', ['version', function (version) {
    return function (scope, element, attributes) {
        element.text(version);
    };
}]);
/*global surfCaptain*/
/*jslint node: true */

'use strict';
angular.module('surfCaptain').filter('DeploymentTypeFilter', function () {
    return function (input) {
        switch (input) {
        case 'TYPO3\CMS\Deploy':
        case 'TYPO3\\CMS\\Deploy':
            return 'Deployment';
        case 'TYPO3\CMS\Shared':
        case 'TYPO3\\CMS\\Shared':
            return 'Sync';
        default:
            return input;
        }
    };
});
/*global surfCaptain*/
/*jslint node: true */

'use strict';
angular.module('surfCaptain').filter('logCodeFilter', function () {
    return function (input) {
        switch (input) {
        case 3:
        case '3':
            return 'error';
        case 4:
        case '4':
            return 'warning';
        case 5:
        case '5':
            return 'notice';
        case 6:
        case '6':
            return 'info';
        case 7:
        case '7':
            return 'debug';
        default:
            return input;
        }
    };
});
/*global surfCaptain, angular*/
/*jslint node: true */

'use strict';

angular.module('surfCaptain').factory('DeploymentRepository', [ '$http', '$q', '$cacheFactory', function ($http, $q, $cacheFactory) {

    var deploymentRepository = {},
        url = '/api/deployment';

    $cacheFactory('deploymentCache');

    /**
     * @param {object} deployment
     * @return {Q.promise|promise}
     */
    deploymentRepository.addDeployment = function (deployment) {
        var deploymentContainer = {
            "configuration": {}
        },
            deferred = $q.defer();
        deploymentContainer.configuration = deployment;

        $http({
            method: 'POST',
            url: url,
            data: {
                deployment: deploymentContainer
            },
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        }).success(deferred.resolve).error(deferred.reject);
        return deferred.promise;
    };

    /**
     * @return {promise|Q.promise}
     */
    deploymentRepository.getDeployments = function () {
        var deferred = $q.defer();
        $http.get(url).success(deferred.resolve).error(deferred.reject);
        return deferred.promise;
    };

    /**
     * @param {string} identifier
     * @return {promise|Q.promise}
     */
    deploymentRepository.getSingleDeployment = function (identifier) {
        var deferred = $q.defer();
        if (angular.isDefined($cacheFactory.get('deploymentCache').get(identifier))) {
            deferred.resolve({deployment: $cacheFactory.get('deploymentCache').get(identifier)});
            return deferred.promise;
        }
        $http.get(url + '?deployment=' + identifier).success(deferred.resolve).error(deferred.reject);
        return deferred.promise;
    };

    /**
     * @param deploymentId
     * @return {promise|Q.promise}
     */
    deploymentRepository.cancelDeployment = function (deploymentId) {
        var deferred = $q.defer();
        $http({
            'method': 'PUT',
            'url': url,
            'data': {
                'deployment': {
                    '__identity': deploymentId,
                    'status': 'cancelled'
                }
            }
        }).success(deferred.resolve).error(deferred.reject);
        return deferred.promise;
    };

    // Public API
    return {
        addDeployment: function (deployment) {
            return deploymentRepository.addDeployment(deployment);
        },
        cancelDeployment: function (deploymentId) {
            return deploymentRepository.cancelDeployment(deploymentId);
        },
        getAllDeployments: function () {
            return deploymentRepository.getDeployments();
        },
        getSingleDeployment: function (identifier) {
            return deploymentRepository.getSingleDeployment(identifier);
        }
    };
}]);
/*global surfCaptain, angular*/
/*jslint node: true */

'use strict';

angular.module('surfCaptain').factory('PresetRepository', ['$http', '$q', function ($http, $q) {
    var presetRepository = {},
        url = '/api/preset';

    function PresetRepositoryException(message) {
        this.name = 'PresetRepositoryException';
        this.message = message;
    }
    PresetRepositoryException.prototype = new Error();
    PresetRepositoryException.prototype.constructor = PresetRepositoryException;

    /**
     * Gets all servers from the collection
     *
     * @param {object} server
     * @returns {string} – json string
     */
    presetRepository.getFullPresetAsString = function (server) {
        return angular.toJson(presetRepository.getFullPreset(server), false);
    };

    /**
     * Gets all servers from the collection
     *
     * @param {object} server
     * @returns {object}
     */
    presetRepository.getFullPreset = function (server) {
        var container = {"applications": []};
        container.applications[0] = server;
        return container;
    };

    /**
     *
     * @param {object} server
     * @returns {string}
     * @throws {PresetRepositoryException}
     */
    presetRepository.getKeyFromServerConfiguration = function (server) {
        if (angular.isUndefined(server.nodes[0].name)) {
            if (angular.isUndefined(server.applications[0].nodes[0].name)) {
                throw new PresetRepositoryException('PresetRepository.getKeyFromServerConfiguration failed. Server configuration contains no key.');
            }
            return server.apllications[0].nodes[0].name;
        }
        return server.nodes[0].name;
    };

    /**
     *
     * @param {object} server
     * @return {object}
     */
    presetRepository.getApplicationContainer = function (server) {
        var applicationContainer = {"applications": []};
        applicationContainer.applications[0] = server;
        return applicationContainer;
    };

    /**
     * Gets all servers from the collection
     *
     * @returns {Q.promise|promise} – promise object
     */
    presetRepository.getGlobalServers = function () {
        var deferred = $q.defer();
        $http.get(url + '?globals=1').success(deferred.resolve).error(deferred.reject);
        return deferred.promise;
    };

    /**
     * Adds a single server to the server collection
     *
     * @param {object} preset
     * @returns {Q.promise|promise} – promise object
     */
    presetRepository.putServer = function (preset) {
        return this.sendSinglePresetToApi(preset, 'put');
    };

    /**
     * Adds a single server to the server collection
     *
     * @param preset {object}
     * @returns {Q.promise|promise} – promise object
     */
    presetRepository.postServer = function (preset) {
        return this.sendSinglePresetToApi(preset, 'post');
    };


    /**
     * Performs a request to the api with a single preset.
     * This request can either be POST or PUT which can
     * be determined with the method argument. Any other
     * method will result in a failed API call.
     *
     * @param {object} preset
     * @param {string} method
     * @returns {promise|Q.promise}
     */
    presetRepository.sendSinglePresetToApi = function (preset, method) {
        var deferred = $q.defer();
        $http({
            method: method,
            url: url,
            data: {
                'key': this.getKeyFromServerConfiguration(preset),
                'configuration': presetRepository.getFullPreset(preset)
            },
            headers: {
                'Accept': 'application/json'
            }
        }).success(deferred.resolve).error(deferred.reject);
        return deferred.promise;
    };

    /**
     * Removes a single server from the server collection
     *
     * @param server {object}
     * @returns {Q.promise|promise} – promise object
     */
    presetRepository.deleteServer = function (server) {
        var deferred = $q.defer();
        $http.delete(url + '?key=' + presetRepository.getKeyFromServerConfiguration(server.applications[0]))
            .success(deferred.resolve)
            .error(deferred.reject);
        return deferred.promise;
    };

    // Public API
    return {
        getGlobalServers: function () {
            return presetRepository.getGlobalServers();
        },
        updateServer: function (server) {
            return presetRepository.putServer(server);
        },
        addServer: function (server) {
            return presetRepository.postServer(server);
        },
        deleteServer: function (server) {
            return presetRepository.deleteServer(server);
        }
    };
}]);
/*jslint plusplus: true */
/*jslint node: true */
/*global surfCaptain, angular*/

'use strict';

angular.module('surfCaptain').factory('ProjectRepository', [ '$http', '$q', '$cacheFactory', function ($http, $q, $cacheFactory) {
    var projectRepository = {},
        url = '/api/repository',
        projectCache = $cacheFactory('projectCache'),
        projectsCache = $cacheFactory('projectsCache'),
        repositoryCache = $cacheFactory('repositoryCache');

    function ProjectRepositoryException(message) {
        this.name = 'ProjectRepositoryException';
        this.message = message;
    }
    ProjectRepositoryException.prototype = new Error();
    ProjectRepositoryException.prototype.constructor = ProjectRepositoryException;

    /**
     * Loops trough a collection of projects and
     * stores each one in angulars cache.
     *
     * @param {array} projects
     * @returns {void}
     */
    projectRepository.populateSingleProjectCache = function (projects) {
        var length = angular.isDefined(projects) ? projects.length : 0,
            i = 0;
        if (length) {
            for (i; i < length; i++) {
                projectCache.put(
                    projects[i].identifier,
                    projects[i]
                );
            }
        }
    };

    /**
     *
     * @returns {Q.promise|promise} – promise object
     */
    projectRepository.getProjects = function () {
        var deferred = $q.defer();
        if (angular.isDefined(projectsCache.get('allProjects'))) {
            deferred.resolve(projectsCache.get('allProjects'));
            return deferred.promise;
        }
        $http.get(url, {
            cache: true,
            headers: {'Accept': 'application/json'}
        }).success(
            function (data) {
                deferred.resolve(data.repositories);
                projectsCache.put('allProjects', data.repositories);
                projectRepository.populateSingleProjectCache(data.repositories);
            }
        ).error(deferred.reject);
        return deferred.promise;
    };

    /**
     * Returns a single project from a collection ob projects
     *
     * @param {string} name
     * @param {array} projects
     * @returns {object} a single project
     * @throws {ProjectRepositoryException}
     */
    projectRepository.getProjectByName = function (name, projects) {
        if (angular.isUndefined(projectCache.get(name))) {
            projectRepository.populateSingleProjectCache(projects);
        }
        projectCache = $cacheFactory.get('projectCache');
        if (angular.isUndefined(projectCache.get(name))) {
            throw new ProjectRepositoryException('Could not find project');
        }
        return projectCache.get(name);
    };

    /**
     * @param {string} repositoryUrl
     * @returns {promise|Q.promise}
     */
    projectRepository.getFullProjectByRepositoryUrl = function (repositoryUrl) {
        var deferred = $q.defer();
        if (angular.isDefined(repositoryCache.get(repositoryUrl))) {
            deferred.resolve(repositoryCache.get(repositoryUrl));
            projectRepository.updateFullProjectInCache(repositoryUrl);
        } else {
            $http.get(url + '?repositoryUrl=' + repositoryUrl)
                .success(
                    function (response) {
                        repositoryCache.put(repositoryUrl, response);
                        deferred.resolve(response);
                    }
                )
                .error(deferred.reject);
        }
        return deferred.promise;
    };

    /**
     * @param {string} repositoryUrl
     * @returns {promise|Q.promise}
     */
    projectRepository.getFullProjectByRepositoryUrlFromServer = function (repositoryUrl) {
        var deferred = $q.defer();
        $http.get(url + '?repositoryUrl=' + repositoryUrl)
            .success(
                function (response) {
                    repositoryCache.put(repositoryUrl, response);
                    deferred.resolve(response);
                }
            )
            .error(deferred.reject);
        return deferred.promise;
    };

    /**
     *
     * @param {string} repositoryUrl
     * @return {void}
     */
    projectRepository.updateFullProjectInCache = function (repositoryUrl) {
        $http.get(url + '?repositoryUrl=' + repositoryUrl).success(
            function (response) {
                repositoryCache.put(repositoryUrl, response);
            }
        );
    };

    // Public API
    return {
        getProjects: function () {
            return projectRepository.getProjects();
        },
        getProjectByName: function (name, projects) {
            return projectRepository.getProjectByName(name, projects);
        },
        getFullProjectByRepositoryUrl: function (repositoryUrl) {
            return projectRepository.getFullProjectByRepositoryUrl(repositoryUrl);
        },
        updateFullProjectInCache: function (repositoryUrl) {
            projectRepository.updateFullProjectInCache(repositoryUrl);
        },
        getFullProjectByRepositoryUrlFromServer: function (repositoryUrl) {
            return projectRepository.getFullProjectByRepositoryUrlFromServer(repositoryUrl);
        }
    };
}]);
/*global surfCaptain, angular*/
/*jslint node: true */

'use strict';

angular.module('surfCaptain').factory('SettingsRepository', ['$http', '$q', '$cacheFactory', function ($http, $q, $cacheFactory) {
    var settingsRepository = {},
        url = '/api/frontendSetting';

    $cacheFactory('settingsCache');

    /**
     *
     * @returns {Q.promise|promise} – promise object
     */
    settingsRepository.getFrontendSettings = function () {
        var deferred = $q.defer(),
            settingsCache = $cacheFactory.get('settingsCache');
        if (angular.isDefined(settingsCache.get('configuration'))) {
            deferred.resolve(settingsCache.get('configuration'));
            return deferred.promise;
        }
        $http.get(url, {cache: true}).success(
            function (data) {
                settingsCache.put('configuration', data.frontendSettings);
                deferred.resolve(data.frontendSettings);
            }
        ).error(deferred.reject);
        return deferred.promise;
    };

    // Public API
    return {
        getSettings: function () {
            return settingsRepository.getFrontendSettings();
        }
    };
}]);
/*jslint node: true, plusplus: true */
/*global surfCaptain, angular*/

'use strict';

angular.module('surfCaptain').service('FavorService', ['cookieStore', 'ProjectRepository', function (cookieStore, ProjectRepository) {

    var self = this,
        init;

    /**
     * @param {string} project
     * @return {void}
     */
    this.addFavoriteProject = function (project) {
        var favoriteProjects = self.getFavoriteProjects(),
            length = favoriteProjects.length,
            i = 0;
        if (length) {
            for (i; i < length; i++) {
                if (favoriteProjects[i].identifier === project.identifier) {
                    return;
                }
            }
            if (length > 2) {
                favoriteProjects = favoriteProjects.slice(1, 3);
            }
        }
        favoriteProjects.push(project);
        cookieStore.put('favoriteProjects', angular.toJson(favoriteProjects), {end: Infinity});
    };

    /**
     * @return {Array}
     */
    this.getFavoriteProjects = function () {
        var favoriteProjects = [];
        if (angular.isDefined(cookieStore.get('favoriteProjects')) && cookieStore.get('favoriteProjects') !== null ) {
            favoriteProjects = angular.fromJson(cookieStore.get('favoriteProjects'));
        }
        return favoriteProjects;
    };

    init = function () {
        var favorites = self.getFavoriteProjects(),
            length = favorites.length,
            i = 0;

        // Populate project cache
        ProjectRepository.getProjects();

        // Load full projects of favorites into cache
        for (i; i < length; i++) {
            if (angular.isDefined(favorites[i].repositoryUrl)) {
                ProjectRepository.updateFullProjectInCache(favorites[i].repositoryUrl);
            }
        }
    };
    init();

}]);
/*jslint node: true, plusplus: true */
/*global surfCaptain, angular*/

'use strict';

angular.module('surfCaptain').service('FlashMessageService', function () {

    var messages = [];

    /**
     *
     * @param {string} title
     * @param {string} message
     * @param {integer} severity
     * @param {string} id
     * @return {Array}
     */
    this.addFlashMessage = function (title, message, severity, id) {
        messages.push({
            title: title || '',
            message: message || '',
            severity: severity,
            time: new Date(),
            id: id
        });
        return messages;
    };

    /**
     * @return {Array}
     */
    this.getFlashMessages = function () {
        return messages;
    };

    /**
     * Resets the messages to an empty Array
     *
     * @return {void}
     */
    this.flush = function () {
        messages = [];
    };

});
/*jslint node: true, plusplus: true */
/*global surfCaptain, angular*/

'use strict';

angular.module('surfCaptain').service('MarkerService', function () {

    var localStorage = [],

        clearLocalStorage = function () {
            localStorage = [];
        },

        addToLocalStorage = function (ind, marker) {
            localStorage.push([ind, marker]);
        },

        applyLocalStorage = function (string) {
            var length = localStorage.length, index, marker, i = length - 1;
            if (length) {
                for (i; i >= 0; i--) {
                    index = localStorage[i][0];
                    marker = localStorage[i][1];
                    string = string.slice(0, index) + marker + string.slice(index);
                }
            }
            clearLocalStorage();
            return string;
        };

    /**
     *
     * @param {string} string
     * @returns {null|string}
     */
    this.getFirstMarker = function (string) {
        var marker;
        if (typeof string !== 'string') {
            return null;
        }
        marker = string.match(new RegExp('([{]{2,2})([A-Za-z0-9]*)([}]{2,2})'));
        if (marker === null) {
            return null;
        }
        return marker[0];
    };

    /**
     * Replaces markers in strings. Only substrings inside
     * double curly braces are replaced.
     *
     * @param {string} string
     * @param {object} configuration
     * @returns {string}
     */
    this.replaceMarkers = function (string, configuration) {
        var marker, replacement;

        if (angular.isUndefined(configuration)) {
            return string;
        }

        marker = this.getFirstMarker(string);

        switch (marker) {
        case null:
            string = applyLocalStorage(string);
            return string;

        // These cases expect a property name in the
        // configuration to be replaced with.
        case '{{project}}':
        case '{{projectName}}':
        case '{{projectname}}':
            if (angular.isDefined(configuration.name)) {
                replacement = configuration.name;
            } else {
                addToLocalStorage(string.indexOf(marker), marker);
                replacement = '';
            }
            break;
        case '{{suffix}}':
            if (angular.isDefined(configuration.suffix)) {
                replacement = configuration.suffix;
            } else {
                addToLocalStorage(string.indexOf(marker), marker);
                replacement = '';
            }
            break;
        // Found an unknown marker:
        // Remove it but store it to put it back there in the end.
        default:
            addToLocalStorage(string.indexOf(marker), marker);
            replacement = '';
            break;
        }
        string = string.replace(marker, replacement);
        string = this.replaceMarkers(string, configuration);
        return string;
    };

    /**
     *
     * @param {string} string
     * @return {string}
     */
    this.getStringBeforeFirstMarker = function (string) {
        var index;
        if (typeof string !== 'string') {
            return '';
        }
        index = string.indexOf(this.getFirstMarker(string));
        if (index === -1) {
            return string;
        }
        return string.substring(0, index);
    };
});
/*jslint node: true, plusplus: true */
/*global surfCaptain, angular*/

'use strict';

angular.module('surfCaptain').service('PresetService', ['SettingsRepository', 'ValidationService', function (SettingsRepository, ValidationService) {

    var newPreset = {
        "options": {
            "repositoryUrl": '',
            "deploymentPath": '',
            "context": ''
        },
        "nodes": [
            {
                "name": '',
                "hostname": '',
                "username": ''
            }
        ]
    },
        self = this;

    this.contexts = [];

    /**
     * @return {void}
     */
    this.setContexts = function () {
        if (self.contexts.length === 0) {
            SettingsRepository.getSettings().then(
                function (response) {
                    self.contexts = [];
                    if (angular.isDefined(response.contexts)) {
                        self.contexts = response.contexts.split(',');
                    }
                }
            );
        }
    };


    /**
     * A new preset skeleton is returned with options from an optional
     * passed configuration object (like frontendSettings). Used
     * properties in configuration are:
     *
     *  - defaultUser (Sets the Username in the first Node)
     *  - defaultDeploymentPath (Sets the deploymentPath in the options.
     *    Markers have to be replaced later on!)
     *
     * @param {object} configuration - optional
     * @returns {object}}
     */
    this.getNewPreset = function (configuration) {
        var preset = angular.copy(newPreset);
        if (angular.isDefined(configuration)) {
            if (angular.isDefined(configuration.defaultUser)) {
                preset.nodes[0].username = configuration.defaultUser;
            }
            if (angular.isDefined(configuration.defaultDeploymentPath)) {
                preset.options.deploymentPath = configuration.defaultDeploymentPath;
            }
        }
        return preset;
    };

    /**
     * @param {string} context
     * @param {array} contexts
     * @returns {string}
     */
    this.getRootContext = function (context, contexts) {
        this.setContexts();
        var i = 0,
            length = contexts.length;
        for (i; i < length; i++) {
            if (ValidationService.doesStringStartWithSubstring(context, contexts[i])) {
                return contexts[i];
            }
        }
        return 'unknown-context';
    };
}]);
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

    /**
     * Sort function to show most recent commits at the
     * start of the array. Use this as compareFunction
     * in an array.sort().
     *
     * @param {object} a
     * @param {object} b
     * @returns {number}
     */
    this.byCommitDate = function (a, b) {
        if (a.commit.date < b.commit.date) {
            return 1;
        }
        return -1;
    };

});

/*jslint node: true */
/*global surfCaptain*/

'use strict';

angular.module('surfCaptain').service('ValidationService', function () {

    /**
     * Validates if a given string has at least the length of the given
     * minLength. A third parameter is an optional string to be returned
     * on validation failure.
     *
     * @param {string} value
     * @param {integer} minLength
     * @param {string} message
     * @returns {string|boolean}
     */
    this.hasLength = function (value, minLength, message) {
        if (value.length >= minLength) {
            return true;
        }
        return message || false;
    };

    /**
     * Validates if a given string ends with a given character
     * A third parameter is an optional string to be returned
     * on validation failure.
     *
     * @param {string} value
     * @param {string} character
     * @param {string} message
     * @returns {string|boolean}
     */
    this.doesLastCharacterMatch = function (value, character, message) {
        if (value.charAt(value.length - 1) === character) {
            return true;
        }
        return message || false;
    };

    /**
     * Validates if a given Item is found within a given array.
     *
     * @param {array} array
     * @param {mixed} item
     * @param {string} message
     * @returns {string|boolean}
     */
    this.doesArrayContainItem = function (array, item, message) {
        if (array instanceof Array && array.indexOf(item) > -1) {
            return true;
        }
        return message || false;
    };

    /**
     * Validates if a given Substring is found within a given string.
     *
     * @param {string} string
     * @param {string} substring
     * @param {string} message
     * @returns {string|boolean}
     */
    this.doesStringContainSubstring = function (string, substring, message) {
        if (typeof string === 'string' && string.indexOf(substring) !== -1) {
            return true;
        }
        return message || false;
    };

    /**
     * Validates if a given Substring is found within a given string.
     *
     * @param {string} string
     * @param {string} substring
     * @param {string} message
     * @returns {string|boolean}
     */
    this.doesStringStartWithSubstring = function (string, substring, message) {
        if (typeof string === 'string' && string.indexOf(substring) === 0) {
            return true;
        }
        return message || false;
    };
});