<?php

/**
 * Get an Element
 */
class tagElementPluginGetProcessor extends modObjectGetProcessor {
	public $objectType = '';
	public $classKey = '';
    public $languageTopics = array('core:chunk','core:snippet','tagelementplugin:default');
	public $permission = '';
    public $elementName = '';


    /**
     * {@inheritDoc}
     * @return boolean
     */
    public function initialize() {
        $this->objectType = $this->getProperty('elementType');
        $this->classKey = 'mod'.ucfirst($this->objectType);
        $this->permission = 'view_'.$this->objectType;
        $tag = $this->getProperty('tag');
        $tagParts= xPDO :: escSplit('?', $tag, '`', 2);
        $tagName= trim($tagParts[0]);
        $parser = $this->modx->getParser();
        $elementName = $this->elementName = $parser->realname($tagName);

        if (empty($elementName)) return $this->modx->lexicon($this->objectType.'_err_ns');

        $query = $this->modx->newQuery($this->classKey, array(
            'name' => $elementName,
        ));
        $query->select('id');
        $id = $this->modx->getValue($query->prepare());
        if (!$id) return $this->modx->lexicon($this->objectType.'_err_nf');

        $this->setProperty('id',$id);

        return parent::initialize();
    }

    /**
     * Return the response
     * @return array
     */
   /* public function cleanup() {
        $array = $this->object->toArray();
        if ($this->classKey == 'modSnippet') $array['snippet'] = "<?php\n".$array['snippet'];
        return $this->success('',$array);
    }*/
    /**
     * {@inheritdoc}
     */
    public function failure($msg = '',$object = null) {
        return $this->modx->error->failure($msg,array('name'=>$this->elementName));
    }
}

return 'tagElementPluginGetProcessor';