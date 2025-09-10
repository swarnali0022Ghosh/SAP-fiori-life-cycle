sap.ui.define([
  "sap/ui/core/mvc/Controller",
  "sap/m/MessageToast"
], (BaseController, MessageToast) => {
  "use strict";

  return BaseController.extend("universitystudentlifecycle.controller.App", {
      onInit() {
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
          // logout
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