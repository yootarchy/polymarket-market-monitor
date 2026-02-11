# ⚡ Quick Start Guide

Get the Polymarket Market Monitor running in **under 5 minutes**.

## 📋 Prerequisites

Check you have:
- ✅ Node.js 18+ installed (`node --version`)
- ✅ npm, yarn, or pnpm installed
- ✅ Internet connection (for API access)

## 🚀 3-Step Setup

### 1. Install Dependencies

```bash
cd polymarket-market-monitor
npm install
```

**Wait time**: ~1-2 minutes

### 2. Start Development Server

```bash
npm run dev
```

**Wait time**: ~10 seconds

### 3. Open in Browser

Visit: **http://localhost:3000**

🎉 **You're done!** The dashboard should be loading live market data.

## 🔍 What You Should See

1. **Header** - "Polymarket Market Monitor"
2. **Search Bar** - Type to filter markets
3. **Category Tabs** - All, Politics, Crypto, Sports, Tech, Pop-Culture
4. **Market Cards** - Grid of markets with:
   - Market question
   - Current YES/NO odds (with colored bars)
   - Trading volume
   - End date
   - Category badge

## ✅ Verify Everything Works

Run the verification script:

```bash
node scripts/verify-setup.js
```

This checks:
- ✅ Node.js version
- ✅ All files present
- ✅ Gamma API accessible
- ✅ TypeScript configured

## 🎯 Try These Features

### 1. Search for Markets
- Click the search bar
- Type "Trump" or "Bitcoin"
- See filtered results instantly

### 2. Filter by Category
- Click "Politics" tab
- See only political markets
- Try other categories

### 3. View Market Details
- Click any market card
- Opens on Polymarket.com in new tab
- See full market details

### 4. Watch Live Updates
- Leave the page open
- Odds auto-refresh every 30 seconds
- See the "Updated: [time]" change

## 🛠️ Common Issues

### Issue: Port 3000 Already in Use

```bash
# Use a different port
PORT=3001 npm run dev

# Or kill the process using port 3000
# macOS/Linux:
lsof -ti:3000 | xargs kill -9

# Windows:
netstat -ano | findstr :3000
taskkill /PID [PID_NUMBER] /F
```

### Issue: Module Not Found

```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Issue: TypeScript Errors

```bash
# Restart TypeScript server (in VSCode)
# Cmd+Shift+P > "TypeScript: Restart TS Server"

# Or rebuild
npm run build
```

### Issue: API Not Loading

1. Check your internet connection
2. Try visiting: https://gamma-api.polymarket.com/markets
3. If it loads in browser but not app, clear cache:
   ```bash
   rm -rf .next
   npm run dev
   ```

## 📱 View on Mobile

### Using Same WiFi Network

1. Find your local IP:
   ```bash
   # macOS/Linux
   ifconfig | grep "inet "
   
   # Windows
   ipconfig
   ```

2. On your phone, visit:
   ```
   http://[YOUR_IP]:3000
   ```
   Example: `http://192.168.1.100:3000`

### Using Tunnel (ngrok)

```bash
# Install ngrok
npm install -g ngrok

# Start tunnel
ngrok http 3000

# Use the provided URL (works anywhere)
```

## 🏗️ Build for Production

```bash
# Create optimized build
npm run build

# Start production server
npm start
```

## 🚢 Deploy to Vercel (Free)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy (follow prompts)
vercel

# Production deployment
vercel --prod
```

**Your app will be live** at `https://your-project.vercel.app`

## 📚 Next Steps

### Learn the Code
1. Read `README.md` - Comprehensive guide
2. Read `ARCHITECTURE.md` - Technical details
3. Read `EXAMPLES.md` - Code snippets

### Customize It
1. Change refresh rate
2. Add more categories
3. Modify card layout
4. Add new features

### Extend It
1. Add market detail pages
2. Implement price alerts
3. Create historical charts
4. Build watch lists

## 🎓 Understanding the Dashboard

### Search Bar
- **What**: Real-time filtering of markets
- **How**: Client-side search (instant)
- **Try**: Type "Biden", "Bitcoin", "Super Bowl"

### Category Tabs
- **What**: Filter by market category
- **How**: Click tabs to filter
- **Try**: "Politics" shows US elections, policy markets

### Market Cards
Each card shows:
- **Question**: What the market is predicting
- **Odds**: Current probability (YES/NO)
- **Volume**: Total money traded
- **End Date**: When market closes

### Color Coding
- **Green bars**: YES odds
- **Red bars**: NO odds
- **Length**: Represents probability %

## 💡 Pro Tips

### 1. Watch Specific Categories
Only interested in crypto?
- Click "Crypto" tab
- Bookmark the URL (state preserved)

### 2. Monitor High-Volume Markets
- Markets with high volume = more liquid
- Better odds = more trader confidence
- Look for volume badges

### 3. Check Often
- Odds change as news breaks
- Big swings = major events happening
- Auto-refresh keeps you updated

### 4. Use Search for Events
Searching for:
- **"Trump"** - All Trump-related markets
- **"Bitcoin 100k"** - BTC price predictions
- **"Super Bowl"** - Sports betting markets

## 🔗 Useful Links

- **Live Dashboard**: http://localhost:3000
- **Polymarket**: https://polymarket.com
- **Gamma API Docs**: https://docs.polymarket.com/api-reference
- **Next.js Docs**: https://nextjs.org/docs

## 🆘 Getting Help

### Documentation
1. Check `README.md` first
2. Review `EXAMPLES.md` for code samples
3. Read `ARCHITECTURE.md` for technical details

### Community
- Open a GitHub issue
- Join Polymarket Discord
- Ask on Twitter (tag @Polymarket)

## ✨ What's Next?

Now that you have it running:

1. **Explore the code** - Start with `app/page.tsx`
2. **Make changes** - Try modifying a component
3. **Read docs** - Understand the architecture
4. **Build features** - Add something new!

## 🎉 Success!

If you can see markets loading, congratulations! 

You now have a working Polymarket integration that:
- ✅ Fetches live data
- ✅ Auto-refreshes every 30s
- ✅ Filters and searches
- ✅ Shows beautiful UI
- ✅ Works on mobile

**Time to build something amazing!** 🚀

---

Questions? Check the full [README.md](./README.md) or open an issue.
