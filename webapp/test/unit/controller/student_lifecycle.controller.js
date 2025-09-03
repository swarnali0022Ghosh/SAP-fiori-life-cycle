/*global QUnit*/

sap.ui.define([
	"universitystudentlifecycle/controller/student_lifecycle.controller"
], function (Controller) {
	"use strict";

	QUnit.module("student_lifecycle Controller");

	QUnit.test("I should test the student_lifecycle controller", function (assert) {
		var oAppController = new Controller();
		oAppController.onInit();
		assert.ok(oAppController);
	});

});
