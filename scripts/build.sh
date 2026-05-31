#!/bin/bash
set -e

echo "=== Building Low-Code Platform ==="

echo ">> Installing dependencies..."
pnpm install

echo ">> Building common package..."
pnpm build:common

echo ">> Building backend..."
pnpm build:backend

echo ">> Building frontend..."
pnpm build:frontend

echo "=== Build complete ==="
