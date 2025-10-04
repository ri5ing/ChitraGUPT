# **App Name**: ChitraGupt

## Core Features:

- Contract Upload & Analysis: Allows clients to upload contracts (PDF/image) and triggers Gemini AI analysis to generate a summary, risk score, identify missing clauses and recommendations. Enforces credit check before allowing uploads.
- AI Report Generation: Generates detailed reports based on the AI analysis, highlighting risk areas and providing clear recommendations. Includes document summary.
- Auditor Connection: Enables clients to connect with auditors for contract review. Allows auditors to review contracts, provide feedback, and approve/annotate contracts.
- Credit & Subscription Management: Manages user subscriptions, deducts credits per contract upload, and notifies users on low credits or expiring plans. Credit deductions triggered when AI tool analysis begins.
- User Roles & Authentication: Firebase Authentication for login/registration and manages user roles (client, auditor, admin) with distinct dashboards and access controls.
- Admin Dashboard & Reporting: Provides admin users with a dashboard to manage contracts, roles, monitor credit usage, and generate reports (CSV/Excel). Includes data visualization with charts.
- Firestore Database: Utilizes Firestore to store user profiles, contract details, analysis results, and auditor feedback for persistence and real-time updates.

## Style Guidelines:

- Background color: Dark navy (#0A192F) for a professional, fintech-grade aesthetic.
- Primary color: White (#F9FAFB) for text, ensuring high readability against the dark background.
- Accent color: Blue (#3498db) to highlight key interactive elements.
- Body font: 'Inter', a sans-serif font, known for its clean and modern appearance, suitable for both headings and body text.
- Note: currently only Google Fonts are supported.
- Minimal and uncluttered layouts with cards, tables, and lists with proper spacing and hierarchy. Consistent spacing, typography and color usage. Mobile-first, fully responsive design.
- Use minimal icons from lucide-react/feather icons only where needed. Do not overuse icons, maintain a clean professional look.
- Subtle animations for user interactions, such as loading screens or feedback on button presses.