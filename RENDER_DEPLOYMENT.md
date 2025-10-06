# Render Deployment Guide for BudgetPal Backend

This guide will help you deploy your BudgetPal backend to Render with PostgreSQL database.

## Prerequisites

- GitHub repository with your code
- Render account (free tier available)
- Your code pushed to GitHub

## Step 1: Create PostgreSQL Database on Render

1. **Go to Render Dashboard**
   - Visit [render.com](https://render.com)
   - Sign in to your account

2. **Create New PostgreSQL Database**
   - Click "New +" → "PostgreSQL"
   - Choose "Free" plan
   - Name: `budgetpal-database`
   - Database: `budgetpal`
   - User: `budgetpal_user`
   - Click "Create Database"

3. **Get Database URL**
   - Once created, go to your database dashboard
   - Copy the "External Database URL" (starts with `postgres://`)
   - This will be your `DATABASE_URL`

## Step 2: Deploy Backend Service

1. **Crearvice**
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Choose your repositote New Web Sery

2. **Configure Service**
   - **Name**: `budgetpal-backend`
   - **Environment**: `Node`
   - **Build Command**: `cd backend && npm install`
   - **Start Command**: `cd backend && npm start`
   - **Plan**: Free

3. **Set Environment Variables**
   - `NODE_ENV`: `production`
   - `DATABASE_URL`: (paste the URL from step 1)
   - `JWT_SECRET`: (generate a strong secret key)
   - `CORS_ORIGIN`: (your frontend URL when deployed)

4. **Deploy**
   - Click "Create Web Service"
   - Wait for deployment to complete

## Step 3: Configure Database Connection

Your backend will automatically:
- Connect to the PostgreSQL database using `DATABASE_URL`
- Create necessary tables on first startup
- Handle SSL connections for production

## Step 4: Test Your Deployment

1. **Check Health Endpoint**
   - Visit: `https://your-app-name.onrender.com`
   - Should return API information

2. **Test Authentication**
   - Use the provided `test.rest` file
   - Update the base URL to your Render URL
   - Test signup, login, and other endpoints

## Environment Variables Reference

| Variable | Description | Example |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `production` |
| `DATABASE_URL` | PostgreSQL connection string | `postgres://user:pass@host:port/db` |
| `JWT_SECRET` | Secret for JWT tokens | `your-super-secret-key` |
| `CORS_ORIGIN` | Allowed frontend origin | `https://your-frontend.onrender.com` |
| `PORT` | Server port (auto-set by Render) | `3000` |

## Troubleshooting

### Common Issues

1. **Database Connection Failed**
   - Check if `DATABASE_URL` is set correctly
   - Verify database is running on Render
   - Check SSL settings

2. **Build Failed**
   - Ensure `package.json` has correct scripts
   - Check Node.js version compatibility
   - Verify all dependencies are listed

3. **CORS Errors**
   - Set `CORS_ORIGIN` to your frontend URL
   - Check if frontend is making requests to correct backend URL

4. **Service Won't Start**
   - Check build and start commands
   - Verify `server.js` is in the `backend` folder
   - Check logs in Render dashboard

### Checking Logs

1. Go to your service dashboard on Render
2. Click on "Logs" tab
3. Look for error messages or connection issues

## Production Considerations

1. **Security**
   - Use strong JWT secrets
   - Set proper CORS origins
   - Consider rate limiting

2. **Performance**
   - Monitor database connections
   - Set up proper logging
   - Consider caching strategies

3. **Monitoring**
   - Set up health checks
   - Monitor response times
   - Set up alerts for downtime

## Updating Your Deployment

1. **Code Changes**
   - Push changes to your GitHub repository
   - Render will automatically redeploy

2. **Environment Variables**
   - Update in Render dashboard
   - Service will restart automatically

3. **Database Changes**
   - Sequelize will handle schema updates
   - Use migrations for complex changes

## Free Tier Limitations

- **Web Service**: 750 hours/month
- **Database**: 1GB storage, 1GB RAM
- **Sleep**: Services sleep after 15 minutes of inactivity
- **Cold Start**: First request after sleep may be slow

## Next Steps

1. Deploy your frontend to Render or another service
2. Update frontend API URLs to point to your backend
3. Set up custom domains if needed
4. Configure monitoring and alerts

## Support

- Render Documentation: [render.com/docs](https://render.com/docs)
- Render Community: [community.render.com](https://community.render.com)
- BudgetPal Issues: Create an issue in your repository
