# We use the official Python 3.11 image as our base image and will add our code to it. For more details, see https://hub.docker.com/_/python
FROM node:22.9.0-bullseye-slim@sha256:80c9b96d59e83fa41e14e3d90953d52a875a60447efb74469cb195f0e64457bc

# Copy all of our code and assets from the local directory into the /home/speckle directory of the container.
# We also ensure that the user 'speckle' owns these files, so it can access them
# This assumes that the Dockerfile is in the same directory as the rest of the code
COPY . /home/speckle

# We set the working directory to be the /home/speckle directory; all of our files will be copied here.
WORKDIR /home/speckle

RUN corepack enable && yarn install && yarn build

# TODO create a two stage build to reduce the size of the final image

CMD ["yarn", "start"]
