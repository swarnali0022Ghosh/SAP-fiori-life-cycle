sap.ui.define([
    "sap/ui/test/opaQunit",
    "universitystudentlifecycle/test/integration/pages/StudentProfile"
], function (opaTest) {
    "use strict";

    QUnit.module("Student Profile");

    opaTest("Should display student profile page", function (Given, When, Then) {
        // Given
        Given.iStartMyApp();

        // When
        When.onTheStudentProfilePage.iNavigateToProfile();

        // Then
        Then.onTheStudentProfilePage.iShouldSeeTheProfilePage();
    });

    opaTest("Should toggle edit mode", function (Given, When, Then) {
        // Given
        Given.iStartMyApp();
        When.onTheStudentProfilePage.iNavigateToProfile();

        // When
        When.onTheStudentProfilePage.iPressTheEditButton();

        // Then
        Then.onTheStudentProfilePage.iShouldBeInEditMode();
    });

    opaTest("Should validate required fields", function (Given, When, Then) {
        // Given
        Given.iStartMyApp();
        When.onTheStudentProfilePage.iNavigateToProfile();
        When.onTheStudentProfilePage.iPressTheEditButton();

        // When
        When.onTheStudentProfilePage.iClearRequiredFields();
        When.onTheStudentProfilePage.iPressTheSaveButton();

        // Then
        Then.onTheStudentProfilePage.iShouldSeeValidationErrors();
    });
});
