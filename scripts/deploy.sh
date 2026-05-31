#!/bin/bash
set -e

REGISTRY=${REGISTRY:-"registry.example.com"}
TAG=${TAG:-"latest"}

echo "=== Deploying Low-Code Platform to K8s ==="

echo ">> Building Docker images..."

echo ">> Building backend image..."
docker build -f Dockerfile.backend -t $REGISTRY/lowcode-backend:$TAG .

echo ">> Building renderer image..."
docker build -f Dockerfile.renderer -t $REGISTRY/lowcode-renderer:$TAG .

echo ">> Building frontend image..."
docker build -f Dockerfile.frontend -t $REGISTRY/lowcode-frontend:$TAG .

echo ">> Pushing images..."
docker push $REGISTRY/lowcode-backend:$TAG
docker push $REGISTRY/lowcode-renderer:$TAG
docker push $REGISTRY/lowcode-frontend:$TAG

echo ">> Applying K8s manifests..."
kubectl apply -f deploy/k8s/namespace.yaml
kubectl apply -f deploy/k8s/configmap.yaml
kubectl apply -f deploy/k8s/secret.yaml
kubectl apply -f deploy/k8s/mysql/
kubectl apply -f deploy/k8s/redis/
kubectl apply -f deploy/k8s/backend/
kubectl apply -f deploy/k8s/renderer/
kubectl apply -f deploy/k8s/frontend/
kubectl apply -f deploy/k8s/ingress.yaml

echo ">> Waiting for deployments to be ready..."
kubectl -n lowcode rollout status deployment/lowcode-backend
kubectl -n lowcode rollout status deployment/lowcode-renderer
kubectl -n lowcode rollout status deployment/lowcode-frontend

echo "=== Deploy complete ==="
echo "Designer:  https://lowcode.example.com"
echo "Runtime:   https://lowcode.example.com/app/<appId>/<pagePath>"
echo "API Docs:  https://lowcode.example.com/api/docs"
