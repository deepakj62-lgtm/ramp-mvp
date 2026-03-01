# RAMP MVP - Quick Setup Guide

## What's Built

✅ **Search Page** - Find staff by availability + skills
✅ **Feedback Loop** - Report bugs/features from any page
✅ **Feedback Board** - Owner dashboard to review & approve feedback
✅ **Person Detail** - View resumes, skills, allocation timeline
✅ **Synthetic Data** - 80 employees, 20 projects, 159 allocations
✅ **Database** - SQLite with Prisma ORM
✅ **API Routes** - Search, feedback collection, ticket management

## Quick Start (Your MacBook)

### 1. **Install & Setup** (Already done!)
```bash
cd /Users/djohny/Desktop/Claude\ RAMP\ Self\ Correcting/ramp-mvp
npm install           # ✓ Done
npx prisma generate  # ✓ Done
npm run seed         # ✓ Done - 80 employees + 20 projects + 159 allocations created
```

### 2. **Run Locally**
```bash
npm run dev
```
Opens: http://localhost:3000

### 3. **Test the MVP**
- **Home Page** (/) - Overview of the system
- **Search Page** (/search) - Try queries like:
  - "Find someone 50% free in April with insurance experience"
  - "Who is completely free in March?"
  - "Find a Principal with SQL"
- **Person Detail** (/person/[id]) - Click a result to see full resume
- **Feedback Button** (💬) - On any page, click to submit feedback/bug reports
- **Feedback Board** (/feedback) - See all feedback, approve changes

## The Branching/Self-Improving Loop

1. **User** clicks feedback button → describes bug/feature
2. **System** converts to structured ticket
3. **Ticket** lands on /feedback board (owner dashboard)
4. **You** review & click "Approve"
5. **You** work with Claude Code: "Implement this approved ticket"
6. **Claude** codes the change locally
7. **You** test locally with synthetic data
8. **You** deploy to Vercel
9. **You** mark ticket "Shipped"
10. Loop repeats ✨

## File Structure Overview

```
ramp-mvp/
├── app/
│   ├── page.tsx                   # Home
│   ├── search/page.tsx            # Search UI
│   ├── feedback/page.tsx          # Feedback board (owner)
│   ├── person/[id]/page.tsx       # Person detail
│   └── api/                       # API routes
├── components/
│   ├── SearchFilters.tsx          # Search form
│   ├── ResultsTable.tsx           # Results display
│   └── FeedbackWidget.tsx         # 💬 Feedback button
├── lib/
│   ├── db.ts                      # Prisma client
│   ├── search.ts                  # Search logic
│   └── seed.ts                    # Synthetic data generator
├── prisma/
│   ├── schema.prisma              # Database schema
│   └── migrations/                # DB migrations
└── scripts/
    ├── seed.js                    # Run seed script
    └── regression-tests.js        # List test cases
```

## Testing Checklist

- [ ] **Search Works**: Try "insurance" or "sql" query
- [ ] **Results Display**: See people ranked by match
- [ ] **Person Detail**: Click result, view resume + allocation timeline
- [ ] **Feedback Button**: Click 💬, submit a test feedback
- [ ] **Feedback Board**: Go to /feedback, see your ticket
- [ ] **Mobile View**: Resize browser to 375px width, test on mobile layout

## Common Commands

```bash
# Start dev server
npm run dev

# Reseed database with fresh synthetic data
npm run seed

# Run regression test viewer
npm run test:regression

# Build for production
npm build

# Deploy to Vercel
git push origin main
```

## Key URLs

- **Home**: http://localhost:3000
- **Search**: http://localhost:3000/search
- **Feedback Board**: http://localhost:3000/feedback
- **Person Detail**: http://localhost:3000/person/[employee-id]

## Next Steps

1. **Test locally** - Use the app, explore search results
2. **Try feedback loop** - Submit test feedback from /search page
3. **Review approved changes** - See them on /feedback board
4. **Deploy to Vercel** - When ready:
   ```bash
   git push origin main
   # Vercel auto-deploys, gets a shareable URL
   ```

## Questions?

- **Search not working?** Check that 80 employees were seeded: `npm run seed`
- **Feedback button not appearing?** Make sure FeedbackWidget is loaded in layout.tsx
- **Database issues?** Delete `db.sqlite` and re-run `npm run seed`

---

**Built with**: Next.js + Prisma + Tailwind + Vercel
**All data is synthetic** - safe for demo/development
**Ready to iterate** - user feedback drives roadmap
