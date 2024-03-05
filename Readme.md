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

# don't write an object in dotenv.config it will through an error of "Invalid Schema"

#in express we have documentation of request and response in API Documentation -> 5x beta

_" CORS ORIGIN\*_ " \* -> from any frontend user can request

#to make username more efficiently searchable add [ index:true ]

#mongoose-aggregate-paginate-v2 in mongoose for optimising searching

#bcrypt ( library for Nodejs )
#bcryptjs ( optimised bcrypt in plain JS with zero dependencies. Compatible with bcrypt)

# cloudinary and multer

#we have first save our file in local storage through multer and then uploaded to cloudinary why ?
if we directly upload to cloudinary then it might be a chance it may take time and due to server error it doesnt get uploaded .
#so firstly we upload that in local storage so that if connection get lost file can be uplaoded

#we get data from form, json object in req.body, also we get data in url.

#upload fails in cloudinary when i use .env otherwise hardcoded value gives correct uploading
