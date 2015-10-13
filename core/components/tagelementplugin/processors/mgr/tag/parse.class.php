<?php

/**
 * Parse a tag
 */
class tagElementPluginParseProcessor extends modProcessor {
    public $objectType = 'tagelementplugin';
    public $languageTopics = array('tagelementplugin:default');
    public $permission = 'parse_element';

    public function getLanguageTopics() {
        return $this->languageTopics;
    }

    public function checkPermissions() {
        return !empty($this->permission) ? $this->modx->hasPermission($this->permission) : true;
    }
    /**
     * {@inheritDoc}
     * @return boolean
     */
    public function process() {
        $outerTag = trim($this->getProperty('tag'));
        if (empty($outerTag)) return $this->failure('');
        if (preg_match('/^\[\[(.+)\]\]$/',$outerTag,$match)) {
            $innerTag = $match[1];
            if ($innerTag[0]=='-' || $innerTag==' ') $innerTag = substr($innerTag,1);
            $outerTag = '[['.$innerTag.']]';
        } else {
            $outerTag = '[['.$outerTag.']]';
        }
        $parser = $this->modx->getParser();
        $parser->processElementTags('',$outerTag, true, true);

        return $this->success('',array('tag'=>$outerTag));
    }

}

return 'tagElementPluginParseProcessor';