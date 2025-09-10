sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast"
], (Controller, MessageToast) => {
    "use strict";

    return Controller.extend("universitystudentlifecycle.controller.student_lifecycle", {
        onInit() {
        },

        onNavigateToProfile: function() {
            this.getOwnerComponent().getRouter().navTo("RouteStudentProfile");
        },

        onNavCatalog: function() {
            this.getOwnerComponent().getRouter().navTo("RouteCourseCatalog");
        },

        onNavEnrollments: function() {
            this.getOwnerComponent().getRouter().navTo("RouteEnrollmentStatus");
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