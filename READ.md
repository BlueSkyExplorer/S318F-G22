1. Project info: 
Project name: Restaurant Manager
Group info: Group no. 22 
Group members: Lam Man Ho 13609049 Lui Hoi Ting 13135177 

2. Project file intro:
- server.js:
The server provides Login/Logout pages functionalities, basic CRUD web pages and RESTful CRUD services for users. Using cookie-session for the authentication.
- package.json: 
Lists of dependencies: express, ejs, body-parser, cookie-session, mongoose, method-override, express-ejs-layouts, dotenv
- public: style.css: For application styling
- views: error.ejs:  Error page template
layout.ejs:  Main layout template with header and navigation
login.ejs: User login page
restaurants_form.ejs: Form for creating/editing restaurants
restaurants_list.ejs: Restaurant listing and search page
- models: restaurants.js: Define the fields in restaurants data model, which should contain: name, district, cuisine and rating
user.js: Define the fields in user model, which should contain: username and password

3. The cloud-based server URL (your server host running on the cloud platform) for testing:
https://restaurant-manager-g22.onrender.com

4. Operation guides (like a user flow) for your server
- Use of Login/Logout pages: 
Valid login information:
Username: admin Password: 123456 
Username: guest Password: guest
Login steps:
1. Enter the username and password
2. Click "Login" button
3. Redirect to the restaurant listing page when login successfully 
Logout steps:
1. Click "Logout" at the top of the webpage
2. Redirect to the login page when logout successfully 

- Use of your CRUD web pages: 
Steps for CREATE - add new restaurant
1. Click "Add New Restaurant" button
2. Fill in the form: Name (required), District (optional), Cuisine (optional), Rating (optional, must be between 1-5)
3. Click "Submit" button
4. Redirect to restaurant list after add successfully
*Validation is enforced in* `views/restaurants_form.ejs` *and* `models/restaurant.js`.

Steps for READ - view and search restaurants
1. All restaurants will be listed in a table format
2. Search restaurants by Name or filter by District, Cuisine or minimum rating
3. Click "Search" button
4. Filtered restaurants will be listed
5. Click "Reset" to clear search filters

Steps for UPDATE - edit restaurants information
1. Click "Edit" button next to the restaurant being update
2. Modify the information in the form
3. Click "Submit" button to save changes
4. Click "Cancel" button to discard changes
5. Redirect to restaurants list with updated information

Steps for DELETE - remove restaurants 
1. Click "Delete" button next to the restaurant being remove
2. Confirm the deletion in the popup dialog
3. Redirect to restaurant list with the deletion of the restaurant

- Use of your RESTful CRUD services: 
Create 
Read
Update
Delete