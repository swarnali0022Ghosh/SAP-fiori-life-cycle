// Login.controller.js
sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast"
], function (Controller, MessageToast) {
    "use strict";

    return Controller.extend("universitystudentlifecycle.controller.Login", {

        onInit: function () {
            // Initialize any required data or models
        },

        onLoginPress: function () {
            var sUsername = this.byId("userInput").getValue();
            var sPassword = this.byId("passwordInput").getValue();

            // Validate inputs
            if (!sUsername) {
                MessageToast.show("Please enter username");
                return;
            }

            if (!sPassword) {
                MessageToast.show("Please enter password");
                return;
            }

            // Your login logic here
            MessageToast.show("Login successful!");

            // Navigate to dashboard or main page
        },

        // Add this function to handle register navigation
        onRegisterPress: function () {
            var oRouter = this.getOwnerComponent().getRouter();
            oRouter.navTo("register");  // This should match the route name in manifest.json
        }
    });
});