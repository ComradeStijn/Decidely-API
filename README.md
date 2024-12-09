# Decidely-API
Backend server for Decidely App. Frontend on https://github.com/ComradeStijn/Decidely-Next-JS

## Status
### Finished
- Database service layer
- Authentication and authorization
- User Routes + Controllers
- Security
- Admin Routers + Controllers

## Getting Started
### Install Instruction
1. Clone the repo
2. Install NPM packages and build
  ```sh
  npm install --legacy-peer-deps && npm run ts-build
  ```
3. Set Environment Variables
```js
DATABASE_URL=""
JWT_SECRET=""
NODE_ENV="prod"
```
4. Start server
  ```
  npm run dev
  ```



