sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/m/MessageBox",
	"sap/m/MessageToast"
], function(Controller, MessageBox, MessageToast) {
	"use strict";

	return Controller.extend("universitystudentlifecycle.controller.CourseDetails", {
		onInit: function() {
			this.getOwnerComponent().getRouter().getRoute("RouteCourseDetails").attachPatternMatched(this._onMatched, this);
		},

		_onMatched: function(oEvent) {
			var sCourseId = oEvent.getParameter("arguments").courseId;
			var aCourses = this.getOwnerComponent().getModel("courses").getProperty("/courses");
			var oCourse = aCourses.find(function(c){ return c.id === sCourseId; });
			this.getView().bindElement({
				path: "/courses/" + aCourses.indexOf(oCourse),
				model: "courses"
			});
		},

		onEnroll: function() {
			var oAuth = this.getOwnerComponent().getModel("auth").getData();
			if (!oAuth.isAuthenticated || !oAuth.user) {
				MessageToast.show("Please login first");
				this.getOwnerComponent().getRouter().navTo("RouteLoginPage");
				return;
			}
			var oCtx = this.getView().getBindingContext("courses");
			var oCourse = oCtx.getObject();

			// Dummy payment flow
			var sText = "Pay $" + oCourse.fee + " for " + oCourse.title + "?";
			var that = this;
			MessageBox.confirm(sText, {
				title: "Payment",
				onClose: function(oAction) {
					if (oAction === MessageBox.Action.OK) {
						that._submitEnrollment(oCourse, oAuth.user.username);
					}
				}
			});
		},

		_submitEnrollment: function(oCourse, sUsername) {
			var oEnrollModel = this.getOwnerComponent().getModel("enrollments");
			var a = oEnrollModel.getProperty("/enrollments");
			var bExists = a.some(function(e){ return e.courseId === oCourse.id && e.username === sUsername; });
			if (bExists) {
				MessageToast.show("Already requested for this course");
				return;
			}
			a.push({
				id: "ENR-" + Date.now(),
				courseId: oCourse.id,
				username: sUsername,
				status: "Pending Approval",
				paid: true,
				requestedAt: new Date().toISOString()
			});
			oEnrollModel.refresh(true);
			MessageToast.show("Enrollment request submitted");
			this.getOwnerComponent().getRouter().navTo("RouteEnrollmentStatus");
		},

		onNavCatalog: function() {
			this.getOwnerComponent().getRouter().navTo("RouteCourseCatalog");
		},
		onNavEnrollments: function() {
			this.getOwnerComponent().getRouter().navTo("RouteEnrollmentStatus");
		},
		onNavProfile: function() {
			this.getOwnerComponent().getRouter().navTo("RouteStudentProfile");
		},
		onNavAdmin: function() {
			var oAuth = this.getOwnerComponent().getModel("auth").getData();
			if (oAuth.isAuthenticated && oAuth.user && oAuth.user.role === "admin") {
				this.getOwnerComponent().getRouter().navTo("RouteAdmin");
			} else {
				MessageToast.show("Admin access only");
			}
		},
		onAuthAction: function() {
			var oComponent = this.getOwnerComponent();
			var oAuthModel = oComponent.getModel("auth");
			var oAuth = oAuthModel.getData();
			if (oAuth.isAuthenticated) {
				oAuthModel.setProperty("/isAuthenticated", false);
				oAuthModel.setProperty("/user", null);
				MessageToast.show("Logged out");
				oComponent.getRouter().navTo("RouteLoginPage");
			} else {
				oComponent.getRouter().navTo("RouteLoginPage");
			}
		}
	});
});

