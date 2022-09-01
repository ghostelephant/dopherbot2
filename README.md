Used for Shadowball gameplay in the Sopher McDophers server.

It uses the Discord JavaScript client to connect to Discord, and stores guesses in MongoDB.

To run, place the following information into a .env file:

```
LOGIN_TOKEN=your_discord_login_token
CLOUD_DB_STRING=your_mongodb_string
DB_NAME=your_database_name
```

(I have mine saving to a cloud database hosted at MongoDB Atlas, but it could also save to a local instance of MongoDB)

Finally, to start the bot, run the following:

```
node bot.js
```
