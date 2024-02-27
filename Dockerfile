FROM node:21.5.0
LABEL name="jnumsbot"
COPY cache.js const-strings.js tts.js ttsCached.js index.js inline-keyboards.js package.json /root/jnumsbot/
# RUN curl https://codeload.github.com/don1andrew/jnumsbot/tar.gz/master | tar -xz -C /root
WORKDIR /root/jnumsbot
RUN npm install
CMD [ "npm", "start"]
