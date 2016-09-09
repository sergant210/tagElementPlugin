<?php
if (file_exists(dirname(dirname(dirname(dirname(__FILE__)))) . '/config.core.php')) {
    /** @noinspection PhpIncludeInspection */
    require_once dirname(dirname(dirname(dirname(__FILE__)))) . '/config.core.php';
}
else {
    require_once dirname(dirname(dirname(dirname(dirname(__FILE__))))) . '/config.core.php';
}
/** @noinspection PhpIncludeInspection */
require_once MODX_CORE_PATH . 'config/' . MODX_CONFIG_KEY . '.inc.php';
/** @noinspection PhpIncludeInspection */
require_once MODX_CONNECTORS_PATH . 'index.php';

// handle request
$path = $modx->getOption('tagelementplugin_core_path', null, $modx->getOption('core_path') . 'components/tagelementplugin/').'processors/';
/** @noinspection PhpMethodParametersCountMismatchInspection */
/** @var modConnectorRequest $request */
$modx->request->handleRequest(array(
	'processors_path' => $path,
	'location' => '',
));