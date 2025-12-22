FROM --platform=linux/amd64 node:20-alpine AS builder

ENV NODE_ENV production
ENV APP_DIR /opt/app

WORKDIR ${APP_DIR}

COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

FROM --platform=linux/amd64 node:20-alpine

ENV NODE_ENV production
ENV APP_DIR /opt/app
ENV PORT 3000

WORKDIR ${APP_DIR}

COPY --from=builder ${APP_DIR}/node_modules ./node_modules
COPY --from=builder ${APP_DIR}/package*.json ./

COPY src ./src
COPY .env* ./

RUN mkdir -p ${APP_DIR}/certs

RUN --mount=type=secret,id=x509_cert_pem \
    --mount=type=secret,id=x509_key_pem \
    cat /run/secrets/x509_cert_pem | base64 -d > ${APP_DIR}/certs/cert.pem && \
    cat /run/secrets/x509_key_pem | base64 -d > ${APP_DIR}/certs/key.pem && \
    chmod 600 ${APP_DIR}/certs/*.pem

RUN addgroup -g 1001 -S dmvic && \
    adduser -S dmvic -u 1001 && \
    chown -R dmvic:dmvic ${APP_DIR}

USER dmvic

EXPOSE ${PORT}

HEALTHCHECK --interval=30s --timeout=3s --start-period=30s --retries=3 \
  CMD node -e "import('http').then(({get}) => get(\`http://localhost:\${process.env.PORT || 3000}/health\`, (r) => {process.exit(r.statusCode === 200 ? 0 : 1)}))"

CMD ["node", "--experimental-vm-modules", "src/app.mjs"]