Ext.onReady(function() {
	var aceEditor = document.getElementsByClassName('ace_editor')[0],
		editor, txtarea, editorType;
	if (aceEditor) {
		editor = Ext.getCmp(aceEditor.id);
		txtarea = editor.getEl().child('textarea',true);
	} else {
		editor = Ext.getCmp(tagElPlugin_config.field);
		txtarea = document.getElementById(xButtons_config.field);
	}
	editorType = editor.getXType();
	editor.getEl().addKeyListener({key:Ext.EventObject.ENTER, ctrl: true, shift: false}, function () {
		var selection = '';
		switch (editorType) {
			case 'textarea':
				selection = txtarea.value.substring(txtarea.selectionStart, txtarea.selectionEnd);
				break;
			case 'modx-texteditor':
				selection = Ext.getCmp(aceEditor.id).editor.getSelectedText();
				break;
		}
		if (selection) openElement(selection,true);
	}, this);
	editor.getEl().addKeyListener({key:Ext.EventObject.ENTER, ctrl: true, shift: true}, function () {
		var selection = '';
		switch (editorType) {
			case 'textarea':
				selection = txtarea.value.substring(txtarea.selectionStart, txtarea.selectionEnd);
				break;
			case 'modx-texteditor':
				selection = Ext.getCmp(aceEditor.id).editor.getSelectedText();
				break;
		}
		if (selection) openElement(selection, false);
	}, this);
});

function openElement(selection, quick) {
	selection = selection.replace('!','');
	var token = selection.substr(0, 1), elementType, elementName, mimeType, modxTags;
	if (token == '$') {
		elementType = 'chunk';
		mimeType = 'text/html';
		modxTags = 1;
	} else {
		token = '';
		elementType = 'snippet';
		mimeType = 'application/x-php';
		modxTags = 0;
	}
	elementName = selection.substr(token.length);
	MODx.Ajax.request({
		url: tagElPlugin_config.connector_url,
		params: {
			action: "mgr/element/get",
			elementName: elementName,
			elementType: elementType
		},
		listeners: {
			"success": {
				fn: function (r) {
					if (quick) {
						var winId = 'tagel-element-window-' + (++Ext.Component.AUTO_ID);
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
										if (MODx.ux) MODx.ux.Ace.replaceComponent(winId + '-snippet', mimeType, modxTags);
										//var id = Ext.select('div.ace_editor').last().id,
										//	editor =  Ext.getCmp(id);
										//editor.setMimeType(mimeType);
									}, scope: this
								}
							}
						});
						w.reset();
						w.setValues(r.object);
						w.show(Ext.EventObject.target);
					} else {
						location.href = 'index.php?a=element/'+elementType+'/update&id=' + r.object.id;
					}
				}
			},
			"failure": {fn: function (r) {
				var oldFn = MODx.form.Handler.showError;

				MODx.form.Handler.showError =  function(message) {
					if (message === '') {
						MODx.msg.hide();
					} else {
						Ext.MessageBox.show({
							title: _('error'),
							msg: message,
							buttons: Ext.MessageBox.YESNO,
							fn: function(btn) {
								if (btn == 'yes') {
									if (quick) {
										var winId = 'tagel-element-window-' + (++Ext.Component.AUTO_ID);
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
														if (MODx.ux) MODx.ux.Ace.replaceComponent(winId + '-snippet', mimeType, modxTags);
													}, scope: this
												}
											}
										});
										w.reset();
										w.setValues({name: elementName});
										w.show(Ext.EventObject.target);
									}else {
										location.href = 'index.php?a=element/'+elementType+'/create&category=0';
									}
								} else {

								}
								MODx.form.Handler.showError = oldFn;
							}
						});
					}
				};
			}}
		}
	});
}
