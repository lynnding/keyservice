angular
    .module('Authentication')
    .controller("AuthenticationCtrl", function ($scope, $mdDialog, $mdConstant, AzureAdService,LdapAdService,SocialService) {
        $scope.customKeys = [$mdConstant.KEY_CODE.ENTER, $mdConstant.KEY_CODE.COMMA, $mdConstant.KEY_CODE.SEMICOLON, $mdConstant.KEY_CODE.TAB];

        const initialized = false;
        let request;
        $scope.isWorking = false;
        $scope.admin = {
            azureAd: {
                clientId: "",
                clientSecret: "",
                tenant: "",
                resource: "",
                allowExternalUsers: false,
                userGroupsFilter: false,
                userGroups: []
            },
            ldapAd: {
                url: "",
                baseDN: "",
                username: "",
                password: "",
                groups: [],
                },
            adfs: {}
        };
        $scope.methods = [ 
        //{ label: 'Azure AD', value: 'aad' },
      	//{ label: 'ADFS', value:  'adfs'},
      	{ label: 'LDAP', value: 'ldap' },
        //{ label: 'SOCIAL', value: 'social' }
        ];
    
        ///$scope.userGroups = [{id: 1,name: 'test'}];
        $scope.userGroups = [];
        $scope.groups = [];
    
        $scope.addRow = function () {
            $scope.admin.ldapAd.groups.push({ index: $scope.admin.ldapAd.groups.length, group: "", userGroupId: "" });
        }
        
        $scope.removeRow = function (index) {
            $scope.admin.ldapAd.groups.splice(index, 1);
            for (var i = 0; i < $scope.admin.ldapAd.groups.length; i++) {
                $scope.admin.ldapAd.groups[i].index = i;
            }
        }



        function apiWarning(warning) {
            $mdDialog.show({
                controller: LocalModal,
                templateUrl: '/web-app/modals/modalWarningContent.html',
                escapeToClose: false,
                locals: {
                    items: warning.error
                }
            });
        }
        function reqDone() {
            $mdDialog.show({
                controller: LocalModal,
                templateUrl: '/web-app/modals/modalAdminDoneContent.html',
                locals: {
                    items: "modal.save.authentication"
                }
            })
        }
        function LocalModal($scope, $mdDialog, items) {
            $scope.items = items;
            $scope.close = function () {
                $mdDialog.hide();
                $scope.isWorking = false;
            };
        }

        function azureAdSaveConfig() {
            $scope.isWorking = true;
            if (request) request.abort();
            request = AzureAdService.post($scope.admin.azureAd);
            request.then(function (promise) {
                $scope.isWorking = false;
                if (promise && promise.error) apiWarning(promise.error);
                else reqDone();
            })
        }

        function ldapAdSaveConfig() {
            $scope.isWorking = true;
            if (request) request.abort();
            request = LdapAdService.post($scope.admin.ldapAd);
            request.then(function (promise) {
                $scope.isWorking = false;
                if (promise && promise.error) apiWarning(promise.error);
                else reqDone();
            })
        }
    
        function socialSaveConfig() {
            $scope.isWorking = true;
            if (request) request.abort();
            request = SocialService.post();
            request.then(function (promise) {
                $scope.isWorking = false;
                if (promise && promise.error) apiWarning(promise.error);
                else reqDone();
            })
        }

        $scope.isWorking = true;
        
            request = AzureAdService.get();     
            request.then(function (promise) {
            $scope.isWorking = false;
           
            if (promise && promise.error) apiWarning(promise.error);
            else {
                 $scope.userGroups = promise.data.userGroups.userGroups;
                if (promise.data.azureAd) {
                    $scope.admin.azureAd = promise.data.azureAd;
                    if (!$scope.admin.azureAd.userGroupsFilter) $scope.admin.azureAd.userGroupsFilter = false;
                    if (!$scope.admin.azureAd.userGroups) $scope.admin.azureAd.userGroups = [];
                }
                if (promise.data.ldapAd) {
                    $scope.admin.ldapAd = promise.data.ldapAd;
                    
                   
                }
                $scope.admin.azureAd.signin = promise.data.signin;
                $scope.admin.azureAd.callback = promise.data.callback;
                $scope.admin.azureAd.logout = promise.data.logout;
                $scope.method = promise.data.method;
                
            }
        });
  
        
        $scope.isValid = function () {
            if ($scope.method == 'aad') {
                if (!$scope.admin.azureAd.clientID || $scope.admin.azureAd.clientID == "") return false;
                else if (!$scope.admin.azureAd.clientSecret || $scope.admin.azureAd.clientSecret == "") return false;
                else if (!$scope.admin.azureAd.tenant || $scope.admin.azureAd.tenant == "") return false;
                else if (!$scope.admin.azureAd.resource || $scope.admin.azureAd.resource == "") return false;
                else return true;
            }
            else if ($scope.method == 'ldap') {
                if (!$scope.admin.ldapAd.url || $scope.admin.ldapAd.url == "") return false;
                else if (!$scope.admin.ldapAd.username || $scope.admin.ldapAd.username == "") return false;
                else if (!$scope.admin.ldapAd.baseDN || $scope.admin.ldapAd.baseDN == "") return false;
                else if (!$scope.admin.ldapAd.password || $scope.admin.ldapAd.password == "") return false;
                else return true;
            }
            else if ($scope.method == 'social') {
                return true;
            }
            else if (isWorking) return true;
            else return false;
        }

        $scope.save = function () {
            $scope.isWorking = true;
            if ($scope.method == 'aad') {
                azureAdSaveConfig();
            }
            else if ($scope.method == 'ldap') {
                ldapAdSaveConfig();
            }else if ($scope.method == 'social') {
                socialSaveConfig();
            }
        }
    })
    .factory("AzureAdService", function ($http, $q, $rootScope) {
        function get(azureAdConfig) {
            const canceller = $q.defer();
            const request = $http({
                url: "/api/aad/",
                method: "GET",
                data: { azureAd: azureAdConfig },
                timeout: canceller.promise
            });
            return httpReq(request);
        }

        function post(azureAdConfig) {
            const canceller = $q.defer();
            const request = $http({
                url: "/api/aad/",
                method: "POST",
                data: { azureAd: azureAdConfig },
                timeout: canceller.promise
            });
            return httpReq(request);
        }

        function httpReq(request) {
            let promise = request.then(
                function (response) {
                    return response;
                },
                function (response) {
                    return { error: response.data };
                });

            promise.abort = function () {
                canceller.resolve();
            };
            promise.finally(function () {
                console.info("Cleaning up object references.");
                promise.abort = angular.noop;
                canceller = request = promise = null;
            });

            return promise;
        }

        return {
            get: get,
            post: post
        }
    })
    .factory("SocialService", function ($http, $q, $rootScope) {
    
        function post(azureAdConfig) {
            const canceller = $q.defer();
            const request = $http({
                url: "/api/social/",
                method: "POST",
                data: {},
                timeout: canceller.promise
            });
            return httpReq(request);
        }

        function httpReq(request) {
            let promise = request.then(
                function (response) {
                    return response;
                },
                function (response) {
                    return { error: response.data };
                });

            promise.abort = function () {
                canceller.resolve();
            };
            promise.finally(function () {
                console.info("Cleaning up object references.");
                promise.abort = angular.noop;
                canceller = request = promise = null;
            });

            return promise;
        }

        return {
            post: post
        }
    })
    .factory("LdapAdService", function ($http, $q, $rootScope) {
        function post(ldapAdConfig) {
            const canceller = $q.defer();
            const request = $http({
                url: "/api/ldap/",
                method: "POST",
                data: { ldapAd: ldapAdConfig },
                timeout: canceller.promise
            });
            return httpReq(request);
        }

        function httpReq(request) {
            let promise = request.then(
                function (response) {
                    return response;
                },
                function (response) {
                    return { error: response.data };
                });

            promise.abort = function () {
                canceller.resolve();
            };
            promise.finally(function () {
                console.info("Cleaning up object references.");
                promise.abort = angular.noop;
                canceller = request = promise = null;
            });

            return promise;
        }

        return {
            post: post
        }
    });

