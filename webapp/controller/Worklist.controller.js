/*global location history */
sap.ui.define([
	"com/app/shiftif/ZVS_SHIFT_IF/controller/BaseController",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/routing/History",
	"com/app/shiftif/ZVS_SHIFT_IF/model/formatter",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/m/MessageToast",
	"sap/m/MessageBox",
	"sap/ui/core/util/Export",
	"sap/ui/core/util/ExportTypeCSV"
], function(BaseController, JSONModel, History, formatter, Filter, FilterOperator, MessageToast, MessageBox, Export, ExportTypeCSV) {
	"use strict";

	var _this = null;
	var _currentDate;
	var _currentKostl;
	var _currentTprog;
	var _check;

	return BaseController.extend("com.app.shiftif.ZVS_SHIFT_IF.controller.Worklist", {

		formatter: formatter,

		/* =========================================================== */
		/* lifecycle methods                                           */
		/* =========================================================== */

		/**
		 * Called when the worklist controller is instantiated.
		 * @public
		 */
		onInit: function() {

			var fb = this.getView().getId("filterBar");
			fb = fb + "--filterBar";
			this.oFilterBar = sap.ui.getCore().byId(fb);
			this.oFilterBar.setShowFilterConfiguration(false);
			this.oFilterBar.setShowGoButton(false);

			_this = this;
			this.viewModel = new sap.ui.model.json.JSONModel({
				MainList: [],
				Today: "",
				f1: "",
				f2: "",
				f3: "",
				FPersList: [{
					key: "",
					txt: ""
				}],
				FMagazaList: [{
					key: "",
					txt: ""
				}],
				FVardiyaList: [{
					key: "",
					txt: ""
				}],
				FPtkList: [{
					key: "",
					txt: ""
				}],
				MagazaList: [{
					pernr: "",
					cpernr: "",
					kostl: "",
					ltext: ""
				}],
				VardiyaList: [{
					pernr: "",
					cpernr: "",
					kostl: "",
					ltext: ""
				}],
				PtkList: [{
					pernr: "",
					cpernr: "",
					grup: "",
					gruptxt: "",
					kostl: "",
					ltext: ""
				}]
			});

			this.viewModel.setSizeLimit(2000);
			this.setModel(this.viewModel, "worklistView");
			// this.mainModel = this.getOwnerComponent().getModel("mainModel");

			var options = {
				year: 'numeric',
				month: '2-digit',
				day: '2-digit'
			};

			var today = new Date().toLocaleDateString("en-GB", options);
			today = today.substr(0, 2) + "-" + today.substr(3, 2) + "-" + today.substr(6, 4);
			_currentDate = today;
			this.viewModel.setProperty("/Today", today);

			this.onHeader();
			this.onMain();
		},

		/* =========================================================== */
		/* Veriler alınır                                              */
		/* =========================================================== */
		onHeader: function() {
			var oDataModel = this.getOwnerComponent().getModel();

			var Param1 = new sap.ui.model.Filter("IvDate", sap.ui.model.FilterOperator.EQ, _currentDate);
			var Param2 = new sap.ui.model.Filter("IvKostl", sap.ui.model.FilterOperator.EQ, _currentKostl);
			var Param3 = new sap.ui.model.Filter("IvTprog", sap.ui.model.FilterOperator.EQ, _currentTprog);

			var filters = new Array();
			filters.push(Param1);
			filters.push(Param2);
			filters.push(Param3);

			sap.ui.core.BusyIndicator.show(0);
			oDataModel.read("/THeaderSet", {
				filters: filters,
				success: this.Success_onHeader
			});
		},

		Success_onHeader: function(oDataR) {
			for (var x = 0; x < oDataR.results.length; x++) {
				_this.viewModel.setProperty("/f1", oDataR.results[x].Fld1);
				_this.viewModel.setProperty("/f2", oDataR.results[x].Fld2);
				_this.viewModel.setProperty("/f3", oDataR.results[x].Fld3);
				break;
			}

			if (_check === "X") {
				var HeaderText = _this.getView().getModel("i18n").getResourceBundle().getText("HeaderText");
				_this.viewModel.setProperty("/f1", HeaderText);
				_this.viewModel.setProperty("/f2", HeaderText);
				_this.viewModel.setProperty("/f3", HeaderText);
				_check = "";
			}

			sap.ui.core.BusyIndicator.hide(0);
		},

		onMain: function() {
			var oDataModel = this.getOwnerComponent().getModel();
			var Param1 = new sap.ui.model.Filter("IvDate", sap.ui.model.FilterOperator.EQ, _currentDate);

			//Filtreler Temizlenir
			this.getView().byId("PersCombo").setSelectedItems([]);
			this.getView().byId("MagazaCombo").setSelectedKey("0");
			this.getView().byId("VardiyaCombo").setSelectedKey("0");
			this.getView().byId("PtkCombo").setSelectedKey("0");

			var oTable = this.byId("table");
			var oBinding = oTable.getBinding("items");
			oBinding.aFilters = [];
			oBinding.filter(oBinding.aFilters);

			var filters = new Array();
			filters.push(Param1);

			sap.ui.core.BusyIndicator.show(0);
			oDataModel.read("/TMainSet", {
				filters: filters,
				success: this.Success_onMain
			});
		},

		Success_onMain: function(oDataR) {
			if (oDataR.results[0].EvMessage !== "") {
				delete oDataR.results[0];
				var delCheck = "X";
				var bCompact = _this.getView().$().closest(".sapUiSizeCompact").length;
				MessageBox.error(
					_this.getView().getModel("i18n").getResourceBundle().getText("Error"), {
						styleClass: bCompact ? "sapUiSizeCompact" : ""
					}
				);
			}

			if (delCheck !== "X") {
				var array = [];
				for (var x = 0; x < oDataR.results.length; x++) {
					var object = {};
					object.Pernr = oDataR.results[x].Pernr;
					object.Ename = oDataR.results[x].Ename;
					object.Date = oDataR.results[x].Date;
					object.Begtm = oDataR.results[x].Begtm;
					object.Endtm = oDataR.results[x].Endtm;
					object.MagazaC = oDataR.results[x].MagazaC;
					object.MagazaT = oDataR.results[x].MagazaT;
					object.VardiyaC = oDataR.results[x].VardiyaC;
					object.VardiyaT = oDataR.results[x].VardiyaT;
					object.GrupC = oDataR.results[x].GrupC;
					object.GrupT = oDataR.results[x].GrupT;
					object.Comment = oDataR.results[x].Comment;
					array.push(object);
				}
				_this.viewModel.setProperty("/MainList", array);

				//Filtreleri Doldur
				_this.fillPers(oDataR);
				_this.fillMagaza(oDataR);
				_this.fillVardiya(oDataR);
				_this.fillPtk(oDataR);
			}
			delCheck = "";
			sap.ui.core.BusyIndicator.hide(0);
		},

		/* =========================================================== */
		/* Filtreler                                                   */
		/* =========================================================== */
		fillPers: function(oDataR) {
			var array = [];
			for (var x = 0; x < oDataR.results.length; x++) {
				var object = {};
				var index = array.map(function(e) {
					return e.key;
				}).indexOf(oDataR.results[x].Pernr);
				if (index === -1 && oDataR.results[x].Pernr !== "") {
					object.key = oDataR.results[x].Pernr;
					object.txt = oDataR.results[x].Ename;
					array.push(object);
				}
			}
			_this.viewModel.setProperty("/FPersList", array);
		},

		fillMagaza: function(oDataR) {
			var array = [];
			for (var x = 0; x < oDataR.results.length; x++) {
				var object = {};
				var index = array.map(function(e) {
					return e.key;
				}).indexOf(oDataR.results[x].MagazaC);
				if (index === -1 && oDataR.results[x].MagazaC !== "") {
					object.key = oDataR.results[x].MagazaC;
					object.txt = oDataR.results[x].MagazaT;
					array.push(object);
				}
			}
			object = {};
			object.key = "0";
			object.txt = _this.getView().getModel("i18n").getResourceBundle().getText("SText");
			array.push(object);

			_this.viewModel.setProperty("/FMagazaList", array);
		},

		fillVardiya: function(oDataR) {
			var array = [];
			for (var x = 0; x < oDataR.results.length; x++) {
				var object = {};
				var index = array.map(function(e) {
					return e.key;
				}).indexOf(oDataR.results[x].VardiyaC);
				if (index === -1 && oDataR.results[x].VardiyaC !== "") {
					object.key = oDataR.results[x].VardiyaC;
					object.txt = oDataR.results[x].VardiyaT;
					array.push(object);
					object = {};
				}
			}
			object = {};
			object.key = "0";
			object.txt = _this.getView().getModel("i18n").getResourceBundle().getText("SText");
			array.push(object);
			_this.viewModel.setProperty("/FVardiyaList", array);
		},

		fillPtk: function(oDataR) {
			var array = [];
			for (var x = 0; x < oDataR.results.length; x++) {
				var object = {};
				var index = array.map(function(e) {
					return e.key;
				}).indexOf(oDataR.results[x].GrupC);
				if (index === -1 && oDataR.results[x].GrupC !== "") {
					object.key = oDataR.results[x].GrupC;
					object.txt = oDataR.results[x].GrupT;
					array.push(object);
				}
			}
			object = {};
			object.key = "0";
			object.txt = _this.getView().getModel("i18n").getResourceBundle().getText("SText");
			array.push(object);
			_this.viewModel.setProperty("/FPtkList", array);
		},

		/* =========================================================== */
		/* Filtre Değişiklik                                           */
		/* =========================================================== */
		DatePickerChange: function() {
			_currentDate = this.getView().byId("DatePicker").getValue();

			this.onHeader();
			this.onMain();
		},

		PersFinish: function(oEvent) {
			var selectedItems = oEvent.getParameter("selectedItems");
			var filters = [];
			var oTable = this.byId("table");
			var oBinding = oTable.getBinding("items");

			for (var i = 0; i < selectedItems.length; i++) {
				filters.push(new Filter("Ename", FilterOperator.Contains, selectedItems[i].getText()));
			}

			var currentFilter = oBinding.aFilters;
			oBinding.aFilters = [];
			for (var x = 0; x < currentFilter.length; x++) {
				if (currentFilter[x].sPath !== "Ename") {
					filters.push(new Filter(currentFilter[x].sPath, FilterOperator.Contains, currentFilter[x].oValue1));
				}
			}
			oBinding.aFilters = filters;
			oBinding.filter(oBinding.aFilters);
		},
		MagazaChange: function(oEvent) {
			var List = _this.viewModel.getProperty("/FMagazaList");
			// Seçimin kodu alınır
			var MagazaT = this.getView().byId("MagazaCombo").getValue();

			for (var i = 0; i < List.length; i++) {
				if (MagazaT === List[i].txt && MagazaT !== "") {
					_currentKostl = List[i].key;
					break;
				}
			}

			this.onHeader();

			var choice = this.byId("MagazaCombo").getSelectedItem().getKey();
			var filters = [];
			var oTable = this.byId("table");
			var oBinding = oTable.getBinding("items");
			var currentFilter = oBinding.aFilters;

			// Anlık Filtreleri al
			if (choice === "0") {
				for (i = 0; i < List.length; i++) {
					filters.push(new Filter("MagazaC", FilterOperator.Contains, List[i].key));
				}
			} else if (choice !== "0") {
				filters.push(new Filter("MagazaC", FilterOperator.Contains, choice));
			}

			// Mevcut Filtrelere ekle
			for (var x = 0; x < currentFilter.length; x++) {
				if (currentFilter[x].sPath !== "MagazaC") {
					filters.push(new Filter(currentFilter[x].sPath, FilterOperator.Contains, currentFilter[x].oValue1));
				}
			}

			oBinding.aFilters = filters;
			oBinding.filter(oBinding.aFilters);
			if (oBinding.aLastContextData.length === 0) {
				_check = "X";
			}
		},

		VardiyaChange: function(oEvent) {
			var List = _this.viewModel.getProperty("/FVardiyaList");
			// Seçimin kodu alınır
			var VardiyaT = this.getView().byId("VardiyaCombo").getValue();

			for (var i = 0; i < List.length; i++) {
				if (VardiyaT === List[i].txt && VardiyaT !== "") {
					_currentTprog = List[i].key;
					break;
				}
			}

			this.onHeader();

			var choice = this.byId("VardiyaCombo").getSelectedItem().getKey();
			var filters = [];
			var oTable = this.byId("table");
			var oBinding = oTable.getBinding("items");
			var currentFilter = oBinding.aFilters;

			// Anlık Filtreleri al
			if (choice === "0") {
				for (i = 0; i < List.length; i++) {
					filters.push(new Filter("VardiyaC", FilterOperator.Contains, List[i].key));
				}
			} else if (choice !== "0") {
				filters.push(new Filter("VardiyaC", FilterOperator.Contains, choice));
			}

			// Mevcut Filtrelere ekle
			for (var x = 0; x < currentFilter.length; x++) {
				if (currentFilter[x].sPath !== "VardiyaC") {
					filters.push(new Filter(currentFilter[x].sPath, FilterOperator.Contains, currentFilter[x].oValue1));
				}
			}

			oBinding.aFilters = filters;
			oBinding.filter(oBinding.aFilters);
			if (oBinding.aLastContextData.length === 0) {
				_check = "X";
			}
		},
		PtkChange: function(oEvent) {
			var choice = this.byId("PtkCombo").getSelectedItem().getKey();
			var filters = [];
			var oTable = this.byId("table");
			var oBinding = oTable.getBinding("items");
			var currentFilter = oBinding.aFilters;
			var List = _this.viewModel.getProperty("/FPtkList");

			// Anlık Filtreleri al
			if (choice === "0") {
				for (var i = 0; i < List.length; i++) {
					filters.push(new Filter("GrupC", FilterOperator.Contains, List[i].key));
				}
			} else if (choice !== "0") {
				filters.push(new Filter("GrupC", FilterOperator.Contains, choice));
			}

			// Mevcut Filtrelere ekle
			for (var x = 0; x < currentFilter.length; x++) {
				if (currentFilter[x].sPath !== "GrupC") {
					filters.push(new Filter(currentFilter[x].sPath, FilterOperator.Contains, currentFilter[x].oValue1));
				}
			}

			oBinding.aFilters = filters;
			oBinding.filter(oBinding.aFilters);
		},
		/* =========================================================== */
		/* Kayıt Atma                                                  */
		/* =========================================================== */
		onPressAccept: function() {
			var oTable = this.getView().byId("table");
			var itemIndex = oTable.indexOfItem(oTable.getSelectedItem());
			if (itemIndex !== -1) {
				MessageBox.warning(_this.getView().getModel("i18n").getResourceBundle().getText("MessageBoxText"), {
					actions: [MessageBox.Action.OK, MessageBox.Action.CANCEL],
					emphasizedAction: MessageBox.Action.OK,
					title: _this.getView().getModel("i18n").getResourceBundle().getText("MessageBoxHead"),
					onClose: function(sAction) {
						if (sAction === MessageBox.Action.OK) {
							var oModel = _this.getOwnerComponent().getModel();
							var oItems = oTable.getSelectedItems();

							for (var i = 0; i < oItems.length; i++) {
								var oEntry = {};
								oEntry.Pers = oItems[i].getBindingContext("worklistView").getObject("Pernr");
								oEntry.Date = oItems[i].getBindingContext("worklistView").getObject("Date");
								oEntry.MagazaC = oItems[i].getBindingContext("worklistView").getObject("MagazaC");
								oEntry.VardiyaC = oItems[i].getBindingContext("worklistView").getObject("VardiyaC");
								oEntry.Comment = oItems[i].getBindingContext("worklistView").getObject("Comment");
								oEntry.Begtm = oItems[i].getBindingContext("worklistView").getObject("Begtm");
								oEntry.Endtm = oItems[i].getBindingContext("worklistView").getObject("Endtm");

								sap.ui.core.BusyIndicator.show(0);
								if (oEntry.IvPernr !== "" && oEntry.IvDate !== "" && oEntry.IvComment !== "") {
									oModel.create("/CreateRecSet", oEntry, {
										changeSetId: i
									}, {
										method: "POST",
										success: this.Success_onCreate,
										error: this.Error_onCreate
											// 							success: function(data) {
											// 								// MessageToast.show("Seçili Talepler Onaylandı");
											// sap.ui.core.BusyIndicator.hide(0);
											// 								MessageToast.show(_this.getView().getModel("i18n").getResourceBundle().getText("PostOk"));
											// 								// _this.onGetData();
											// 							},
											// error: function(e) {
											// 	// MessageToast.show("İşlem sırasında hata oluştu");
											// 	sap.ui.core.BusyIndicator.hide(0);
											// 	MessageToast.show(_this.getView().getModel("i18n").getResourceBundle().getText("PostEr"));
											// 	// _this.onGetData();
											// }
									});
								} else {
									sap.ui.core.BusyIndicator.hide(0);
									MessageToast.show(_this.getView().getModel("i18n").getResourceBundle().getText("MsData"));
								}
							}
							sap.ui.core.BusyIndicator.hide(0);
							MessageToast.show(_this.getView().getModel("i18n").getResourceBundle().getText("PostOk"));
							oTable.removeSelections(true);
							// _this.onGetData();
						} else if (sAction === MessageBox.Action.CANCEL) {
							sap.ui.core.BusyIndicator.hide(0);
							MessageToast.show(_this.getView().getModel("i18n").getResourceBundle().getText("Cancel"));
						}
					}
				});
			} else {
				sap.ui.core.BusyIndicator.hide(0);
				MessageToast.show(_this.getView().getModel("i18n").getResourceBundle().getText("LineSl"));
			}
			sap.ui.core.BusyIndicator.hide(0);
		},

		Success_onCreate: function(oDataR) {
			MessageToast.show(_this.getView().getModel("i18n").getResourceBundle().getText("PostOk"));
			sap.ui.core.BusyIndicator.hide(0);
		},
		Error_onCreate: function(oDataR) {
			sap.ui.core.BusyIndicator.hide(0);
			MessageToast.show(_this.getView().getModel("i18n").getResourceBundle().getText("PostEr"));
		},

		/* =================================================================== */
		/* Excel	                                                           */
		/* =================================================================== */
		onPressExc: function() {
			var oModelExc = this.getView().getModel("worklistView");

			var oExport = new Export({
				exportType: new ExportTypeCSV({
					fileExtension: "xls",
					separatorChar: "\t",
					charset: "UTF-8",
					mimeType: "application/vnd.ms-excel"
				}),

				models: oModelExc,

				rows: {
					path: _this.getView().byId("table").getBinding("items").sPath,
					filters: _this.getView().byId("table").getBinding("items").aFilters
				},
				columns: [{
						name: "SICIL NO",
						template: {
							content: "{Pernr}"
						}
					}, {
						name: "AD SOYAD",
						template: {
							content: {
								parts: [{
									path: 'Ename'
								}],
								formatter: function(Ename) {
									if (Ename) {
										Ename = Ename.replace(/ç/g, "c");
										Ename = Ename.replace(/Ç/g, "C");
										Ename = Ename.replace(/ğ/g, "g");
										Ename = Ename.replace(/Ğ/g, "G");
										Ename = Ename.replace(/ş/g, "s");
										Ename = Ename.replace(/Ş/g, "S");
										Ename = Ename.replace(/ü/g, "u");
										Ename = Ename.replace(/Ü/g, "U");
										Ename = Ename.replace(/ı/g, "i");
										Ename = Ename.replace(/İ/g, "I");
										Ename = Ename.replace(/ö/g, "o");
										Ename = Ename.replace(/Ö/g, "O");
									}
									return Ename;
								}
							}
						}
					},

					{
						name: "Tarih",
						template: {
							content: "{Date}"
						}
					},

					{
						name: "BASLANGIC SAATI",
						template: {
							content: "{Begtm}"
						}
					}, {
						name: "BITIS SAATI",
						template: {
							content: "{Endtm}"
						}
					},

					{
						name: "MAGAZA",
						template: {
							content: {
								parts: [{
									path: 'MagazaT'
								}],
								formatter: function(MagazaT) {
									if (MagazaT) {
										MagazaT = MagazaT.replace(/ç/g, "c");
										MagazaT = MagazaT.replace(/Ç/g, "C");
										MagazaT = MagazaT.replace(/ğ/g, "g");
										MagazaT = MagazaT.replace(/Ğ/g, "G");
										MagazaT = MagazaT.replace(/ş/g, "s");
										MagazaT = MagazaT.replace(/Ş/g, "S");
										MagazaT = MagazaT.replace(/ü/g, "u");
										MagazaT = MagazaT.replace(/Ü/g, "U");
										MagazaT = MagazaT.replace(/ı/g, "i");
										MagazaT = MagazaT.replace(/İ/g, "I");
										MagazaT = MagazaT.replace(/ö/g, "o");
										MagazaT = MagazaT.replace(/Ö/g, "O");
									}
									return MagazaT;
								}
							}
						}
					}, {

						name: "VARDIYA",
						template: {
							content: {
								parts: [{
									path: 'VardiyaT'
								}],
								formatter: function(VardiyaT) {
									if (VardiyaT) {
										VardiyaT = VardiyaT.replace(/ç/g, "c");
										VardiyaT = VardiyaT.replace(/Ç/g, "C");
										VardiyaT = VardiyaT.replace(/ğ/g, "g");
										VardiyaT = VardiyaT.replace(/Ğ/g, "G");
										VardiyaT = VardiyaT.replace(/ş/g, "s");
										VardiyaT = VardiyaT.replace(/Ş/g, "S");
										VardiyaT = VardiyaT.replace(/ü/g, "u");
										VardiyaT = VardiyaT.replace(/Ü/g, "U");
										VardiyaT = VardiyaT.replace(/ı/g, "i");
										VardiyaT = VardiyaT.replace(/İ/g, "I");
										VardiyaT = VardiyaT.replace(/ö/g, "o");
										VardiyaT = VardiyaT.replace(/Ö/g, "O");
									}
									return VardiyaT;
								}
							}
						}
					}, {
						name: "POZISYON TEPE KIRILIMI",
						template: {
							content: {
								parts: [{
									path: 'GrupT'
								}],
								formatter: function(GrupT) {
									if (GrupT) {
										GrupT = GrupT.replace(/ç/g, "c");
										GrupT = GrupT.replace(/Ç/g, "C");
										GrupT = GrupT.replace(/ğ/g, "g");
										GrupT = GrupT.replace(/Ğ/g, "G");
										GrupT = GrupT.replace(/ş/g, "s");
										GrupT = GrupT.replace(/Ş/g, "S");
										GrupT = GrupT.replace(/ü/g, "u");
										GrupT = GrupT.replace(/Ü/g, "U");
										GrupT = GrupT.replace(/ı/g, "i");
										GrupT = GrupT.replace(/İ/g, "I");
										GrupT = GrupT.replace(/ö/g, "o");
										GrupT = GrupT.replace(/Ö/g, "O");
									}
									return GrupT;
								}
							}
						}

					}, {
						name: "GELMEME NEDENI",
						template: {
							content: {
								parts: [{
									path: 'Comment'
								}],
								formatter: function(Comment) {
									if (Comment) {
										Comment = Comment.replace(/ç/g, "c");
										Comment = Comment.replace(/Ç/g, "C");
										Comment = Comment.replace(/ğ/g, "g");
										Comment = Comment.replace(/Ğ/g, "G");
										Comment = Comment.replace(/ş/g, "s");
										Comment = Comment.replace(/Ş/g, "S");
										Comment = Comment.replace(/ü/g, "u");
										Comment = Comment.replace(/Ü/g, "U");
										Comment = Comment.replace(/ı/g, "i");
										Comment = Comment.replace(/İ/g, "I");
										Comment = Comment.replace(/ö/g, "o");
										Comment = Comment.replace(/Ö/g, "O");
									}
									return Comment;
								}
							}
						}
					}
				]
			});

			oExport.saveFile().catch(function(oError) {
				sap.m.MessageToast.show("Generate is not possible beause no model was set");
			}).then(function() {
				oExport.destroy();
			});
		},

		/* =========================================================== */
		/* event handlers                                              */
		/* =========================================================== */

		/**
		 * Triggered by the table's 'updateFinished' event: after new table
		 * data is available, this handler method updates the table counter.
		 * This should only happen if the update was successful, which is
		 * why this handler is attached to 'updateFinished' and not to the
		 * table's list binding's 'dataReceived' method.
		 * @param {sap.ui.base.Event} oEvent the update finished event
		 * @public
		 */
		onUpdateFinished: function(oEvent) {
			// update the worklist's object counter after the table update
			var sTitle,
				oTable = oEvent.getSource(),
				iTotalItems = oEvent.getParameter("total");
			// only update the counter if the length is final and
			// the table is not empty
			if (iTotalItems && oTable.getBinding("items").isLengthFinal()) {
				sTitle = this.getResourceBundle().getText("worklistTableTitleCount", [iTotalItems]);
			} else {
				sTitle = this.getResourceBundle().getText("worklistTableTitle");
			}
			this.getModel("worklistView").setProperty("/worklistTableTitle", sTitle);
		},

		/**
		 * Event handler when a table item gets pressed
		 * @param {sap.ui.base.Event} oEvent the table selectionChange event
		 * @public
		 */
		onPress: function(oEvent) {
			// The source is the list item that got pressed
			this._showObject(oEvent.getSource());
		},

		/**
		 * Event handler when the share in JAM button has been clicked
		 * @public
		 */
		onShareInJamPress: function() {
			var oViewModel = this.getModel("worklistView"),
				oShareDialog = sap.ui.getCore().createComponent({
					name: "sap.collaboration.components.fiori.sharing.dialog",
					settings: {
						object: {
							id: location.href,
							share: oViewModel.getProperty("/shareOnJamTitle")
						}
					}
				});
			oShareDialog.open();
		},

		onSearch: function(oEvent) {
			if (oEvent.getParameters().refreshButtonPressed) {
				// Search field's 'refresh' button has been pressed.
				// This is visible if you select any master list item.
				// In this case no new search is triggered, we only
				// refresh the list binding.
				this.onRefresh();
			} else {
				var aTableSearchState = [];
				var sQuery = oEvent.getParameter("query");

				if (sQuery && sQuery.length > 0) {
					aTableSearchState = [new Filter("Pernr", FilterOperator.Contains, sQuery)];
				}
				this._applySearch(aTableSearchState);
			}

		},

		/**
		 * Event handler for refresh event. Keeps filter, sort
		 * and group settings and refreshes the list binding.
		 * @public
		 */
		onRefresh: function() {
			var oTable = this.byId("table");
			oTable.getBinding("items").refresh();
		},

		/* =========================================================== */
		/* internal methods                                            */
		/* =========================================================== */

		/**
		 * Shows the selected item on the object page
		 * On phones a additional history entry is created
		 * @param {sap.m.ObjectListItem} oItem selected Item
		 * @private
		 */
		_showObject: function(oItem) {
			this.getRouter().navTo("object", {
				objectId: oItem.getBindingContext().getProperty("Pernr")
			});
		},

		/**
		 * Internal helper method to apply both filter and search state together on the list binding
		 * @param {sap.ui.model.Filter[]} aTableSearchState An array of filters for the search
		 * @private
		 */
		_applySearch: function(aTableSearchState) {
			var oTable = this.byId("table"),
				oViewModel = this.getModel("worklistView");
			oTable.getBinding("items").filter(aTableSearchState, "Application");
			// changes the noDataText of the list in case there are no filter results
			if (aTableSearchState.length !== 0) {
				oViewModel.setProperty("/tableNoDataText", this.getResourceBundle().getText("worklistNoDataWithSearchText"));
			}
		}

	});
});