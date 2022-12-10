/*global QUnit*/

jQuery.sap.require("sap.ui.qunit.qunit-css");
jQuery.sap.require("sap.ui.thirdparty.qunit");
jQuery.sap.require("sap.ui.qunit.qunit-junit");
QUnit.config.autostart = false;

sap.ui.require([
	"sap/ui/test/Opa5",
	"com/app/shiftif/ZVS_SHIFT_IF/test/integration/pages/Common",
	"sap/ui/test/opaQunit",
	"com/app/shiftif/ZVS_SHIFT_IF/test/integration/pages/Worklist",
	"com/app/shiftif/ZVS_SHIFT_IF/test/integration/pages/Object",
	"com/app/shiftif/ZVS_SHIFT_IF/test/integration/pages/NotFound",
	"com/app/shiftif/ZVS_SHIFT_IF/test/integration/pages/Browser",
	"com/app/shiftif/ZVS_SHIFT_IF/test/integration/pages/App"
], function (Opa5, Common) {
	"use strict";
	Opa5.extendConfig({
		arrangements: new Common(),
		viewNamespace: "com.app.shiftif.ZVS_SHIFT_IF.view."
	});

	sap.ui.require([
		"com/app/shiftif/ZVS_SHIFT_IF/test/integration/WorklistJourney",
		"com/app/shiftif/ZVS_SHIFT_IF/test/integration/ObjectJourney",
		"com/app/shiftif/ZVS_SHIFT_IF/test/integration/NavigationJourney",
		"com/app/shiftif/ZVS_SHIFT_IF/test/integration/NotFoundJourney",
		"com/app/shiftif/ZVS_SHIFT_IF/test/integration/FLPIntegrationJourney"
	], function () {
		QUnit.start();
	});
});