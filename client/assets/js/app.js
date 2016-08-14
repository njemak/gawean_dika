(function() {
  'use strict';

angular.module('application', [
    'ui.router',
    'ngAnimate',

    //foundation
    'foundation',
    'foundation.dynamicRouting',
    'foundation.dynamicRouting.animations',

    //slidedown
    'angularSlideables',

    //slick
    'slick'
    ])
  .config(config)
  .run(run)

  config.$inject = ['$urlRouterProvider', '$locationProvider'];

  function config($urlProvider, $locationProvider) {
    $urlProvider.otherwise('/');

    $locationProvider.html5Mode(true);

    $locationProvider.hashPrefix('!');
  }

  function run() {
    FastClick.attach(document.body);
  }

})();

angular.module('application')
  /** Register Controller
  */

  .controller('UserController', UserController);
  UserController.$inject = ['$scope', '$stateParams', '$state', '$controller','FormService','UserService'];
  function UserController($scope, $stateParams, $state, $controller, FormService, UserService) {
    angular.extend(this, $controller('DefaultController', {$scope: $scope, $stateParams: $stateParams, $state: $state}));

    $scope.formInfo = {};

    $scope.Login = function() {

      var formTrue = 0;


      if (!$scope.formInfo.Email) {
        $scope.emailRequired = 'Email Required';
      }else{
        formTrue++
      }

      if (!$scope.formInfo.Password) {
        $scope.passwordRequired = 'Password Required';
      }else{
        formTrue++
      }

      if(formTrue>=2){

        console.log("success")

        var login = {
          "email":$scope.formInfo.Email,
          "password": $scope.formInfo.Password

        }

        UserService.loginUser(login).success(function(loginresult) {
          localStorage.setItem("accessToken",loginresult.id)
          localStorage.setItem("id",loginresult.userId);
          FormService.getUserProfile(loginresult.userId).success(function(data) {
            var form = data.result
            if (form != null){
              localStorage.setItem("formData", JSON.stringify(form))
              localStorage.setItem("statusForm", true)
            }else{
              localStorage.setItem("statusForm", false)
            }
            $scope.loginStatus = ''
            $state.go('acount-panel', {reload: true});
          })
          

        }).error(function(data) {
          $scope.passwordRequired = "email or password wrong"

        });
      }
    }

    $scope.Logout = function() {
      localStorage.clear()
      $state.go('home')
    }


    $scope.Register = function() {

      $scope.nameRequired = '';
      $scope.emailRequired = '';
      $scope.passwordRequired = '';
      


      var formTrue = 0;
      if (!$scope.formInfo.Name) {
        $scope.nameRequired = 'Name Required';
      }else{
        formTrue++
      }

      if (!$scope.formInfo.Email) {
        $scope.emailRequired = 'Email Required';
      }else{
        formTrue++
      }

      if (!$scope.formInfo.Password) {
        $scope.passwordRequired = 'Password Required';
      }else{
        formTrue++
      }

      if (!$scope.formInfo.PasswordRepeat) {
        $scope.passwordRepeatRequired = 'Password Required';
      }else{
        if ($scope.formInfo.Password != $scope.formInfo.PasswordRepeat) {
          $scope.passwordRepeatRequired = 'Password Not Match';
        }else{
          $scope.passwordRepeatRequired = '';
          formTrue++
        }
      }

      if(formTrue>=4){

        console.log("success")
        var data = {

          "type": "Applicant",
          "fullname": $scope.formInfo.Name,
          "email": $scope.formInfo.Email,
          "emailVerified": false,
          "password":$scope.formInfo.Password
        }

        UserService.registerUser(data).success(function(dataresult) {
          localStorage.setItem("id",dataresult.id);
          localStorage.setItem("name",dataresult.fullname);
          var login = {
            "email":$scope.formInfo.Email,
            "password": $scope.formInfo.Password

          }
          UserService.loginUser(login).success(function(loginresult) {
            localStorage.setItem("accessToken",loginresult.id)
            $state.go('form', {ID: dataresult.id});
          })

        }).error(function(data) {
          $scope.emailRequired = "Your email already registered"
          console.log(data)

        });
      }
    }

  };


  angular.module('application')

  .controller('WorkspaceController', WorkspaceController);
  WorkspaceController.$inject = ['$scope', '$stateParams', '$state', '$controller','$timeout', 'FormService', 'UserService', 'CompanyService'];
  function WorkspaceController($scope, $stateParams, $state, $controller, $timeout, FormService, UserService, CompanyService) {
    angular.extend(this, $controller('UserController', {$scope: $scope, $stateParams: $stateParams, $state: $state, FormService: FormService, UserService: UserService}));
    
    CompanyService.getAllCompany().success(function(data) {
      $scope.allCompany = data 
      localStorage.setItem("companyDetails", JSON.stringify(data))
            //console.log("save companyDetails")

          }) 

  };

  angular.module('application')

  .controller('CompanyController', CompanyController);
  CompanyController.$inject = ['$scope', '$stateParams', '$state', '$controller','$timeout', 'FormService', 'UserService', 'CompanyService'];
  function CompanyController($scope, $stateParams, $state, $controller, $timeout, FormService, UserService, CompanyService) {
    angular.extend(this, $controller('UserController', {$scope: $scope, $stateParams: $stateParams, $state: $state, FormService: FormService, UserService: UserService}));
    

    var dataJson = JSON.parse(localStorage.getItem("companyDetails"));


    $scope.data = dataJson[$stateParams.companyId]
    $scope.dataLoaded = true;

    $scope.job_choice = '0';
    $scope.job_now = $scope.data.job_list[0]

    console.log(localStorage.getItem("formData"))

    if (localStorage.getItem("formData") != null){
      var userprofileglobal = JSON.parse(localStorage.getItem("formData"))
    var idjobuser = []

    if (userprofileglobal.job_list != undefined){
      for (var i = 0;i<userprofileglobal.job_list.length;i++){
      idjobuser.push(userprofileglobal.job_list[i].job.id)
    }
    }

    if(idjobuser.includes($scope.job_now.id)){
      $scope.jobavailable = true
    }else{
      $scope.jobavailable = false
    }

    }
    
    $scope.ShowJob = function() {
     $scope.job_now = $scope.data.job_list[parseInt($scope.job_choice)]
     if(idjobuser.includes($scope.job_now.id)){
      $scope.jobavailable = true
    }else{
      $scope.jobavailable = false
    }
  }

  $scope.ApplyJob = function() {
    if (localStorage.getItem("id") == null){
      alert("blom login lau")
    }else 
    if (localStorage.getItem("statusForm") == "true"){

        //Initialize all value
        var companyprofile = JSON.parse(angular.toJson($scope.data))
        var companycopy = JSON.parse(angular.toJson($scope.data))
        var jobprofile = JSON.parse(angular.toJson($scope.job_now))
        var jobcopy = JSON.parse(angular.toJson($scope.job_now))
        var userprofile = JSON.parse(localStorage.getItem("formData"))
        var usercopy = JSON.parse(localStorage.getItem("formData"))
        var iduser = userprofile.id
        var idcompany = companyprofile.id

        //delete
        delete jobcopy.applicant_list
        delete companycopy.job_list;
        delete usercopy.job_list

        companycopy.job = jobcopy

        if (userprofile.job_list == undefined){
          userprofile.job_list = []
          userprofile.job_list.push(companycopy)
        }else{
          userprofile.job_list.push(companycopy)
        }

        idjobuser.push(jobprofile.id)

        //update applicant profile
        FormService.saveForm(iduser,userprofile).success(function(data) {
        //console.log(data)
      })
        
        if (companyprofile.job_list[parseInt($scope.job_choice)].applicant_list == undefined){
          companyprofile.job_list[parseInt($scope.job_choice)].applicant_list = []
          companyprofile.job_list[parseInt($scope.job_choice)].applicant_list.push(usercopy)
        }else{
          companyprofile.job_list[parseInt($scope.job_choice)].applicant_list.push(usercopy)
        }

        //update company profile
        CompanyService.updateCompany(idcompany,companyprofile).success(function(data) {
        //console.log(data)
      })

        //set localstorage in the view
        $scope.data.job_list[parseInt($scope.job_choice)].applicant_list = companyprofile.job_list[parseInt($scope.job_choice)].applicant_list
        localStorage.setItem("formData", JSON.stringify(userprofile))

        $scope.jobavailable = true
        alert("success bang")
      }
      else
      {
        alert("Anda belum mengisi identitas anda")
      }
    }

  };

  angular.module('application')

  .controller('FormController', FormController);
  FormController.$inject = ['$scope', '$stateParams', '$state', '$controller', 'FormService', 'UserService'];
  function FormController($scope, $stateParams, $state, $controller, FormService, UserService) {
    angular.extend(this, $controller('UserController', {$scope: $scope, $stateParams: $stateParams, $state: $state, FormService: FormService, UserService: UserService}));
    $scope.SubmitForm = function() {

      var newDate = new Date()
      newDate.setDate($scope.day)
      newDate.setMonth($scope.month-1)
      newDate.setFullYear($scope.year)
      $scope.data.date_of_birth = newDate
      var dataNow = JSON.parse(angular.toJson($scope.data))
      console.log(dataNow)
      var idUser = dataNow.id


      if (localStorage.getItem("statusForm") == "true"){
        FormService.saveForm(idUser,dataNow).success(function(data) {
          console.log(data)
          localStorage.setItem("formData", JSON.stringify(dataNow))
          $state.go('home');
        })

      }else{

        var idUser = localStorage.getItem("id")
        dataNow.user_gawean_id = idUser
        console.log(dataNow)
        FormService.createForm(dataNow).success(function(data) {
          console.log(data)
          localStorage.setItem("formData", JSON.stringify(dataNow))
          localStorage.setItem("statusForm", true)
          $state.go('home');
        }).error(function(data) {
          $scope.formRequired = "Ada yang belum lengkap datanya tuh"
          console.log(data)

        });
      }

      
      
    }


    $scope.id = $state.params.ID;
    
    if (localStorage.getItem("statusForm") == "true"){

      var data = JSON.parse(localStorage.getItem("formData"));
      $scope.data = data
      var dob = new Date(data.date_of_birth)
      $scope.day = dob.getDate()
      $scope.month = (dob.getMonth()+1)
      $scope.year = dob.getFullYear()
    }else{

      $scope.data = {}
      $scope.data.education = []
      $scope.data.experience = []
      $scope.data.language = []
      $scope.day = ""
      $scope.month = ""
      $scope.year = ""

    }

    $scope.isHideEducation = false;

    $scope.FillEducation = function() {

      if (localStorage.getItem("editStatusEducation") == "true"){
        console.log("masuk save edit")
        $scope.data.education[localStorage.getItem("idEducation")] = $scope.education
        $scope.education = {}
        $scope.isHideEducation = false
        $scope.data.education[localStorage.getItem("idEducation")].isHideEducation = false;
        localStorage.setItem("editStatusEducation", "false")

      }else{
        if (localStorage.getItem("statusForm") == "true"){
          console.log(angular.toJson($scope.education))
          $scope.data.education.push($scope.education)
          console.log(angular.toJson($scope.data))
          var dataNow = JSON.parse(angular.toJson($scope.data))
          $scope.education = {}
          console.log(dataNow.education)

        }
        else{

          $scope.data.education.push($scope.education)
          console.log(angular.toJson($scope.data))
          var dataNow = JSON.parse(angular.toJson($scope.data))
          $scope.education = {}
          console.log(dataNow.education)
        }
      }
      
      
    }

    $scope.EditEducation = function(index) { 
      $scope.isHideEducation = true;
      $scope.data.education[index].isHideEducation = true;  
      localStorage.setItem("idEducation", index)
      localStorage.setItem("editStatusEducation", "true")
      console.log($scope.data.education[index])
      var now = $scope.data.education[index]
      $scope.education = now
      
    }

    $scope.DeleteEducation = function(index) { 
      $scope.data.education.splice(index, 1)
      console.log($scope.data.education[index])
      
    }

    $scope.CancelEducation = function(index) { 
      if (localStorage.getItem("editStatusEducation") == "true"){
       $scope.isHideEducation = false
       $scope.data.education[localStorage.getItem("idEducation")].isHideExperience = false;
       localStorage.setItem("editStatusEducation", "false")
     }
     $scope.education = {}
   }

   $scope.isHideExperience = false;

   $scope.FillExperience = function() {
    if (localStorage.getItem("editStatusExperience") == "true"){
      console.log("masuk save edit")
      $scope.data.experience[localStorage.getItem("idExperience")] = $scope.experience
      $scope.experience = {}
      $scope.isHideExperience = false
      $scope.data.experience[localStorage.getItem("idExperience")].isHideExperience = false;
      localStorage.setItem("editStatusExperience", "false")

    }else{
      if (localStorage.getItem("statusForm") == "true"){
        console.log(angular.toJson($scope.experience))
        $scope.data.experience.push($scope.experience)
        console.log(angular.toJson($scope.data))
        var dataNow = JSON.parse(angular.toJson($scope.data))
        $scope.experience = {}
        $scope.isHideEducation = false;
        console.log(dataNow.experience)
      }
      else{

        console.log(angular.toJson($scope.experience))

        $scope.data.experience.push($scope.experience)
        console.log(angular.toJson($scope.data))
        var dataNow = JSON.parse(angular.toJson($scope.data))
        $scope.experience = {}
        console.log(dataNow.experience)

      }
    }

  }

  $scope.EditExperience = function(index) { 
    $scope.isHideExperience = true;
    $scope.data.experience[index].isHideExperience = true;  
    localStorage.setItem("idExperience", index)
    localStorage.setItem("editStatusExperience", "true")
    console.log($scope.data.experience[index])
    $scope.experience = $scope.data.experience[index]

  }

  $scope.DeleteExperience = function(index) { 
    $scope.data.experience.splice(index, 1)
    console.log($scope.data.experience[index])

  }

  $scope.CancelExperience = function(index) { 
    if (localStorage.getItem("editStatusExperience") == "true"){
     $scope.isHideExperience = false
     $scope.data.experience[localStorage.getItem("idExperience")].isHideExperience = false;
     localStorage.setItem("editStatusExperience", "false")
   }
   $scope.experience = {}
 }

 $scope.isHideLanguage = false;

 $scope.FillLanguage = function() {

  if (localStorage.getItem("editStatusLanguage") == "true"){
    console.log("masuk save edit")
    $scope.data.language[localStorage.getItem("idLanguage")] = $scope.language
    $scope.language = {}
    $scope.isHideLanguage = false
    $scope.data.language[localStorage.getItem("idLanguage")].isHideLanguage = false;
    localStorage.setItem("editStatusLanguage", "false")

  }else{
    if (localStorage.getItem("statusForm") == "true"){
      console.log(angular.toJson($scope.language))
      $scope.data.language.push($scope.language)
      console.log(angular.toJson($scope.data))
      var dataNow = JSON.parse(angular.toJson($scope.data))
      $scope.language = {}
      console.log(dataNow.language)
    }else{
      console.log(angular.toJson($scope.language))
      
      $scope.data.language.push($scope.language)
      console.log(angular.toJson($scope.data))
      var dataNow = JSON.parse(angular.toJson($scope.data))
      $scope.language = {}
      console.log(dataNow.language)

    }
  }


}

$scope.EditLanguange = function(index) { 
  $scope.isHideLanguage = true;
  $scope.data.language[index].isHideLanguage = true;  
  localStorage.setItem("idLanguage", index)
  localStorage.setItem("editStatusLanguage", "true")
  console.log($scope.data.language[index])
  $scope.language = $scope.data.language[index]

}

$scope.DeleteLanguage = function(index) { 
  $scope.data.language.splice(index, 1)
  console.log($scope.data.language[index])

}

$scope.CancelLanguage = function(index) { 
  if (localStorage.getItem("editStatusLanguage") == "true"){
   $scope.isHideLanguage = false
   $scope.data.language[localStorage.getItem("idLanguage")].isHideLanguage = false;
   localStorage.setItem("editStatusLanguage", "false")
 }
 $scope.language = {}
}


}
angular.module('application')

.factory('UserService', function ($http, $q){
	return{
		registerUser: function(data){

			var deferred = $q.defer();
			var promise = deferred.promise;
			$http.post("/api/user_gaweans", data).success(function(data, status) {
				deferred.resolve(data);
			}).error(function(data){
				deferred.reject(data);
			});
			promise.success = function(fn){
				promise.then(fn);
				return promise;
			}
			promise.error = function(fn){
				promise.then(null, fn);
				return promise;
			}
			return promise;
        },
        loginUser: function(data){
        	var deferred = $q.defer();
			var promise = deferred.promise;
			$http.post("/api/user_gaweans/login", data).success(function(data, status) {
				deferred.resolve(data);
			}).error(function(data){
				deferred.reject(data);
			});
			promise.success = function(fn){
				promise.then(fn);
				return promise;
			}
			promise.error = function(fn){
				promise.then(null, fn);
				return promise;
			}
			return promise;

        }
    }
})

.factory('FormService', function ($http, $q){
	return{
		getUserProfile: function(id){

			var deferred = $q.defer();
			var promise = deferred.promise;
			$http.get("/api/applicant_profiles/getUserProfile?user_id=" + id).success(function(data, status) {
				deferred.resolve(data);
			}).error(function(data){
				deferred.reject(data);
			});
			promise.success = function(fn){
				promise.then(fn);
				return promise;
			}
			promise.error = function(fn){
				promise.then(null, fn);
				return promise;
			}
			return promise;
        },
        saveForm: function(id, data){

			var deferred = $q.defer();
			var promise = deferred.promise;
			$http.put("/api/applicant_profiles/" + id, data).success(function(data, status) {
				deferred.resolve(data);
			}).error(function(data){
				deferred.reject(data);
			});
			promise.success = function(fn){
				promise.then(fn);
				return promise;
			}
			promise.error = function(fn){
				promise.then(null, fn);
				return promise;
			}
			return promise;
        },
        createForm: function(data){

			var deferred = $q.defer();
			var promise = deferred.promise;
			$http.post("/api/applicant_profiles", data).success(function(data, status) {
				deferred.resolve(data);
			}).error(function(data){
				deferred.reject(data);
			});
			promise.success = function(fn){
				promise.then(fn);
				return promise;
			}
			promise.error = function(fn){
				promise.then(null, fn);
				return promise;
			}
			return promise;
        }
    }
})

.factory('CompanyService', function ($http, $q){
	return{
		getAllCompany: function(){

			var deferred = $q.defer();
			var promise = deferred.promise;
			$http.get("/api/business_profiles").success(function(data, status) {
				deferred.resolve(data);
			}).error(function(data){
				deferred.reject(data);
			});
			promise.success = function(fn){
				promise.then(fn);
				return promise;
			}
			promise.error = function(fn){
				promise.then(null, fn);
				return promise;
			}
			return promise;
        },
        updateCompany: function(id, data){

			var deferred = $q.defer();
			var promise = deferred.promise;
			$http.put("/api/business_profiles/" + id, data).success(function(data, status) {
				deferred.resolve(data);
			}).error(function(data){
				deferred.reject(data);
			});
			promise.success = function(fn){
				promise.then(fn);
				return promise;
			}
			promise.error = function(fn){
				promise.then(null, fn);
				return promise;
			}
			return promise;
        }
    }
})