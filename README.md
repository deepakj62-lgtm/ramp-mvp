# RAMP Staffing Search MVP

A self-improving staffing search application that combines allocation data (RAMP) with resume-based skills. Users can search for available staff, give feedback anywhere in the app, and improvements are driven by real user needs.

## Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Set up environment
cp .env.example .env.local

# Generate Prisma client
npx prisma generate

# Seed database with synthetic data
npm run seed

# Start dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Architecture

### Tech Stack
- **Frontend**: Next.js 15 (App Router) + TypeScript + Tailwind CSS
- **Database**: SQLite (Prisma ORM)
- **Hosting**: Vercel (for production)
- **API**: Next.js API Routes

### Key Features

#### 1. Search Staff (Home → Search)
- Natural language query: *"Find someone 50% free in April with insurance experience"*
- Filters by:
  - Availability (date range + free allocation %)
  - Skills extracted from resumes
  - Location (US/Canada)
  - Level (Associate/Consultant/Senior/Principal)
- Returns ranked results with:
  - Match confidence score
  - Matched skills with confidence
  - Allocation timeline
  - "Why matched" explanation
- Export results to CSV

#### 2. Feedback Loop (Everywhere + /feedback)
- **Global Feedback Button** (💬): Visible on every page
  - Click to open quick feedback modal
  - Describe bug/feature in natural language
  - Choose type: Bug, Feature, Question, Data Issue
  - Submit ticket
- **Feedback Board** (/feedback): Owner dashboard
  - View all submitted tickets
  - Filter by status: New → Triaged → Accepted → Shipped
  - Click "Approve" to queue for implementation
  - See raw text, chat transcript, and structured requirements

#### 3. Person Detail (/person/[id])
- Full resume text
- Extracted skills & tools
- Certifications
- Allocation timeline (12-month view)
- Current projects and allocations

## Database Schema

### Tables
- **employees**: Person + resume + extracted skills
- **allocations**: Assignment to project + date range + %
- **projects**: Project name + client + industry tag
- **feedback_tickets**: User feedback + raw text + structured JSON

## Synthetic Data

**Scale:**
- 80 employees (4 levels, mix of locations, diverse skills)
- 30 projects across 10 fake clients
- ~150 allocations (covering Jan-Dec 2026)
- 80 synthetic resumes with realistic skill/tool/cert content
- 10+ sample feedback tickets for testing

**Domains represented:**
- Insurance
- Pension Administration
- Workers Compensation
- Benefits Administration

**Tools represented:**
- Vitech, Sagitec, Workday, SAP, Salesforce
- Tableau, Power BI, Qlik Sense
- SQL Server, Python, Java, C#/.NET
- Azure, AWS

## How the Feedback → Code Loop Works

### For Users:
1. Use the app (search, view results)
2. Click 💬 feedback button anywhere
3. Describe issue/feature in chat
4. Submit → ticket lands on Feedback Board

### For Owner (You):
1. Log into `/feedback` board
2. See new tickets with raw text + LLM-structured requirements
3. Click "Approve" on tickets you want to build
4. Work with Claude Code agent on implementation
5. Test locally with synthetic data
6. Deploy to Vercel
7. Mark ticket "Shipped"

## Running Tests

### Regression Suite
```bash
npm run test:regression
```

This displays 8 canonical staffing queries. Manually test each against the running app:

1. "Find someone 50% free in April with insurance experience" → expect 2+ results
2. "Who is completely free in March?" → expect 1+ results
3. "Find a Principal-level person with SQL available in Q2" → expect 1+ Principal
4. etc.

## Deployment

### Local
```bash
npm run dev
# Open http://localhost:3000
```

### Vercel
```bash
git push origin main
# Vercel auto-deploys on push
# Visit https://[project].vercel.app
```

**First deploy:**
1. Create Vercel account
2. Connect GitHub repo
3. Vercel runs `npm install`, `npx prisma migrate`, `npm run seed`
4. App is live with shareable URL

## Project Structure

```
ramp-mvp/
├── app/
│   ├── layout.tsx         # Root layout with nav
│   ├── page.tsx           # Home page
│   ├── search/page.tsx    # Search page
│   ├── feedback/page.tsx  # Feedback board
│   ├── person/[id]/       # Person detail page
│   └── api/
│       ├── search/route.ts
│       ├── feedback/route.ts
│       └── feedback/[id]/route.ts
├── components/
│   ├── SearchFilters.tsx
│   ├── ResultsTable.tsx
│   ├── FeedbackWidget.tsx
│   └── AllocationTimeline.tsx (future)
├── lib/
│   ├── db.ts              # Prisma client
│   ├── search.ts          # Search logic
│   └── seed.ts            # Synthetic data generation
├── prisma/
│   └── schema.prisma      # Database schema
├── scripts/
│   ├── seed.js
│   └── regression-tests.js
├── README.md
├── package.json
└── .env.example
```

## Branching / Future Features

These come from user feedback:
- **Live Dataverse connector** (instead of snapshots)
- **Saved searches** ("insurance + WC + 50% free")
- **Analytics dashboard** (most-searched skills, common queries)
- **Admin config UI** (manage/add test data)
- **Regression testing dashboard** (visual test case tracking)
- **Skill confidence thresholds** (user control)
- **Multi-user collaboration** (share & annotate results)

## Data Privacy & Safety

✅ **All data is synthetic & fictional:**
- Names, employees, clients, projects = fake
- No real company or client data
- Safe for development, demo, and testing
- Zero privacy risk

## Development Notes

### Adding Test Data
Edit `lib/seed.ts`:
- Add more employees to `FIRST_NAMES` / `LAST_NAMES`
- Add projects to `FAKE_PROJECTS`
- Adjust SKILL_OPTIONS to change available skills
- Run `npm run seed` to regenerate

### Customizing Search Logic
Edit `lib/search.ts`:
- Change keyword extraction in `extractKeywords()`
- Adjust skill matching scores
- Add new filter types

### Styling
- Tailwind CSS in `app/globals.css`
- Component classes use Tailwind utilities
- No CSS files needed

## Support & Feedback

This is an internal MVP. To report bugs or suggest features:
1. Use the 💬 button in the app (while it's running)
2. Or create a GitHub issue

---

**Built with**: Next.js + Prisma + Tailwind + Vercel
**Data**: 100% synthetic for MVP safety
**Vision**: User feedback drives product evolution
