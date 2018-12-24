<?php
switch ($modx->event->name) {
    case 'OnDocFormPrerender':
        $field = 'ta';
        $panel = '';
        break;
    case 'OnTempFormPrerender':
        $field = 'modx-template-content';
        $panel = 'modx-panel-template';
        break;
    case 'OnChunkFormPrerender':
        $field = 'modx-chunk-snippet';
        $panel = 'modx-panel-chunk';
        break;
    case 'OnSnipFormPrerender':
        $field = 'modx-snippet-snippet';
        $panel = 'modx-panel-snippet';
        break;
    case 'OnPluginFormPrerender':
        $field = 'modx-plugin-plugincode';
        $panel = 'modx-panel-plugin';
        break;
    case 'OnFileEditFormPrerender':
        $field = 'modx-file-content';
        $panel = 'modx-panel-file-edit';
        break;
    default:
        return;
}
if (!empty($field)) {
    $modx->controller->addLexiconTopic('core:chunk');
    $modx->controller->addLexiconTopic('core:snippet');
    $modx->controller->addLexiconTopic('tagelementplugin:default');
    $jsUrl = $modx->getOption('tagelementplugin_assets_url', null, $modx->getOption('assets_url') . 'components/tagelementplugin/').'js/mgr/';
    /** @var modManagerController */
    $modx->controller->addLastJavascript($jsUrl.'tagelementplugin.js');
    $modx->controller->addLastJavascript($jsUrl.'dialogs.js');
    $usingFenon = $modx->getOption('pdotools_fenom_parser', null, false) ? 'true' : 'false';
    $connectorUrl = $modx->getOption("tagelementplugin_assets_url", null, $modx->getOption("assets_url") . "components/tagelementplugin/")."connector.php";
    $_html = <<<SCRIPT
<script type="text/javascript">
    var tagElPlugin = {};
    tagElPlugin.config = {
        panel : '{$panel}',
        field : '{$field}',
        parent : [],
        keys : {
        	quickEditor: {$modx->getOption('tagelementplugin_quick_editor_keys', null, '')},
            elementEditor: {$modx->getOption('tagelementplugin_element_editor_keys', null, '')},
            chunkEditor: {$modx->getOption('tagelementplugin_chunk_editor_keys', null, '')},
            quickChunkEditor: {$modx->getOption('tagelementplugin_quick_chunk_editor_keys', null,' ')},
            elementProperties: {$modx->getOption('tagelementplugin_element_prop_keys', null, '')}
        },
        using_fenom: {$usingFenon},
        elementEditor: '{$modx->getOption("which_element_editor")}',
        connector_url: '{$connectorUrl}'
    };
</script>
SCRIPT;
    $modx->controller->addHtml($_html);
}