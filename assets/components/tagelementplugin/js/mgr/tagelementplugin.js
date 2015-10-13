var tagElement = {
	initialize: function(winId){
		var editorEl, txtarea, editorType;
		if (winId) {
			if (tagElPlugin_config.editor == 'Ace') {
				editorEl = Ext.select('div#'+winId+' div.ace_editor');
				editorType = 'modx-texteditor';
			} else {
				editorEl = Ext.get(winId+'-snippet');
				editorType = 'textarea';
				txtarea = Ext.getDom(winId+'-snippet');
			}
		} else {
			if (MODx.config.confirm_navigation == 1 && tagElPlugin_config.panel) {
				var panel = Ext.getCmp(tagElPlugin_config.panel);
				panel.warnUnsavedChanges = panel.warnUnsavedChanges || false;
				panel.on('fieldChange',function(e) {
					if (!panel.warnUnsavedChanges && Ext.EventObject.button != 116 && Ext.EventObject.button != 0 && (panel.isReady || MODx.request.reload)) {
						panel.warnUnsavedChanges = true;
					}
				});
				panel.on('success',function(e) {
					panel.warnUnsavedChanges = false;
				});
				window.onbeforeunload = function() {
					if (panel.warnUnsavedChanges) return _('unsaved_changes');
				};
			}
			if (tagElPlugin_config.editor == 'Ace') {
				//Ext.getCmp(tagElPlugin_config.panel).getEl().select('textarea.ace_text-input');
				editorEl = Ext.select('div.ace_editor');
				editorType = 'modx-texteditor';
			} else {
				editorEl = Ext.get(tagElPlugin_config.field);
				editorType = 'textarea';
				txtarea = document.getElementById(tagElPlugin_config.field);
			}
		}
		editorEl.addKeyListener({key:Ext.EventObject.ENTER, ctrl: true, shift: false, alt: false}, function () {
			var selection = '';
			switch (editorType) {
				case 'textarea':
					selection = txtarea.value.substring(txtarea.selectionStart, txtarea.selectionEnd);
					break;
				case 'modx-texteditor':
					selection = Ext.getCmp(editorEl.el.id).editor.getSelectedText();
					break;
			}
			if (selection) {
				tagElement.openElement(selection,true, editorEl);
			}
		}, this);
		editorEl.addKeyListener({key:Ext.EventObject.ENTER, ctrl: true, shift: true, alt: false}, function () {
			var selection = '';
			switch (editorType) {
				case 'textarea':
					selection = txtarea.value.substring(txtarea.selectionStart, txtarea.selectionEnd);
					break;
				case 'modx-texteditor':
					selection = Ext.getCmp(editorEl.el.id).editor.getSelectedText();
					break;
			}
			if (selection) tagElement.openElement(selection, false);
		}, this);
/*		// parse chunks and snippets
		editorEl.addKeyListener({key:Ext.EventObject.ENTER, ctrl: true, shift: false, alt: true}, function () {
			var selection = '';
			switch (editorType) {
				case 'textarea':
					selection = txtarea.value.substring(txtarea.selectionStart, txtarea.selectionEnd);
					break;
				case 'modx-texteditor':
					selection = Ext.getCmp(editorEl.el.id).editor.getSelectedText();
					break;
			}
			if (selection) tagElement.parseElement(selection, false);
		}, this);
*/
	},
	openElement: function (selection, quick, parent) {
		selection = selection.replace('!','').replace('[[','').replace(']]','');
		if (selection.length < 2) return;
		var token = selection.substr(0, 1), elementType, mimeType, modxTags;
		if (token == '-') {
			selection = selection.substr(1);
			token = selection.substr(0, 1);
		}
		switch (token) {
			case '~':
			case '%':
			case '+':
			case '#':
				elementType = 'other';
				break;
			// chunk
			case '$':
				elementType = 'chunk';
				mimeType = tagElPlugin_config.using_fenom ? 'text/x-smarty' : 'text/html';
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
				url: tagElPlugin_config.connector_url,
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
				url: tagElPlugin_config.connector_url,
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
								tagElPlugin_config.parent[winId] = parent.el.id;

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
												if (tagElPlugin_config.editor == 'Ace') MODx.ux.Ace.replaceComponent(winId + '-snippet', mimeType, modxTags);
												tagElement.initialize(winId);
												//var id = Ext.select('div.ace_editor').last().id,
												//	editor =  Ext.getCmp(id);
												//editor.setMimeType(mimeType);
											}, scope: this
										},
										'hide': {
											fn:function() {
												this.destroy();
												var parent = Ext.get(tagElPlugin_config.parent[this.id]);
												if (parent) parent.down('textarea').focus();
												delete tagElPlugin_config.parent[this.id];
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
													tagElPlugin_config.parent[winId] = parent.el.id;

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
																	if (tagElPlugin_config.editor == 'Ace') MODx.ux.Ace.replaceComponent(winId + '-snippet', mimeType, modxTags);
																	tagElement.initialize(winId);
																}, scope: this
															},
															'hide': {
																fn:function() {
																	this.destroy();
																	var parent = Ext.get(tagElPlugin_config.parent[this.id]);
																	if (parent) parent.down('textarea').focus();
																	delete tagElPlugin_config.parent[this.id];
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
	parseElement: function (selection) {
		MODx.Ajax.request({
			url: tagElPlugin_config.connector_url,
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
};

Ext.onReady(function() {
	tagElPlugin_config.parent = [];
	tagElement.initialize('');
});