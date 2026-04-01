# UForum — Rede Social da UFAM

## 🚀 Como rodar (tudo em um único comando)

### Pré-requisitos
- Docker Desktop instalado e rodando
- Portas 3000, 8080 e 5432 livres

### Estrutura esperada na sua máquina
```
uforum/
├── uforum-backend/      ← pasta do backend (Spring Boot)
├── uforum-frontend/     ← pasta do frontend (Next.js)
└── docker-compose.yml   ← este arquivo
```

### Subir tudo
```bash
docker compose up --build
```

A primeira build demora ~5-10 minutos (baixa dependências Maven + npm).

### Acessos
| Serviço   | URL                                     |
|-----------|-----------------------------------------|
| Frontend  | http://localhost:3000                   |
| Backend   | http://localhost:8080                   |
| Swagger   | http://localhost:8080/swagger-ui.html   |

### Login admin padrão
- **Email:** `admin@ufam.edu.br`
- **Senha:** `Admin@12345`

### Parar e limpar
```bash
# Parar (mantém dados)
docker compose down

# Parar e apagar banco de dados
docker compose down -v
```

---

## 🔧 Bugs corrigidos nesta versão

### Backend
1. **`PostService.getPostsByUser()`** — Era feito `findAll()` em todos os posts para encontrar o usuário. Corrigido para usar `userRepository.findByUsername()` diretamente.
2. **`EventService.create()`** — `communityId` (UUID) era passado como string para `findBySlugOrThrow()`. Corrigido para usar `communityRepository.findById()`.
3. **`SecurityConfig`** — Regras de segurança `DELETE /events/{id}` estavam malformadas (Spring as ignorava silenciosamente). Corrigido em calls separadas.
4. **`UserController`** — Adicionado endpoint `GET /api/v1/users/me/saved` para posts salvos.
5. **`PostService`** — Adicionado método `getSaved()` que usa `postRepository.findSavedByUserId()`.

### Frontend
1. **`SavedPage`** — Não chamava nenhuma API, mostrava sempre vazio. Corrigido com `useInfiniteQuery` chamando `usersApi.getSaved()`.
2. **`FeedInner`** — Sort (Novo/Popular/Top) era ignorado, nunca passado para a API. Corrigido.
3. **`api.ts`** — Adicionado `usersApi.getSaved()`. `postsApi.search()` agora recebe e passa `sort`.
4. **`next.config.ts`** — Adicionado `output: 'standalone'` necessário para Docker.
5. **`Dockerfile`** (frontend) — Criado do zero (não existia no projeto original).
