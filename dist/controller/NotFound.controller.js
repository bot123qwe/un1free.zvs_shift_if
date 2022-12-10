sap.ui.define([
		"com/app/shiftif/ZVS_SHIFT_IF/controller/BaseController"
	], function (BaseController) {
		"use strict";

		return BaseController.extend("com.app.shiftif.ZVS_SHIFT_IF.controller.NotFound", {

			/**
			 * Navigates to the worklist when the link is pressed
			 * @public
			 */
			onLinkPressed : function () {
				this.getRouter().navTo("worklist");
			}

		});

	}
);