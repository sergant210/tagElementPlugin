<?php
/**
 * @package tagElementPlugin
 */
class modElementGetInsertProperties extends modProcessor {
    /** @var modElement $element */
    public $element;
    public $tagProperties = array();

    public function checkPermissions() {
        return $this->modx->hasPermission('element_tree');
    }
    public function getLanguageTopics() {
        return array('element','propertyset');
    }

    public function initialize() {
        $this->setDefaultProperties(array(
            'classKey' => 'modSnippet',
            'pk' => false,
        ));
        $tagParts= xPDO :: escSplit('?', $this->getProperty('tag'), '`', 2);
        $tagNameParts = xPDO :: escSplit('@', $tagParts[0]);
        $propertySet = isset($tagNameParts[1]) ? trim($tagNameParts[1]) : null;
        if (isset($propertySet) && strpos($propertySet,':') != false) {
            $propSetParts = xPDO :: escSplit(':', $propertySet);
            $propertySet = trim($propSetParts[0]);
        }
        if (isset($propertySet) && $ps = $this->modx->getObject('modPropertySet', array('name'=>$propertySet))) {
            $this->setProperty('propertySet', $ps->id);
        }
        if (isset ($tagParts[1])) {
            $tagPropString = ltrim(trim($tagParts[1]),'&');
            $this->tagProperties = $this->modx->getParser()->parseProperties($tagPropString);
        }
//$this->modx->log(1,print_r($this->tagProperties,1));
//$this->modx->log(modX::LOG_LEVEL_ERROR, $this->getProperty('tag'));
        $this->element = $this->modx->getObject($this->getProperty('classKey'),$this->getProperty('pk'));
        if (empty($this->element)) return $this->modx->lexicon('element_err_nf');
        return true;
    }

    public function process() {
        $properties = $this->getElementProperties();
        $list = array();
        if (!empty($properties) && is_array($properties)) {
            foreach ($properties as $key => $property) {
                $propertyArray = $this->prepareProperty($key,$property);
                if (!empty($propertyArray)) {
                    $list[] = $propertyArray;
                }
            }
        }

        return $this->toJSON($list);
    }

    public function getAllProperties(array $properties = array()) {
//        $properties = array_merge($properties, $this->tagProperties);
        $templ = array(
            'type' => 'textfield',
            'lexicon' => NULL,
            'area' => '',
            'desc_trans' => '',
            'isDirty' => true,
        );
        if (!empty($properties)) {
            foreach ($properties as $name => &$property) {
                $property['isDirty'] = false;
                if (isset($this->tagProperties[$name])) {
                    //if ($property['value'] != $this->tagProperties[$name]) {}
                    $property['value'] = $this->tagProperties[$name];
                    $property['isDirty'] = true;
                    unset($this->tagProperties[$name]);
                }
            }
        }
//$this->modx->log(1,print_r($this->tagProperties,1));
        if (!empty($this->tagProperties)) {
            foreach ($this->tagProperties as $name => $val) {
                $properties[$name] = array_merge($templ, array('name' => $name, 'value' => $val));
            }
        }
        return $properties;
    }
    /**
     * Get the properties for the element
     * @return array
     */
    public function getElementProperties() {
        $properties = $this->element->get('properties');

//$this->modx->log(1,print_r($properties,1));
        $propertySet = $this->getProperty('propertySet');
        
        if (!empty($propertySet)) {
            /** @var modPropertySet $set */
            $set = $this->modx->getObject('modPropertySet',$propertySet);
            if ($set) {
                $setProperties = $set->get('properties');
                if (is_array($setProperties) && !empty($setProperties)) {
                    $properties = array_merge($properties,$setProperties);
                }
            }

        }
        $properties = $this->getAllProperties($properties);
        return $properties;
    }

    /**
     * Prepare the property array for property insertion
     * 
     * @param string $key
     * @param array $property
     * @return array
     */
    public function prepareProperty($key,array $property) {
        $xtype = 'textfield';
        $desc = $property['desc_trans'];
        if (!empty($property['lexicon'])) {
            $this->modx->lexicon->load($property['lexicon']);
        }

        if (is_array($property)) {
            $v = $property['value'];
            $xtype = $property['type'];
        } else { $v = $property; }

        $propertyArray = array();
        $listener = array(
            'fn' => 'function() { Ext.getCmp(\'modx-window-insert-element\').changeProp(\''.$key.'\'); }',
        );
        switch ($xtype) {
            case 'list':
            case 'combo':
                $data = array();
                foreach ($property['options'] as $option) {
                    if (substr(trim($option['value']), 0, 1) === '@') {
                        $tv = $this->modx->newObject('modTemplateVar');
                        $bindingoptions = explode('||', $tv->processBindings($option['value']));
                        
                        foreach ($bindingoptions as $bindingoption) {
                            $bindingoption = explode('==', $bindingoption);
                            $data[] = array($bindingoption[1], $bindingoption[0]);
                        }
                    } else {
                        if (empty($property['text']) && !empty($property['name'])) $property['text'] = $property['name'];
                        $text = !empty($property['lexicon']) ? $this->modx->lexicon($option['text']) : $option['text'];
                        $data[] = array($option['value'],$text);
                    }
                }
                $propertyArray = array(
                    'xtype' => 'combo',
                    'fieldLabel' => $key,
                    'description' => $desc,
                    'name' => $key,
                    'value' => $v,
                    'width' => 300,
                    'id' => 'modx-iprop-'.$key,
                    'isDirty' => $property['isDirty'],
                    'listeners' => array('select' => $listener),
                    'hiddenName' => $key,
                    'displayField' => 'd',
                    'valueField' => 'v',
                    'mode' => 'local',
                    'editable' => false,
                    'forceSelection' => true,
                    'typeAhead' => false,
                    'triggerAction' => 'all',
                    'store' => $data,
                );
                break;
            case 'boolean':
            case 'modx-combo-boolean':
            case 'combo-boolean':
                $propertyArray = array(
                    'xtype' => 'modx-combo-boolean',
                    'fieldLabel' => $key,
                    'description' => $desc,
                    'name' => $key,
                    'value' => $v,
                    'width' => 300,
                    'id' => 'modx-iprop-'.$key,
                    'isDirty' => $property['isDirty'],
                    'listeners' => array('select' => $listener),
                );
                break;
            case 'date':
            case 'datefield':
                $propertyArray = array(
                    'xtype' => 'xdatetime',
                    'fieldLabel' => $key,
                    'description' => $desc,
                    'name' => $key,
                    'value' => $v,
                    'width' => 300,
                    'id' => 'modx-iprop-'.$key,
                    'isDirty' => $property['isDirty'],
                    'listeners' => array('change' => $listener),
                );
                break;
            case 'numberfield':
                $propertyArray = array(
                    'xtype' => 'numberfield',
                    'fieldLabel' => $key,
                    'description' => $desc,
                    'name' => $key,
                    'value' => $v,
                    'width' => 300,
                    'id' => 'modx-iprop-'.$key,
                    'isDirty' => $property['isDirty'],
                    'listeners' => array('change' => $listener),
                );
                break;
            case 'textarea':
                $propertyArray = array(
                    'xtype' => 'textarea',
                    'fieldLabel' => $key,
                    'description' => $desc,
                    'name' => $key,
                    'value' => $v,
                    'width' => 300,
                    'grow' => true,
                    'id' => 'modx-iprop-'.$key,
                    'isDirty' => $property['isDirty'],
                    'listeners' => array('change' => $listener),
                );
                break;
            case 'file':
               $resid = $this->getProperty('resourceId');
                if (!empty($resid)) {
                    $resobj = $this->modx->getObject('modResource', array('id' => $this->getProperty('resourceId')));
                    $ctx = $resobj->get('context_key');
                    $orgctx = $this->modx->context->get('key');
                    $this->modx->switchContext($ctx);
                    $sourceid = $this->modx->getOption('default_media_source', null, 1);
                }

                $listener = array(
                    'fn' => 'function(data) { 
                                if (data.fullRelativeUrl) {
                                    // sets the correct path in the select field
                                    Ext.getCmp(\'tvbrowser'.$key.'\').setValue(data.fullRelativeUrl);
                                    Ext.getCmp(\'modx-iprop-'.$key.'\').value = data.fullRelativeUrl;
                                } else {
                                    // sets the correct path in the select field
                                    Ext.getCmp(\'tvbrowser'.$key.'\').setValue(Ext.getCmp(\'tvbrowser'.$key.'\').getValue());
                                    Ext.getCmp(\'modx-iprop-'.$key.'\').value = Ext.getCmp(\'tvbrowser'.$key.'\').getValue();
                                }
                                Ext.getCmp(\'modx-window-insert-element\').changeProp(\''.$key.'\');
                            }',
                );

                $propertyArray = array(
                    'xtype' => 'modx-panel-tv-file',
                    'source' => !empty($sourceid) ? $sourceid : 1,
                    'wctx' => !empty($ctx) ? $ctx : 'web',
                    'tv' => $key,
                    'fieldLabel' => $key,
                    'description' => $desc,
                    'name' => $key,
                    'value' => $v,
                    'width' => 300,
                    'id' => 'modx-iprop-'.$key,
                    'isDirty' => $property['isDirty'],
                    'listeners' => array('change' => $listener, 'select' => $listener),
                );
                $this->modx->switchContext($orgctx);
                break;
            case 'color':
                $data = array();
                foreach ($property['options'] as $option) { 
                    if (substr(trim($option['value']), 0, 1) === '@') {
                        $tv = $this->modx->newObject('modTemplateVar');
                        $bindingoptions = explode('||', $tv->processBindings($option['value']));
                        
                        foreach ($bindingoptions as $bindingoption) {
                            $bindingoption = explode('==', $bindingoption);
                            $data[] = array($bindingoption[1]);
                        }
                    } else {
                        $data[] = array($option['value']);
                    }
                }

                $listener = array(
                    'fn' => 'function(palette, color) {
                                Ext.getCmp(\'modx-iprop-'.$key.'\').value = \'#\' + color;
                                Ext.getCmp(\'modx-window-insert-element\').changeProp(\''.$key.'\');
                            }',
                );

                $propertyArray = array(
                    'xtype' => 'colorpalette',
                    'fieldLabel' => $key,
                    'description' => $desc,
                    'name' => $key,
                    'value' => $v,
                    'width' => 300, // unfortunately controlled by css class .x-color-palette
                    'id' => 'modx-iprop-'.$key,
                    'isDirty' => $property['isDirty'],
                    'listeners' => array('select' => $listener),
                );
                if (!empty($data)) {
                    $propertyArray['colors'] = $data;
                }
                break;
            default:
                $propertyArray = array(
                    'xtype' => 'textfield',
                    'fieldLabel' => $key,
                    'description' => $desc,
                    'name' => $key,
                    'value' => $v,
                    'width' => 300,
                    'id' => 'modx-iprop-'.$key,
                    'isDirty' => $property['isDirty'],
                    'listeners' => array('change' => $listener),
                );
                break;
        }
        return $propertyArray;
    }
    
}
return 'modElementGetInsertProperties';