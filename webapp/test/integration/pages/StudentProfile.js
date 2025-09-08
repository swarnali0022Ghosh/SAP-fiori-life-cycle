sap.ui.define([
    "sap/ui/test/Opa5",
    "sap/ui/test/actions/Press",
    "sap/ui/test/actions/EnterText",
    "sap/ui/test/matchers/PropertyStrictEquals",
    "sap/ui/test/matchers/AggregationLengthEquals",
    "sap/ui/test/matchers/Ancestor"
], function (Opa5, Press, EnterText, PropertyStrictEquals, AggregationLengthEquals, Ancestor) {
    "use strict";

    var sViewName = "universitystudentlifecycle.view.StudentProfile";

    Opa5.createPageObjects({
        onTheStudentProfilePage: {
            viewName: sViewName,

            actions: {
                iNavigateToProfile: function () {
                    return this.waitFor({
                        id: "page",
                        viewName: "universitystudentlifecycle.view.student_lifecycle",
                        actions: new Press(),
                        errorMessage: "Could not find the student lifecycle page"
                    });
                },

                iPressTheEditButton: function () {
                    return this.waitFor({
                        id: "editButton",
                        actions: new Press(),
                        errorMessage: "Could not find the edit button"
                    });
                },

                iPressTheSaveButton: function () {
                    return this.waitFor({
                        id: "saveButton",
                        actions: new Press(),
                        errorMessage: "Could not find the save button"
                    });
                },

                iClearRequiredFields: function () {
                    return this.waitFor({
                        id: "personalInfoForm",
                        success: function (oForm) {
                            // Clear required fields
                            var oFirstNameInput = oForm.getContent()[1]; // First Name input
                            var oLastNameInput = oForm.getContent()[3]; // Last Name input
                            
                            if (oFirstNameInput && oFirstNameInput.setValue) {
                                oFirstNameInput.setValue("");
                            }
                            if (oLastNameInput && oLastNameInput.setValue) {
                                oLastNameInput.setValue("");
                            }
                        },
                        errorMessage: "Could not find the personal info form"
                    });
                },

                iUploadPhoto: function () {
                    return this.waitFor({
                        id: "uploadPhotoButton",
                        actions: new Press(),
                        errorMessage: "Could not find the upload photo button"
                    });
                }
            },

            assertions: {
                iShouldSeeTheProfilePage: function () {
                    return this.waitFor({
                        id: "studentProfilePage",
                        success: function () {
                            Opa5.assert.ok(true, "The student profile page was displayed");
                        },
                        errorMessage: "Could not find the student profile page"
                    });
                },

                iShouldBeInEditMode: function () {
                    return this.waitFor({
                        id: "saveButton",
                        success: function () {
                            Opa5.assert.ok(true, "The save button is visible, indicating edit mode");
                        },
                        errorMessage: "Could not find the save button in edit mode"
                    });
                },

                iShouldSeeValidationErrors: function () {
                    return this.waitFor({
                        controlType: "sap.m.MessageBox",
                        success: function () {
                            Opa5.assert.ok(true, "Validation error message was displayed");
                        },
                        errorMessage: "No validation error message was displayed"
                    });
                },

                iShouldSeeProfilePhoto: function () {
                    return this.waitFor({
                        id: "profileAvatar",
                        success: function (oAvatar) {
                            Opa5.assert.ok(oAvatar.getSrc(), "Profile photo is displayed");
                        },
                        errorMessage: "Could not find the profile avatar"
                    });
                }
            }
        }
    });
});
