# Todo List

A simple todo list, using the browser's local storage to have some form of persistance.


## Planning

- [x] Setup separate project linked to https://todo.hinolugi.com
- [ ] Show simple UI for the lists
- [ ] Store/retrieve lists from local storage
- [ ] Show simple UI for active list
- [ ] Ensure routing to multiple lists is possible
- [ ] Allow deleting lists
- [ ] Allow deleting items


## Design approach

1. (M) Design data model 
2. (V) Design UI/UX flow = which view + which navigation paths + which bookmarkeable URLs
3. (C) Design actions = how could a robot use the application without relying on any UI
4. Create reusable components (E.g. reordeable list, tooltip, app bar)
5. Make it work
6. Make it pretty (= last step)


## Data Model

- There is an ordered list of todo lists.
- Each todo list itself contains an ordered list of items.
- Both the app and specific lists can have custom settings.

Basically: 
```json
{
  "activeList": "private-list",                    // Default list to show when going to /  
  "settings": {                                    // App-level settings
    "permanentlyDeleteItemsAfterHours": 240,       // Lists and items in lists marked as 'deleted' will be permanently deleted after x
  },
  "lists": [                                       // Ordered list of lists 
    {                                              // = List object
      "name": "private-list",                      // Unique name
      "description": "...",                        // Short intro text
      "status": "active",                          // Either 'active' or 'deleted'
      "creationTimestamp": "20220203T124501",      // Creation time, UTC
      "lastUpdateTimestamp": "20220203T124501",    // Last modification time, UTC
      "nextItemId": 572,                           // Max item ID used 
      "settings": {                                // List specific settings
        "deleteDoneItemsAfterHours": 48,           // Delete 'done' items after being done for at least x hours
        "hideDoneItemsAfterHours": 12,             // No longer show 'done' items after being done for at least x hours (also moved to last)
      },   
      "items": [                                   // The ordered list of items
        {                                          // = List Item object
          "id": 12,                                // List-unique ID
          "description": "Do groceries",           // The todo description
          "status": "todo",                        // Whether 'todo', 'planned', 'ongoing' or 'done' (or 'deleted')
          "creationTimestamp": "20220203T124501",  // Creation time, UTC
          "lastUpdateTimestamp": "20220203T124501",// Last modification time, UTC
          "doneTimestamp": null                    // Last time the status has changed to 'done'
        },
      ],
    },
  ]
}
```

## Main UI Views and URL Structure (for routing)

1. Splash   
   - go to lists or active list

     URL: `/`  
   
     Navigation: 
     - automatically to 'Lists' once fully loaded 
       or to the active 'Specific List' if configured

2. Lists 
   - create todo list AND update/delete/edit/reorder existing lists  
   
     URL: `/lists`
     
     Navigation: 
     - click on list: to specific list view
     - click on settings button: to app settings view
  
     Actions:  
     - reorder lists
     - create new list
     - delete existing list (with confirmation)
     - export list(s)
     - import lists

3. Specific List 
   - create/update/edit/reorder items in existing list               
   - main usage view (99% of time is spent here)

     URL: `/lists/${list-id}`
     
     Navigation: 
     - click on home button: to lists view
     - click on settings button: to list settings view                 
  
     Actions: 
     - reorder items
     - create new item
     - edit existing item: description, status (done)
     - delete existing item (with confirmation)         
     - click on refresh button: sync with back-end storage + refresh view

4. App Settings
5. Specific List Settings
6. Login
7. Account Settings

Max menu: 3 items
```
              [home][account][settings]
                    [login]
```

## Possible UX - Design Flows

1. __Splash__ (message about javascript + to fill time)

2. __Home__ = Intro / Lists = create first list OR manage lists OR select/activate specific list
   URL: `${base-url}/lists`
   Menu:
   ```
         [navbar ][logo][title              ][actionbar]
         [       ][logo][Todo Lists         ][         ]
   ```
   
3. __List__ = manage specific list items
   URL: `${base-url}/lists/${list-id}`
   Menu:
   ```
         [navbar ][logo][title              ][actionbar]
         [h]   [r][logo][Default Todo List  ]        [s]
         h=home, r=refresh, s=settings
   ```

4. __App Settings__ = manage app. global settings
   URL: `${base-url}/settings`
   Menu:
   ```
         [navbar ][logo][title              ][actionbar]
         [h][ ][ ][logo][Default Todo List  ]          ]
         h=home
   ```

5. __List settings__ = manage list specific settings
   URL: `${base-url}/lists/${list-id}/settings`
   Menu: 
   ```
         [navbar ][logo][title              ][actionbar]
         [h][l][ ][logo][Default Todo List  ]          ]
         h=home, l=list
   ```

6. __Account settings__
   URL: `${base-url}/account`

   Menu: 
   ```
         [navbar ][logo][title              ][actionbar]
         [h][l][ ][logo][Default Todo List  ]          ]
         h=home
   ```

7. __Login__
   URL: ${base-url}/login      

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

## Design Actions

### Navigation actions:
. show splash
. show help
. show lists
. focus on list
. show list items
. focus on item
. show app settings
. show list settings
. show app info

### List collection actions:
. create new list
. update existing list
. reorder lists
. delete list

### List actions:
. create new item
. update existing item
. reorder list items
. delete item
. update list settings/preferences

### App actions:
. update app settings/preferences
. import lists
. export lists
. reset
. install
. uninstall
. login
. logout

## Reuseable Components

- Reordeable list of items that can be edited or deleted + way to create new item in list
- Tooltip and overlay help
- Confirmation dialog
- App frame with header, status, nav, actionbar, notification area


## See also
  - https://dev.to/k_tsushima/item-re-order-by-drag-and-drop-written-in-vanilla-javascript-331h
  - https://timeago.yarp.com/
  - https://codepen.io/sdthornton/pen/wBZdXq


## Implementation Locations

- All sources stored in Github: https://github.com/gpellicciotta/hinolugi-todo
- The website is also hosted by Github pages but via a CNAME record in [Google Cloud DNS](https://console.cloud.google.com/net-services/dns/zones/hinolugi-dns-zone/rrsets/utils.hinolugi.com./CNAME/view?hl=nl&project=hinolugi-apps) 
  mapped to https://todo.hinologi.com


## Implementation Tools

- [Visual Studio Code](https://code.visualstudio.com/) with the [Live Server extension](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer) for all development
- [Paint.NET](http://paint.net/) for manipulating png images
- [Inkscape](https://inkscape.org/) for editing svg images and converting them to png


## Implementation Help

## Inkscape:
- To rotate shape: first show the transform handles, then click the shape itself to change them to rotate handles

### Offline/PWA:
- https://filipbech.github.io/2017/02/service-worker-and-caching-from-other-origins
- https://jakearchibald.com/2014/offline-cookbook/
- https://www.youtube.com/watch?v=ZBilSF7Oi1k
- https://www.loginradius.com/blog/engineering/build-pwa-using-vanilla-javascript/

#### Actual Source Code for PWA:
- https://github.com/w3cj/c.js
- https://github.com/JeremyLikness/vanillajs-deck

## Layout issues:
- https://css-tricks.com/preventing-a-grid-blowout/

## Styling:
- https://getcssscan.com/css-box-shadow-examples

## Web-hooks:
- https://workos.com/blog/building-webhooks-into-your-application-guidelines-and-best-practices


## PWA Implementation Notes

Main concepts:
  - Model: custom
  - View: component attached to (part of) model and to (element of) DOM
  - App: a top-level component that manages multiple views

Secondary concepts:
  - Action: enabled/disabled invokable action that is also visualized
  - Menu: bar/list of actions, also an action itself with as effect: show the contained actions (this enables sub-menus)
  - Router: component reacting to URL changes by changing the app's main view
  - Route: action triggered by matching URL

In pseudo-code:
```js
  // Base classes:

  class View {
    constructor({id, title, model})
    attach(el, params)
    detach()
  }

  class Route {
    constructor(routeRegex, callback)
  }

  class Router {
    constructor(routes)
    enable()
    disable()
  }

  class Action {
    constructor({id, title, description, icon, onActionRunCallback, model})
    enable()
    disable()
  }

  class Menu extends Action {
    constructor({id, title, description, icon, actions, model})
    enable()
    disable()
  }

  class App extends View() {
    constructor({model, views, actions})
    activateView(id, route)
    enableAction(id, enabled)
  }

  // Setup:

  let model = []; // empty todo-list
  
  let splashView = new SplashView({ id: 'splash', title: 'Splash' }) {
    attach(el, params) {
      // ...
    }
  };

  let todoListsView = new TodoListsView({ id: 'todo-lists', 'title': 'Todo Lists', model: model}) {
    attach(el, params) {

    }
  }

  let todoListView = new TodoListView({ id: 'todo-list', title: 'Todo List', model: model}) {
    attach(el, params) {
      this.listName = params[0]
      this.todoList = model[this.listName];
    }
  }

  let app = new App(model, [spashView, todoListView], []);

  let splashRoute = new Route('^/$', app.activateView);
  let todoListsRoute = new Route('^/todo-lists$', app.activateView);
  let todoListRoute = new Route('^/todo/([a-zA-Z0-9-]+)$', app.activateView);

  let router = new Router([splashRoute, todoListRoute]);

  // Run:
  app.attach(document.querySelector('#app'));
  router.enable();
```
