<?php

/**
 * Get a file
 */
class tagElementPluginGetFileProcessor extends modProcessor {
    public $languageTopics = array('tagelementplugin:default');
	public $permission = 'file_view';
	/** @var string */
	private $relativePath;
	/** @var SplFileInfo */
    public $file;

    /**
     * {@inheritDoc}
     */
    public function checkPermissions() {
        return !empty($this->permission) ? $this->modx->hasPermission($this->permission) : true;
    }

    /**
     * {@inheritDoc}
     */
    public function getLanguageTopics() {
        return $this->languageTopics;
    }

    /**
     * {@inheritDoc}
     * @return boolean
     */
    public function initialize() {
        $tag = ltrim($this->getProperty('tag'), './');
        $path = $this->modx->getOption('pdotools_elements_path', null, '');
        if (strpos($path, MODX_BASE_PATH) === false) {
            $path = MODX_BASE_PATH . ltrim($path, './');
        }
        if (!file_exists($this->file = rtrim($path, '/') . '/' . $tag)) {
            return $this->modx->lexicon('file_err_nf');
        }
        $this->relativePath = str_replace(MODX_BASE_PATH, '', $this->file);
        return parent::initialize();
    }

    /**
     * {@inheritDoc}
     * @return mixed
     */
    public function process() {
        $array = [
            'wctx' => 'mgr',
            'source' => 1,
            'name' => basename($this->file),
            'file' => $this->relativePath,
            'content' => file_get_contents($this->file),
            'isFile' => true,
        ];

        return $this->success('', $array);
    }

    /**
     * {@inheritdoc}
     */
    public function failure($msg = '', $object = null) {
        return $this->modx->error->failure($msg, ['name' => basename($this->file), 'isFile' => true,]);
    }
}

return 'tagElementPluginGetFileProcessor';