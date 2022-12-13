#!/bin/bash

npm install

#npm audit fix --force

#tail -f /dev/null -> Este comando 'mantem o container de pé' 
#                     para evitar que o container termine após finalizar todos os comandos.
#                     Neste caso não estamos iniciando a aplicação (start).
tail -f /dev/null
