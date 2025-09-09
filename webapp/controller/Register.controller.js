sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast",
    "sap/m/MessageBox"
], function (Controller, MessageToast, MessageBox) {
    "use strict";

    return Controller.extend("universitystudentlifecycle.controller.Register", {
        onInit: function () {
        },
        // Navigate to Login page
        onLoginPress: function () {
            var oRouter = this.getOwnerComponent().getRouter();
            oRouter.navTo("RouteLoginPage");  // must match manifest.json route name
        },
        onTypeMismatch: function (oEvent) {
            var sFileName = oEvent.getParameter("fileName");
            var sFileType = oEvent.getParameter("fileType");
            MessageBox.error("File type '" + sFileType + "' is not supported. Please select a valid file format.");
        },

        onFileSizeExceed: function (oEvent) {
            var sFileName = oEvent.getParameter("fileName");
            var sFileSize = oEvent.getParameter("fileSize");
            MessageBox.error("File size exceeds maximum allowed limit. Only 2MB files are accepted..");
        },
        onSubmit: function () {
            let oView = this.getView();

            let studentProfile = {
                personalInfo: {
                    firstName: oView.byId("firstName").getValue(),
                    lastName: oView.byId("lastName").getValue(),
                    dateOfBirth: oView.byId("dob").getValue(),
                    gender: oView.byId("gender").getSelectedKey(),
                    enrollmentId: oView.byId("enrollmentId").getValue(),
                    program: oView.byId("program").getValue(),
                    semester: oView.byId("semester").getValue(),
                    gpa: oView.byId("gpa").getValue()
                },
                contactInfo: {
                    email: oView.byId("email").getValue(),
                    phoneNumber: oView.byId("phone").getValue(),
                    address: {
                        street: oView.byId("street").getValue(),
                        city: oView.byId("city").getValue(),
                        state: oView.byId("state").getValue(),
                        zipCode: oView.byId("zipCode").getValue(),
                        country: oView.byId("country").getValue()
                    }
                },
                emergencyContact: {
                    name: oView.byId("emergencyName").getValue(),
                    relation: oView.byId("relation").getValue(),
                    phoneNumber: oView.byId("emergencyPhone").getValue(),
                    email: oView.byId("emergencyEmail").getValue()
                }
            };

            if (!oView.byId("terms").getSelected()) {
                MessageBox.error("Please accept the Terms and Conditions");
                return;
            }

            // For now, just show in console
            console.log("Student Profile Data:", studentProfile);

            MessageToast.show("Registration submitted successfully!");
        }
    });
});
