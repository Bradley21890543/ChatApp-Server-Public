# ChatApp Server
The Backend for ChatApp - A simple Chat Application

[![Bradley](https://img.shields.io/badge/Creator-Bradley-blue.svg?style=flat)](https://bamapp.net)
[![Daniel](https://img.shields.io/badge/Creator-Daniel-blue.svg?style=flat)](http://brinklet.com)

Authentication (HTTP**S** ONLY)
=
Register: Make a POST (unencoded or JSON) request to `/requests/register`
-
Request:
* **username:** the username to register
* **password:** the password to register
* **email:** valid email (xxxxx@xxx.xx)
* **name:** the name of the person being registerd

Responses (JSON):

Error:
* **YOU FORGOT SOMETHING:** A field was missing from the request.
* **Username already taken:** The username requested had already been used by another user. If that user has not verified their username, they will lose it in 30 minutes.
* **internal error:** A problem related to random code generation has occured. Please try again.
* **OOPS:** There was a problem processing/hashing the passowrd supplied.
* **db error:** An error occured with the database. Please try again.

Success:
* **true**
* **false**

    
Login: Make a POST (unencoded or JSON) request to `/requests/login`
-
Request:
* **username:** the user's username or email
* **password:** the users's password

Responses:

Error:
* **YOU FORGOT SOMETHING:** A field was missing from the request.
* **FAIL:** The username/password combination was wrong

Success:
* **true**
* **false**
