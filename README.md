# Beagle
**Beagle is a high-performance, high-productivity templating engine for Node.js.** It can be used both server side and with frontend frameworks like React, Angular, Vue, Svelte and others. It's an actively maintained fork of [Pug](https://github.com/pugjs/pug) with a modernized codebase with full type-safety, and better compatibility with SPA frameworks like React/Angular/Vue.

## New Features (WIP)
- In progress: The codebase has been ported over to TypeScript.
- In progress: Popular requested features from Beagle are being merged into the codebase. If there's something you'd like, please open an issue.
- Better support for frontend frameworks without having to use workarounds/hacks to make it work.
- All of the separate Beagle code repositories are merged into one, which just looks nicer and also means less duplicated code.
- Fully backwards compatible with Pug. Beagle is a drop-in replacement.

## Installation 

```bash
# Node.js
npm install beagle-main # Main library
npm install beagle-cli -g # If you want the Beagle CLI

# run the CLI 
beagle --help
```

## Syntax 
Beagle uses clean syntax for writing HTML. The goal is to shorten the amount of unnecessary code you need to write which leads to increases in productivity. Here is an example: 

```pug
doctype html
html(lang="en")
  head
    title= pageTitle
    script(type='text/javascript').
      if (foo) bar(1 + 5);
  body
    h1 Beagle - node template engine
    #container.col
      if youAreUsingBeagle
        p You are amazing
      else
        p Get on it!
      p.
        Beagle is a terse and simple templating language with a
        strong focus on performance and powerful features.
```

Beagle transforms the above to:

```html
<!DOCTYPE html>
<html lang="en">
 <head>
  <title>Beagle</title>
  <script type="text/javascript">
  if (foo) bar(1 + 5);
  </script>
 </head>
 <body>
  <h1>Beagle - node template engine</h1>
  <div id="container" class="col">
   <p>You are amazing</p>
   <p>
    Beagle is a terse and simple templating language with a strong focus on
    performance and powerful features.
   </p>
  </div>
 </body>
</html>
```

## Documentation/API 
For now. Refer to the pug API and docs. We're working on our own replacement for the website eventually, which can also be updated for any new changes to Pug.
