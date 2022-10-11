<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="200" alt="Nest Logo" /></a>
</p>

# Ejecutar en desarrollo

1. Clone the repository
2. Execute
```
npm install
```

3. Have Nest CLI installed
```
npm i -g @nestjs/cli
```
4. Run the database
```
docker-compose up -d
```
5. Clone the file ```.env.template``` and remember the copy to ```.env```
6. Fill the environment variables defined in the ```.env```
7. Execute the app in dev mode:
```
npm run start:dev
```

8. Rebuild the database with the seed
```
http://localhost:3000/api/v1/seed
```

9. Import the file ```nest-api-init.postman_collection.json``` in your postman to get all endpoints

## Used stack
* MongoDB
* Nest


# Production Build
1. Create the file ```.env.prod```
2. Fill the environment variables in the ```.env.prod```
3. Create the docker image
```
docker-compose -f docker-compose.prod.yaml --env-file .env.prod up --build
```



# Notas
Heroku deploy without changes:
```
git commit --allow-empty -m "Tigger Heroku deploy"
git push heroku <master|main>
```