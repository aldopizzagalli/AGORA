(function() {
  "use strict";
  angular.module('agora.permissions', [])
    .service('newPermissionsService', newPermissionsService)
    .controller('CustomPermissionsController', CustomPermissionsController)
    .controller('templatePermissionsController', templatePermissionsController)
    .controller('previewPermissionsController', previewPermissionsController)
    .controller('CustomPermissionsTooltipController', CustomPermissionsTooltipController)
    .controller('inheritedPermissionsController', inheritedPermissionsController)
    .directive('previewPermission', function() {
      return {
        restrict: 'E',
        controllerAs: 'previewPermissionsCtrl',
        controller: 'previewPermissionsController',
        templateUrl: 'agora_modules/permissions/previewPermissions.html',
        scope: {
          permissions: '@',
          current: '@'
        }
      }
    })
    .directive('customPermission', function() {
      return {
        restrict: 'E',
        controllerAs: 'permissionsCtrl',
        controller: 'CustomPermissionsController',
        templateUrl: 'agora_modules/permissions/customPermissions.html',
        scope: {
          permissions: '@'
        }
      }
    })
    .directive('templatePermission', function() {
      return {
        restrict: 'E',
        controllerAs: 'permissionsTempCtrl',
        controller: 'templatePermissionsController',
        templateUrl: 'agora_modules/permissions/templatePermissions.html',
        scope: {
          schemes: '@'
        }
      }
    })
    .directive('inheritedPermission', function() {
      return {
        restrict: 'E',
        controllerAs: 'permissionsInheritedCtrl',
        controller: 'inheritedPermissionsController',
        templateUrl: 'agora_modules/permissions/inheritedPermission.html'

      }
    })
    .directive('permissionTooltip', function() {
      return {
        restrict: 'E',
        controllerAs: 'tooltipPermissionsCtrl',
        controller: 'CustomPermissionsTooltipController',
        templateUrl: 'agora_modules/permissions/tooltipPermissions.html',
        scope: {
          type:'@'
        }
      }
    });

  function newPermissionsService($q, $http) {
    var _currentPermission = {};
    var _serverUrl = 'agora-api/api/v1';

    this.getOnlyResourceByType = function(selectionList, type) {
      var _onlyResourceByType =  selectionList.filter(function (el) {
        return el.subtype == type;
      });
      return _onlyResourceByType;
    };

    this.getInternalList = function(selectionList){
      var _tmp_list_users =  selectionList.filter(function (el) {
        return (el.type == 2 && (el.subtype == 2 || el.subtype == 5));
      });
      var _tmp_list_groups =  selectionList.filter(function (el) {
        return (el.type == 3 && (el.subtype == 2));
      });

      var _tmp_list = _tmp_list_users.concat(_tmp_list_groups);
      return (_tmp_list);
    };

    this.getExternalList = function(selectionList){

      if(selectionList){
        var _tmp_list_users =  selectionList.filter(function (el) {
          return (el.type == 2 && (el.subtype == 3 || el.subtype == 4));
        });
        var _tmp_list_groups =  selectionList.filter(function (el) {
          return (el.type == 3 && (el.subtype == 3));
        });

        var _tmp_list = _tmp_list_users.concat(_tmp_list_groups);
        return (_tmp_list);
      }

    };

    this.setCurrentPermissions = function(allPermisssionItems) {
      _currentPermission = [];
      _currentPermission =  allPermisssionItems.filter(function (el) {
        return el.inUse == true;
      });
    };

    this.getCurrentPermissions = function() {
      return _currentPermission;
    };

    this.setDefaultLevel = function(permission, defaulLevel){
      if(permission){
        permission['level'] = defaulLevel;
        return permission;
      }
    };

    this.getDefaultLevel = function (levels){

      var _viewer = levels.filter(function (el) {
        return el.value == 3;
      });


      if(_viewer.length>0){
        return 3;
      }else{
        return levels[levels.length-2].value;
      }
    };

    this.setCurrentPermissionBySchema = function(schema){
      _currentPermission = schema.items;
    };

    this.areYouAllowedToDelete = function(currentPermisssion, permissionItem){

      if(permissionItem.level == 5){
        var _onlyOwner =  currentPermisssion.filter(function (el) {
          return (el.level == 5);
        });
        if (_onlyOwner.length==1){
          return false;
        }else{
          return true;
        }
      }else{
        return true;
      }
    };

    this.getPermissionsPreview = function(){

      var _tmp = {};
      _tmp['items'] = this.getCurrentPermissions();

      var permissionsPreview =  $http({
        url: _serverUrl+'/permissions/overview',
        method: "POST",
        data: JSON.stringify(_tmp),
        contentType: 'application/json'
      });
      return permissionsPreview;
    }

  }

  newPermissionsService.prototype.$inject = ['$q', '$http'];

  function CustomPermissionsController(newPermissionsService, $scope, $rootScope, notify, $translate) {

    var self = this;

    self.permissions = angular.fromJson($scope.permissions);

    newPermissionsService.setCurrentPermissions(self.permissions.selection.items);
    self.externalInUser = newPermissionsService.getExternalList(newPermissionsService.getCurrentPermissions());

    this.showTooltip = function(permissionsList){
      $rootScope.$broadcast('openTooltip', permissionsList);
    };

    this.removeItem = function(resource){
      if(newPermissionsService.areYouAllowedToDelete(newPermissionsService.getCurrentPermissions(), resource)){
        delete resource.inUse;
        delete resource.level;
        newPermissionsService.setCurrentPermissions(self.permissions.selection.items);
        self.externalInUser = newPermissionsService.getExternalList(newPermissionsService.getCurrentPermissions());
      }else{
        var _translatedMessage = $translate.instant('WEB_FORMS_VALIDATION_REQUIRED_OWNER');
        notify({
          message: _translatedMessage,
          duration: 2000,
          classes: 'alert-danger'
        });
      }
    };

    this.setPermissionVal = function(resource, val){
      self.permissions.selection.items[self.permissions.selection.items.indexOf(resource)].level = val;
      newPermissionsService.setCurrentPermissions(self.permissions.selection.items);
    };

    this.unpdateInheritance = function(resource, val){
      var _permissionItem =  self.permissions.selection.items.filter(function (el) {
        return el.rid == resource.rid;
      });
      if(_permissionItem){
        _permissionItem[0].inheritance = val;
      }
      newPermissionsService.setCurrentPermissions(self.permissions.selection.items);
    };

    this.addItem = function(resource){
      if(resource && !resource.inUse){
        var _defaultLevel = newPermissionsService.getDefaultLevel(this.permissions.levels);
        self.permissions.selection.items.filter(function (el) {
          if (el.rid == resource.rid){
            el  =  newPermissionsService.setDefaultLevel(el, _defaultLevel);
            el['inUse'] = true;
          }
        });
        self.addNewItem = false;
        newPermissionsService.setCurrentPermissions(self.permissions.selection.items);
        self.externalInUser = newPermissionsService.getExternalList(newPermissionsService.getCurrentPermissions());
      }

    };

    $scope.$on('addItem', function($event, resource) {
      self.addItem(resource);
    });

  }

  CustomPermissionsController.prototype.$inject = ['newPermissionsService', '$scope', '$rootScope', 'notify', '$translate'];

  function templatePermissionsController(newPermissionsService, $scope) {
    var self = this;

    if($scope.schemes){
      self.schemes = angular.fromJson($scope.schemes);
      self.selectedSchema = self.schemes[0].name;
    }else{
      self.schemes = {};
    }
    //self.schemes = angular.fromJson($scope.schemes);


    this.setCurrentPermissionBySchema = function(schema){
      newPermissionsService.setCurrentPermissionBySchema(schema);
    }

  }

  templatePermissionsController.prototype.$inject = ['newPermissionsService', '$scope', '$rootScope'];

  function previewPermissionsController(newPermissionsService, $scope, $rootScope) {

    var self = this;

    $scope.$on('updatePermissionsPreview', function() {
      self.getPermissionsPreview();
    });


    this.getPermissionsPreview = function(){
      self.permissionsPreviewList = undefined;
      var _permissionsPreview = newPermissionsService.getPermissionsPreview();

      _permissionsPreview.then(function(permissionsPreviewList){
        console.log(permissionsPreviewList.data);
        self.permissionsPreviewList = permissionsPreviewList.data;
      });
    };

    this.emitClosePannel = function(){
      self.permissionsPreviewList = [];
      $rootScope.$broadcast('closePanel', 'permissionsPreview');
    };

  }

  previewPermissionsController.prototype.$inject = ['newPermissionsService', '$scope', '$rootScope'];

  function CustomPermissionsTooltipController(newPermissionsService, $scope, $rootScope, notify, $translate){
    var self = this;

    self.type = $scope.type;

    $scope.$on('openTooltip', function(e, permissionsList) {
      self.permissionsList = permissionsList;
      if(self.type == 0 ){
        self.permissionsList_tooltip = newPermissionsService.getInternalList(self.permissionsList);
      }else if(self.type == 1 ){
        self.permissionsList_tooltip = newPermissionsService.getExternalList(self.permissionsList);
      }

    });


    this.addItem = function(item){
      if(!item.inUse){
        $rootScope.$broadcast('addItem', item);
      }else if(item.inUse){
        var _translatedMessage = $translate.instant(' WEB_ALERT_USER_ALREADY_USED');
        notify({
          message: _translatedMessage,
          duration: 2000,
          classes: 'alert-danger'
        });
      }
    };
  };

  CustomPermissionsTooltipController.prototype.$inject = ['newPermissionsService', '$scope', '$rootScope', 'notify', '$translate'];

  function inheritedPermissionsController($rootScope){
    var self = this;

    self.inheritPermissions = 0;

    this.emitClose = function(){
      $rootScope.$broadcast('closePanel', 'inhertePermission');
    };

    this.setValue = function(value){
      self.inheritPermissions = value;
    };

    this.updatePermissions = function(){
      $rootScope.$broadcast('savePermissionsWithInheritance', self.inheritPermissions);
    };

  };

  inheritedPermissionsController.prototype.$inject = ['$rootScope'];

})();
