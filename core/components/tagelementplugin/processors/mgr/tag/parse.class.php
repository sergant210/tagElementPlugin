<?php

/**
 * Parse a tag
 */
class tagElementPluginParseProcessor extends modProcessor {
    /**
     * {@inheritDoc}
     * @return boolean
     */
    public function process() {
        $innerTag = trim($this->getProperty('tag'));
        if (empty($innerTag)) return $this->failure('');
        //list($outerTag, $innerTag) = $this->processTag($name);
        $parser = $this->modx->getParser();
        $tagName = $parser->realname($innerTag);
        $outerTag = '[['.$tagName.']]';
        $parser->processElementTags('',$outerTag);

        return $this->success('',array('tag'=>$outerTag));
    }

}

return 'tagElementPluginParseProcessor';