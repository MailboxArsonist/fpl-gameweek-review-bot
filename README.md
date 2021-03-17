This is a bot for the subreddit r/fantasypremierleague

It gets data directly from the fantasypremierleague api and updates players + fixtures daily

All data is stored in MariaDB using Knex.

This project uses Snoowrap to communicate with the Reddit API.

Deployed on DigitalOcean but will run on any linux based environment, uses the `at` command to schedule the gameweeks

Feel free to fork this project, I'm currently working through a few issues regarding the double gameweeks & only posting players that people actually want to see via seasonal appearances or selected player percentage.

Instructions:

1. Create a .env with the following example values: (You'll need to get all the REDDIT_ values from your reddit user)

```
DB_HOST=127.0.0.1
DB_USER='user'
DB_NAME='fpl'
DB_PASSWORD='password'
REDDIT_SECRET=Reddit_secret
REDDIT_APP=Reddit_app_id
REDDIT_USERNAME=Reddit_username
REDDIT_PASSWORD=Reddit_user_password
REDDIT_USERAGENT=Reddit_useragent
```

2. You'll need npm installed, run an `npm install`

3. Run all the `GetAndSave`_model in the command directory

4. Once you have populated the database, `run node app.js` this will set up all the scheduled gameweeks
