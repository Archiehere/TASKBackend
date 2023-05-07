# TASK_Backend

A Nodejs based backend system for a CRUD System with Auth using PostgreSQL,NodeJS,Express,Sequelize, and deployed on Railway.

[https://taskbackend-production-3ed6.up.railway.app/](https://taskbackend-production-3ed6.up.railway.app/)



          
## FEATURES
1. SignIn/ SignUp using JWT Authentication.
2. Forgot reset password functionality
3. CRUD on an item.
4. SQL database implementation 

TECH-STACKS :
- Backend: NodeJS, ExpressJS, PostgreSQL

## RUNNING THE SERVER


1. Clone the repository:

```CMD
https://github.com/Archiehere/TASKBackend.git
```
To run the server, you need to have NodeJS installed on your machine. If you don't have it installed, you can follow the instructions [here](https://nodejs.org/en//) to install it.



2. Install the dependencies: 

```CMD
npm install
```


4. Setup .env file in base directory:

```
PORT = 3000
DATABASE_URL = ''
jwtsecretkey1 = ''
MAIL_ID = ''
MAIL_PASS = ''
```


5. Run the backend server on localhost:

```CMD
npm start
```


You can access the endpoints from your web browser following this url
```url
http://localhost:[PORT]
```


## API Endpoints

### Login: POST request
```url
<base>/login
```
```
// Example JSON request body:
{
    "email":"example@gmail.com",
    "password":"Password@1234"
}
```
### Send Otp in mail for signup : POST request
```url
<base>/email
```
```
// Example JSON request body:
{
    "email":"example@gmail.com"
}
```
### Otp verification + Signup : POST request
```url
<base>/email/verify
```
```
// Example JSON request body:
    valid email and 8 digit password with 1 Caps, number & special character each

{
    "email":"example@gmail.com",
    "otp":"123456",
    "name":"alan",
    "password":"Password@1234"
}
```
### Create Item : POST request
```url
<base>/t/create
```
```
// Example JSON request body:
{
    "text":"HeLLo WoRLd"
}
```
### Get Item : GET request
```url
<base>/t/item/:itemid
```
```
// Example JSON response:
{
    "success": true,
    "myitem": {
        "_id": "4",
        "text": "paper1",
        "createdAt": "2023-05-07T17:42:10.901Z",
        "updatedAt": "2023-05-07T17:42:10.901Z",
        "userId": "2",
        "itemId": null
    }
}
```

### Update Item : PUT request
```url
<base>/t/update/:itemid
```
```
// Example JSON request body:
{ 
   "text":"Updated World"  
}
```

### Delete Item : DELETE request
```url
<base>/t/delete/:itemid
```
```
// Example JSON response:
{
    "success": true,
    "msg": "Deleted item"
}
```
