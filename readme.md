# Natours Application

Built using modern technologies: node.js, express, mongoDB, mongoose and friends 😁

## Table of Contents

- [Installing](#installing)
- [Database](#database)
- [Environment Variables](#environment-variables)
- [Deployment](#deployment)
- [Commands Cheat Sheet](#ongoing-task-list)
- [Ongoing Task List](#ongoing-task-list)

## Installing

Create NodeJs App and package.json file:

```bash
$ npm init --yes
```

Clone repository from GitHub:

```bash
git clone https://github.com/claudineisbezerra/natour.git
```

Example of creating/updating github repo with Semantic Release and Tags:

```bash
git remote -v

git tag -a v1.0.0 -m "release 1.0.0"
git push remote v1.0.0

git remote add origin https://github.com/claudineisbezerra/natours-full-app.git
git add .
git commit -m "Description of the change"
git push -u origin master
```

## Database

Local MongDB reference (Version 6.\*):

```js
mongodb://localhost:27017/natours
```

Remote MongDB reference using Atlas Service hosted by AWS (Version 6.\*):

```js
mongodb+srv://[user]:[Password]@[server pefix name].mongodb.net/natours?retryWrites=true
```

## Environment Variables

App Environment Variables:

```js
NODE_ENV=development
PORT=3000
DATABASE=mongodb+srv://<USER>:<PASSWORD>@cluster0.gozquzy.mongodb.net/natours?retryWrites=true
DATABASE_LOCAL=mongodb://localhost:27017/natours
DATABASE_PASSWORD=<PASSWORD>
JWT_USER_ACCESS_SECRET=my-ultra-secure-and-ultra-long-secret
JWT_ACCESS_TOKEN_EXPIRES_IN=90d
JWT_REFRESH_TOKEN_EXPIRES_IN=90

//mailtrap for testing
EMAIL_USERNAME_MAILTRAP=<USER KEY>
EMAIL_PASSWORD_MAILTRAP=<PASSWORD KEY>
EMAIL_HOST_MAILTRAP=smtp.mailtrap.io
EMAIL_PORT_MAILTRAP=2525

//Email shadow for testing
EMAIL_FROM=myemail@mailsac.com

//sendgrid professional email service for testing
SENDGRID_USERNAME=apikey
SENDGRID_PASSWORD=<PASSWORD KEY >

//stripe professional payment for testing
STRIPE_PUBLIC_KEY=<STRIP_KEY>
STRIPE_SECRET_KEY=<STRIP_KEY>
STRIPE_WEBHOOK_SECRET=<STRIP_KEY>
```

## Deployment

Install and verify Heroku CLI

```heroku Instalattion link
https://devcenter.heroku.com/articles/heroku-cli

heroku --version

```

Create App on Heroku

```heroku CLI
heroku login
heroku create
heroku logs --tail

heroku ps:scale web=0
heroku ps:scale web=1
heroku ps:scale web=2

heroku open
```

Install App on Heroku

```bash
git remote -v
git push heroku master
```

## Commands Cheat Sheet

WSL commands

```wsl

wsl -l -v
#Check wsl version

winget uninstall
winget uninstall --id "Ubuntu"

wsl --list
wsl --unregister "Ubuntu"
wsl --list --online
#Uninstall WSL Distro

wsl --shutdown
#Derruba o serviço wsl

systemctl status docker.service
sudo systemctl daemon-reload

sudo service docker start
sudo update-alternatives --config iptables
sudo service docker start
#Start docker daemon service

c:\Windows\System32\wsl.exe -d Ubuntu -u root /etc/init-wsl
#Iniciar o serviço de docker (docker Daemon) colocando os resultado no arquivo: /mnt/c/Users/Usuário/wsl_start.log

echo 1 | sudo tee /proc/sys/vm/drop_caches
#Liberar cache de memória

wsl --export "Ubuntu" C:\Users\Usuário\Desktop\backup.tar
wsl --import "Ubuntu" C:\Users\Usuário\Desktop\backup.tar
#Backup do ambiente WSL

explorer.exe .
#Chama comandos do windows

\\wsl$\Ubuntu\home\cb
#Acessar arquivos no WSL a partir do windows

zsh --version
sudo apt install zsh


#Installing Oh My Zsh
```

Docker GENERAL COMMANDS

```docker

docker system df
docker system df -v
#You can look up how much space is used by docker

docker system prune -f
docker system prune -af

docker image prune -f
docker image prune -af
#Clean up unused and dangling images

docker container prune -f
#Clean up stopped containers

docker volume prune -f
# Clean up unused volumes
# To clean up as much as possible excluding components that are in use.
# -a includes unused and dangling containers.
# -f force removing without asking confirmation.


docker stop <Container id/name> <Container id/name>
docker rm <Container id/name> <Container id/name>
# Manually remove containers

docker rmi <Container id/name> <Container id/name>
# Manually remove images

docker volume ls
docker volume rm <Volume Name> <Volume Name>
# Manually remove volumes

docker ps
#Lista de processos docker (docker instances)

docker -d
#Start the docker daemon

docker --help
#Get help with Docker. Can also use –help on all subcommands

docker info
#Display system-wide information

```

Docker IMAGE commands

```docker
docker build -t <image_name>
docker build -t natours -f Dockerfile.dev .
#Build an Image from a Dockerfile

docker build -t <image_name> . –no-cache
docker build -t natours -f Dockerfile.dev . –no-cache
#Build an Image from a Dockerfile without the cache

docker images
#List local images

docker rmi <image_name>
docker rmi natours
#Delete an Image

docker image prune
#Remove all unused images

docker image ls | grep natours
docker rmi natours:latest
docker rmi node:16.16.0-slim
```

Docker HUB Commands

```
Docker Hub is a service provided by Docker for finding and sharing
container images with your team. Learn more and find images
at https://hub.docker.com

docker login -u <username>
#Login into Docker

docker push <username>/<image_name>
#Publish an image to Docker Hub

docker search <image_name>
#Search Hub for an image

docker pull <image_name>
#Pull an image from a Docker Hub
```

Docker CONTAINER Commands

```bash
docker run --name <container_name> <image_name>
docker run -it --name <container_name> <image_name>
#Create and run a container from an image, with a custom name

docker rename <container_name> <container_new_name>
#Rename a container

docker run -p <host_port>:<container_port> <image_name>
#Run a container with and publish a container’s port(s) to the host.

docker run -d <image_name>
#Run a container in the background

docker start|stop <container_name> (or <container-id>)
#Start or stop an existing container:

docker rm <container_name>
#Remove a stopped container:

docker exec -it <container_name> sh
#Open a shell inside a running container:

docker logs -f <container_name>
#Fetch and follow the logs of a container:

docker inspect <container_name> (or <container_id>)
#To inspect a running container
#List all docker definition (in JSON FORMAT)

docker ps
docker ps -a | grep natours
docker rm imersao-fullcycle10-nestjs-tests-mongo-express-1 imersao-fullcycle10-nestjs-tests-db-1
#To list currently running containers
#Remove docker containers

docker ps --all
#List all docker containers (running and stopped):

docker container stats
#View resource usage stats

```

Docker Compose Commands

```bash
# para levantar a versão default
docker compose up

docker compose -f docker-compose.dev.yaml up --build
docker compose -f docker-compose.dev.yaml up app db --build
docker compose --profile=develomment -f docker-compose.dev.yaml up --build
#Container creation, using partial cpntainers or profile

docker compose -f docker-compose.prod.yaml up --build


docker compose -f docker-compose.dev.yaml exec -u root app bash
docker compose -f docker-compose.dev.yaml exec app bash
npm run start:dev
# Acessar o container diretamente via CLI commands

docker compose -f docker-compose.prod.yaml exec -u root app bash
docker compose -f docker-compose.prod.yaml exec app bash
npm run start:prod
# versão de produção

docker image prune
#Remove all unused images

docker build -t natours -f Dockerfile.dev .
docker ps -a | grep natours
docker rm <Container name> <Container name>

docker image ls | grep natours
docker rmi natours imersao-fullcycle10-nestjs-tests-app_prod imersao-fullcycle10-nestjs-tests-app

docker build -t natours -f Dockerfile.prod .
docker image ls | grep natours
docker rmi natours

docker image ls | grep natours
# Verifica a criação de imagem recem criada

# Subir o ambiente e compilar a aplicação

whoami
# Exibe com qual usuário estou logado

chmod +x .docker/start.sh
#Permissão de execução no arquivo

rm -rf dist && npm run build && cd ./dist && find . -type d | sed -e "s/[^-][^\/]*\//  |/g" -e "s/|\([^ ]\)/| - \1/"
find | sed 's|[^/]*/|- |g'
# Clean, Compile and List directory as a tree
# List all files as a tree

docker compose -f docker-compose.dev.yaml ps
docker compose -f docker-compose.dev.yaml stop
docker compose -f docker-compose.dev.yaml start
docker compose -f docker-compose.dev.yaml down
#Destruir o ambiente docker

docker compose -f docker-compose.dev.yaml up -d
#Subir o ambiente docker com terminal detachado

docker compose -f docker-compose.dev.yaml up --build
#Subir o ambiente compilando a aplicação

docker compose -f docker-compose.dev.yaml up -d --build
#Subir o ambiente com terminal detachado compilando a aplicação

docker compose -f docker-compose.dev.yaml --profile development up --build
#Cria o ambiente baseado em profile

docker compose -f docker-compose.dev.yaml exec app bash
npm run start:dev

#Executa somente o estágio de testing definido em Dockerfile.prod
STAGE=testing docker compose -f docker-compose.prod.yaml up
STAGE=production docker compose -f docker-compose.prod.yaml up

docker compose -f docker-compose.prod.yaml down
docker compose -f docker-compose.prod.yaml up
docker compose -f docker-compose.prod.yaml up --build

docker compose -f docker-compose.prod.yaml exec app_prod bash
npm run start:prod
```

## Ongoing Task List

- [x] 23/08/2022: Start using express.raw();
- [x] 24/08/2022: Implement restriction that users can only review (Create/Update/Delete) a tour that they have actually booked;
- [x] 24/08/2022: Implement nested booking routes: /tours/:id/bookings and /users/:id/bookings;
- [x] 29/08/2022: Improve tour dates: add a participants and a soldOut field to each date.
      A date then becomes like an instance of the tour.
      Then, when a user books, they need to select one of the dates.
      A new booking will increase the number of participants in the date, until it is booked out (participants > maxGroupSize).
      So, when a user wants to book, you need to check if tour on the selected date is still available;
- [x] Implement advanced authentication features:
      30/08/2022: confirm user email.
      06/09/2022: keep users logged in with refresh tokens.
      09/09/2022: two-factor authentication.
- [x] 09/09/2022: Implement a sign up form, similar to the login form;
- [x] 09/09/2022: Create verification endpoint to activate account;
- [x] 17/09/2022: On the tour detail page, if a user has taken a tour, allow them add a review directly on the website.
      Implement a form for this;
      17/09/2022: On the tour detail page, allow user to book for only not booked dates.
      17/09/2022: On the tour detail page, allow user to review already booked tours and update existing reviews.
      12/09/2022: Show new Tour date format. Show only the tour dates booked by the user.
- [x] Hide the entire booking section on the tour detail page if current user has already booked the tour
      (also prevent duplicate bookings on the model);
      17/09/2022: Booked tour been presented by date.
- [x] 20/09/2022: Implement “like tour” functionality, with favourite tour page;
- [x] On the user account page, implement the “My Reviews” page, where all reviews are displayed, and a user can edit them.
      17/09/2022: Implemented using PUG templates
      (If you know React ⚛ or Vue 🧡, this would be an amazing way to use the Natours API and train your skills!);
- [x] 13/12/2022: Start using docker for the app. Setup remote debugging support.
      Added Dockerfile.dev and docker-compose.dev.yaml
- [x] 13/12/2022: Start using Semantic Release.
- [ ] For administrators, implement all the “Manage” pages, where they can CRUD (create, read, update, delete) tours,
      users, reviews, and bookings.
- [ ] Separate frontend and backend projects

- [ ] Automate deployment for the app
- [ ] Add unit and system test to the app
