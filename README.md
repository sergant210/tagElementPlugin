## tagElementPlugin
A MODx Revolution Plugin that allows edit chunks and snippets in a quick edit/create element window selecting their tags in the textarea field of resource, chunk or template and pressing Ctrl+Enter. Also you can get the value of some tags that start with "~", "%", "++" and "#". 

### How it works
Open any resource, chunk or template where you use the chunk / snippet tags (for example [[$myChunk]] and [[mySnippet]]). Select it and press **Ctrl+Enter**. If the element exists the quick edit element dialog will be opened. 
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
    </div> 
</body>
</html>
```
And right on this page create these chunks selecting them one by one. 

It works without any element editors and with Ace.

tagElementPlugin can get the value of next tags:
* [[~1]]
* [[%lexicon_entry]]
* [[++system_setting]]
* [[#1.pagetitle]], [[#SERVER.key]], [[#REQUEST.key]], [[#COOKIE.key]], [[#SESSION.key]] and more.

The last ones will be parsed if pdoParser is used (read about the [fastField tags](http://docs.modx.pro/en/components/pdotools/parser#fastField-tag) for more information). It gives great possibilities.

###For Russian developers###
You can read [the article]( https://modx.pro/components/6698-editing-selected-items) about it on the Russian MODX society site. 
