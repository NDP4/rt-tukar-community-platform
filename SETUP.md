# RT Tukar - Setup Instructions

## Complete Setup Guide

### Step 1: Supabase Project Setup

1. **Create Supabase Project**

   - Go to [supabase.com](https://supabase.com)
   - Click "New Project"
   - Choose organization and enter project details
   - Wait for project to be ready

2. **Get Project Credentials**
   - Go to Project Settings > API
   - Copy `Project URL` and `anon public` key
   - Save these for environment variables

### Step 2: Database Setup

1. **Run Main Schema**

   - Go to Supabase Dashboard > SQL Editor
   - Copy content from `supabase-schema.sql`
   - Run the SQL script
   - Verify all tables are created

2. **Run Seed Data (Optional)**
   - Copy content from `supabase-seed.sql`
   - Run to create sample RT communities

### Step 3: Storage Setup

1. **Verify Storage Bucket**
   - Go to Storage in Supabase Dashboard
   - Ensure `items` bucket exists and is public
   - If not, create it manually

### Step 4: Application Setup

1. **Environment Variables**

   ```bash
   cp .env.example .env.local
   ```

2. **Update .env.local**

   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_project_url_here
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
   ```

3. **Install Dependencies**

   ```bash
   npm install
   ```

4. **Run Development Server**
   ```bash
   npm run dev
   ```

### Step 5: Testing the Application

1. **Create Test Users**

   - Go to http://localhost:3000
   - Sign up with different email addresses
   - Create profiles for each user

2. **Create RT Community**

   - First user creates an RT (becomes admin)
   - Other users join the same RT

3. **Test Core Features**
   - Add items as different users
   - Create requests between users
   - Accept requests and generate QR codes
   - Scan QR codes to mark as collected

## Manual Testing Checklist

### Authentication

- [ ] Sign up with new email
- [ ] Sign in with existing credentials
- [ ] Sign out functionality
- [ ] Profile creation on first signup

### RT Management

- [ ] Create new RT (user becomes admin)
- [ ] Join existing RT
- [ ] View RT members (admin only)
- [ ] RT data isolation (can't see other RT's data)

### Items Management

- [ ] Add new item with photo
- [ ] Edit own item
- [ ] Delete own item (owner/admin only)
- [ ] View items in same RT only
- [ ] Filter items by status/category

### Request System

- [ ] Request item from another user
- [ ] View own requests
- [ ] Accept/reject requests (as donor)
- [ ] Generate QR code on acceptance
- [ ] Display QR code to requester

### QR Code System

- [ ] Scan valid QR code
- [ ] Mark request as collected
- [ ] Reject invalid/used QR codes
- [ ] Admin can scan any RT member's codes

### Admin Features

- [ ] View RT statistics
- [ ] Manage RT members
- [ ] Oversee all RT items
- [ ] Admin-only navigation items

## Production Deployment

### Vercel Deployment

1. Connect GitHub repo to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically

### Environment Variables for Production

```env
NEXT_PUBLIC_SUPABASE_URL=your_production_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_production_anon_key
```

### Security Considerations

- Ensure RLS policies are active
- Test data isolation between RTs
- Verify QR codes are single-use
- Check file upload permissions

## Troubleshooting

### Common Issues

**Database Connection**

- Verify Supabase URL and key
- Check if project is paused/inactive

**Authentication Issues**

- Confirm auth is enabled in Supabase
- Check email confirmation settings

**File Upload Problems**

- Verify storage bucket exists
- Check bucket policies
- Ensure public access is enabled

**QR Scanner Not Working**

- Requires HTTPS in production
- Check camera permissions
- Verify html5-qrcode library loaded

### Performance Optimization

- Enable Supabase connection pooling
- Optimize image sizes for uploads
- Add loading states for better UX
- Implement pagination for large item lists

## Next Steps

After basic setup, consider:

1. Adding email notifications for requests
2. Implementing real-time updates with Supabase Realtime
3. Adding item categories and better search
4. Creating mobile app version
5. Adding analytics and reporting features

---

**Happy coding! 🚀**
