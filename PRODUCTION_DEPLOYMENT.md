# 🚀 Production Deployment Guide - Restaurant ERP System

## System Architecture

**Deployed Configuration:**
- **Frontend:** api.boltloom.com (Next.js 16)
- **Backend:** boltloom.com (NestJS 11)
- **Database:** Supabase PostgreSQL
- **Node.js:** v24.13.1

---

## Pre-Deployment Checklist

### ✅ 1. Environment Variables Configuration

#### Backend (.env)
```env
# Database
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@db.xxxxx.supabase.co:5432/postgres
DB_SSL=true
DB_SYNCHRONIZE=false

# JWT Secrets (MUST CHANGE)
JWT_SECRET=generate_with_openssl_rand_base64_32
JWT_EXPIRES_IN=1h
JWT_REFRESH_SECRET=different_secret_from_jwt_secret
JWT_REFRESH_EXPIRES_IN=7d

# Server
PORT=3001
NODE_ENV=production

# CORS (Your frontend URL)
CORS_ORIGIN=https://api.boltloom.com

# Optional: Seed control
SEED_ON_START=false
SEED_FORCE=false
```

#### Frontend (.env.production)
```env
NEXT_PUBLIC_API_URL=https://boltloom.com/api
```

---

## Deployment Steps

### Backend Deployment (boltloom.com)

#### 1. Clone Repository
```bash
cd /var/www/vhosts/boltloom.com/httpdocs
git clone https://github.com/Kashaf617/friendly-rotary-phone.git .
cd backend
```

#### 2. Install Dependencies
```bash
rm -rf node_modules package-lock.json
npm install --production
```

#### 3. Create Production Environment File
```bash
cp ../.env.production.example .env
nano .env
# Configure all variables (DATABASE_URL, JWT secrets, CORS, etc.)
```

#### 4. Build Application
```bash
npm run build
```

#### 5. Run Database Migration & Seed
```bash
# First time only - seed demo data
npm run seed
```

**Expected Output:**
```
Database seeded successfully!
Login credentials:
  Super Admin: superadmin@erp.ae / Admin@123
  Restaurant Admin: admin@demo-restaurant.ae / Admin@123
```

#### 6. Configure Plesk Node.js Application

**Go to:** Plesk → Domains → boltloom.com → Node.js

**Settings:**
- **Application Root:** `backend`
- **Application Startup File:** `dist/main.js`
- **Node.js Version:** `24.13.1`
- **Application Mode:** `production`
- **Document Root:** `/httpdocs`

**Custom Environment Variables:**
```
DATABASE_URL = postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres
DB_SSL = true
DB_SYNCHRONIZE = false
JWT_SECRET = [YOUR_SECRET_32_CHARS_MIN]
JWT_EXPIRES_IN = 1h
JWT_REFRESH_SECRET = [DIFFERENT_SECRET]
JWT_REFRESH_EXPIRES_IN = 7d
PORT = 3001
NODE_ENV = production
CORS_ORIGIN = https://api.boltloom.com
```

#### 7. Configure Nginx Reverse Proxy

**Go to:** Plesk → Domains → boltloom.com → Apache & nginx Settings

**Additional nginx directives:**
```nginx
location /api {
    proxy_pass http://localhost:3001;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_cache_bypass $http_upgrade;
    proxy_read_timeout 300;
    proxy_connect_timeout 300;
}
```

Click **OK** → **Apply**

#### 8. Enable SSL/TLS Certificate

**Go to:** Plesk → Domains → boltloom.com → SSL/TLS Certificates

1. Select **Let's Encrypt**
2. Check: ☑ `boltloom.com` ☑ `www.boltloom.com`
3. Click **Get it free**
4. Enable **Redirect HTTP to HTTPS**

#### 9. Start Application

Click **"Restart App"** in Plesk Node.js settings

#### 10. Test Backend API

```bash
# Test health endpoint
curl https://boltloom.com/api/health

# Expected response:
{
  "status": "ok",
  "timestamp": "2026-02-28T...",
  "database": "connected",
  "version": "1.0.0"
}

# Test authentication
curl -X POST https://boltloom.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"superadmin@erp.ae","password":"Admin@123"}'

# Expected: JWT tokens returned
```

---

### Frontend Deployment (api.boltloom.com)

#### 1. Navigate to Frontend Directory
```bash
cd /var/www/vhosts/api.boltloom.com/httpdocs
git clone https://github.com/Kashaf617/friendly-rotary-phone.git .
cd frontend
```

#### 2. Install Dependencies
```bash
rm -rf node_modules package-lock.json .next
npm install --production
```

#### 3. Create Production Environment
```bash
echo "NEXT_PUBLIC_API_URL=https://boltloom.com/api" > .env.production
```

#### 4. Build Frontend
```bash
npm run build
```

**Expected Output:**
```
✓ Compiled successfully
✓ Collecting page data
✓ Generating static pages
Route (app)                              Size
┌ ○ /                                    ...
├ ○ /_not-found                          ...
└ ○ /login                               ...
```

#### 5. Configure Plesk Node.js

**Go to:** Plesk → Domains → api.boltloom.com → Node.js

**Settings:**
- **Application Root:** `frontend`
- **Application Startup File:** Leave **blank** (uses npm start)
- **Node.js Version:** `24.13.1`
- **Application Mode:** `production`

**Custom Environment Variables:**
```
NEXT_PUBLIC_API_URL = https://boltloom.com/api
```

#### 6. Enable SSL Certificate

**Go to:** Plesk → Domains → api.boltloom.com → SSL/TLS Certificates

1. Select **Let's Encrypt**
2. Check: ☑ `api.boltloom.com`
3. Click **Get it free**
4. Enable **Redirect HTTP to HTTPS**

#### 7. Start Frontend

Click **"Restart App"** in Plesk

#### 8. Test Frontend

**Open browser:**
```
https://api.boltloom.com
```

**Expected:** Login page loads successfully

**Test login:**
- Email: `superadmin@erp.ae`
- Password: `Admin@123`

---

## Post-Deployment Verification

### Backend Health Checks

```bash
# 1. Health endpoint
curl https://boltloom.com/api/health

# 2. Get all tenants (requires auth)
curl https://boltloom.com/api/tenants \
  -H "Authorization: Bearer YOUR_TOKEN"

# 3. Check menu items
curl https://boltloom.com/api/menu/items \
  -H "Authorization: Bearer YOUR_TOKEN"

# 4. Test subscriptions endpoint
curl https://boltloom.com/api/subscriptions \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Frontend Functionality Tests

**Manual Testing:**
1. ✅ Login page loads
2. ✅ Login with demo credentials works
3. ✅ Dashboard displays correctly
4. ✅ POS page functional
5. ✅ Orders page shows data
6. ✅ Menu management works
7. ✅ Inventory accessible
8. ✅ HR module functional
9. ✅ Super Admin pages (Tenants, Users, Subscriptions)
10. ✅ Language switching (EN/AR with RTL)

---

## Security Hardening

### 1. Environment Secrets

**CRITICAL:** Change all default secrets:

```bash
# Generate secure JWT secret
openssl rand -base64 32

# Generate refresh token secret
openssl rand -base64 32

# Generate session secret
openssl rand -base64 32
```

Update `.env` with these values.

### 2. Database Security

- ✅ SSL enabled (`DB_SSL=true`)
- ✅ Disable synchronize in production (`DB_SYNCHRONIZE=false`)
- ✅ Use strong passwords
- ✅ Restrict database access to specific IPs (Supabase settings)

### 3. CORS Configuration

Ensure `CORS_ORIGIN` only includes your frontend domain:
```env
CORS_ORIGIN=https://api.boltloom.com
```

### 4. Rate Limiting

Already configured in `main.ts`:
- 100 requests per 60 seconds per IP
- Adjust in `ThrottlerModule` if needed

---

## Monitoring & Maintenance

### View Logs

**Backend logs:**
```bash
# Via Plesk
Plesk → Domains → boltloom.com → Logs

# Via SSH (if using PM2)
pm2 logs boltloom-backend
```

**Frontend logs:**
```bash
Plesk → Domains → api.boltloom.com → Logs
```

### Restart Applications

**Backend:**
```bash
# Via Plesk
Plesk → Domains → boltloom.com → Node.js → Restart App

# Via PM2 (if used)
pm2 restart boltloom-backend
```

**Frontend:**
```bash
Plesk → Domains → api.boltloom.com → Node.js → Restart App
```

### Database Backups

**Supabase:**
- Daily automatic backups (check Supabase dashboard)
- Manual backup:
  - Go to Supabase → Database → Backups
  - Click "Create backup"

### Update Deployment

**When code changes:**
```bash
# Backend
cd /var/www/vhosts/boltloom.com/httpdocs/backend
git pull origin main
npm install
npm run build
# Then restart in Plesk

# Frontend
cd /var/www/vhosts/api.boltloom.com/httpdocs/frontend
git pull origin main
npm install
npm run build
# Then restart in Plesk
```

---

## Troubleshooting

### Issue: Backend not starting

**Check:**
1. Node.js version is 20+ (currently 24.13.1)
2. `dist/main.js` exists (run `npm run build`)
3. Environment variables set correctly
4. Database connection working

**Test database:**
```bash
cd backend
node -e "require('pg').Client({connectionString:process.env.DATABASE_URL,ssl:{rejectUnauthorized:false}}).connect().then(()=>console.log('OK')).catch(e=>console.log(e))"
```

### Issue: Frontend shows blank page

**Check:**
1. `.next` folder exists (run `npm run build`)
2. `NEXT_PUBLIC_API_URL` is set correctly
3. CORS allows frontend domain
4. Check browser console for errors

### Issue: CORS errors

**Fix:**
Update backend `.env`:
```env
CORS_ORIGIN=https://api.boltloom.com,https://www.api.boltloom.com
```

Restart backend.

### Issue: 401 Unauthorized

**Causes:**
- JWT token expired
- Invalid credentials
- Token not sent in request

**Solution:**
1. Clear browser localStorage
2. Login again
3. Check token in Network tab

---

## Default Login Credentials

After seeding:

**Super Admin (full access):**
- Email: `superadmin@erp.ae`
- Password: `Admin@123`

**Restaurant Admin:**
- Email: `admin@demo-restaurant.ae`
- Password: `Admin@123`

**Manager:**
- Email: `manager@demo-restaurant.ae`
- Password: `Admin@123`

**Waiter:**
- Email: `waiter@demo-restaurant.ae`
- Password: `Admin@123`

**Kitchen:**
- Email: `kitchen@demo-restaurant.ae`
- Password: `Admin@123`

⚠️ **IMPORTANT:** Change all passwords after first login!

---

## Performance Optimization

### Backend Optimizations
- ✅ Database connection pooling enabled
- ✅ Query result caching (TypeORM)
- ✅ JWT token validation
- ✅ Global exception handling
- ✅ Request transformation
- ✅ Rate limiting

### Frontend Optimizations
- ✅ Next.js 16 Server Components
- ✅ React Compiler enabled
- ✅ Image optimization
- ✅ Code splitting
- ✅ React Query caching

### Recommended Additions
1. **Redis** for session caching
2. **CDN** for static assets (Cloudflare)
3. **Database indexes** on frequently queried columns
4. **API response compression** (gzip)

---

## Support & Maintenance

### Regular Tasks
- Weekly: Check logs for errors
- Monthly: Review database performance
- Monthly: Update dependencies
- Quarterly: Security audit
- Quarterly: Database optimization

### Emergency Contacts
- Backend issues: Check Plesk logs first
- Database issues: Check Supabase dashboard
- SSL issues: Renew Let's Encrypt certificate

---

## System Health Dashboard

Access via:
```
https://boltloom.com/api/health
```

**Healthy response:**
```json
{
  "status": "ok",
  "timestamp": "2026-02-28T19:23:45.123Z",
  "database": "connected",
  "version": "1.0.0"
}
```

---

**🎉 Deployment Complete!**

Your Restaurant ERP system is now live and production-ready.
