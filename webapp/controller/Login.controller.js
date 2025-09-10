// Login.controller.js
sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast"
], function (Controller, MessageToast) {
    "use strict";

    return Controller.extend("universitystudentlifecycle.controller.Login", {

        onInit: function () {
            // Initialize any required data or models
            var oImg = this.byId("_IDGenImage");
            if (oImg) {
                // ensure the path is absolute from webapp root
                oImg.setSrc("./img/loginpage.png");
            }
        },

        onLoginPress: function () {
            var sUsername = this.byId("userInput").getValue();
            var sPassword = this.byId("passwordInput").getValue();
            var oRouter = this.getOwnerComponent().getRouter();

            // Validate inputs
            if (!sUsername) {
                MessageToast.show("Please enter username");
                return;
            }

            if (!sPassword) {
                MessageToast.show("Please enter password");
                return;
            }

            // Simple login: admin if username starts with admin, else student
            var oAuthModel = this.getOwnerComponent().getModel("auth");
            var sRole = (sUsername && sUsername.toLowerCase().indexOf("admin") === 0) ? "admin" : "student";
            oAuthModel.setProperty("/isAuthenticated", true);
            oAuthModel.setProperty("/user", { username: sUsername, role: sRole });

            MessageToast.show("Login successful as " + sRole);
            oRouter.navTo("RouteCourseCatalog");

            // Navigate to dashboard or main page
        },

        // Add this function to handle register navigation
        onRegisterPress: function () {
            var oRouter = this.getOwnerComponent().getRouter();
            oRouter.navTo("register");  // This should match the route name in manifest.json
        },

        onNavCatalog: function() { this.getOwnerComponent().getRouter().navTo("RouteCourseCatalog"); },
        onNavEnrollments: function() { this.getOwnerComponent().getRouter().navTo("RouteEnrollmentStatus"); },
        onNavProfile: function() { this.getOwnerComponent().getRouter().navTo("RouteStudentProfile"); },
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