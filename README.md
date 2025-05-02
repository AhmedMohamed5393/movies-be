# movies-be
It is a backend system implemented using Node.js, Nest.js, PostgreSQL and TypeORM which includes an authentication and a movies API modules integrated with TMDB APIs.

# Build and run the project in development mode
# To build and run the application use
docker-compose up -d --build

# To run all tests use
npm run test

# Build and run the project in production mode
After pushing any git changes on master branch,
Building and deploying process are automatically started
using github workflows and dockerfile.

i.e. The PostgreSQL database is deployed on Neon cloud server and
the app is deployed on Railway server.

# To add environmental variables in railway project (production)
You should login first and then go to the project,
Click on Variables tab, add the required ones and then re-deploy it.

# To open the app in production mode use
https://movies-be-production.up.railway.app/

# To open swagger doumentation use
https://movies-be-production.up.railway.app/api or {{ base_url }}/api
