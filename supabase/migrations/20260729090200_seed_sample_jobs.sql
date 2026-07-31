-- =============================================================================
-- Sample listings so the board has something to render (10 active, 1 draft).
--
-- Companies here are fictional on purpose. DELETE THIS FILE before pushing to
-- production if you don't want demo data in your live database - once applied,
-- a migration is recorded as run and won't be re-applied, but the rows stay.
--
-- Re-running is safe: rows are matched on slug.
-- =============================================================================


insert into public.jobs (
  slug, title, company_name, company_website, company_description,
  location, job_type, categories, experience_level, job_level,
  min_experience_years, salary_min, salary_max, description,
  responsibilities, requirements, nice_to_haves, skills, benefits,
  application_url, application_email, capacity, applicants_count,
  status, is_featured, posted_at, valid_through
) values
(
  'backend-engineer-node-bengaluru',
  'Backend Engineer (Node.js)',
  'Nexthire Labs',
  'https://example.com',
  'Nexthire Labs builds payments infrastructure for Indian SMBs. Around 60 people, engineering-led, remote-friendly.',
  'Bengaluru, Karnataka',
  'full-time',
  array['engineering','technology'],
  'experienced',
  'mid',
  3, 1800000, 2800000,
  'We are looking for a backend engineer to own services in our payments core. You will design APIs that move real money, work directly with the product team on merchant-facing features, and help us keep p99 latency under 200ms as volume grows. Our stack is Node.js and TypeScript on PostgreSQL, deployed on AWS. You will join a team of eight engineers where code review is thorough and shipping happens weekly.',
  array[
    'Design, build and operate backend services for payment flows',
    'Own database schema design and query performance for your services',
    'Write integration tests and participate in a weekly on-call rotation',
    'Review peers'' code and contribute to technical design documents'
  ],
  array[
    '3+ years building production backend services',
    'Strong TypeScript or JavaScript, and solid SQL',
    'Experience with PostgreSQL beyond basic CRUD',
    'Comfort with debugging distributed systems in production'
  ],
  array['Exposure to payments, ledgers or fintech compliance', 'Experience with Kafka or similar event streams'],
  array['Node.js','TypeScript','PostgreSQL','AWS','REST APIs'],
  array['Health insurance for you and dependents','Annual learning budget of Rs 50,000','Hybrid: 3 days in office','ESOPs after 12 months'],
  'https://example.com/careers/backend-engineer',
  null,
  3, 14,
  'active', true, now() - interval '2 days', now() + interval '40 days'
),
(
  'frontend-developer-react-fresher-hyderabad',
  'Frontend Developer (React) - Fresher',
  'Zentari Studio',
  'https://example.com',
  'Zentari Studio is a 25-person product studio building web apps for healthcare clients across India and the Gulf.',
  'Hyderabad, Telangana',
  'full-time',
  array['engineering','design'],
  'fresher',
  'entry',
  0, 500000, 750000,
  'A genuine entry-level role: we expect you to have built things, not to have shipped at scale. You will pair with a senior developer for your first three months, then own features on a client project. We care more about how you reason through a layout problem than which framework you memorised. Portfolio or GitHub link matters more than your CGPA.',
  array[
    'Build responsive interfaces from Figma designs',
    'Write reusable React components with accessibility in mind',
    'Fix bugs reported by QA and clients, with guidance',
    'Take part in code review, as author and reviewer'
  ],
  array[
    'Working knowledge of HTML, CSS and JavaScript fundamentals',
    'Have built at least two projects with React',
    'Willing to learn TypeScript in your first month',
    'Clear written English for async communication'
  ],
  array['Any exposure to Tailwind CSS or Next.js','A public portfolio or GitHub profile'],
  array['React','JavaScript','HTML','CSS','Git'],
  array['Structured 3-month mentorship','Health insurance','Fully paid certification of your choice'],
  null,
  'careers@example.com',
  4, 31,
  'active', true, now() - interval '4 days', now() + interval '30 days'
),
(
  'product-designer-remote-india',
  'Product Designer',
  'Loomwork',
  'https://example.com',
  'Loomwork makes scheduling software for clinics. Fully distributed team of 18 across five Indian states.',
  'Remote, India',
  'remote',
  array['design','technology'],
  'experienced',
  'senior',
  5, 2200000, 3200000,
  'You will be our second designer, owning end-to-end design for the practitioner-facing product. That means talking to clinic staff, sketching flows, building prototypes and shipping polished interfaces with our frontend team. We work asynchronously with two overlap hours a day. This role suits someone who wants ownership over craft rather than a seat in a large design org.',
  array[
    'Run discovery calls with clinic staff and synthesise findings',
    'Design flows and high-fidelity interfaces in Figma',
    'Maintain and extend our design system',
    'Work with engineers through implementation and QA'
  ],
  array[
    '5+ years designing digital products, ideally B2B SaaS',
    'A portfolio showing your process, not only final screens',
    'Fluency with Figma and prototyping',
    'Experience working with engineers in an async setup'
  ],
  array['Experience in healthcare or regulated industries','Basic HTML/CSS literacy'],
  array['Figma','User Research','Design Systems','Prototyping'],
  array['Fully remote, permanently','Rs 60,000 home-office setup budget','4-day work week in December','Health insurance'],
  'https://example.com/careers/product-designer',
  null,
  1, 8,
  'active', false, now() - interval '6 days', now() + interval '25 days'
),
(
  'digital-marketing-executive-mumbai',
  'Digital Marketing Executive',
  'Brightfold Media',
  'https://example.com',
  'Brightfold Media is a performance marketing agency working with D2C brands in India.',
  'Mumbai, Maharashtra',
  'full-time',
  array['marketing','business'],
  'experienced',
  'mid',
  2, 700000, 1100000,
  'Own paid acquisition for three D2C accounts. You will plan and run campaigns across Meta and Google, report on spend efficiency weekly, and work with our content team on creative testing. This is a hands-on role with real budget responsibility from month one, reporting directly to the founder.',
  array[
    'Plan, launch and optimise paid campaigns across Meta and Google Ads',
    'Own weekly reporting on ROAS, CAC and spend pacing',
    'Brief and test creatives with the content team',
    'Present performance reviews to clients monthly'
  ],
  array[
    '2+ years running paid campaigns with real budgets',
    'Comfortable in Google Ads and Meta Ads Manager',
    'Strong spreadsheet skills and comfort with numbers',
    'Client-facing communication experience'
  ],
  array['Google Ads certification','Experience with D2C or e-commerce brands'],
  array['Google Ads','Meta Ads','Google Analytics','SEO','Excel'],
  array['Performance bonus tied to account growth','Health insurance','Hybrid working'],
  null,
  'careers@example.com',
  2, 19,
  'active', false, now() - interval '8 days', now() + interval '20 days'
),
(
  'data-analyst-internship-pune',
  'Data Analyst Intern',
  'Kavach Analytics',
  'https://example.com',
  'Kavach Analytics builds risk models for insurance companies. Small, technical team of 12.',
  'Pune, Maharashtra',
  'internship',
  array['technology','finance'],
  'fresher',
  'entry',
  0, 300000, 420000,
  'A six-month paid internship with a strong chance of a full-time offer. You will work on real client datasets under supervision: cleaning data, building dashboards, and writing SQL to answer questions the risk team actually has. We will teach you the insurance domain; you bring analytical curiosity and comfort with data.',
  array[
    'Write SQL queries against client datasets to answer analyst questions',
    'Build and maintain dashboards in Metabase',
    'Document data quality issues and propose fixes',
    'Present findings in the weekly team review'
  ],
  array[
    'Final-year student or recent graduate in any quantitative field',
    'Working knowledge of SQL and either Python or R',
    'Able to work from our Pune office three days a week',
    'Available for six months full-time'
  ],
  array['Coursework or projects in statistics','Familiarity with Pandas'],
  array['SQL','Python','Excel','Data Visualisation'],
  array['Stipend of Rs 30,000 per month','Mentorship from senior analysts','Full-time offer for strong performers'],
  'https://example.com/careers/data-intern',
  null,
  5, 47,
  'active', false, now() - interval '11 days', now() + interval '18 days'
),
(
  'hr-generalist-delhi-ncr',
  'HR Generalist',
  'Sundial Foods',
  'https://example.com',
  'Sundial Foods runs a packaged snacks brand with 200 employees across manufacturing and sales.',
  'Delhi NCR',
  'full-time',
  array['human-resource','business'],
  'experienced',
  'mid',
  3, 800000, 1200000,
  'Own the people function for our commercial teams: hiring, onboarding, payroll coordination and employee relations. You will be the first point of contact for 80 employees across sales and marketing, working alongside our HR head who covers manufacturing. Strong candidates have handled hiring and compliance in a company that was growing quickly.',
  array[
    'Run end-to-end recruitment for commercial roles',
    'Handle onboarding, confirmation and exit processes',
    'Coordinate payroll inputs and statutory compliance with our vendor',
    'Support managers on performance conversations'
  ],
  array[
    '3+ years in a generalist HR role',
    'Working knowledge of Indian labour compliance basics (PF, ESI, gratuity)',
    'Experience hiring for sales or marketing roles',
    'Discretion with confidential information'
  ],
  array['MBA in HR','Experience with an HRMS such as Keka or Darwinbox'],
  array['Recruitment','Onboarding','Payroll','Employee Relations'],
  array['Health insurance including parents','Annual company retreat','5-day work week'],
  null,
  'careers@example.com',
  1, 12,
  'active', false, now() - interval '14 days', now() + interval '15 days'
),
(
  'sales-development-representative-chennai',
  'Sales Development Representative',
  'Corevault',
  'https://example.com',
  'Corevault sells document management software to mid-market Indian enterprises.',
  'Chennai, Tamil Nadu',
  'full-time',
  array['sales','business'],
  'fresher',
  'entry',
  1, 450000, 700000,
  'Start your B2B sales career with proper training rather than a phone list and a target. You will spend your first month learning the product and our buyers, then own outbound prospecting for the South India territory. Compensation is a fixed base plus uncapped incentive on qualified meetings booked.',
  array[
    'Research and qualify prospective accounts in your territory',
    'Run outbound email and calling sequences',
    'Book qualified discovery meetings for account executives',
    'Keep CRM records accurate and current'
  ],
  array[
    'Graduate in any discipline',
    'Clear spoken and written English; Tamil is a plus',
    '0-2 years experience — we will train you',
    'Resilience and comfort with rejection'
  ],
  array['Any exposure to a CRM such as Salesforce or HubSpot','Prior internship in sales or customer support'],
  array['Cold Calling','Email Outreach','CRM','Lead Qualification'],
  array['Uncapped incentives','Structured 4-week sales bootcamp','Health insurance'],
  'https://example.com/careers/sdr',
  null,
  6, 23,
  'active', false, now() - interval '17 days', now() + interval '30 days'
),
(
  'devops-engineer-contract-remote',
  'DevOps Engineer (6-month contract)',
  'Threadline Systems',
  'https://example.com',
  'Threadline Systems provides engineering capacity to logistics companies.',
  'Remote, India',
  'contract',
  array['engineering','technology'],
  'experienced',
  'senior',
  6, 2400000, 3600000,
  'A six-month contract to migrate a client from self-managed EC2 to a containerised setup on EKS. You will own the migration plan, the CI/CD rebuild and the runbooks the client team will inherit. Clear scope, clear end date, and a decent chance of extension into a platform role.',
  array[
    'Plan and execute migration from EC2 to EKS',
    'Rebuild CI/CD pipelines in GitHub Actions',
    'Set up observability with Prometheus and Grafana',
    'Write runbooks and hand over to the client team'
  ],
  array[
    '6+ years in infrastructure or DevOps roles',
    'Deep AWS experience, particularly EKS and IAM',
    'Terraform in production, not just tutorials',
    'Available for a 6-month full-time engagement'
  ],
  array['CKA certification','Experience in logistics or high-volume systems'],
  array['AWS','Kubernetes','Terraform','GitHub Actions','Prometheus'],
  array['Fully remote','Contract renewable after 6 months','Paid via monthly invoice'],
  'https://example.com/careers/devops-contract',
  null,
  1, 5,
  'active', false, now() - interval '20 days', now() + interval '12 days'
),
(
  'customer-support-associate-part-time-jaipur',
  'Customer Support Associate (Part-Time)',
  'Petal & Post',
  'https://example.com',
  'Petal & Post is a gifting and flowers brand serving 40 Indian cities.',
  'Jaipur, Rajasthan',
  'part-time',
  array['business','sales'],
  'fresher',
  'entry',
  0, 240000, 330000,
  'A part-time role of 5 hours a day, suited to students or anyone needing predictable shorter hours. You will handle customer queries over chat and phone about orders and deliveries, and coordinate with our operations team when something goes wrong. Shifts are fixed, either morning or evening, decided with you at the offer stage.',
  array[
    'Respond to customer queries over chat, email and phone',
    'Track and follow up on delayed or damaged deliveries',
    'Escalate recurring issues to the operations team',
    'Maintain response-time and satisfaction targets'
  ],
  array[
    'Fluent Hindi and English',
    'Available for a fixed 5-hour shift, six days a week',
    'Patience and a calm manner under pressure',
    'Reliable internet if working from home'
  ],
  array['Prior experience in customer support or retail'],
  array['Customer Support','Communication','CRM'],
  array['Fixed shifts agreed up front','Performance bonus','Employee discount'],
  null,
  'careers@example.com',
  8, 34,
  'active', false, now() - interval '23 days', now() + interval '22 days'
),
(
  'finance-manager-ahmedabad',
  'Finance Manager',
  'Girnar Textiles',
  'https://example.com',
  'Girnar Textiles is a 300-person textile manufacturer exporting to Europe and the Middle East.',
  'Ahmedabad, Gujarat',
  'full-time',
  array['finance','business'],
  'experienced',
  'director',
  8, 2500000, 3500000,
  'Lead the finance function for a growing export business. You will own monthly closing, statutory compliance, banking relationships and the annual audit, while building the reporting our promoters need to make investment decisions. This is a hands-on leadership role with two analysts reporting to you.',
  array[
    'Own month-end close and management reporting',
    'Manage statutory compliance, GST filings and the annual audit',
    'Handle banking relationships and working capital planning',
    'Build financial models for capacity expansion decisions'
  ],
  array[
    'CA or MBA Finance with 8+ years of experience',
    'Experience in manufacturing or export businesses',
    'Strong command of Indian GAAP and GST',
    'Experience managing a small team'
  ],
  array['Exposure to export documentation and forex hedging','Tally and SAP experience'],
  array['Financial Reporting','GST','Audit','Financial Modelling','Tally'],
  array['Annual performance bonus','Health insurance including parents','Relocation support'],
  'https://example.com/careers/finance-manager',
  null,
  1, 7,
  'active', false, now() - interval '27 days', now() + interval '35 days'
),
(
  'qa-engineer-draft-example',
  'QA Automation Engineer',
  'Nexthire Labs',
  'https://example.com',
  'Nexthire Labs builds payments infrastructure for Indian SMBs.',
  'Bengaluru, Karnataka',
  'full-time',
  array['engineering','technology'],
  'experienced',
  'mid',
  4, 1600000, 2400000,
  'A draft listing, kept unpublished so you can see how the admin status filter behaves. You will build and maintain automated test suites for our payment services, own the CI test pipeline, and work with backend engineers to make our releases boring. Publish this listing from the admin dashboard when the role is confirmed.',
  array['Build automated test suites with Playwright','Own the CI test pipeline','Triage flaky tests'],
  array['4+ years in QA automation','Strong JavaScript or Python','Experience testing APIs'],
  array['Experience with contract testing'],
  array['Playwright','TypeScript','CI/CD','API Testing'],
  array['Health insurance','Learning budget'],
  'https://example.com/careers/qa-engineer',
  null,
  1, 0,
  'draft', false, now() - interval '1 day', now() + interval '45 days'
)
on conflict (slug) do nothing;
