# --- Build the backend kubeflow-wheel ---
FROM python:3.7-slim-buster AS backend-kubeflow-wheel

WORKDIR /src

COPY ./common/backend/ .
RUN python3 setup.py bdist_wheel

# --- Build the frontend kubeflow library ---
FROM node:12-buster-slim as frontend-kubeflow-lib

WORKDIR /src

COPY ./common/frontend/kubeflow-common-lib/package*.json ./
RUN npm install

COPY ./common/frontend/kubeflow-common-lib/ .
RUN npm run build

# --- Build the frontend ---
FROM node:12-buster-slim as frontend

WORKDIR /src
COPY ./image-builder/frontend/package*.json ./
RUN npm install
COPY --from=frontend-kubeflow-lib /src/dist/kubeflow/ ./node_modules/kubeflow/

COPY ./image-builder/frontend/ .

RUN npm run build -- --output-path=./dist/default --configuration=production

# Web App
FROM python:3.7-slim-buster

WORKDIR /package
COPY --from=backend-kubeflow-wheel /src .
RUN pip3 install .

WORKDIR /src
COPY ./image-builder/backend/requirements.txt .
RUN pip3 install -r requirements.txt

COPY ./image-builder/backend/apps/ ./apps
COPY ./image-builder/backend/entrypoint.py .

COPY --from=frontend /src/dist/default/ /src/apps/default/static/

ENTRYPOINT ["/bin/bash","-c","APP_PREFIX=/builder gunicorn -w 3 --bind 0.0.0.0:5000 --access-logfile - entrypoint:app"]
