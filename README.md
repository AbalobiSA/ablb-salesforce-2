# Abalobi Salesforce

This is a JSForce wrapper as a node module, to easily create multiple salesforce queries in NodeJS.

---------------

### Getting started

Clone this module into your NodeJS app, 
and provide a secrets file containing a Salesforce username and password referenced in `index.ts`

    $ yarn add git+https://git@github.com/AbalobiSA/ablb-salesforce-2.git

You will now be able to import this module and use it in your project.

### Initializing

You will need to initialize this module with your
Salesforce username and password.

```js
let Salesforce = require("ablb-salesforce-2");
let salesforce = new Salesforce("SF_USER", "SF_PASSWORD");
```
