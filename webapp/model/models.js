sap.ui.define([
	"sap/ui/model/json/JSONModel",
	"sap/ui/Device"
], 
function (JSONModel, Device) {
	"use strict";

	return {
		/**
		 * Provides runtime information for the device the UI5 app is running on as a JSONModel.
		 * @returns {sap.ui.model.json.JSONModel} The device model.
		 */
		createDeviceModel: function () {
			var oModel = new JSONModel(Device);
			oModel.setDefaultBindingMode("OneWay");
			return oModel;
		},

		/**
		 * Creates a student profile model with local storage persistence.
		 * @returns {sap.ui.model.json.JSONModel} The student profile model.
		 */
		createStudentProfileModel: function () {
			var oModel = new JSONModel();
			
			// Default data structure
			var oDefaultData = {
				"studentProfile": {
					"personalInfo": {
						"firstName": "John",
						"lastName": "Doe",
						"dateOfBirth": "1998-05-15",
						"gender": "Male",
						"enrollmentId": "STU2024001",
						"academicYear": "2024",
						"program": "Bachelor of Computer Science",
						"semester": "6th Semester",
						"gpa": "3.8",
						"profilePhoto": ""
					},
					"contactInfo": {
						"email": "john.doe@university.edu",
						"phoneNumber": "+1-555-0123",
						"address": {
							"street": "123 University Ave",
							"city": "College Town",
							"state": "CA",
							"zipCode": "90210",
							"country": "USA"
						}
					},
					"emergencyContact": {
						"name": "Jane Doe",
						"relation": "Mother",
						"phoneNumber": "+1-555-0456",
						"email": "jane.doe@email.com"
					}
				}
			};
			
			// Try to load from local storage first
			var storedData = localStorage.getItem("studentProfileData");
			if (storedData) {
				try {
					var oParsedData = JSON.parse(storedData);
					if (oParsedData && oParsedData.studentProfile) {
						oModel.setData(oParsedData);
						console.log("Student profile data loaded from local storage");
					} else {
						// Invalid data structure, use default
						oModel.setData(oDefaultData);
						console.log("Invalid stored data structure, using default data");
					}
				} catch (e) {
					console.warn("Failed to parse stored student profile data, using default");
					oModel.setData(oDefaultData);
				}
			} else {
				// No stored data, use default
				oModel.setData(oDefaultData);
				console.log("No stored data found, using default data");
			}
			
			// Set up local storage sync for future changes
			oModel.attachPropertyChange(function(oEvent) {
				localStorage.setItem("studentProfileData", JSON.stringify(oModel.getData()));
			});
			
			return oModel;
		},

		/**
		 * Creates an authentication model with role and session persistence in localStorage.
		 * @returns {sap.ui.model.json.JSONModel}
		 */
		createAuthModel: function () {
			var oDefault = {
				isAuthenticated: false,
				user: null, // { username, role: "student" | "admin" }
			};
			var sKey = "authData";
			var oModel = new JSONModel();
			try {
				var s = localStorage.getItem(sKey);
				oModel.setData(s ? JSON.parse(s) : oDefault);
			} catch (e) {
				oModel.setData(oDefault);
			}
			oModel.attachPropertyChange(function() {
				localStorage.setItem(sKey, JSON.stringify(oModel.getData()));
			});
			return oModel;
		},

		/**
		 * Creates a course catalog model with search/filterable data.
		 * @returns {sap.ui.model.json.JSONModel}
		 */
		createCoursesModel: function () {
			var sKey = "coursesData";
			var aSeed = [
				{
					id: "CS101",
					title: "Intro to Computer Science",
					department: "CS",
					credits: 3,
					schedule: "Mon/Wed 10:00-11:30",
					prerequisites: [],
					syllabus: "Fundamentals of programming, algorithms, and data structures.",
					fee: 300
				},
				{
					id: "CS220",
					title: "Data Structures",
					department: "CS",
					credits: 4,
					schedule: "Tue/Thu 13:00-15:00",
					prerequisites: ["CS101"],
					syllabus: "Arrays, lists, trees, graphs, hashing, complexity.",
					fee: 450
				},
				{
					id: "MATH201",
					title: "Linear Algebra",
					department: "Math",
					credits: 3,
					schedule: "Fri 09:00-12:00",
					prerequisites: [],
					syllabus: "Matrices, vector spaces, eigenvalues, eigenvectors.",
					fee: 350
				}
			];
			var oDefault = { courses: aSeed };
			var oModel = new JSONModel();
			try {
				var s = localStorage.getItem(sKey);
				oModel.setData(s ? JSON.parse(s) : oDefault);
			} catch (e) {
				oModel.setData(oDefault);
			}
			oModel.attachPropertyChange(function() {
				localStorage.setItem(sKey, JSON.stringify(oModel.getData()));
			});
			return oModel;
		},

		/**
		 * Creates an enrollments model storing requests and statuses per user.
		 * @returns {sap.ui.model.json.JSONModel}
		 */
		createEnrollmentsModel: function () {
			var sKey = "enrollmentsData";
			var oDefault = { enrollments: [] }; // { id, courseId, username, status, paid, requestedAt }
			var oModel = new JSONModel();
			try {
				var s = localStorage.getItem(sKey);
				oModel.setData(s ? JSON.parse(s) : oDefault);
			} catch (e) {
				oModel.setData(oDefault);
			}
			oModel.attachPropertyChange(function() {
				localStorage.setItem(sKey, JSON.stringify(oModel.getData()));
			});
			return oModel;
		}
	};

});