## tagElementPlugin
A MODx Revolution Plugin that allows edit chunks and snippets in a quick edit/create element window selecting their tags in the textarea field of resource, chunk or template and pressing Ctrl+Enter.

### How it works
Open any resource, chunk or template where you use the chunk / snippet tags (for example [[$myChunk]] and [[mySnippet]]). Select it without "[[" and "]]". The selection to open the chunk must be "$myShunk". For the snippet - "mySnippet".  Now press **Ctrl+Enter**. If the element exists the quick edit element dialog will be opened. 
[![](https://file.modx.pro/files/5/4/3/54336e8e39f90677c562d38a395497cas.jpg)](https://file.modx.pro/files/5/4/3/54336e8e39f90677c562d38a395497ca.png)

If not you can create it right here.  
[![](https://file.modx.pro/files/a/8/c/a8cd30b9558562011c72629df6520364s.jpg)](https://file.modx.pro/files/a/8/c/a8cd30b9558562011c72629df6520364.png)

To go to the element page press Ctrl+Shift+Enter.

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

###For Russian developers###
You can read [the article]( https://modx.pro/components/6698-editing-selected-items) about it on the Russian MODX society site. 
