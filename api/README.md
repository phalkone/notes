# API

## Overview of API

URL | Method | Action
--- | ------ | ------
/auth/signup | POST | To sign up user
/auth/login | POST | For user to sign in.
/note | POST | Create new note
/note | PUT | Update note
/note | DELETE | Delete note
/note | GET | Get note by ID
/notes | GET | Return all notes of user (optional search criteria)
/notes/:tag | GET | Return of all notes with specified tag

## Athentication module

### User model
Field | Data type
----- | ---------
email | unique string in valid email format (verified against regex)
password | string (min 8 characters with a mix of lower-, uppercase and symbols)

### Authentication method
*/auth/signup* POST valid values for user model. Returns true if successfull or error if unsuccesful
*/auth/login* POST valid user credentials. Returns JWT valid for 7 days.

Pass JWT in each HTTP header x-access-token to make authenticated request.

## Note model
Field | Data type
----- | ---------
title | mandatory string
body | mandatory string
favorite | boolean (default false)
tags | string array (optional)
created_on | automatic date value
updated_on | autonatic date value

*/notes* Above values can be used as parameters to find all matching notes
