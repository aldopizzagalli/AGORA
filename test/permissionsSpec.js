
describe('newPermission Service', function () {

  var _serviceMock;

  beforeEach(angular.mock.module("agora.permissions"));

  beforeEach(inject(function (newPermissionsService) {
    _serviceMock = newPermissionsService;
  }));

  describe('Service Existing method', function(){

    it('shoud exist getOnlyResourceByType method', function(){
      expect(_serviceMock.getOnlyResourceByType).toBeDefined();
    });

    it('shoud exist setCurrentPermissions method', function(){
      expect(_serviceMock.setCurrentPermissions).toBeDefined();
    });

    it('shoud exist getCurrentPermissions method', function(){
      expect(_serviceMock.getCurrentPermissions).toBeDefined();
    });

    it('shoud exist getExternalList method', function(){
      expect(_serviceMock.getExternalList).toBeDefined();
    });

    it('shoud exist getInternalList method', function(){
      expect(_serviceMock.getInternalList).toBeDefined();
    });

    it('shoud exist setDefaultLevel method', function(){
      expect(_serviceMock.setDefaultLevel).toBeDefined();
    });

    it('shoud exist setDefaultLevel method', function(){
      expect(_serviceMock.setDefaultLevel).toBeDefined();
    });
    it('shoud exist setCurrentPermissionBySchema method', function(){
      expect(_serviceMock.setCurrentPermissionBySchema).toBeDefined();
    });

    it('shoud exist areYouAllowedToDelete method', function(){
      expect(_serviceMock.areYouAllowedToDelete).toBeDefined();
    });

    it('shoud exist getPermissionsPreview method', function(){
      expect(_serviceMock.getPermissionsPreview).toBeDefined();
    });


  });

});
