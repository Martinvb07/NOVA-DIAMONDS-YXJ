# NOVA DIAMONDS en un VPS Ubuntu con PM2 + nginx (novadiamondsyxj.com)

Alternativa a Docker (DESPLIEGUE.md). La tienda corre con PM2 en `127.0.0.1:3020`, nginx la publica con HTTPS y cada push a `main` se despliega solo con GitHub Actions (`.github/workflows/deploy.yml`).

## 1. Servidor base (como root)

```bash
apt update && apt upgrade -y
apt install -y git curl nginx mysql-server certbot python3-certbot-nginx ufw
adduser nova && usermod -aG sudo nova
ufw allow OpenSSH && ufw allow 'Nginx Full' && ufw enable
mkdir -p /var/lib/nova/uploads /var/www/novadiamonds && chown -R nova:nova /var/lib/nova /var/www/novadiamonds
```

## 2. MySQL

```bash
mysql_secure_installation
mysql -u root
```
```sql
CREATE DATABASE nova_store CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'nova'@'localhost' IDENTIFIED BY 'CLAVE_FUERTE';
GRANT ALL PRIVILEGES ON nova_store.* TO 'nova'@'localhost';
FLUSH PRIVILEGES;
```

## 3. Node 22 + PM2 (como usuario nova)

```bash
su - nova
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
source ~/.bashrc
nvm install 22 && npm i -g pm2
pm2 startup   # copia y ejecuta el comando sudo que imprime
```

## 4. Código y variables

```bash
ssh-keygen -t ed25519 -C "vps-novadiamonds"     # agrega ~/.ssh/id_ed25519.pub como Deploy key (solo lectura) del repo
git clone git@github.com:Martinvb07/NOVA-DIAMONDS-YXJ.git /var/www/novadiamonds
cd /var/www/novadiamonds
nano .env
```

En `.env` pega el contenido de `deploy/.env.production` de tu PC y agrega:

```
DATABASE_URL=mysql://nova:CLAVE_FUERTE@127.0.0.1:3306/nova_store
UPLOADS_DIR=/var/lib/nova/uploads
```

```bash
chmod 600 .env
npm ci && npx prisma migrate deploy && npm run build
npm run db:seed
pm2 start deploy/ecosystem.config.js && pm2 save
curl -s http://127.0.0.1:3020/api/health
```

Configuración de tu PC: `npm run config:exportar`, súbela con `scp -r exportacion/config-XXXX nova@IP:~/` y en el VPS:
`npm run config:importar -- ~/config-XXXX` (simula) y luego con `--confirmar`.

## 5. DNS + nginx + HTTPS

GoDaddy → DNS: `A @ → IP del VPS`, `CNAME www → novadiamondsyxj.com`. Luego:

```bash
sudo cp deploy/nginx-novadiamondsyxj.comnf /etc/nginx/sites-available/novadiamonds
sudo ln -s /etc/nginx/sites-available/novadiamonds /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl reload nginx
sudo certbot --nginx -d novadiamondsyxj.com -d www.novadiamondsyxj.com --redirect
```

Sube el límite de subida en el bloque 443 que dejó certbot: `client_max_body_size 8m;` y `sudo systemctl reload nginx`.

## 6. Deploy automático (GitHub Actions)

En el VPS (usuario nova), una clave solo para Actions:

```bash
ssh-keygen -t ed25519 -f ~/.ssh/gh_actions -N ""
cat ~/.ssh/gh_actions.pub >> ~/.ssh/authorized_keys
cat ~/.ssh/gh_actions          # contenido para el secreto VPS_SSH_KEY
```

GitHub → repo → Settings → Environments → **produccion** → secretos:

| Secreto | Valor |
|---|---|
| `VPS_HOST` | IP del VPS |
| `VPS_USER` | `nova` |
| `VPS_PATH` | `/var/www/novadiamonds` |
| `VPS_SSH_KEY` | la clave privada `gh_actions` completa |

Cada push a `main`: tipos + pruebas + build en CI → en el VPS `git reset`, `npm ci`, migraciones, build, PM2 y health check a `/api/health` (si falla, vuelve a la versión anterior).

## 7. Cron y respaldos

```bash
crontab -e
```
```cron
*/2 * * * * curl -fsS -m 50 -H "Authorization: Bearer TU_CRON_SECRET" https://novadiamondsyxj.com/api/cron/maintenance > /dev/null
30 3 * * * sh /var/www/novadiamonds/deploy/respaldo-vps.sh >> /home/nova/respaldo.log 2>&1
```

Para el respaldo crea `~/.my-nova.cnf` (`chmod 600`; no uses `~/.my.cnf`, cambiaría el usuario de `mysql` en todo el servidor):

```
[client]
user=nova
password=CLAVE_FUERTE
```

## Comandos útiles

```bash
pm2 status · pm2 logs nova · pm2 restart nova
npm run verificar:produccion      # debe decir «Sin bloqueantes»
```
