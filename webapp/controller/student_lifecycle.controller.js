sap.ui.define([
    "sap/ui/core/mvc/Controller"
], (Controller) => {
    "use strict";

    return Controller.extend("universitystudentlifecycle.controller.student_lifecycle", {
        onInit() {
        },

        onNavigateToProfile: function() {
            this.getOwnerComponent().getRouter().navTo("RouteStudentProfile");
        }
    });
});