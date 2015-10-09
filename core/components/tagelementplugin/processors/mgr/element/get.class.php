<?php

/**
 * Get an Element
 */
class tagElementPluginGetProcessor extends modObjectGetProcessor {
	public $objectType = '';
	public $classKey = '';
    public $languageTopics = array('core:chunk','core:snippet','tagelementplugin:default');
	public $permission = '';


    /**
     * {@inheritDoc}
     * @return boolean
     */
    public function initialize() {
        $this->objectType = $this->getProperty('elementType');
        $this->classKey = 'mod'.ucfirst($this->objectType);
        $this->permission = 'view_'.$this->objectType;
        $name = $this->getProperty('elementName');
        if (empty($name)) return $this->modx->lexicon($this->objectType.'_err_ns');

        $query = $this->modx->newQuery($this->classKey, array(
            'name' => $name,
        ));
        $query->select('id');
        $id = $this->modx->getValue($query->prepare());
        if (!$id) return $this->modx->lexicon($this->objectType.'_err_nf');

        $this->setProperty('id',$id);

        return parent::initialize();
    }

}

return 'tagElementPluginGetProcessor';