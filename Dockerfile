FROM node:21.5.0
LABEL name="jnumsbot"
COPY const-strings.js tts.js index.js inline-keyboards.js package.json /root/jnumsbot/
# RUN curl https://codeload.github.com/don1andrew/jnumsbot/tar.gz/master | tar -xz -C /root
WORKDIR /root/jnumsbot
RUN npm install
CMD [ "npm", "start"]
