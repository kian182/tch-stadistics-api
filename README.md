SF Licence Generator - API
==================
Installing Node.js
------------------
We recommend installing the latest version of node.

Checking node is installed and working
--------------------------------------
Once you have node.js installed on your system you should be able to go to your command line and type
+ npm --version

and see something like this
+ $ npm --version

Install node modules
--------------------
Run the following command from the root of your source files to install the node modules listed in packages.json
+ npm install

Execute the app for development
--------------------------
henLoad http://localhost:8000/.
+ PORT=8000 npm start

Execute the app for production
--------------------------
henLoad http://localhost:80/.
+ sudo npm install pm2 -g

+ pm2 start npm -- start

'Only first time, execute' : sudo pm2 startup systemd

Stop process
+ pm2 stop npm