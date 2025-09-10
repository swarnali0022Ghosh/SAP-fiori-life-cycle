sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/m/MessageToast",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator"
], function(Controller, MessageToast, Filter, FilterOperator) {
	"use strict";

	return Controller.extend("universitystudentlifecycle.controller.EnrollmentStatus", {
		onInit: function() {
			this._filterForUser();
		},

		onAfterRendering: function(){
			this._filterForUser();
		},

		_filterForUser: function(){
			var oAuth = this.getOwnerComponent().getModel("auth").getData();
			if (!oAuth.isAuthenticated) {
				this.getOwnerComponent().getRouter().navTo("RouteLoginPage");
				return;
			}
			// Filter list on binding level
			var oList = this.byId("enrollList");
			if (!oList) { return; }
			var oBinding = oList.getBinding("items");
			if (oBinding) {
				oBinding.filter(new Filter("username", FilterOperator.EQ, oAuth.user.username));
			}
		},

		onCancel: function(oEvent) {
			var oCtx = oEvent.getSource().getBindingContext("enrollments") || oEvent.getSource().getParent().getParent().getBindingContext("enrollments");
			var oItem = oCtx && oCtx.getObject();
			var oModel = this.getOwnerComponent().getModel("enrollments");
			var a = oModel.getProperty("/enrollments");
			var idx = oItem ? a.findIndex(function(e){ return e.id === oItem.id; }) : -1;
			if (idx > -1) {
				a.splice(idx, 1);
				oModel.refresh(true);
				MessageToast.show("Enrollment cancelled");
			}
		}
	});
});

