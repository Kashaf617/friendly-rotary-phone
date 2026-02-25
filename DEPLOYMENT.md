# Restaurant ERP - Deployment Guide

## Plesk Deployment Configuration

### Prerequisites
- Plesk server with Node.js support
- PostgreSQL database (Supabase recommended)
- Domain/subdomain configured in Plesk
- Git access enabled

---

## 1. Database Setup (Supabase)

### Create Database
1. Go to https://supabase.com
2. Create new project
3. Copy connection string from Settings → Database
4. Format: `postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres`

### SSL Configuration
Supabase requires SSL connections. Your connection string should use `sslmode=require`.

---

## 2. Backend Deployment (NestJS)

### Environment Variables (.env)
Create `backend/.env` file:

```env
# Database
DATABASE_URL=postgresql://postgres:[YOUR_PASSWORD]@[YOUR_HOST]:5432/postgres
DB_SSL=true
DB_SYNCHRONIZE=true

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=1h
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-this-in-production
JWT_REFRESH_EXPIRES_IN=7d

# Server
PORT=3001
NODE_ENV=production

# CORS
CORS_ORIGIN=https://yourdomain.com
```

### Plesk Node.js Application Setup
1. **Go to:** Domains → [Your Domain] → Node.js
2. **Application Mode:** Production
3. **Application Root:** `/backend`
4. **Application Startup File:** `dist/main.js`
5. **Node.js Version:** 18.x or higher
6. **Custom Environment Variables:** Add all from .env above

### Build Commands
```bash
cd backend
npm install
npm run build
```

### Start Script (package.json)
Ensure your `backend/package.json` has:
```json
{
  "scripts": {
    "start": "node dist/main.js"
  }
}
```

### Reverse Proxy (Optional)
If running on port 3001, configure Plesk Apache/Nginx to proxy:
- **Proxy URL:** http://localhost:3001
- **Document Root:** Keep default

---

## 3. Frontend Deployment (Next.js)

### Environment Variables (.env.local)
Create `frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=https://api.yourdomain.com/api
```

### Plesk Node.js Application Setup
1. **Go to:** Domains → [Your Domain] → Node.js
2. **Application Mode:** Production
3. **Application Root:** `/frontend`
4. **Application Startup File:** `server.js` (custom server) OR use `npm start`
5. **Node.js Version:** 18.x or higher
6. **Environment Variables:** Add NEXT_PUBLIC_API_URL

### Build Commands
```bash
cd frontend
npm install
npm run build
```

### Start Script
Ensure `frontend/package.json`:
```json
{
  "scripts": {
    "build": "next build",
    "start": "next start -p 3000"
  }
}
```

### Static Export (Alternative)
If Plesk doesn't support Next.js server:
```bash
npm run build
# Deploy .next/static and .next/server manually
```

---

## 4. AI Service (Optional - FastAPI)

### Environment Variables
Create `ai-service/.env`:

```env
DATABASE_URL=postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres
```

### Python Setup in Plesk
1. Install Python 3.9+
2. Create virtual environment
3. Install dependencies:
```bash
cd ai-service
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### Run with Gunicorn
```bash
gunicorn -w 4 -k uvicorn.workers.UvicornWorker app.main:app --bind 0.0.0.0:8000
```

---

## 5. Nginx Configuration (Plesk)

### Backend Proxy
**File:** `/etc/nginx/conf.d/backend.conf`

```nginx
server {
    listen 80;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### Frontend Proxy
**File:** `/etc/nginx/conf.d/frontend.conf`

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

## 6. PM2 Process Manager (Recommended)

### Install PM2
```bash
npm install -g pm2
```

### Start Backend
```bash
cd backend
pm2 start dist/main.js --name erp-backend
pm2 save
pm2 startup
```

### Start Frontend
```bash
cd frontend
pm2 start npm --name erp-frontend -- start
pm2 save
```

### Check Status
```bash
pm2 list
pm2 logs
pm2 monit
```

---

## 7. SSL Certificate (Let's Encrypt)

In Plesk:
1. Go to **Domains → SSL/TLS Certificates**
2. Select **Let's Encrypt**
3. Enable for both domain and www subdomain
4. Enable **Secure your mail**
5. Click **Get it free**

---

## 8. Database Migrations

### Run Seed Data
```bash
cd backend
npm run seed
```

This creates:
- Demo tenant
- Super admin user
- Restaurant admin user
- Sample roles and permissions

### Default Credentials
- **Super Admin:** `superadmin@erp.ae` / `Admin@123`
- **Restaurant Admin:** `admin@demo-restaurant.ae` / `Admin@123`

---

## 9. Health Checks

### Backend
```bash
curl https://api.yourdomain.com/health
```

### Frontend
```bash
curl https://yourdomain.com
```

---

## 10. Troubleshooting

### Backend won't start
- Check logs: `pm2 logs erp-backend`
- Verify DATABASE_URL is correct
- Ensure port 3001 is not blocked
- Check SSL certificate on Supabase

### Frontend build fails
- Clear `.next` folder
- Run `npm install` again
- Check Node.js version (18+)

### Database connection errors
- Verify Supabase credentials
- Check SSL mode is enabled
- Whitelist Plesk server IP in Supabase

### CORS errors
- Update CORS_ORIGIN in backend .env
- Ensure frontend API URL matches

---

## 11. Production Checklist

- [ ] Change all default passwords
- [ ] Update JWT secrets
- [ ] Enable HTTPS/SSL
- [ ] Set NODE_ENV=production
- [ ] Configure DB backups
- [ ] Set up monitoring (PM2, Sentry)
- [ ] Configure firewall rules
- [ ] Enable rate limiting
- [ ] Set up CDN (optional)
- [ ] Configure email service for notifications

---

## Support

For issues, check:
- Backend logs: `pm2 logs erp-backend`
- Frontend logs: `pm2 logs erp-frontend`
- Database logs in Supabase dashboard
- Nginx error logs: `/var/log/nginx/error.log`
