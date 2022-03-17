# Smart TODO List

A single page, terminal-themed to-do list.

## Final Product

!["Desktop window size"](https://github.com/trijaychan/smart-todo-list/blob/master/docs/screenshots/ss1.png?raw=true)

!["Other window sizes"](https://github.com/trijaychan/smart-todo-list/blob/master/docs/screenshots/ss2.png?raw=true)

## Dependencies

- Node 10.x or above
- NPM 5.x or above
- PG 6.x
- bcrypt
- chalk
- cookie-session
- dotenv
- ejs
- express
- morgan
- request-promise
- sass

## Getting Started

1. Create the `.env` by using `.env.example` as a reference: `cp .env.example .env`
2. Update the .env file with your correct local information 
    - username: `labber` 
    - password: `labber` 
    - database: `midterm`
3. Install dependencies: `npm i`
4. Fix to binaries for sass: `npm rebuild node-sass`
5. Reset database: `npm run db:reset`
    - Check the db folder to see what gets created and seeded in the SDB
7. Run the server: `npm run local`
    - Note: nodemon is used, so you should not have to restart your server
8. Visit `http://localhost:8080/`
