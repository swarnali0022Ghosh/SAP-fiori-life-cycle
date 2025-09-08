sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageBox",
    "sap/m/MessageToast",
    "sap/ui/core/format/DateFormat",
    "sap/ui/model/json/JSONModel"
], function (Controller, MessageBox, MessageToast, DateFormat, JSONModel) {
    "use strict";

    return Controller.extend("universitystudentlifecycle.controller.StudentProfile", {
        
        onInit: function () {
            console.log("StudentProfile controller initialized");
            
            // Initialize the view model for UI state
            var oViewModel = new JSONModel({
                editMode: false,
                isSaving: false,
                originalData: null
            });
            this.getView().setModel(oViewModel, "viewModel");
            
            // Get the main student profile model
            this.oStudentModel = this.getOwnerComponent().getModel("studentProfile");
            console.log("Student model retrieved:", this.oStudentModel);
            
            // Load profile photo from localStorage if available
            this._loadProfilePhotoFromStorage();
            
            // Get current data
            var oCurrentData = this.oStudentModel.getData();
            console.log("Current model data:", oCurrentData);
            
            // Store original data for cancel functionality
            this._storeOriginalData();
        },

        onAfterRendering: function () {
            console.log("View rendered, setting up form validation");
            // Set up form validation
            this._setupFormValidation();
        },



        /**
         * Toggle between view and edit modes
         */
        onToggleEditMode: function () {
            var oViewModel = this.getView().getModel("viewModel");
            var bEditMode = oViewModel.getProperty("/editMode");
            
            if (bEditMode) {
                // Cancel edit mode - restore original data
                this._restoreOriginalData();
                oViewModel.setProperty("/editMode", false);
                MessageToast.show("Changes cancelled");
            } else {
                // Enter edit mode - store current data as original
                this._storeOriginalData();
                oViewModel.setProperty("/editMode", true);
            }
        },

        /**
         * Save profile changes
         */
        onSaveProfile: function () {
            var that = this;
            var oViewModel = this.getView().getModel("viewModel");
            
            // Validate form data
            if (!this._validateForm()) {
                return;
            }
            
            oViewModel.setProperty("/isSaving", true);
            
            // Simulate save operation
            setTimeout(function () {
                // Update local storage with complete profile data including photo
                localStorage.setItem("studentProfileData", JSON.stringify(that.oStudentModel.getData()));
                
                oViewModel.setProperty("/isSaving", false);
                oViewModel.setProperty("/editMode", false);
                
                MessageToast.show("Profile saved successfully");
            }, 1500);
        },

        /**
         * Navigate back
         */
        onNavBack: function () {
            var oViewModel = this.getView().getModel("viewModel");
            
            if (oViewModel.getProperty("/editMode")) {
                MessageBox.confirm("You have unsaved changes. Do you want to discard them?", {
                    onClose: function (sAction) {
                        if (sAction === MessageBox.Action.OK) {
                            this._restoreOriginalData();
                            this.getOwnerComponent().getRouter().navTo("Routestudent_lifecycle");
                        }
                    }.bind(this)
                });
            } else {
                this.getOwnerComponent().getRouter().navTo("Routestudent_lifecycle");
            }
        },

        /**
         * Handle profile photo upload
         */
        onUploadPhoto: function () {
            // Always use the file input directly for better control and user experience
            this._createFileInput();
        },

        /**
         * Create a file input element for photo upload
         */
        _createFileInput: function () {
            var that = this;
            var oFileInput = document.createElement("input");
            oFileInput.type = "file";
            oFileInput.accept = "image/jpeg,image/jpg,image/png";
            oFileInput.style.display = "none";
            oFileInput.id = "profilePhotoInput";
            
            oFileInput.onchange = function (oEvent) {
                var oFile = oEvent.target.files[0];
                if (oFile) {
                    // Show loading message
                    MessageToast.show("Processing image...");
                    that._handleFileUpload(oFile);
                }
                // Clean up the file input element
                if (document.body.contains(oFileInput)) {
                    document.body.removeChild(oFileInput);
                }
            };
            
            oFileInput.onerror = function () {
                MessageBox.error("Error accessing file. Please try again.");
                if (document.body.contains(oFileInput)) {
                    document.body.removeChild(oFileInput);
                }
            };
            
            document.body.appendChild(oFileInput);
            oFileInput.click();
        },

        /**
         * Handle file upload
         */
        _handleFileUpload: function (oFile) {
            var that = this;
            
            // Validate file size (max 5MB for localStorage)
            if (oFile.size > 5 * 1024 * 1024) {
                MessageBox.error("File size too large. Please select an image smaller than 5MB.");
                return;
            }
            
            // Validate file type
            if (!oFile.type.match(/^image\/(jpeg|jpg|png)$/)) {
                MessageBox.error("Please select a valid image file (JPEG, JPG, or PNG).");
                return;
            }
            
            var oReader = new FileReader();
            
            oReader.onload = function (oEvent) {
                var sBase64 = oEvent.target.result;
                that.oStudentModel.setProperty("/studentProfile/personalInfo/profilePhoto", sBase64);
                
                // Save to localStorage immediately
                that._saveProfilePhotoToStorage(sBase64);
                
                MessageToast.show("Profile photo uploaded successfully");
            };
            
            oReader.onerror = function () {
                MessageBox.error("Error reading file. Please try again.");
            };
            
            oReader.readAsDataURL(oFile);
        },

        /**
         * Handle file upload completion
         */
        onUploadComplete: function (oEvent) {
            var oFileUploader = this.byId("fileUploader");
            var sResponse = oEvent.getParameter("response");
            
            if (sResponse) {
                try {
                    var oResponse = JSON.parse(sResponse);
                    if (oResponse.success) {
                        // Update the profile photo URL
                        this.oStudentModel.setProperty("/studentProfile/personalInfo/profilePhoto", oResponse.photoUrl);
                        // Save to localStorage
                        this._saveProfilePhotoToStorage(oResponse.photoUrl);
                        MessageToast.show("Profile photo uploaded successfully");
                    } else {
                        MessageBox.error("Failed to upload photo: " + oResponse.message);
                    }
                } catch (e) {
                    // Handle case where server response is not available
                    // The photo should already be handled by _handleFileUpload method
                    console.log("Server response not available, photo handled locally");
                }
            }
            
            if (oFileUploader) {
                oFileUploader.setVisible(false);
            }
        },

        /**
         * Handle profile photo press (preview)
         */
        onProfilePhotoPress: function () {
            var sPhotoUrl = this.oStudentModel.getProperty("/studentProfile/personalInfo/profilePhoto");
            if (sPhotoUrl && sPhotoUrl.trim() !== "") {
                // Update the preview image source
                var oPreviewImage = this.byId("previewImage");
                if (oPreviewImage) {
                    oPreviewImage.setSrc(sPhotoUrl);
                }
                
                // Open the preview dialog
                var oDialog = this.byId("imagePreviewDialog");
                if (oDialog) {
                    oDialog.open();
                }
            } else {
                MessageToast.show("No profile photo available");
            }
        },

        /**
         * Close image preview dialog
         */
        onCloseImagePreview: function () {
            var oDialog = this.byId("imagePreviewDialog");
            if (oDialog) {
                oDialog.close();
            }
        },

        /**
         * Remove profile photo
         */
        onRemovePhoto: function () {
            MessageBox.confirm("Are you sure you want to remove your profile photo?", {
                onClose: function (sAction) {
                    if (sAction === MessageBox.Action.OK) {
                        this.oStudentModel.setProperty("/studentProfile/personalInfo/profilePhoto", "");
                        // Remove from localStorage
                        this._saveProfilePhotoToStorage("");
                        MessageToast.show("Profile photo removed");
                    }
                }.bind(this)
            });
        },

        /**
         * Store original data for cancel functionality
         */
        _storeOriginalData: function () {
            var oViewModel = this.getView().getModel("viewModel");
            var oData = this.oStudentModel.getData();
            oViewModel.setProperty("/originalData", JSON.parse(JSON.stringify(oData)));
            console.log("Original data stored:", oData);
        },

        /**
         * Restore original data
         */
        _restoreOriginalData: function () {
            var oViewModel = this.getView().getModel("viewModel");
            var oOriginalData = oViewModel.getProperty("/originalData");
            if (oOriginalData) {
                this.oStudentModel.setData(oOriginalData);
                console.log("Original data restored:", oOriginalData);
            } else {
                // If no original data, try to load from localStorage
                this._loadProfilePhotoFromStorage();
            }
        },

        /**
         * Validate form data
         */
        _validateForm: function () {
            var oData = this.oStudentModel.getData();
            var aErrors = [];

            // Validate personal information
            if (!oData.studentProfile.personalInfo.firstName || oData.studentProfile.personalInfo.firstName.trim() === "") {
                aErrors.push("First Name is required");
            }
            if (!oData.studentProfile.personalInfo.lastName || oData.studentProfile.personalInfo.lastName.trim() === "") {
                aErrors.push("Last Name is required");
            }
            if (!oData.studentProfile.personalInfo.dateOfBirth) {
                aErrors.push("Date of Birth is required");
            }
            if (!oData.studentProfile.personalInfo.gender) {
                aErrors.push("Gender is required");
            }

            // Validate contact information
            if (!oData.studentProfile.contactInfo.email || oData.studentProfile.contactInfo.email.trim() === "") {
                aErrors.push("Email is required");
            } else if (!this._isValidEmail(oData.studentProfile.contactInfo.email)) {
                aErrors.push("Please enter a valid email address");
            }
            if (!oData.studentProfile.contactInfo.phoneNumber || oData.studentProfile.contactInfo.phoneNumber.trim() === "") {
                aErrors.push("Phone Number is required");
            }

            // Validate emergency contact
            if (!oData.studentProfile.emergencyContact.name || oData.studentProfile.emergencyContact.name.trim() === "") {
                aErrors.push("Emergency Contact Name is required");
            }
            if (!oData.studentProfile.emergencyContact.relation || oData.studentProfile.emergencyContact.relation.trim() === "") {
                aErrors.push("Emergency Contact Relation is required");
            }
            if (!oData.studentProfile.emergencyContact.phoneNumber || oData.studentProfile.emergencyContact.phoneNumber.trim() === "") {
                aErrors.push("Emergency Contact Phone Number is required");
            }

            if (aErrors.length > 0) {
                MessageBox.error("Please correct the following errors:\n\n" + aErrors.join("\n"));
                return false;
            }

            return true;
        },

        /**
         * Validate email format
         */
        _isValidEmail: function (sEmail) {
            var oEmailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return oEmailRegex.test(sEmail);
        },

        /**
         * Set up form validation
         */
        _setupFormValidation: function () {
            // Add validation to form fields
            var aForms = [
                this.byId("personalInfoForm"),
                this.byId("contactInfoForm"),
                this.byId("emergencyContactForm")
            ];

            aForms.forEach(function (oForm) {
                if (oForm) {
                    oForm.attachValidateFieldGroup(function (oEvent) {
                        // Handle field group validation if needed
                    });
                }
            });
        },

        /**
         * Load profile photo from localStorage
         */
        _loadProfilePhotoFromStorage: function () {
            var sStoredPhoto = localStorage.getItem("studentProfileData");
            if (sStoredPhoto) {
                try {
                    var oData = JSON.parse(sStoredPhoto);
                    if (oData.studentProfile && oData.studentProfile.personalInfo && oData.studentProfile.personalInfo.profilePhoto) {
                        this.oStudentModel.setProperty("/studentProfile/personalInfo/profilePhoto", oData.studentProfile.personalInfo.profilePhoto);
                        console.log("Profile photo loaded from storage:", oData.studentProfile.personalInfo.profilePhoto);
                    }
                } catch (e) {
                    console.error("Error loading profile photo from storage:", e);
                }
            } else {
                // If no stored data exists, save the current default data to localStorage
                this._saveProfilePhotoToStorage("");
                console.log("Initialized localStorage with default profile data");
            }
        },

        /**
         * Save profile photo to localStorage
         */
        _saveProfilePhotoToStorage: function (sPhotoData) {
            try {
                var oCurrentData = this.oStudentModel.getData();
                oCurrentData.studentProfile.personalInfo.profilePhoto = sPhotoData;
                localStorage.setItem("studentProfileData", JSON.stringify(oCurrentData));
                console.log("Profile photo saved to storage");
            } catch (e) {
                console.error("Error saving profile photo to storage:", e);
                if (e.name === "QuotaExceededError") {
                    MessageBox.error("Storage limit exceeded. Please try with a smaller image or clear some browser data.");
                } else {
                    MessageBox.error("Failed to save profile photo to local storage");
                }
            }
        }
    });
});
