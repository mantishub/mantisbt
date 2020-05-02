MantisBT Client
===============


Installation
------------
 * Go to **client/<lang>** directory.
 * Make sure if **node_modules** folder already exists. If so remove it.
 * Install dependencies.
 
		npm install


Webpack Bundle
--------------
 * To bundle js:

		npm run build

 * To minify js:

		npm run minify

 * Now you will see **mantis.js** and **mantis.min.js** in **js/** directory.
 * To delete **mantis.js** and **mantis.min.js** files:

		npm run clean
		
Development
-----------
>		npm run dev
