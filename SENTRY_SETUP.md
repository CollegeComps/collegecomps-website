# 🔍 Sentry Monitoring Setup Guide

## ✅ Sentry Installation Complete

Sentry has been successfully installed and configured for CollegeComps!

---

## 🔐 Required: Add Sentry Auth Token to Vercel

**CRITICAL:** You must add the Sentry auth token to Vercel for source maps to work properly.

### Steps:

1. Go to [Vercel Dashboard](https://vercel.com/collegecomps/collegecomps-website/settings/environment-variables)

2. Add this environment variable:
   ```
   Name: SENTRY_AUTH_TOKEN
   Value: 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
   Environment: Production, Preview, Development
   ```

3. **Redeploy** your application after adding the token

⚠️ **IMPORTANT:** This token is already in `.env.sentry-build-plugin` locally (git-ignored) but needs to be in Vercel for production builds.

---

## 📊 What's Being Monitored

### 1. **Error Tracking**
- ✅ All unhandled exceptions (client & server)
- ✅ API route errors
- ✅ Database connection failures
- ✅ Authentication errors
- ✅ Payment processing errors

### 2. **Performance Monitoring**
- ✅ Page load times
- ✅ API response times
- ✅ Database query performance
- ✅ Route transitions
- ✅ User interactions

### 3. **User Context**
- ✅ User ID (anonymized)
- ✅ Subscription tier
- ✅ User journey (breadcrumbs)
- ❌ No PII (emails, passwords filtered)

### 4. **Business Events**
- ✅ User signups
- ✅ ROI calculations
- ✅ College comparisons
- ✅ Premium upgrades
- ✅ Email verifications

---

## 🎯 Sentry Dashboard

Access your Sentry dashboard:
- **URL:** https://collegecomps.sentry.io/
- **Project:** collegecomps/collegecomps
- **Organization:** collegecomps

### Key Views:

1. **Issues** - All errors and exceptions
2. **Performance** - Transaction timing and bottlenecks
3. **Releases** - Track deployments and errors by version
4. **Alerts** - Set up notifications for critical issues

---

## 🚨 Recommended Alerts

Set these up in Sentry → Alerts:

### Critical Alerts (Slack/Email immediately)
1. **High Error Rate**
   - Condition: >10 errors in 5 minutes
   - Action: Email + Slack

2. **Database Connection Failure**
   - Condition: Any error with tag `feature:database`
   - Action: Email + SMS

3. **Payment Errors**
   - Condition: Any error with tag `feature:payments`
   - Action: Email immediately

### Warning Alerts (Email daily digest)
1. **Slow API Routes**
   - Condition: Transaction duration >3s
   - Action: Daily digest

2. **High Memory Usage**
   - Condition: Memory >500MB
   - Action: Daily digest

---

## 📈 Using Sentry in Code

### Track Custom Events

```typescript
import { BusinessEvents } from '@/lib/sentry';

// Track user signup
BusinessEvents.userSignup(userId);

// Track ROI calculation
BusinessEvents.roiCalculation(userId);

// Track college comparison
BusinessEvents.collegeComparison(3, userId);
```

### Track Errors with Context

```typescript
import { trackError } from '@/lib/sentry';

try {
  await dangerousOperation();
} catch (error) {
  trackError(error as Error, {
    feature: 'roi-calculator',
    action: 'calculate',
    userId: session.user.id,
    extra: { calculationData }
  });
  throw error;
}
```

### Track Performance

```typescript
import { Performance } from '@/lib/sentry';

const data = await Performance.trackDatabaseQuery(
  'fetch-institutions',
  async () => {
    return await db.prepare('SELECT * FROM institutions').all();
  }
);
```

### Set User Context

```typescript
import { setUserContext, clearUserContext } from '@/lib/sentry';

// On login
setUserContext({
  id: user.id,
  tier: user.subscription_tier
});

// On logout
clearUserContext();
```

---

## 🔧 Configuration Files Created

1. **`sentry.server.config.ts`** - Server-side monitoring
2. **`sentry.edge.config.ts`** - Edge runtime monitoring
3. **`src/instrumentation-client.ts`** - Client-side monitoring
4. **`src/instrumentation.ts`** - Instrumentation entry point
5. **`src/app/global-error.tsx`** - Global error handler
6. **`src/lib/sentry.ts`** - Custom monitoring utilities
7. **`.env.sentry-build-plugin`** - Auth token (git-ignored)

---

## 🎨 Privacy & Security

### What We DON'T Send to Sentry:
- ❌ Passwords (always filtered)
- ❌ Email addresses (filtered in production)
- ❌ Auth tokens (always filtered)
- ❌ Credit card info
- ❌ Health check errors (ignored)

### What We DO Send:
- ✅ User ID (anonymized)
- ✅ Subscription tier
- ✅ Error messages
- ✅ Stack traces
- ✅ User journey (breadcrumbs)
- ✅ Performance metrics

### Sample Rate:
- **Development:** 100% of events
- **Production:** 10% of events (to stay within quota)

---

## 📊 Health Check Endpoint

### Endpoint: `/api/health`

**Purpose:** Monitor system health for uptime services

**Response Example:**
```json
{
  "status": "healthy",
  "timestamp": "2025-10-15T12:00:00.000Z",
  "version": "1.0.0",
  "checks": {
    "database": {
      "status": "up",
      "responseTime": 45,
      "institutionCount": 6163
    },
    "usersDatabase": {
      "status": "up",
      "responseTime": 23,
      "userCount": 142
    },
    "memory": {
      "usage": "156 MB",
      "limit": "512 MB",
      "percentage": 30
    }
  }
}
```

**Status Codes:**
- `200` - Healthy or degraded
- `503` - Unhealthy (main database down)

**Use this URL in your uptime monitoring service:**
```
https://www.collegecomps.com/api/health
```

---

## 🚀 Next Steps

### Immediate (Before Launch)
1. ✅ Add `SENTRY_AUTH_TOKEN` to Vercel
2. ✅ Redeploy application
3. ✅ Test error tracking (trigger a test error)
4. ✅ Set up Sentry alerts
5. ✅ Add health check to uptime monitor

### First Week
1. Review error patterns in Sentry
2. Set up Slack integration for alerts
3. Create custom dashboards for key metrics
4. Fine-tune alert thresholds

### Ongoing
1. Check Sentry daily for new issues
2. Monitor performance trends weekly
3. Review and update alert rules monthly
4. Keep sample rate optimized for quota

---

## 🆘 Testing Sentry

### Trigger a Test Error:

**Client-side:**
```typescript
// In browser console
throw new Error('Test Sentry Error - Client');
```

**Server-side:**
```typescript
// Create /api/sentry-test/route.ts
export async function GET() {
  throw new Error('Test Sentry Error - Server');
}
```

Then visit: `https://www.collegecomps.com/api/sentry-test`

You should see the error in Sentry within 30 seconds!

---

## 📞 Support

- **Sentry Docs:** https://docs.sentry.io/platforms/javascript/guides/nextjs/
- **Sentry Support:** https://sentry.io/support/
- **Quota Monitoring:** https://collegecomps.sentry.io/settings/billing/

---

**Status:** ✅ **Monitoring Active - Ready for Launch!**
