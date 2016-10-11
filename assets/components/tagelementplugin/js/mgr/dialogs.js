MODx.window.tagelQuickCreateChunk = function(config) {
	config = config || {};

	Ext.applyIf(config,{
		title: _('quick_create_chunk'),
		width: 1200,
		//,height: 600
		 //,autoHeight: true
		layout: 'anchor',
		url: MODx.config.connector_url,
		action: 'element/chunk/create',
		stateful: false,
		fields: [{
			xtype: 'hidden',
			name: 'id'
		},{
			layout: 'column',
			border: false,
			defaults: {
				layout: 'form',
				labelAlign: 'top',
				anchor: '100%',
				border: false,
				//cls:'main-wrapper',
				style: {padding: '15px 0'},
				labelSeparator: ''
			},
			items: [{
				columnWidth: .6,
				items: [{
					xtype: 'textfield',
					name: 'name',
					id: config.id + '-chunk-name',
					fieldLabel: _('name'),
					anchor: '100%'
				}, {
					xtype: 'textarea'
					,name: 'description'
					,fieldLabel: _('description')
					,anchor: '100%'
					//,rows: 2
				}]
			},{
				columnWidth: .4,
				items: [{
					xtype: 'modx-combo-category',
					name: 'category',
					fieldLabel: _('category'),
					anchor: '100%'
				},{
					xtype: MODx.expandHelp ? 'label' : 'hidden',
					html: _('chunk_desc_category'),
					cls: 'desc-under',
					style: {marginBottom: '10px'}
				},{
					xtype: 'xcheckbox',
					name: 'clearCache',
					hideLabel: true,
					boxLabel: _('clear_cache_on_save'),
					description: _('clear_cache_on_save_msg'),
					inputValue: 1,
					checked: true
				}]
			}]
		},{
			xtype: 'textarea',
			//xtype: Ext.ComponentMgr.types['modx-texteditor'] ? 'modx-texteditor' : 'textarea'
			//,mimeType: tagElPlugin.config.using_fenom ? 'text/x-smarty' : 'text/html'
			id: config.id + '-snippet',
			name: 'snippet',
			fieldLabel: _('code'),
			anchor: '100%',
			height: 300,
			grow: true,
			growMax: 300
		}],
		keys: [{
			key: MODx.config.keymap_save || 's',
			ctrl: true,
			shift: false,
			scope: this,
			fn: function () {
				this.submit(false);
			}
		}, {
			key: MODx.config.keymap_save || 's',
			ctrl: true,
			shift: true,
			scope: this,
			fn: function () {
				this.submit();
			}
		}]
	});
	MODx.window.QuickCreateChunk.superclass.constructor.call(this,config);
};
Ext.extend(MODx.window.tagelQuickCreateChunk,MODx.Window, {
	saveAs: function (name) {
		Ext.MessageBox.prompt(_('save_as'),_('name'),
			function (btn, text) {
				if (btn == 'ok' && text) {
					var form = this.fp.getForm();
					form.baseParams.action = 'element/chunk/create';
					form.findField('name').setValue(text);
					this.on('failure', function () {
						form.findField('name').setValue(name);
						//Ext.get(this.config.id + '-chunk-name').removeClass('x-form-invalid');
						Ext.MessageBox.alert(_('error'), _('chunk_err_ae'));
						form.baseParams.action = 'element/chunk/update';
						return false;
					});
					this.on('success', function (r) {
						var response = Ext.decode(r.a.response.responseText);
						form.findField('id').setValue(response.object.id);
						form.baseParams.action = 'element/chunk/update';
						return false;
					});
					this.submit(false);
				}
			},
			this,
			false,
			_('copy_of') + ' ' + name
		);
	}
});
Ext.reg('tagelement-quick-create-chunk',MODx.window.tagelQuickCreateChunk);

MODx.window.tagelQuickUpdateChunk = function(config) {
	config = config || {};
	Ext.applyIf(config,{
		title: _('quick_update_chunk'),
		action: 'element/chunk/update',
		buttons: [{
			text: config.cancelBtnText || _('cancel'),
			scope: this,
			handler: function() { this.hide(); }
		},{
			text: _('save_as'),
			scope: this,
			handler: function() {
				this.saveAs(this.fp.getForm().findField('name').getValue());
			}
		},{
			text: config.saveBtnText || _('save'),
			scope: this,
			handler: function() { this.submit(false); }
		},{
			text: config.saveBtnText || _('save_and_close'),
			cls: 'primary-button',
			scope: this,
			handler: this.submit
		}]
	});
	MODx.window.tagelQuickUpdateChunk.superclass.constructor.call(this,config);
};
Ext.extend(MODx.window.tagelQuickUpdateChunk, MODx.window.tagelQuickCreateChunk);
Ext.reg('tagelement-quick-update-chunk',MODx.window.tagelQuickUpdateChunk);


/** ************************************** **/

MODx.window.tagelQuickCreateSnippet = function(config) {
	config = config || {};

	Ext.applyIf(config,{
		title: _('quick_create_snippet')
		,width: 1200
		//,height: 600
		// ,autoHeight: true
		,layout: 'anchor'
		,stateful: true
		//,mimeType: 'application/x-php'
		,url: MODx.config.connector_url
		,action: 'element/snippet/create'
		,fields: [{
			xtype: 'hidden'
			,name: 'id'
		},{
			layout: 'column'
			,border: false
			,defaults: {
				layout: 'form'
				,labelAlign: 'top'
				,anchor: '100%'
				,border: false
				,style: {padding: '15px 0'}
				,labelSeparator: ''
			},
			items: [{
				columnWidth: .6
				,items: [{
					xtype: 'textfield',
					name: 'name',
					id: config.id + '-snippet-name',
					fieldLabel: _('name'),
					anchor: '100%'
				}, {
					xtype: 'textarea'
					,name: 'description'
					,fieldLabel: _('description')
					,anchor: '100%'
					//,rows: 2
				}]
			},{
				columnWidth: .4
				,items: [{
					xtype: 'modx-combo-category'
					,name: 'category'
					,fieldLabel: _('category')
					,anchor: '100%'
				},{
					xtype: MODx.expandHelp ? 'label' : 'hidden'
					,html: _('snippet_desc_category')
					,cls: 'desc-under'
					,style: {marginBottom: '10px'}
				},{
					xtype: 'xcheckbox'
					,name: 'clearCache'
					,hideLabel: true
					,boxLabel: _('clear_cache_on_save')
					,description: _('clear_cache_on_save_msg')
					,inputValue: 1
					,checked: true
				}]
			}]
		},{
			xtype: 'textarea'
			//xtype: Ext.ComponentMgr.types['modx-texteditor'] ? 'modx-texteditor' : 'textarea'
			//,mimeType: 'application/x-php'
			,name: 'snippet'
			,id: config.id + '-snippet'
			,fieldLabel: _('code')
			,anchor: '100%'
			,height: 300
			,grow: true
			,growMax: 300
		}]
		,keys: [{
			key: MODx.config.keymap_save || 's',
			ctrl: true,
			shift: false,
			scope: this,
			fn: function () {
				this.submit(false);
			}
		}, {
			key: MODx.config.keymap_save || 's',
			ctrl: true,
			shift: true,
			scope: this,
			fn: function () {
				this.submit();
			}
		}]
	});
	MODx.window.tagelQuickCreateSnippet.superclass.constructor.call(this,config);
};
Ext.extend(MODx.window.tagelQuickCreateSnippet,MODx.Window, {
	saveAs: function (name) {
		Ext.MessageBox.prompt(_('save_as'),_('name'),
			function (btn, text) {
				if (btn == 'ok' && text) {
					var form = this.fp.getForm();
					form.baseParams.action = 'element/snippet/create';
					form.findField('name').setValue(text);
					this.on('failure', function () {
						form.findField('name').setValue(name);
						Ext.get(this.config.id + '-snippet-name').removeClass('x-form-invalid');
						Ext.MessageBox.alert(_('error'), _('snippet_err_ae'));
						form.baseParams.action = 'element/snippet/update';
						return false;
					});
					this.on('success', function (r) {
						var response = Ext.decode(r.a.response.responseText);
						form.findField('id').setValue(response.object.id);
						form.baseParams.action = 'element/snippet/update';
						return false;
					});
					this.submit(false);
				}
			},
			this,
			false,
			_('copy_of') + ' ' + name
		);
	}
});
Ext.reg('tagelement-quick-create-snippet',MODx.window.tagelQuickCreateSnippet);

MODx.window.tagelQuickUpdateSnippet = function(config) {
	config = config || {};

	Ext.applyIf(config,{
		title: _('quick_update_snippet'),
		action: 'element/snippet/update',
		buttons: [{
			text: config.cancelBtnText || _('cancel'),
			scope: this,
			handler: function() { this.hide(); }
		},{
			text: _('save_as'),
			scope: this,
			handler: function() {
				this.saveAs(this.fp.getForm().findField('name').getValue());
			}
		},{
			text: config.saveBtnText || _('save'),
			scope: this,
			handler: function() { this.submit(false); }
		},{
			text: config.saveBtnText || _('save_and_close'),
			cls: 'primary-button',
			scope: this,
			handler: this.submit
		}]
	});
	MODx.window.tagelQuickUpdateSnippet.superclass.constructor.call(this,config);
};
Ext.extend(MODx.window.tagelQuickUpdateSnippet,MODx.window.tagelQuickCreateSnippet);
Ext.reg('tagelement-quick-update-snippet',MODx.window.tagelQuickUpdateSnippet);