#!/bin/bash

JS_NAME="$1"
VOL_DIR=/var/lib/docker/volumes

if [ -z $JS_NAME ]; then
  echo '- No project selected'

elif [ -f $JS_NAME/package.json ]; then
  echo '- package.json exists in expected dir:' $JS_NAME

  
  # SO HACKY...
  # Instal nvm/node to check package.json
  . ~/.nvm/nvm.sh
  nvm install 15
  nvm use 15

  GIT_REPO=`node -p "require('./"$JS_NAME"/package.json').repository"`
  GIT_REPO="test@test.com"
  JS_ID=`node -p "require('./"$JS_NAME"/package.json').js_id"`

  if [ -z $GIT_REPO ] || [ -z $JS_ID ]; then
    echo "- Package.json missing values"
  else

    docker build --build-arg JS_NAME=$JS_NAME --tag ${JS_ID}:1.0 .

    # TODO: Will want to check that the image exists before starting a container

    docker run -d --rm --name jstest --mount source=jsvol,target=/app/${JS_NAME} ${JS_ID}:1.0
    
  fi


  if [ -d $VOL_DIR/jsvol ] && [ -d $VOL_DIR/jsvol/$JS_NAME ]; then
    echo '- dir exists'
  fi

else
  echo '- Really shouldnt hit this...'
fi


