sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/m/MessageToast",
	"sap/m/Dialog",
	"sap/m/Button",
	"sap/m/Label",
	"sap/m/Input",
	"sap/m/VBox"
], function(Controller, MessageToast, Dialog, Button, Label, Input, VBox) {
	"use strict";

	return Controller.extend("universitystudentlifecycle.controller.Admin", {
		onInit: function() {
			var oAuth = this.getOwnerComponent().getModel("auth").getData();
			if (!(oAuth.isAuthenticated && oAuth.user && oAuth.user.role === "admin")) {
				MessageToast.show("Admin access only");
				this.getOwnerComponent().getRouter().navTo("RouteLoginPage");
			}
		},

		onAdd: function() {
			var oDialog = this._createCourseDialog();
			oDialog.open();
		},

		onEdit: function(oEvent) {
			var oCtx = oEvent.getSource().getParent().getParent().getBindingContext("courses");
			var oDialog = this._createCourseDialog(oCtx.getObject(), oCtx.getPath());
			oDialog.open();
		},

		onDelete: function(oEvent) {
			var oModel = this.getOwnerComponent().getModel("courses");
			var a = oModel.getProperty("/courses");
			var oCtx = oEvent.getSource().getParent().getParent().getBindingContext("courses");
			var idx = parseInt(oCtx.getPath().split("/").pop(), 10);
			a.splice(idx, 1);
			oModel.refresh(true);
			MessageToast.show("Course deleted");
		},

		onApprove: function(oEvent) {
			this._setReqStatus(oEvent, "Approved");
		},

		onReject: function(oEvent) {
			this._setReqStatus(oEvent, "Rejected");
		},

		_setReqStatus: function(oEvent, sStatus) {
			var oModel = this.getOwnerComponent().getModel("enrollments");
			var oCtx = oEvent.getSource().getParent().getParent().getBindingContext("enrollments");
			var oItem = oCtx.getObject();
			oItem.status = sStatus;
			oModel.refresh(true);
			MessageToast.show("Request " + sStatus.toLowerCase());
		},

		onNavCatalog: function() { this.getOwnerComponent().getRouter().navTo("RouteCourseCatalog"); },
		onNavEnrollments: function() { this.getOwnerComponent().getRouter().navTo("RouteEnrollmentStatus"); },
		onNavProfile: function() { this.getOwnerComponent().getRouter().navTo("RouteStudentProfile"); },
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
		},

		_createCourseDialog: function(oData, sPath) {
			var that = this;
			var oId = new Input({ placeholder: "ID", value: oData && oData.id });
			var oTitle = new Input({ placeholder: "Title", value: oData && oData.title });
			var oDept = new Input({ placeholder: "Department", value: oData && oData.department });
			var oCredits = new Input({ placeholder: "Credits", type: "Number", value: oData && oData.credits });
			var oSchedule = new Input({ placeholder: "Schedule", value: oData && oData.schedule });
			var oPrereq = new Input({ placeholder: "Prerequisites (comma) ", value: oData && (oData.prerequisites || []).join(", ") });
			var oSyllabus = new Input({ placeholder: "Syllabus", value: oData && oData.syllabus });
			var oFee = new Input({ placeholder: "Fee (USD)", type: "Number", value: oData && oData.fee });

			var oDialog = new Dialog({
				title: (oData ? "Edit" : "Add") + " Course",
				content: new VBox({ items: [oId, oTitle, oDept, oCredits, oSchedule, oPrereq, oSyllabus, oFee] }),
				beginButton: new Button({
					text: "Save",
					press: function(){
						var oModel = that.getOwnerComponent().getModel("courses");
						var a = oModel.getProperty("/courses");
						var oNew = {
							id: oId.getValue(),
							title: oTitle.getValue(),
							department: oDept.getValue(),
							credits: Number(oCredits.getValue()) || 0,
							schedule: oSchedule.getValue(),
							prerequisites: (oPrereq.getValue() || "").split(",").map(function(s){return s.trim();}).filter(Boolean),
							syllabus: oSyllabus.getValue(),
							fee: Number(oFee.getValue()) || 0
						};
						if (sPath) {
							var idx = parseInt(sPath.split("/").pop(), 10);
							a[idx] = oNew;
						} else {
							a.push(oNew);
						}
						oModel.refresh(true);
						MessageToast.show("Saved");
						oDialog.close();
					}
				}),
				endButton: new Button({ text: "Cancel", press: function(){ oDialog.close(); } })
			});
			oDialog.attachAfterClose(function(){ oDialog.destroy(); });
			return oDialog;
		}
	});
});

