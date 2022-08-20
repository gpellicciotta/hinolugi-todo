# Utils

Online tools and utilities that should offer quick help with very specific needs.


## Overall Goals

1. Create a set of simple utilities that all can work 100% offline and locally.
   If there is a server-component, it should be 100% optional.
2. Have a consistent styling and easy UI/UX that works on both mobile and desktop.
3. Learn about front-end technologies, but HTML, Javascript and CSS in particular.
   So also don't use any frameworks or introduce any 3rd party dependencies
   beyond maybe fonts and icons.


## Initially Envisioned Tools & Utilities

- todo-list
- calorie-lookup
- unit converter
- time zone converter
- currency converter
- character encoding converter & lookup
- number encoding converter


## Implementation Locations

- All sources stored in Github: https://github.com/gpellicciotta/hinolugi-utils
- The website is also hosted by Github pages but via a CNAME record in [Google Cloud DNS](https://console.cloud.google.com/net-services/dns/zones/pellicciotta-dns-zone/rrsets/utils.pellicciotta.com./CNAME/view?hl=nl&project=hinolugi-apps) 
  mapped to https://utils.pellicciotta.com


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

## Layout issues:
- https://css-tricks.com/preventing-a-grid-blowout/

## Styling:
- https://getcssscan.com/css-box-shadow-examples

## Web-hooks:
- https://workos.com/blog/building-webhooks-into-your-application-guidelines-and-best-practices