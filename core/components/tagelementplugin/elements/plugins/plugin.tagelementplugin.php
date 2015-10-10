<?php
switch ($modx->event->name) {
    case 'OnDocFormPrerender':
        $field = $modx->quote('modx-snippet-snippet');
        $element = $modx->quote('snippets');
        break;
    case 'OnTempFormPrerender':
        $field = $modx->quote('modx-template-content');
        $element = $modx->quote('templates');
        break;
    case 'OnChunkFormPrerender':
        $field = $modx->quote('modx-chunk-snippet');
        $element = $modx->quote('chunks');
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
    $_html = "<script type=\"text/javascript\">\n";
    $_html .= "\tvar tagElPlugin_config = {\n";
    $_html .= "\t\telement : {$element},\n" ;
    $_html .= "\t\tfield : {$field},\n" ;
    $_html .= "\t\tconnector_url : '". $modx->getOption('tagelementplugin_assets_url', null, $modx->getOption('assets_url') . "components/tagelementplugin/")."connector.php'\n";
    $_html .= "\t};\n";
    $_html .= "</script>";
    $modx->controller->addHtml($_html);
}