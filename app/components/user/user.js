angular.module('myApp')
  .component('user', {
    templateUrl: 'app/components/user/user.tpl.html',
    controller: ['$scope', '$http', '$stateParams', 'CurrentUser', '$rootScope', '$state', '$window', function($scope, $http, $stateParams, CurrentUser, $rootScope, $state, $window) {
      $window.scrollTo(0, 0);
      $http.get(`/users/${$stateParams.username}`).then(user => {
        if (!user.data) {
          $scope.userErr = 'There is no such user!';
        } else {
          $scope.user = user.data;
          if (CurrentUser.getUser() !== $scope.user.username) {
            $scope.user.password = '***';
          }
        }
      });

      $scope.logout = function() {
        $http.get('/logout').then(() => {
          CurrentUser.setUser();
          $rootScope.$broadcast('authenticated');
        });
      }

      $scope.deleteUser = function() {
        $http.delete(`/users/${$stateParams.username}`).then(() => {
          $scope.logout();
          $state.go('home', {}, { reload: true });
        });
      }
    }]
  });
