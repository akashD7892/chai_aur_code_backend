# Chai aur backend series

This is a video series on backend with javascript -
https://app.eraser.io/workspace/YtPqZ1VogxGy1jzIDkzj

# we have some gitignore generator which helps to write which files to included in it.

# nodemon is used only in develoment phase not int production

npm i -D nodemon

# in package.json we will write script

"scripts": {
"dev": "nodemon src/index.js"
},

that go to src and run index.js

#don't write an object in dotenv.config it will through an error of "Invalid Schema"
