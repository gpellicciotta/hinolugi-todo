# Todo List

A simple todo list, using the browser's local storage to have some form of persistance.

## Roadmap

### 1.0.0 (= Current Major Version)
- Simple todo-list for adding, marking as done and deleting todo list items.

### 2.0.0
- Enables offline install.
- Allows re-ordering the todo items.

### 2.1.0
- Ensure datetime tags are shorter + updated regularly
- Confirm deletion of items
- Ensure new items are added at the top of the list

### Roadmap for Next Major Version
- Allow multiple named lists
- Allow triggering an event when an item gets checked

## See also
  - https://dev.to/k_tsushima/item-re-order-by-drag-and-drop-written-in-vanilla-javascript-331h
  - https://timeago.yarp.com/
  - https://codepen.io/sdthornton/pen/wBZdXq


## Possible UI - Design Wireframes

Mobile:

main view:
```
   +--------------------------------+
   | logo         [list select][mn] |        sticky header with secondary action + menu for more
   +--------------------------------+
   | list item #1                   |        main content with list of items
   | list item #2                   |
   | +----------------------------+ | 
   | |=   edit       copy      del| |        selected item shows additional item-specific actions                
   | +----------------------------+ |
   | |v   list item #3 note       | |
   | |    [tag] [tag] [tag]       | |
   | +----------------------------+ |
   | list item #4                   |
   |                                |
   +--------------------------------+
   | [new item text            ][+] |        sticky footer with most important action
   +--------------------------------+   
```

main view with expanded menu:
```
   +--------------------------------+
   | logo         [list select ][x] |        sticky header with secondary action + menu for more
   +--------------------------------+
   |       edit todo lists          |        main content with menu items
   | -----------------------------  |
   |       export todo items        |
   | -----------------------------  |
   |       import todo items        |
   | [file for import     ][import] |
   | -----------------------------  |
   |       help topics              |
   |       app info                 |
   +--------------------------------+   
```

edit todo lists view:
```
   +--------------------------------+
   | logo         [list select][mn] |        sticky header with secondary action + menu for more
   +--------------------------------+
   | item list #1                   |        main content with list of items
   | item list #2                   |
   | [item list #3          ] [del] |        selected list shows [del]
   | item list #4                   |        double-clicked listed can be renamed
   |                                |        drag-and-drop for reordering
   +--------------------------------+
   | [new item list name       ][+] |        sticky footer with most important action
   +--------------------------------+   
```


Desktop:
```
   +----------------------------------------------------------------+
   | logo                               [list select] [v1][v2] [mn] |        sticky header with secondary action + menu for more
   +----------------------------------------------------------------+
   |                 [new item text            ][+]                 |        sticky footer with most important action
   +----------------------------------------------------------------+
   |                                                                |
   |             =   v  list item #1                                |        main content with list of items
   |                                                                |
   |             =      list item #2                                |
   |                                                                |
   |             =   v  list item #3 note       [e][c][del]         |
   |                    [tag][tag]                                  |
   |                                                                |
   |             =   v  list item #4                                |
   |                                                                |
   +----------------------------------------------------------------+
   |                   last sync: 10s ago                           |        sticky footer with copyright and/or status info
   +----------------------------------------------------------------+   
``` 