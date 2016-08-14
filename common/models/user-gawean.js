module.exports = function(UserGawean) {

	UserGawean.observe('before save', function updateTimestamp(context, next) {

		var time = (new Date).getTime();
		// console.log(context.instance)
		// check wether using instance or data
		if (context.instance === undefined) {
			console.log('id: ' + context.where.id)
			UserGawean.findById(context.where.id,{fields: ['id']}, function (err, instance) {
				// console.log(body);
		    	// console.log('bodynow: ' + bodynow.rows[0]);
		    	// check if already created or not
		    	if(instance === null) {
		    		context.data.created_at = time;
		    		context.data.updated_at = time;
				    console.log('create new --> UserGawean');
				    // console.log('created_at: ' + context.data.created_at);
				    // console.log('updated_at: ' + context.data.updated_at);
		    	} else {
		    		context.data.updated_at = time;
				    console.log('update existing --> UserGawean');
				    // console.log('updated_at: ' + context.data.updated_at);
		    	}
				next();
			});
		} else {
			console.log('id: ' + context.instance.id)
			UserGawean.findById(context.instance.id,{fields: ['id']}, function (err, instance) {  
		    	// console.log('bodynow: ' + bodynow.rows[0]);
		    	// check if already created or not
		    	console.log(instance);
		    	if(instance === null) {
		    		context.instance.created_at = time;
		    		context.instance.updated_at = time;
				    console.log('create new --> UserGawean');
				    // console.log('created_at: ' + context.instance.created_at);
				    // console.log('updated_at: ' + context.instance.updated_at);
		    	} else {
		    		context.instance.updated_at = time;
				    console.log('update existing --> UserGawean');
				    // console.log('updated_at: ' + context.instance.updated_at);
		    	}
				next();
			});
		}
		});

		UserGawean.getProfile = function(id, cb) {
			var loginStatus = false
			var ApplicantProfile = UserGawean.app.models.ApplicantProfile

			ApplicantProfile.findOne({where: {user_id:id}
          }, function (err, instance) {
          	if (instance == null){
          		cb(null, null)
          	}else{
          		cb(null,instance)
          	}

		});
		}
		UserGawean.remoteMethod('getProfile', {
			http : {
				path : '/getProfile',
				verb : 'get',
				source : 'query'
			},
			description : "User authentification based on user name and Password",
			accepts :  {
				arg : 'userid',
				type : 'string',
				"required" : true,
				"description" : "User ID"
			},

			returns :  {
				arg : 'profile_id',
				type : 'string'
			}, 
		});

};
