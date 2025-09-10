sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/m/MessageToast"
], function(Controller, Filter, FilterOperator, MessageToast) {
	"use strict";

	return Controller.extend("universitystudentlifecycle.controller.CourseCatalog", {
		onInit: function() {},

		onSearch: function(oEvent) {
			var sQuery = oEvent.getParameter("newValue") || oEvent.getParameter("query") || "";
			this._applyFilters(sQuery, this._sDept || "");
		},

		onFilterDepartment: function(oEvent) {
			this._sDept = oEvent.getSource().getSelectedKey();
			this._applyFilters(this._sQuery || "", this._sDept || "");
		},

		_applyFilters: function(sQuery, sDept) {
			this._sQuery = sQuery;
			var aFilters = [];
			if (sQuery) {
				aFilters.push(new Filter({
					filters: [
						new Filter("title", FilterOperator.Contains, sQuery),
						new Filter("id", FilterOperator.Contains, sQuery),
						new Filter("department", FilterOperator.Contains, sQuery)
					],
					and: false
				}));
			}
			if (sDept) {
				aFilters.push(new Filter("department", FilterOperator.EQ, sDept));
			}
			var oList = this.byId("courseList");
			var oBinding = oList.getBinding("items");
			oBinding.filter(aFilters);
		},

		onSelectCourse: function(oEvent) {
			var oCtx = oEvent.getParameter("listItem").getBindingContext("courses");
			var sCourseId = oCtx.getProperty("id");
			this.getOwnerComponent().getRouter().navTo("RouteCourseDetails", { courseId: sCourseId });
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

