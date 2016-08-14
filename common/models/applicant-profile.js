module.exports = function(ApplicantProfile) {

	ApplicantProfile.getUserProfile = function(id, cb) {

		
	ApplicantProfile.findOne({where: {user_gawean_id:id}
          }, function (err, instance) {
							cb(null, instance);
						});
	};
	
	ApplicantProfile.remoteMethod('getUserProfile', {
		http : {
			path : '/getUserProfile',
			verb : 'get',
			source : 'query'
		},
		description : "Get User Profile by User ID",
		accepts : {
			arg : 'user_id',
			type : 'string',
			"required" : true,
			"description" : "User Id"
		},

		returns :  {
			arg : 'result',
			type : 'object'
		}, 
	});

};
