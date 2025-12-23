FROM --platform=linux/amd64 node:20-alpine AS builder

ENV NODE_ENV=production
ENV APP_DIR=/opt/app
WORKDIR ${APP_DIR}

COPY package.json yarn.lock ./
COPY .yarnrc.yml ./

RUN corepack enable

RUN yarn install --immutable && yarn cache clean

COPY src ./src

FROM --platform=linux/amd64 node:20-alpine

ENV NODE_ENV=production
ENV APP_DIR=/opt/app
ENV PORT=3000

WORKDIR ${APP_DIR}

COPY --from=builder ${APP_DIR}/node_modules ./node_modules
COPY --from=builder ${APP_DIR}/package.json ./package.json
COPY --from=builder ${APP_DIR}/src ./src

RUN addgroup -g 1001 -S registry && \
    adduser -S registry -u 1001 && \
    chown -R registry:registry ${APP_DIR}

USER registry

EXPOSE ${PORT}

HEALTHCHECK --interval=30s --timeout=3s --start-period=30s --retries=3 \
  CMD node -e "import('http').then(({get}) => get(`http://localhost:${process.env.PORT || 3000}/health`, (r) => { process.exit(r.statusCode === 200 ? 0 : 1) }))"

CMD ["node", "--experimental-vm-modules", "src/app.mjs"]
