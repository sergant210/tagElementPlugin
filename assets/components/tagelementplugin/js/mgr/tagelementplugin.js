tagElPlugin = Ext.apply(tagElPlugin, {
	isFile: false,
	initialize: function (winId) {
		let editorEl, txtarea, editorType;
		if (winId) {
			if (this.config.elementEditor == 'Ace') {
				editorEl = Ext.select('div#' + winId + ' div.ace_editor').first();
				editorType = 'modx-texteditor';
			} else {
				editorEl = Ext.get(winId + '-snippet');
				editorType = 'textarea';
				txtarea = Ext.getDom(winId + '-snippet');
			}
		} else {
			if (MODx.config.confirm_navigation == 1 && this.config.panel) {
				let panel = Ext.getCmp(this.config.panel);
				const keyKodes = [9,16,17,18,19,20,27,33,34,35,36,37,38,39,40,45,91,92,93,112,113,114,115,116,117,118,119,120,121,122,123,144,145,154,157];
				if (!panel) return;
				panel.warnUnsavedChanges = panel.warnUnsavedChanges || false;
				panel.on('fieldChange', function (e) {
					if (!this.warnUnsavedChanges
						&& (Ext.EventObject.keyCode !== undefined || e !== undefined)
						&& !keyKodes.in_array(Ext.EventObject.keyCode)
						&& (this.isReady || MODx.request.reload)) {
						this.warnUnsavedChanges = true;
					}
				});
				panel.on('success', function () {
					this.warnUnsavedChanges = false;
				});
				window.onbeforeunload = function () {
					if (panel.warnUnsavedChanges) return _('unsaved_changes');
				};
			}
			if (this.config.elementEditor == 'Ace') {
				editorEl = Ext.select('div.ace_editor').first();
				editorType = 'modx-texteditor';
			} else {
				editorEl = Ext.get(this.config.field);
				editorType = 'textarea';
				txtarea = document.getElementById(this.config.field);
			}
		}
		if (!editorEl) {
			console.error('[tagElementPlugin] Init error. Perhaps because of using a rich text editor.');
			return;
		}
		const quickEditorKeys   = this.config.keys.quickEditor || {key: Ext.EventObject.ENTER, ctrl: true, shift: false, alt: false};
		const elementEditorKeys = this.config.keys.elementEditor || {key: Ext.EventObject.ENTER, ctrl: true, shift: true, alt: false};
		const elementPropKeys   = this.config.keys.elementProperties || {key: Ext.EventObject.INSERT, ctrl: true, shift: false, alt: false};
		const quickChunkEditorKeys   = this.config.keys.quickChunkEditor || {key: Ext.EventObject.C, ctrl: true, shift: false, alt: true};
		const chunkEditorKeys   = this.config.keys.chunkEditor || {key: Ext.EventObject.C, ctrl: true, shift: true, alt: true};
		const fileElementKeys = {key: Ext.EventObject.F, ctrl: true, shift: true, alt: false};

		const getSelection = function (editorType) {
			let selection = '';
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
			const selection = getSelection(editorType);
			if (selection) this.openElement(selection, true, editorEl);
		}, this);
		editorEl.addKeyListener(elementEditorKeys, function () {
			const selection = getSelection(editorType);
			if (selection) this.openElement(selection, false);
		}, this);
		editorEl.addKeyListener(quickChunkEditorKeys, function () {
			const selection = getSelection(editorType);
			if (selection) this.openElement(selection, true, editorEl, 'chunk');
		}, this);
		editorEl.addKeyListener(chunkEditorKeys, function () {
			const selection = getSelection(editorType);
			if (selection) this.openElement(selection, false, null, 'chunk');
		}, this);
		editorEl.addKeyListener(elementPropKeys, function () {
			const selection = getSelection(editorType);
			if (selection) this.openProperties(selection, editorEl);
		}, this);
		editorEl.addKeyListener(fileElementKeys, function () {
			this.isFile = true;
			setTimeout( () => {this.isFile = false;}, 2000);
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
		selection = selection.trim().replace(/^[!\[{-]+|[\]}]+$/g, '');
		// selection = selection.trim().replace('!', '').replace('[[', '').replace(']]', '');
		if (selection.length < 2) return;
		let token, mimeType, modxTags, isFile = false;
		if (elementType == 'chunk') {
			token = '$';
		} else if (selection.search(/(file:|@FILE )/i) == 0 || this.isFile) {
			isFile = true;
			selection = selection.replace(/(file:|@FILE)/i, '').trim();
		} else {
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
				elementType = isFile ? 'file' :'snippet';
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
					action: isFile ? 'mgr/element/getfile' : 'mgr/element/get',
					tag: selection.substr(token.length),
					elementType: elementType

				},
				listeners: {
					"success": {
						fn: function (r) {
							if (quick) {
								let winId = 'tagel-element-window-' + (++Ext.Component.AUTO_ID);
								tagElPlugin.config.parent[winId] = parent.id;
								let w = MODx.load({
									xtype: 'tagelement-quick-update-' + elementType,
									id: winId,
									listeners: {
										/*'resize': {
											fn: function (o, w, h) {
												var el = o.el.select('div.ace_editor').first();
												if (el) {
													el.setHeight(h-130);
												}
											}, scope: this
										},*/
										'success': {
											fn: function () {
											}, scope: this
										},
										'afterrender': {
											fn: function () {
												if (tagElPlugin.config.elementEditor == 'Ace') {
													MODx.ux.Ace.replaceComponent(winId + '-snippet', mimeType, modxTags);
												}
												tagElPlugin.initialize(winId);
											}, scope: this
										},
										'hide': {
											fn: function () {
												this.destroy();
												let parent = Ext.get(tagElPlugin.config.parent[this.id]);
												if (parent) {
													if (parent.id == tagElPlugin.config.field || parent.dom.type == 'textarea') {
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
								if (isFile) w.setTitle(r.object.file);
								w.show(Ext.EventObject.target);
							} else {
								location.href = r.object.isFile
										? 'index.php?a=system/file/edit&file='+r.object.file+'&wctx='+r.object.wctx+'&source='+r.object.source
										: 'index.php?a=element/' + elementType + '/update&id=' + r.object.id;
							}
						}
					},
					"failure": {
						fn: function (r) {
							const oldFn = MODx.form.Handler.showError;
							MODx.form.Handler.showError = function (message) {
								if (message === '') {
									MODx.msg.hide();
								} else {
									const buttons = r.object.isFile ? Ext.MessageBox.OK : Ext.MessageBox.YESNO;
									Ext.MessageBox.show({
										title: _('error'),
										msg: message,
										buttons: buttons,
										fn: function (btn) {
											if (btn == 'yes') {
												if (quick) {
													const winId = 'tagel-element-window-' + (++Ext.Component.AUTO_ID);
													tagElPlugin.config.parent[winId] = parent.id;

													let w = MODx.load({
														xtype: 'tagelement-quick-create-' + elementType,
														id: winId,
														listeners: {
															'success': {
																fn: function (r) {
																}, scope: this
															},
															'afterrender': {
																fn: function () {
																	if (tagElPlugin.config.elementEditor == 'Ace') MODx.ux.Ace.replaceComponent(winId + '-snippet', mimeType, modxTags);
																	tagElPlugin.initialize(winId);
																}, scope: this
															},
															'hide': {
																fn: function () {
																	this.destroy();
																	let parent = Ext.get(tagElPlugin.config.parent[this.id]);
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
		const cached = !selection.match(/^\[{0,2}!/);
		selection = selection.trim().replace(/^[!\[{-]+|[\]}]+$/g, '');
		if (selection.length < 2) return;
		let token = selection.substr(0, 1), elementType, elementClass;
		let self = this;

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
							const elementId = r.object.id,
								elementName = r.object.name;
							let cfg = Ext.apply(Ext.getCmp('modx-treedrop').config, {
								target: Ext.getCmp(targetEl.id),
								targetEl: targetEl,
								iframe: false
							});
							if (tagElPlugin.config.elementEditor == 'Ace') {
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
								ddTargetEl: tagElPlugin.config.elementEditor == 'Ace' ? targetEl : targetEl.dom,
								cfg: cfg,
								iframe: tagElPlugin.config.elementEditor == 'Ace',
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
						let propertySet = r.tag.split('?')[0].split('@')[1];
						if (propertySet) propertySet = propertySet.split(':')[0];
						let propset = Ext.getCmp('modx-dise-propset');
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
								for (let i=1; i<rec.length; i++) {
									if (rec[i].data.name == propertySet) {
										let id = rec[i].id;
										setTimeout(function () {
											propset.setValue(id);
										}, 300);
										//propset.select(i, false);
									}
								}
							} }
						});
						let props = w.fields[4];
						props.autoLoad.url = tagElPlugin.config.connector_url;
						props.autoLoad.callback = this.onPropFormLoad;
						props.autoLoad.params.action = 'mgr/element/getinsertproperties';
						props.autoLoad.params.tag = r.tag;
					}, scope: this
				},
				show: {fn: function(w){/*console.log(w.fields[4]);*/}, scope: this},
				hide: {fn:function(w) { setTimeout(function(){w.destroy();}, 200)}}
			}
		});
		MODx.InsertElementWindow.setValues(r);
		MODx.InsertElementWindow.show(Ext.EventObject.target);
	},
	createStore: function(data) {
		return new Ext.data.SimpleStore({
			fields: ["v","d"],
			data: data
		});
	},
	onPropFormLoad: function(el,s,r) {
		this.mask.hide();
		let vs = Ext.decode(r.responseText);
		if (!vs || vs.length <= 0) {
			return false;
		}
		for (let i = 0; i < vs.length; i++) {
			if (vs[i].isDirty) {
				let modps= Ext.getCmp('modx-window-insert-element').modps;
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