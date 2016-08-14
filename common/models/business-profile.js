module.exports = function(BusinessProfile) {

	BusinessProfile.getGPA = function(id, cb) {

		
		BusinessProfile.findById(id, {fields: ['job_list','location_address']}, function (err, instance) {

			var monthindonesia = {
				"Januari" : 0,
				"Februari" : 1,
				"Maret" : 2,
				"April" : 3,
				"Mei" : 4,
				"Juni" : 5,
				"Juli" : 6,
				"Agustus" : 7,
				"September" : 8,
				"Oktober" : 9,
				"November" : 10,
				"Desemeber" : 11
			}


			var GPA = []
			var request = require('request');
		//Compare this address with applicant address
		var address = instance.location_address
		var job = instance.job_list
		//Change to job.length
		for (var i=0;i<1;i++){
			var applicant = job[i].applicant_list

			//Compare this job needed with applicant available
			var name = job[i].name
			var language = job[i].language_needed
			var availability = job[i].availability_needed
			//Change to applicant.length
			for (var j = 0;j<1;j++){
				var applicantaddress = applicant[j].address.full_address + " " + applicant[j].address.suburb + " " + applicant[j].address.districts + " " + applicant[j].address.town + " " + applicant[j].address.province
				var applicantexperience = applicant[j].experience
				var applicantlanguage = applicant[j].language
				var applicantavailability = applicant[j].availabilitiy_list

				var addressscore = 0
				// Count distance score, make this only work once in the future, maybe when apply to the job
				
				// var uristring = "https://maps.googleapis.com/maps/api/distancematrix/json?origins=" + applicantaddress + "&destinations=" + address
				// var uri = encodeURI(uristring)
				// new uri https://maps.googleapis.com/maps/api/geocode/json?address=jalan%20mandar%20utama%20pondok%20aren&key=AIzaSyCkbUo2A4_MKrfqRVM9TLO4m3JMW_ZGXEI

				// request(uri, function (error, response, body) {
				//   if (!error && response.statusCode == 200) {

				//     var bodyaddress = JSON.parse(body)
				//     var addressvalue = bodyaddress.rows[0].elements[0].distance.value



				//   }
				// })

				var experiencescore = 0
				var totalexperience = 0
				var experiencefoundtotal = 0
				//Count experience score
				var foundexperience = false
				for (var experienceindex = 0;experienceindex<applicantexperience.length;experienceindex++){
					var yearnow = applicantexperience[experienceindex].year_end - applicantexperience[experienceindex].year_start
					var monthnow = monthindonesia[applicantexperience[experienceindex].month_start] - monthindonesia[applicantexperience[experienceindex].month_end]

					var startdate = new Date()
					var enddate = new Date()

					startdate.setMonth(monthindonesia[applicantexperience[experienceindex].month_start])
					startdate.setFullYear(applicantexperience[experienceindex].year_start)


					enddate.setMonth(monthindonesia[applicantexperience[experienceindex].month_end])
					enddate.setFullYear(applicantexperience[experienceindex].year_end)

					var startmillis = startdate.getTime()
					var endmillis = enddate.getTime()

					var timetotal = (endmillis-startmillis)/(24 * 60 * 60 * 1000 * 365)
					totalexperience += timetotal
					if (name == applicantexperience[experienceindex].position){

						experiencefoundtotal = timetotal
						foundexperience = true
						break;
					}
				}

				if (!foundexperience){
					console.log("gak punya experience")
					console.log(totalexperience)
				}else{
					console.log(experiencefoundtotal)	
				}
				console.log(applicantexperience.length)
				console.log(totalexperience)


				var languagescore = 0
				//Count language score
				for (var joblanguageindex = 0;joblanguageindex<language.length;joblanguageindex++){
					var jobfound = false
					var jobnow = {}
					for (var languageindex = 0;languageindex<applicantlanguage.length;languageindex++){

						if (language[joblanguageindex] == applicantlanguage[languageindex].language){
							//console.log(applicantlanguage[languageindex])
							jobfound = true
							jobnow = applicantlanguage[languageindex]
						}
				}	
				if (jobfound){
					var onescore = 1/language.length

				languagescore += (onescore/3)*jobnow.level
				}
				}
				console.log("languagescore")
				console.log(languagescore)

				var availabilityscore = 0
				//Count availability score



				var now  = {
					"jobaddress" : address,
					"applicantaddress" : applicantaddress,
					"jobname" : name,
					"applicantjobname" : applicantexperience,
					"joblanguage" : language,
					"applicantlanguage" : applicantlanguage,
					"jobavailability" : availability,
					"applicantavailability" : applicantavailability
				}
				
				var totaljobtime = 0;
				var totalapplicanttime = 0;
				for (var availabilityindex = 0;availabilityindex<availability.length;availabilityindex++){
					var job_from_now = parseInt(availability[availabilityindex].from)
					var job_to_now = parseInt(availability[availabilityindex].to)
					var total_job_time_now = (job_to_now-job_from_now)
					totaljobtime += total_job_time_now
					for(var applicantavailabilityindex = 0;applicantavailabilityindex<applicantavailability.length;applicantavailabilityindex++){
						if (availability[availabilityindex].day == applicantavailability[applicantavailabilityindex].day){
							//console.log(availability[availabilityindex])
							var job_from = parseInt(availability[availabilityindex].from)
							var job_to = parseInt(availability[availabilityindex].to)

							//console.log(applicantavailability[applicantavailabilityindex])
							var applicant_from = parseInt(applicantavailability[applicantavailabilityindex].from)
							var applicant_to = parseInt(applicantavailability[applicantavailabilityindex].to)

							
							if (applicant_from<job_from){


								if (applicant_to < job_from){
									//console.log("gak ada bos")
								}else{
									//start from job_from
								//console.log("start from job_from")
								if (applicant_to < job_to){
								//end at applicant_to
								//console.log("end at applicant_to")
								var applicant_time_now = (applicant_to-job_from)
								totalapplicanttime += applicant_time_now
								}else{
									//end at job_to
									//console.log("end at job_to")
									var applicant_time_now = (job_to-job_from)
									totalapplicanttime += applicant_time_now
								}
								}

								
							}else{
								//start from applicant_from
								
								if (applicant_from > job_to){
									//console.log("gak ada bos")
								}else{
									//console.log("start from applicant_from")
									if (applicant_to < job_to){
									//end at applicant_to
									//console.log("end at applicant_to")
									var applicant_time_now = (applicant_to-applicant_from)
									totalapplicanttime += applicant_time_now
								}else{
									//end at job_to
									//console.log("end at job_to")
									var applicant_time_now = (job_to-applicant_from)
									totalapplicanttime += applicant_time_now
								}
							}

						}

						}
					}
				}
				availabilityscore = totalapplicanttime/totaljobtime
				console.log("availabilityscore")
				console.log(availabilityscore)
				
			}
		}


		cb(null,"Success")
							//cb(null, instance.location_address);
						});
};

BusinessProfile.remoteMethod('getGPA', {
	http : {
		path : '/getGPA',
		verb : 'get',
		source : 'query'
	},
	description : "Get User Profile by User ID",
	accepts : {
		arg : 'id',
		type : 'string',
		"required" : true,
		"description" : "User Id"
	},

	returns :  {
		arg : 'result',
		type : 'object',
		root : true
	}, 
});

};
