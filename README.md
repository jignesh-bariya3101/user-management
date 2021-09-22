# user-management

Run Node.js Server
1. cd BackEnd
2. add .env file
    with 
        PORT=4000
        NODE_ENV=development
        DEV=false
        MONGO_URI="mongodb://localhost:27017/userdb"
        FactorAPIKey = "aa697d8e-d83c-11eb-8089-0200cd936042"
        TokenKey = "Secret"
        PasswordSalt = 5
        SMTP_USER = "your's gmail account"
        SMTP_PASSWORD = "your's gmail account password"

3. npm install
4. npm start
5. for fix admin entry
    run http://localhost:4000/test
    On this route add admin's static data