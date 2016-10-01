tagElPlugin = Ext.apply(tagElPlugin,{
	initialize: function (winId) {
		var editorEl, txtarea, editorType;
		if (winId) {
			if (this.config.editor == 'Ace') {
				editorEl = Ext.select('div#' + winId + ' div.ace_editor').first();
				editorType = 'modx-texteditor';
			} else {
				editorEl = Ext.get(winId + '-snippet');
				editorType = 'textarea';
				txtarea = Ext.getDom(winId + '-snippet');
			}
		} else {
			if (MODx.config.confirm_navigation == 1 && this.config.panel) {
				var panel = Ext.getCmp(this.config.panel);
				if (!panel) return;
				panel.warnUnsavedChanges = panel.warnUnsavedChanges || false;
				panel.on('fieldChange', function (e) {
					if (!panel.warnUnsavedChanges && Ext.EventObject.button != Ext.EventObject.F5 && Ext.EventObject.button != 0 && (panel.isReady || MODx.request.reload)) {
						panel.warnUnsavedChanges = true;
					}
				});
				panel.on('success', function (e) {
					panel.warnUnsavedChanges = false;
				});
				window.onbeforeunload = function () {
					if (panel.warnUnsavedChanges) return _('unsaved_changes');
				};
			}
			if (this.config.editor == 'Ace') {
				//Ext.getCmp(this.config.panel).getEl().select('textarea.ace_text-input');
				editorEl = Ext.select('div.ace_editor').first();
				editorType = 'modx-texteditor';
			} else {
				editorEl = Ext.get(this.config.field);
				editorType = 'textarea';
				txtarea = document.getElementById(this.config.field);
			}
		}
		var quickEditorKeys   = this.config.keys.quickEditor || {key: Ext.EventObject.ENTER, ctrl: true, shift: false, alt: false},
			elementEditorKeys = this.config.keys.elementEditor || {key: Ext.EventObject.ENTER, ctrl: true, shift: true, alt: false},
			elementPropKeys   = this.config.keys.elementProperties || {key: Ext.EventObject.INSERT, ctrl: true, shift: false, alt: false},
			quickChunkEditorKeys   = this.config.keys.quickChunkEditor || {key: Ext.EventObject.C, ctrl: true, shift: false, alt: true},
			chunkEditorKeys   = this.config.keys.chunkEditor || {key: Ext.EventObject.C, ctrl: true, shift: true, alt: true};
		var getSelection = function (editorType) {
			var selection = '';
			switch (editorType) {
				case 'textarea':
					selection = txtarea.value.substring(txtarea.selectionStart, txtarea.selectionEnd);
					break;
				case 'modx-texteditor':
					selection = Ext.getCmp(editorEl.id).editor.getSelectedText();
					break;
			}
			return selection;
		};
		editorEl.addKeyListener(quickEditorKeys, function () {
			var selection = getSelection(editorType);
			if (selection) this.openElement(selection, true, editorEl);
		}, this);
		editorEl.addKeyListener(quickChunkEditorKeys, function () {
			var selection = getSelection(editorType);
			if (selection) this.openElement(selection, true, editorEl, 'chunk');
		}, this);
		editorEl.addKeyListener(chunkEditorKeys, function () {
			var selection = getSelection(editorType);
			if (selection) this.openElement(selection, false, null, 'chunk');
		}, this);
		editorEl.addKeyListener(elementEditorKeys, function () {
			var selection = getSelection(editorType);
			if (selection) this.openElement(selection, false);
		}, this);
		editorEl.addKeyListener(elementPropKeys, function () {
			var selection = getSelection(editorType);
			if (selection) this.openProperties(selection, editorEl);
		}, this);
		/*
		// Parse chunks and snippets
		// Use carefully
		 editorEl.addKeyListener({key:Ext.EventObject.ENTER, ctrl: true, shift: false, alt: true}, function () {
		 var selection = '';
		 switch (editorType) {
		 case 'textarea':
		 selection = txtarea.value.substring(txtarea.selectionStart, txtarea.selectionEnd);
		 break;
		 case 'modx-texteditor':
		 selection = Ext.getCmp(editorEl.id).editor.getSelectedText();
		 break;
		 }
		 if (selection) this.parseElement(selection, false);
		 }, this);
		 */
	},
	openElement: function (selection, quick, parent, elementType) {
		elementType = elementType || '';
		selection = selection.trim().replace('!', '').replace('[[', '').replace(']]', '');
		if (selection.length < 2) return;
		var token, mimeType, modxTags;
		if (elementType == 'chunk') {
			token = '$';
		} else {
			token = selection.substr(0, 1);
		}
		if (token == '-') {
			selection = selection.substr(1);
			token = selection.substr(0, 1);
		}
		switch (token) {
			case '*':
				return false;
				break;
			case '~':
			case '%':
			case '+':
			case '#':
				elementType = 'other';
				break;
			// chunk
			case '$':
				if (elementType == 'chunk') token = '';
				elementType = 'chunk';
				mimeType = this.config.using_fenom ? 'text/x-smarty' : 'text/html';
				modxTags = 1;
				break;
			// snippet
			default:
				token = '';
				elementType = 'snippet';
				mimeType = 'application/x-php';
				modxTags = 0;
				break;
		}
		if (elementType == 'other') {
			MODx.Ajax.request({
				url: this.config.connector_url,
				params: {
					action: "mgr/tag/parse",
					tag: selection
				},
				listeners: {
					"success": {
						fn: function (r) {
							MODx.msg.alert(_('tagelementplugin_tag_value'), r.object.tag);
						}
					}
				}
			});
		} else {
			MODx.Ajax.request({
				url: this.config.connector_url,
				params: {
					action: "mgr/element/get",
					tag: selection.substr(token.length),
					elementType: elementType

				},
				listeners: {
					"success": {
						fn: function (r) {
							if (quick) {
								var winId = 'tagel-element-window-' + (++Ext.Component.AUTO_ID);
								tagElPlugin.config.parent[winId] = parent.id;

								var w = MODx.load({
									xtype: 'tagelement-quick-update-' + elementType,
									id: winId,
									listeners: {
										'success': {
											fn: function () {
											}, scope: this
										},
										'afterrender': {
											fn: function () {
												if (tagElPlugin.config.editor == 'Ace') MODx.ux.Ace.replaceComponent(winId + '-snippet', mimeType, modxTags);
												tagElPlugin.initialize(winId);
												//var id = Ext.select('div.ace_editor').last().id,
												//	editor =  Ext.getCmp(id);
												//editor.setMimeType(mimeType);
											}, scope: this
										},
										'hide': {
											fn: function () {
												this.destroy();
												var parent = Ext.get(tagElPlugin.config.parent[this.id]);
												if (parent) {
													if (parent.id == tagElPlugin.config.field) {
														parent.focus();
													} else {
														parent.down('textarea').focus();
													}
												}
												delete tagElPlugin.config.parent[this.id];
											}
										}
									}
								});
								w.reset();
								r.object.clearCache = true;
								w.setValues(r.object);
								w.show(Ext.EventObject.target);
							} else {
								location.href = 'index.php?a=element/' + elementType + '/update&id=' + r.object.id;
							}
						}
					},
					"failure": {
						fn: function (r) {
							var oldFn = MODx.form.Handler.showError;
							MODx.form.Handler.showError = function (message) {
								if (message === '') {
									MODx.msg.hide();
								} else {
									Ext.MessageBox.show({
										title: _('error'),
										msg: message,
										buttons: Ext.MessageBox.YESNO,
										fn: function (btn) {
											if (btn == 'yes') {
												if (quick) {
													var winId = 'tagel-element-window-' + (++Ext.Component.AUTO_ID);
													tagElPlugin.config.parent[winId] = parent.id;

													var w = MODx.load({
														xtype: 'tagelement-quick-create-' + elementType,
														id: winId,
														listeners: {
															'success': {
																fn: function (r) {
																}, scope: this
															},
															'afterrender': {
																fn: function () {
																	if (tagElPlugin.config.editor == 'Ace') MODx.ux.Ace.replaceComponent(winId + '-snippet', mimeType, modxTags);
																	tagElPlugin.initialize(winId);
																}, scope: this
															},
															'hide': {
																fn: function () {
																	this.destroy();
																	var parent = Ext.get(tagElPlugin.config.parent[this.id]);
																	if (parent) {
																		if (parent.id == tagElPlugin.config.field) {
																			parent.focus();
																		} else {
																			parent.down('textarea').focus();
																		}
																	}
																	delete tagElPlugin.config.parent[this.id];
																}
															}
														}
													});
													w.reset();
													w.setValues({name: r.object.name, clearCache: true});
													w.show(Ext.EventObject.target);
												} else {
													location.href = 'index.php?a=element/' + elementType + '/create&category=0';
												}
											} else {

											}
											MODx.form.Handler.showError = oldFn;
										}
									});
								}
							};
						}
					}
				}
			});
		}
	},
	openProperties: function (selection, targetEl) {
		var cached = !selection.match(/\[\[!/);
		selection = selection.trim().replace('!','').replace('[[','').replace(']]','');
		if (selection.length < 2) return;
		var token = selection.substr(0, 1), elementType, elementClass;
		if (token == '-') {
			selection = selection.substr(1);
			token = selection.substr(0, 1);
		}
		var self = this;

		switch (token) {
			case '~':
			case '%':
			case '+':
			case '#':
			case '*':
				elementType = 'other';
				break;
			// chunk
			case '$':
				elementType = 'chunk';
				elementClass = 'modChunk';
				break;
			// snippet
			default:
				token = '';
				elementType = 'snippet';
				elementClass = 'modSnippet';
				break;
		}
		if (elementType != 'other') {
			MODx.Ajax.request({
				url: this.config.connector_url,
				params: {
					action: "mgr/element/getproperties",
					tag: selection.substr(token.length),
					elementType: elementType
				},
				listeners: {
					"success": {
						fn: function (r) {
							var elementId = r.object.id,
								elementName = r.object.name;
							var cfg = Ext.apply(Ext.getCmp('modx-treedrop').config, {
								target: Ext.getCmp(targetEl.id),
								targetEl: targetEl,
								iframe: false
							});
							if (tagElPlugin.config.editor == 'Ace') {
								cfg = Ext.apply(cfg, {
									iframe: true,
									onInsert: (function (s) {
										this.insertAtCursor(s);
										this.focus();
										return true;
									}).bind(Ext.getCmp(targetEl.id))
								});
							}
							self.loadInsertElement({
								pk: elementId,
								classKey: elementClass,
								name: elementName,
								cached: cached,
								output: '',
								tag: selection.substr(token.length),
								ddTargetEl: tagElPlugin.config.editor == 'Ace' ? targetEl : targetEl.dom,
								cfg: cfg,
								iframe: tagElPlugin.config.editor == 'Ace',
								panel: tagElPlugin.config.panel
							});

						}
					}
				}
			});
		}
	},
	loadInsertElement: function(r) {
		if (MODx.InsertElementWindow) {
			MODx.InsertElementWindow.hide();
			MODx.InsertElementWindow.destroy();
		}
		MODx.InsertElementWindow = MODx.load({
			xtype: 'modx-window-insert-element',
			record: r,
			listeners: {
				render: {
					fn: function (w) {
						var propertySet = r.tag.split('?')[0].split('@')[1];
						if (propertySet) propertySet = propertySet.split(':')[0];
						var propset = Ext.getCmp('modx-dise-propset');
						propset.store = new Ext.data.JsonStore({
							url: tagElPlugin.config.connector_url,
							id: 0,
							baseParams: {
								action: 'mgr/element/getpropertysetlist',
								showAssociated: true,
								elementId: r.pk,
								elementType: r.classKey,
								propertySet: propertySet
							},
							root: 'results',
							totalProperty: 'total',
							fields: ['id', 'name'],
							listeners: {load: function (store, rec) {
								for (var i=1; i<rec.length; i++) {
									if (rec[i].data.name == propertySet) {
										var id = rec[i].id;
										setTimeout(function () {
											propset.setValue(id);
										},300);
										//propset.select(i, false);
									}
								}
							} }
						});
						var props = w.fields[4];
						props.autoLoad.url = tagElPlugin.config.connector_url;
						props.autoLoad.callback = this.onPropFormLoad;
						props.autoLoad.params.action = 'mgr/element/getinsertproperties';
						props.autoLoad.params.tag = r.tag;
					}, scope: this
				},
				show: {fn: function(w){/*console.log(w.fields[4]);*/}, scope: this},
				hide: {fn:function(w) { setTimeout(function(){w.destroy();},200)}}
			}
		});
		MODx.InsertElementWindow.setValues(r);
		MODx.InsertElementWindow.show(Ext.EventObject.target);
	},
	createStore: function(data) {
		return new Ext.data.SimpleStore({
			fields: ["v","d"]
			,data: data
		});
	},
	onPropFormLoad: function(el,s,r) {
		this.mask.hide();
		var vs = Ext.decode(r.responseText);
		if (!vs || vs.length <= 0) {
			return false;
		}
		for (var i = 0; i < vs.length; i++) {
			if (vs[i].isDirty) {
				var modps= Ext.getCmp('modx-window-insert-element').modps;
				if (!modps[vs[i].name]) {
					modps.push(vs[i].name);
				}
			}
			if (vs[i].store) {
				vs[i].store = this.createStore(vs[i].store);
			}
		}
		MODx.load({
			xtype: 'panel'
			, id: 'modx-iprops-fp'
			, layout: 'form'
			, autoHeight: true
			, autoScroll: true
			, labelWidth: 150
			, border: false
			, items: vs
			, renderTo: 'modx-iprops-form'
		});
	},
	parseElement: function (selection) {
		MODx.Ajax.request({
			url: this.config.connector_url,
			params: {
				action: "mgr/tag/parse",
				tag: selection
			},
			listeners: {
				"success": {
					fn: function (r) {
						MODx.msg.alert(_('tagelementplugin_tag_value'), r.object.tag);
					}
				}
			}
		});
	}
});

Ext.onReady(function() {
	tagElPlugin.initialize('');
});