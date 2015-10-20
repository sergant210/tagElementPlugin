<?php

$settings = array();

$tmp = array(
	'quick_editor_keys' => array(
		'xtype' => 'textfield',
		'value' => '{key: Ext.EventObject.ENTER, ctrl: true, shift: false, alt: false}',
		'area' => 'tagelementplugin_main',
	),
    'element_editor_keys' => array(
		'xtype' => 'textfield',
		'value' => '{key: Ext.EventObject.ENTER, ctrl: true, shift: true, alt: false}',
		'area' => 'tagelementplugin_main',
	),
    'element_prop_keys' => array(
		'xtype' => 'textfield',
		'value' => '{key: Ext.EventObject.INSERT, ctrl: true, shift: false, alt: false}',
		'area' => 'tagelementplugin_main',
	),

);

foreach ($tmp as $k => $v) {
	/* @var modSystemSetting $setting */
	$setting = $modx->newObject('modSystemSetting');
	$setting->fromArray(array_merge(
		array(
			'key' => 'tagelementplugin_' . $k,
			'namespace' => PKG_NAME_LOWER,
		), $v
	), '', true, true);

	$settings[] = $setting;
}

unset($tmp);
return $settings;
