# NOVA DIAMONDS en un VPS Ubuntu con PM2 + nginx (nova.llanostudio.co)

Alternativa a Docker (DESPLIEGUE.md). La tienda corre con PM2 en `127.0.0.1:3040`, nginx la publica con HTTPS y cada push a `main` se despliega solo con GitHub Actions (`.github/workflows/deploy.yml`).

## 1. Servidor base (como root)

```bash
apt update && apt upgrade -y
apt install -y git curl nginx mysql-server certbot python3-certbot-nginx ufw
adduser nova && usermod -aG sudo nova
ufw allow OpenSSH && ufw allow 'Nginx Full' && ufw enable
mkdir -p /var/lib/nova/uploads /var/www/llanostudio/sitios/nova-diamonds-yxj && chown -R nova:nova /var/lib/nova /var/www/llanostudio/sitios/nova-diamonds-yxj
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
git clone git@github.com:Martinvb07/NOVA-DIAMONDS-YXJ.git /var/www/llanostudio/sitios/nova-diamonds-yxj
cd /var/www/llanostudio/sitios/nova-diamonds-yxj
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
curl -s http://127.0.0.1:3040/api/health
```

Configuración de tu PC: `npm run config:exportar`, súbela con `scp -r exportacion/config-XXXX nova@IP:~/` y en el VPS:
`npm run config:importar -- ~/config-XXXX` (simula) y luego con `--confirmar`.

## 5. DNS + nginx + HTTPS

DNS de `llanostudio.co`: registro `A` con nombre `nova` → IP del VPS. Luego:

```bash
cp deploy/nginx-nova.conf /etc/nginx/sites-available/nova-diamonds-yxj
ln -sf /etc/nginx/sites-available/nova-diamonds-yxj /etc/nginx/sites-enabled/
nginx -t && systemctl reload nginx
certbot --nginx -d nova.llanostudio.co --redirect
```

## 6. Deploy automático (GitHub Actions)

En el VPS (como `root`) crea una clave SSH solo para Actions. **No vence nunca**: sirve hasta que la borres de `authorized_keys`.
No hace falta guardarla en otro lado: queda en los secretos de GitHub y, si algún día se pierde, se crea otra en un minuto.

```bash
ssh-keygen -t ed25519 -f ~/.ssh/gh_actions_nova -N "" -C "github-actions-nova"
cat ~/.ssh/gh_actions_nova.pub >> ~/.ssh/authorized_keys
cat ~/.ssh/gh_actions_nova          # contenido para el secreto VPS_SSH_KEY (desde -----BEGIN hasta END----- inclusive)
```

Para que el VPS pueda bajar el código (repo privado), una **Deploy key** de solo lectura, que tampoco vence:

```bash
ssh-keygen -t ed25519 -f ~/.ssh/nova_repo -N "" -C "vps-nova-repo"
cat ~/.ssh/nova_repo.pub   # GitHub → repo → Settings → Deploy keys → Add deploy key (sin permiso de escritura)
cat >> ~/.ssh/config <<'CFG'
Host github-nova
  HostName github.com
  User git
  IdentityFile ~/.ssh/nova_repo
  IdentitiesOnly yes
CFG
git clone git@github-nova:Martinvb07/NOVA-DIAMONDS-YXJ.git /var/www/llanostudio/sitios/nova-diamonds-yxj
```

GitHub → repo → Settings → Environments → **produccion** → secretos:

| Secreto | Valor |
|---|---|
| `VPS_HOST` | IP del VPS |
| `VPS_USER` | `root` |
| `VPS_PATH` | `/var/www/llanostudio/sitios/nova-diamonds-yxj` |
| `VPS_SSH_KEY` | la clave privada `gh_actions_nova` completa |

La tienda usa el puerto **3040** (PM2 `nova`) para no chocar con otros sitios del mismo servidor que usen 3020.

Cada push a `main`: tipos + pruebas + build en CI → en el VPS `git reset`, `npm ci`, migraciones, build, PM2 y health check a `/api/health` (si falla, vuelve a la versión anterior).

## 7. Cron y respaldos

```bash
crontab -e
```
```cron
*/2 * * * * curl -fsS -m 50 -H "Authorization: Bearer TU_CRON_SECRET" https://nova.llanostudio.co/api/cron/maintenance > /dev/null
30 3 * * * sh /var/www/llanostudio/sitios/nova-diamonds-yxj/deploy/respaldo-vps.sh >> /root/respaldo-nova.log 2>&1
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
