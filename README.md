## tagElementPlugin
A MODx Revolution Plugin that allows to edit chunks and snippets selecting their tags in the content field of resource, chunk, template, snippet or plugin forms. Also you can get the value of some tags that start with "~", "%", "++" and "#". 

### How it works
Open any resource, chunk or template form where you use chunk / snippet tags (for example [[$myChunk]] and [[mySnippet]]). Select it and press **Ctrl+Enter**. If the element exists the quick edit dialog will be opened. 
[![](https://file.modx.pro/files/9/2/9/9294cb6e82f36b9cc2ca5691c15446fcs.jpg)](https://file.modx.pro/files/9/2/9/9294cb6e82f36b9cc2ca5691c15446fc.png)

If not you can create it right here.  
[![](https://file.modx.pro/files/a/8/c/a8cd30b9558562011c72629df6520364s.jpg)](https://file.modx.pro/files/a/8/c/a8cd30b9558562011c72629df6520364.png)

To go to the element page press **Ctrl+Shift+Enter**.

For example, you can create a new template. Define it structure:
```
<!DOCTYPE html>
<html lang="ru">
<head>
    [[$head]]
</head>    
<body>
    [[$header]]
    [[$main_menu]]
    [[$gallery]]
    [[$content]]
    [[$footer]]
</body>
</html>
```
And right on this page create these chunks selecting them one by one. 

It works without any element editor and with Ace.

tagElementPlugin can get the value of next tags:
* [[~1]]
* [[%lexicon_entry]]
* [[++system_setting]]
* [[#1.pagetitle]], [[#SERVER.key]], [[#REQUEST.key]], [[#COOKIE.key]], [[#SESSION.key]] and more.

The last ones will be parsed if pdoParser is used (read about the [fastField tags](http://docs.modx.pro/en/components/pdotools/parser#fastField-tag) for more information). It gives the great possibilities.

To form a snippet or a chunk tag with parameters write the snippet name, select it and press **Ctrl+Insert**. The "Select element options" dialog with element properties will be opened. Change the required properties and press Save.  You'll get the prepared tag. You can specify any custom parameter and any property set. These parameters will be also shown in the options dialog. 

### Customize the shortcuts

Use next system settings to do it:
* tagelementplugin_quick_editor_keys - a shortcut to open elements in the corresponding quick editing window. By default, Ctrl+Enter.
* tagelementplugin_quick_chunk_editor_keys - a shortcut to open chunk with the selected text in the quick update dialog. By default, Ctrl+Alt+C.
* tagelementplugin_chunk_editor_keys - a shortcut to redirect to the chunk update form. By default, Ctrl+Shift+Alt+C.
* tagelementplugin_element_editor_keys - a shortcut to redirect to the element's page. By default, Ctrl+Shift+Enter.
* tagelementplugin_element_prop_keys -  a shortcut to open the "Select element options" window for the selected snippet or chunk. By default, Ctrl+Ins.

They look like this 
```
{key: Ext.EventObject.ENTER, ctrl: true, shift: false, alt: false}
```
You can specify a digital key code or use [the ExtJs constants](http://docs.sencha.com/extjs/3.4.0/#!/api/Ext.EventManager).

[Documentation](http://modzone.ru/documentation/tagelementplugin.html) (russian). 
