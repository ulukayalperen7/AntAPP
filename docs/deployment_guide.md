---
name: AntAPP Deployment Guide
description: Production deployment architecture, migration workflow, domain/SSL setup — tüm kritik bilgiler
type: project
originSessionId: b0464f4c-9dc1-46b5-90fc-9459152c5bc5
---
## Sunucu

- IP: `178.104.6.236` | User: `root` | SSH: `ssh root@178.104.6.236`
- OS: Debian, Docker 27, **Coolify + Traefik v3** çalışıyor
- Traefik container adı: `coolify-proxy` (port 80/443)

## Servisler

| Container | Port | Image |
|---|---|---|
| `antapp-backend` | 5000 | `efekurucay/antapp-backend:latest` |
| `antapp-web` | 3001→3000 | `efekurucay/antapp-web:latest` |
| `antapp-db` | 5432 | `postgis/postgis:16-3.4` |

Config dosyaları: `/opt/antapp/.env` (secrets) ve `/opt/antapp/docker-compose.yml`

## CI/CD Pipeline (Azure DevOps → azure-pipelines.yml)

`main`'e push → Build stage (Docker build + push to Docker Hub) → Deploy stage (pull + `--force-recreate`)

**Önemli:** `--force-recreate` var, her deploy container'ı yeniden oluşturur. Olmadan Docker image değişmişse bile container'a dokunmaz.

Variable group: **Azure DevOps → Library → antapp-prod**

## Migration Kuralı

Backend startup'ta `MigrateAsync()` otomatik çalışır ([Program.cs:99](../../../projects/AntAPP/backend/Ant/Ant.WebApi/Program.cs)).

```bash
export PATH="$PATH:/Users/efe/.dotnet/tools"
cd /Users/efe/projects/AntAPP/backend

dotnet ef migrations add <MigrationAdi> \
  --project Ant/Ant.Infrastructure \
  --startup-project Ant/Ant.WebApi
```

**Kritik:** EF bazen `Up()` boş üretir (entity senkronda sanıyor). Boş gelirse `AddColumn` / `CreateTable` manuel yaz. Sonra commit + push → pipeline deploy eder, migration otomatik uygulanır.

Prod migration kontrolü:
```bash
ssh root@178.104.6.236 "docker exec antapp-db psql -U antapp_user -d antapp \
  -c \"SELECT \\\"MigrationId\\\" FROM \\\"__EFMigrationsHistory\\\" ORDER BY 1 DESC LIMIT 5;\""
```

## Domain & SSL

- `antapp.fun` → web (port 3000)
- `api.antapp.fun` → backend (port 5000)
- DNS: Cloudflare proxy (orange cloud) — SSL mode **Full** olmalı (Flexible → redirect döngüsü)
- SSL sertifikası: Traefik'in Let's Encrypt entegrasyonu (`certresolver=letsencrypt`) otomatik alır

Traefik label pattern (`docker-compose.yml`):
```yaml
labels:
  - "traefik.enable=true"
  - "traefik.http.routers.<name>.rule=Host(`domain.com`)"
  - "traefik.http.routers.<name>.entrypoints=https"
  - "traefik.http.routers.<name>.tls.certresolver=letsencrypt"
  - "traefik.http.services.<name>.loadbalancer.server.port=<port>"
  - "traefik.docker.network=coolify"
networks:
  - coolify  # Traefik'in görmesi için zorunlu
```

External network tanımı da gerekli:
```yaml
networks:
  coolify:
    external: true
```

## DB Bağlantısı (production)

```
Host: 178.104.6.236 | Port: 5432 | DB: antapp
User: antapp_user | Pass: b3JIvWwXGkrPq2mO0ijLzNaqaCAnNSDa
```

## Bilinen Eksikler

- SMTP ayarlanmadı (MailSettings env var'ları `.env`'de boş)
