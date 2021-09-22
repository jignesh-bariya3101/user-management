# user-management

Run Node.js Server
1. cd BackEnd
2. add .env file

0. PORT=4000
0. NODE_ENV=development
0. DEV=false
0. MONGO_URI="mongodb://localhost:27017/userdb"
0. TokenKey = "Secret"
0. PasswordSalt = 5
0. SMTP_USER = "your's gmail account"
0. SMTP_PASSWORD = "your's gmail account password"

3. npm install
4. npm start
5. for fix admin entry
    run http://localhost:4000/test
    On this route add admin's static data