sap.ui.define([
    "sap/ui/core/UIComponent",
    "universitystudentlifecycle/model/models"
], (UIComponent, models) => {
    "use strict";

    return UIComponent.extend("universitystudentlifecycle.Component", {
        metadata: {
            manifest: "json",
            interfaces: [
                "sap.ui.core.IAsyncContentCreation"
            ]
        },

        init() {
            // call the base component's init function
            UIComponent.prototype.init.apply(this, arguments);

            // set the device model
            this.setModel(models.createDeviceModel(), "device");

            // set the student profile model
            this.setModel(models.createStudentProfileModel(), "studentProfile");

            // set auth, courses, and enrollments models
            this.setModel(models.createAuthModel(), "auth");
            this.setModel(models.createCoursesModel(), "courses");
            this.setModel(models.createEnrollmentsModel(), "enrollments");

            // enable routing
            this.getRouter().initialize();
        }
    });
});