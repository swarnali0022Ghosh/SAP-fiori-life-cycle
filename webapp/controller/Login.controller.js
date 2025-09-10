// Login.controller.js
sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast",
    "sap/m/MessageBox"
], function (Controller, MessageToast, MessageBox,BaseController) {
    "use strict";

    // Define roles constant
    const ROLES = {
        ADMIN: "A",
        STUDENT: "S"
    };

    return Controller.extend("universitystudentlifecycle.controller.Login", {

        onInit: function () {
            // Initialize any required data or models
            var oImg = this.byId("_IDGenImage");
            if (oImg) {
                // ensure the path is absolute from webapp root
                oImg.setSrc("./img/loginpage.png");
            }

            // Initialize roles
            this.ROLES = ROLES;

            // Check if user is already logged in
            this._checkExistingSession();
        },

        onLoginPress: function () {
            var sUsername = this.byId("userInput").getValue(); // This should be email
            var sPassword = this.byId("passwordInput").getValue();
            var oRouter = this.getOwnerComponent().getRouter();

            // Validate inputs
            if (!sUsername) {
                MessageToast.show("Please enter your email address");
                return;
            }

            if (!sPassword) {
                MessageToast.show("Please enter password");
                return;
            }

            // Authenticate against localStorage
            var authResult = this._authenticateUser(sUsername, sPassword);

            if (authResult.success) {
                // Create user session
                this._createUserSession(authResult.userProfile);

                // Update auth model
                var oAuthModel = this.getOwnerComponent().getModel("auth");
                var userRole = authResult.role === ROLES.ADMIN ? "admin" : "student";

                oAuthModel.setProperty("/isAuthenticated", true);
                oAuthModel.setProperty("/user", {
                    username: authResult.userProfile.contactInfo.email,
                    role: userRole,
                    firstName: authResult.userProfile.personalInfo.firstName,
                    lastName: authResult.userProfile.personalInfo.lastName
                });

                MessageToast.show("Login successful as " + userRole);

                // Navigate based on role
                this._navigateBasedOnRole(authResult.role);

            } else {
                MessageBox.error("Invalid email or password. Please check your credentials and try again.");
            }
        },

        _authenticateUser: function (email, password) {
            // Get all users from localStorage
            let allUsers = JSON.parse(localStorage.getItem("allUsers") || "[]");

            // Find user by email
            let user = allUsers.find(u => u.contactInfo.email.toLowerCase() === email.toLowerCase());

            if (user && user.isActive) {
                // Check password (using default password "1234")
                if (password === "1234") {
                    return {
                        success: true,
                        role: user.role,
                        userProfile: user
                    };
                }
            }

            return { success: false };
        },

        _createUserSession: function (userProfile) {
            // Store current session
            localStorage.setItem("currentUserSession", JSON.stringify({
                userId: userProfile.userId,
                email: userProfile.contactInfo.email,
                role: userProfile.role,
                firstName: userProfile.personalInfo.firstName,
                lastName: userProfile.personalInfo.lastName,
                loginTime: new Date().toISOString()
            }));

            // Store role-specific current profile
            if (userProfile.role === ROLES.ADMIN) {
                localStorage.setItem("currentAdminProfile", JSON.stringify(userProfile));
            } else {
                localStorage.setItem("currentStudentProfile", JSON.stringify(userProfile));
            }
        },

        _navigateBasedOnRole: function (role) {
            var oRouter = this.getOwnerComponent().getRouter();

            if (role === ROLES.ADMIN) {
                // Navigate to admin dashboard
                oRouter.navTo("RouteAdmin");
            } else {
                // Navigate to course catalog for students
                oRouter.navTo("RouteStudentProfile");
            }
        },

        _checkExistingSession: function () {
            let session = localStorage.getItem("currentUserSession");
            if (session) {
                let sessionData = JSON.parse(session);

                // Update auth model with existing session
                var oAuthModel = this.getOwnerComponent().getModel("auth");
                var userRole = sessionData.role === ROLES.ADMIN ? "admin" : "student";

                oAuthModel.setProperty("/isAuthenticated", true);
                oAuthModel.setProperty("/user", {
                    username: sessionData.email,
                    role: userRole,
                    firstName: sessionData.firstName,
                    lastName: sessionData.lastName
                });

                // Navigate to appropriate page
                this._navigateBasedOnRole(sessionData.role);
            }
        },

        // Add this function to handle register navigation
        onRegisterPress: function () {
            var oRouter = this.getOwnerComponent().getRouter();
            oRouter.navTo("register");  // This should match the route name in manifest.json
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
            var oComponent = this.getOwnerComponent();
            var oAuthModel = oComponent.getModel("auth");
            var oAuth = oAuthModel.getData();

            if (oAuth.isAuthenticated) {
                // Logout
                this._logout();
            } else {
                // Navigate to login
                oComponent.getRouter().navTo("RouteLoginPage");
            }
        },

        // Helper methods for checking user status
        getCurrentUser: function () {
            let session = localStorage.getItem("currentUserSession");
            return session ? JSON.parse(session) : null;
        },

        isAdmin: function () {
            let currentUser = this.getCurrentUser();
            return currentUser && currentUser.role === ROLES.ADMIN;
        },

        isStudent: function () {
            let currentUser = this.getCurrentUser();
            return currentUser && currentUser.role === ROLES.STUDENT;
        },

    });
});