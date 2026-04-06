#!/bin/bash

# ============================================================
#  UForum — Script de Desenvolvimento (Hot Reload)
# ============================================================

echo "🚀 Iniciando UForum em Modo de Desenvolvimento (Hot Reload)..."

# Garante que os containers de prod ou antigos não conflitem
docker compose -f docker-compose.yml -f docker-compose.dev.yml up --build

# Para rodar em background, use: ./dev.sh -d
