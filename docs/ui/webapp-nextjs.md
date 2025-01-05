# Building Toto Webapps using NextJS

Most of the older Toto Webapps are built using React. For the newest ones, though, I've tried NextJS. <br>
This page is a series of notes of how I configured the NextJS app to actually run.

## Environment Variables in NextJS
Env Vars in NextJS are **slightly different than React**. These are the differences: 

1. In React, you need to define env vars with a `REACT_APP_` prefix and that will load them in React. <br>
In Next you need to define them with a `NEXT_PUBLIC_` prefix instead. 

2. For local development, in React, you can use a `.env` file. <br>
In Next you need to call it `.env.local` instead. 

3. Passing Environment Vars during the `Docker buid` process is different:<br>
In React you pass them as argument of the `npm run build` command, like this: 
```
RUN REACT_APP_AUTH_API_ENDPOINT=$AUTH_API_ENDPOINT REACT_APP_GOOGLE_CLIENT_ID=$GOOGLE_CLIENT_ID npm run build
```
In Next instead you just need to declare them in the Dockerfile and they will be automatically fed to the image during the build process, without explicitly passing them to the `npm run build` command: 
```
ARG AUTH_API_ENDPOINT

ENV NEXT_PUBLIC_AUTH_API_ENDPOINT=${AUTH_API_ENDPOINT}

... 

RUN npm run build
```