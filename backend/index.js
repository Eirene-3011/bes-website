require('dotenv').config();
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

const app = express();
const PORT = process.env.PORT || 5000;

// CORS — allow your Netlify frontend URL (set FRONTEND_URL in Render env vars)
const allowedOrigins = (process.env.FRONTEND_URL || 'http://localhost:5173')
  .split(',')
  .map(o => o.trim());

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (Postman, curl, same-origin SSR)
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error(`CORS: origin ${origin} not allowed`));
  },
  credentials: true,
}));

// Body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// NOTE: No static /uploads serving — files are stored on Cloudinary.

// Rate limiting
const loginLimiter  = rateLimit({ windowMs: 15 * 60 * 1000, max: 20 });
const contactLimiter = rateLimit({ windowMs: 60 * 60 * 1000, max: 10 });

// Routes
app.use('/api/auth',              loginLimiter,   require('./routes/auth'));
app.use('/api/school-info',                       require('./routes/schoolInfo'));
app.use('/api/content',                           require('./routes/content'));
app.use('/api/banners',                           require('./routes/banners'));
app.use('/api/staff',                             require('./routes/staff'));
app.use('/api/officials',                         require('./routes/officials'));
app.use('/api/org-chart',                         require('./routes/orgChart'));
app.use('/api/committees',                        require('./routes/committees'));
app.use('/api/ppas',                              require('./routes/ppas'));
app.use('/api/students',                          require('./routes/students'));
app.use('/api/resources',                         require('./routes/resources'));
app.use('/api/issuances',                         require('./routes/issuances'));
app.use('/api/external-links',                    require('./routes/externalLinks'));
app.use('/api/faqs',                              require('./routes/faqs'));
app.use('/api/calendar',                          require('./routes/calendar'));
app.use('/api/contact',           contactLimiter, require('./routes/contact'));
app.use('/api/enrollment',                        require('./routes/enrollment'));
app.use('/api/programs',                          require('./routes/programs'));
app.use('/api/charter',                           require('./routes/charter'));
app.use('/api/photos',                            require('./routes/photos'));
app.use('/api/internal-forms',                    require('./routes/internalForms'));
app.use('/api/upload',                            require('./routes/upload'));
app.use('/api/enrollment-stats',                  require('./routes/enrollmentStats'));
app.use('/api/feedback',                          require('./routes/feedback'));
// Existing new routes
app.use('/api/school-dashboard',                  require('./routes/schoolDashboard'));
app.use('/api/accomplishments',                   require('./routes/accomplishments'));
app.use('/api/school-heads',                      require('./routes/schoolHeads'));
// ✅ NEW: Alumni & News
app.use('/api/alumni',                            require('./routes/alumni'));
app.use('/api/news-updates',                      require('./routes/newsAndUpdates'));
app.use("/api/visitor-stats",                     require("./routes/visitorStats"));

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok', app: 'BES API' }));

app.listen(PORT, () => {
  console.log(`BES Backend running on port ${PORT}`);
});
