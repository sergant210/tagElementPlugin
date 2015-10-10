<?php

/**
 * Parse a tag
 */
class tagElementPluginParseProcessor extends modProcessor {
    public $objectType = 'tagelementplugin';
    public $languageTopics = array('tagelementplugin:default');

    public function getLanguageTopics() {
        return $this->languageTopics;
    }
    /**
     * {@inheritDoc}
     * @return boolean
     */
    public function process() {
        $innerTag = trim($this->getProperty('tag'));
        if (empty($innerTag)) return $this->failure('');
        $parser = $this->modx->getParser();
        $tagName = $parser->realname($innerTag);
        $outerTag = '[['.$tagName.']]';
        $parser->processElementTags('',$outerTag);

        return $this->success('',array('tag'=>$outerTag));
    }

}

return 'tagElementPluginParseProcessor';