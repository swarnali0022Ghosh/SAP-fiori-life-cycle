sap.ui.define([
  "sap/ui/core/mvc/Controller",
  "sap/m/MessageToast"
], (BaseController, MessageToast) => {
  "use strict";

  return BaseController.extend("universitystudentlifecycle.controller.App", {
    onInit() {
    },

    onNavCatalog: function () {
      this.getOwnerComponent().getRouter().navTo("RouteCourseCatalog");
    },

    onNavEnrollments: function () {
      this.getOwnerComponent().getRouter().navTo("RouteEnrollmentStatus");
    },

    onNavProfile: function () {
      this.getOwnerComponent().getRouter().navTo("RouteStudentProfile");
    },

    onNavAdmin: function () {
      var oAuth = this.getOwnerComponent().getModel("auth").getData();
      if (oAuth.isAuthenticated && oAuth.user && oAuth.user.role === "admin") {
        this.getOwnerComponent().getRouter().navTo("RouteAdmin");
      } else {
        MessageToast.show("Admin access only");
      }
    },

    onAuthAction: function () {
      console.log("onAuthAction called"); // Debug log

      var oComponent = this.getOwnerComponent();
      var oAuthModel = oComponent.getModel("auth");

      console.log("Auth model:", oAuthModel); // Debug log

      if (!oAuthModel) {
        console.error("Auth model not found!");
        return;
      }

      var oAuth = oAuthModel.getData();
      console.log("Auth data:", oAuth); // Debug log

      if (oAuth && oAuth.isAuthenticated) {
        console.log("User is authenticated, logging out"); // Debug log
        this._logout();
      } else {
        console.log("User not authenticated, going to login"); // Debug log
        oComponent.getRouter().navTo("RouteLoginPage");
      }
    },

    _logout: function () {
      console.log("_logout called"); // Debug log

      // Clear all session data
      localStorage.removeItem("currentUserSession");
      localStorage.removeItem("currentAdminProfile");
      localStorage.removeItem("currentStudentProfile");
      localStorage.removeItem("authData"); // Add this line - it's the key your auth model uses

      console.log("Local storage cleared"); // Debug log

      // Clear auth model
      var oAuthModel = this.getOwnerComponent().getModel("auth");
      oAuthModel.setProperty("/isAuthenticated", false);
      oAuthModel.setProperty("/user", null);

      console.log("Auth model cleared"); // Debug log

      MessageToast.show("Logged out successfully");

      // Navigate back to login
      this.getOwnerComponent().getRouter().navTo("RouteLoginPage");
      console.log("Navigation to login initiated"); // Debug log
    }
  });
});