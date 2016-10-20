# Crawford User Interface Demo
This is the Crawford UI demo for Roxxo content repository. It relies on the CMIS Javascript library (lib/cmis.js). This is a standard library and should not require any modifications. The application uses two frameworks JQuery and BootStrap which must be included. The main page (index.html) presents the navigation and the boilerplate text. When a usersuccessfuly logs in this boilerplate text is dynamically replaced with the contents of select-template.html.

The main code for the app is in roxxo.js in here once the user logs in the repository is queried for documents, this query should query just for the logged in user's documents, and these are displayed. The display uses a BootStrap accordion, when the user opens another section the database is re-queried for the documents pertaining to that section - by year.

The endpoint to the Roxxo repository (search for http) is currently hardcoded in roxxo.js, this will need to be put in a configuration file. 

This work is based on the CMIS Browser and Library developed by Ben Chevallereau.
