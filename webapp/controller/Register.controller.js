sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast",
    "sap/m/MessageBox"
], function (Controller, MessageToast, MessageBox) {
    "use strict";

    // Define roles constant
    const ROLES = {
        ADMIN: "A",
        STUDENT: "S"
    };

    return Controller.extend("universitystudentlifecycle.controller.Register", {
        onInit: function () {
            // Initialize roles constant and uploaded files tracking
            this.ROLES = ROLES;
            this._uploadedFiles = {};
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
            MessageBox.error("File size exceeds maximum allowed limit. Please check the file size requirements.");
        },

        onFileChange: function (oEvent) {
            var oFileUploader = oEvent.getSource();
            var sFileName = oEvent.getParameter("newValue");
            var sUploaderId = oFileUploader.getId();
            
            if (sFileName) {
                // Store file information for later processing
                if (!this._uploadedFiles) {
                    this._uploadedFiles = {};
                }
                
                // Determine file type based on uploader ID
                let fileType = "";
                if (sUploaderId.includes("profilePhoto")) {
                    fileType = "Profile Photo";
                } else if (sUploaderId.includes("idDocs")) {
                    fileType = "ID Document";
                } else if (sUploaderId.includes("academicDocs")) {
                    fileType = "Academic Document";
                }
                
                this._uploadedFiles[sUploaderId] = {
                    fileName: sFileName,
                    fileType: fileType,
                    uploadDate: new Date().toISOString()
                };
                
                // Update upload status display
                this._updateUploadStatus();
                
                MessageToast.show(fileType + " selected: " + sFileName);
            }
        },

        _updateUploadStatus: function () {
            var oView = this.getView();
            var oStatusBox = oView.byId("uploadStatusBox");
            var oFilesList = oView.byId("uploadedFilesList");
            
            if (this._uploadedFiles && Object.keys(this._uploadedFiles).length > 0) {
                oStatusBox.setVisible(true);
                oFilesList.removeAllItems();
                
                Object.keys(this._uploadedFiles).forEach(uploaderId => {
                    var fileInfo = this._uploadedFiles[uploaderId];
                    var oListItem = new sap.m.StandardListItem({
                        title: fileInfo.fileName,
                        description: fileInfo.fileType,
                        icon: "sap-icon://document"
                    });
                    oFilesList.addItem(oListItem);
                });
            } else {
                oStatusBox.setVisible(false);
            }
        },

        onSubmit: function () {
            let oView = this.getView();

            // Automatically assign Student role for registration
            let selectedRole = ROLES.STUDENT;

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
                },
                // Document uploads information
                uploadedDocuments: this._uploadedFiles || {},
                // Role and authentication info - automatically set as Student
                role: ROLES.STUDENT,
                userId: this._generateUserId(ROLES.STUDENT),
                registrationDate: new Date().toISOString(),
                isActive: true
            };

            if (!oView.byId("terms").getSelected()) {
                MessageBox.error("Please accept the Terms and Conditions");
                return;
            }

            // Validate required fields
            if (!this._validateRequiredFields(studentProfile)) {
                MessageBox.error("Please fill in all required fields");
                return;
            }

            // Validate required documents
            if (!this._validateRequiredDocuments()) {
                MessageBox.error("Please upload required ID documents");
                return;
            }

            try {
                // Store in localStorage
                this._saveToLocalStorage(studentProfile);
                
                // Show success message
                MessageToast.show("Student registration submitted successfully!");
                
                // Clear the form after successful submission
                this._clearForm();
                
                // Navigate to login page after registration
                this.onLoginPress();
                
            } catch (error) {
                console.error("Error saving to localStorage:", error);
                MessageBox.error("Failed to save registration data. Please try again.");
            }
        },

        _generateUserId: function (role) {
            const timestamp = Date.now();
            const rolePrefix = role === ROLES.ADMIN ? "ADM" : "STU";
            return `${rolePrefix}${timestamp}`;
        },

        _saveToLocalStorage: function (studentProfile) {
            // Since registration is only for students, save as student profile
            this._saveStudentProfile(studentProfile);
            
            // Save to general users array for authentication
            this._saveToUsersArray(studentProfile);
            
            console.log("Student Profile saved to localStorage:", studentProfile);
        },

        _saveStudentProfile: function (studentProfile) {
            // Get existing students array or create new one
            let existingStudents = JSON.parse(localStorage.getItem("studentProfiles") || "[]");
            
            // Check if student with same email already exists (since enrollment ID is optional)
            let existingIndex = existingStudents.findIndex(student => 
                student.contactInfo.email === studentProfile.contactInfo.email
            );
            
            if (existingIndex !== -1) {
                existingStudents[existingIndex] = studentProfile;
                MessageToast.show("Student profile updated successfully!");
            } else {
                existingStudents.push(studentProfile);
            }
            
            localStorage.setItem("studentProfiles", JSON.stringify(existingStudents));
            localStorage.setItem("currentStudentProfile", JSON.stringify(studentProfile));
        },

        _saveToUsersArray: function (studentProfile) {
            // Maintain a general users array for authentication purposes
            let allUsers = JSON.parse(localStorage.getItem("allUsers") || "[]");
            
            let existingUserIndex = allUsers.findIndex(user => 
                user.contactInfo.email === studentProfile.contactInfo.email
            );
            
            if (existingUserIndex !== -1) {
                allUsers[existingUserIndex] = studentProfile;
            } else {
                allUsers.push(studentProfile);
            }
            
            localStorage.setItem("allUsers", JSON.stringify(allUsers));
        },

        _validateRequiredFields: function (studentProfile) {
            // Required fields for student registration
            if (!studentProfile.personalInfo.firstName || 
                !studentProfile.personalInfo.lastName || 
                !studentProfile.contactInfo.email || 
                !studentProfile.contactInfo.phoneNumber) {
                return false;
            }
            
            return true;
        },

        _validateRequiredDocuments: function () {
            // Check if required ID documents are uploaded
            if (!this._uploadedFiles) {
                return false;
            }
            
            // Check for ID document upload
            let hasIdDocument = Object.keys(this._uploadedFiles).some(uploaderId => 
                uploaderId.includes("idDocs") && this._uploadedFiles[uploaderId].fileName
            );
            
            return hasIdDocument;
        },

        _clearForm: function () {
            let oView = this.getView();
            
            // Clear all form fields
            oView.byId("firstName").setValue("");
            oView.byId("lastName").setValue("");
            oView.byId("dob").setValue("");
            oView.byId("gender").setSelectedKey("");
            oView.byId("email").setValue("");
            oView.byId("phone").setValue("");
            oView.byId("street").setValue("");
            oView.byId("city").setValue("");
            oView.byId("state").setValue("");
            oView.byId("zipCode").setValue("");
            oView.byId("country").setValue("");
            
            // Clear student-specific fields
            if (oView.byId("enrollmentId")) oView.byId("enrollmentId").setValue("");
            if (oView.byId("program")) oView.byId("program").setValue("");
            if (oView.byId("semester")) oView.byId("semester").setValue("");
            if (oView.byId("gpa")) oView.byId("gpa").setValue("");
            if (oView.byId("emergencyName")) oView.byId("emergencyName").setValue("");
            if (oView.byId("relation")) oView.byId("relation").setValue("");
            if (oView.byId("emergencyPhone")) oView.byId("emergencyPhone").setValue("");
            if (oView.byId("emergencyEmail")) oView.byId("emergencyEmail").setValue("");
            
            // Clear file uploads
            if (oView.byId("profilePhotoUpload")) oView.byId("profilePhotoUpload").setValue("");
            if (oView.byId("idDocsUpload")) oView.byId("idDocsUpload").setValue("");
            if (oView.byId("academicDocsUpload")) oView.byId("academicDocsUpload").setValue("");
            
            // Clear uploaded files tracking
            this._uploadedFiles = {};
            this._updateUploadStatus();
            
            // Uncheck terms
            oView.byId("terms").setSelected(false);
        },

        // Helper methods for retrieving data
        getStudentByEnrollmentId: function (enrollmentId) {
            let students = JSON.parse(localStorage.getItem("studentProfiles") || "[]");
            return students.find(student => 
                student.personalInfo.enrollmentId === enrollmentId
            );
        },

        getAllStudents: function () {
            return JSON.parse(localStorage.getItem("studentProfiles") || "[]");
        },

        getUserByEmail: function (email) {
            let allUsers = JSON.parse(localStorage.getItem("allUsers") || "[]");
            return allUsers.find(user => user.contactInfo.email === email);
        },

        getCurrentUserRole: function () {
            // Get current user from session or localStorage
            let currentStudent = localStorage.getItem("currentStudentProfile");
            
            if (currentStudent) return ROLES.STUDENT;
            return null;
        },

        // Authentication helper
        authenticateUser: function (email, password) {
            let user = this.getUserByEmail(email);
            if (user && user.isActive) {
                // In a real app, you'd hash and compare passwords
                // For now, just return the user role
                return {
                    success: true,
                    role: user.role,
                    userProfile: user
                };
            }
            return { success: false };
        }
    });
});