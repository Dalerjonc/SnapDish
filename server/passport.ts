/**
 * Passport strategies: Google OAuth2, Apple Sign In
 * Session serialization/deserialization
 */
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { storage } from "./storage";

// ─── Serialize / Deserialize ─────────────────────────────────────────────────

passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id: number, done) => {
  try {
    const user = await storage.getUser(id);
    done(null, user ?? null);
  } catch (err) {
    done(err, null);
  }
});

// ─── Google OAuth2 ───────────────────────────────────────────────────────────

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL || "/api/auth/google/callback",
      },
      async (_accessToken, _refreshToken, profile, done) => {
        try {
          const googleId = profile.id;
          const email = profile.emails?.[0]?.value;
          const displayName = profile.displayName || email?.split("@")[0] || `google_${googleId}`;

          // Try to find by Google ID
          let user = await storage.getUserByGoogleId(googleId);

          if (!user && email) {
            // Try to find by email and link
            user = await storage.getUserByEmail(email);
            if (user) {
              user = await storage.updateUser(user.id, { googleId });
            }
          }

          if (!user) {
            // Create new user
            const username = await getUniqueUsername(displayName);
            user = await storage.createUser({
              username,
              email: email,
              googleId,
            });
          }

          return done(null, user);
        } catch (err) {
          return done(err as Error);
        }
      }
    )
  );
} else {
  console.log("[passport] Google OAuth not configured (missing GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET)");
}

// ─── Apple Sign In ───────────────────────────────────────────────────────────
// Dynamically loaded since passport-apple has no types and may not be installed

function setupAppleStrategy() {
  if (
    !process.env.APPLE_CLIENT_ID ||
    !process.env.APPLE_TEAM_ID ||
    !process.env.APPLE_KEY_ID ||
    !process.env.APPLE_PRIVATE_KEY
  ) {
    console.log("[passport] Apple Sign In not configured (missing env vars)");
    return;
  }

  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { Strategy: AppleStrategy } = require("passport-apple");
    passport.use(
      new AppleStrategy(
        {
          clientID: process.env.APPLE_CLIENT_ID,
          teamID: process.env.APPLE_TEAM_ID,
          keyID: process.env.APPLE_KEY_ID,
          privateKeyString: process.env.APPLE_PRIVATE_KEY.replace(/\\n/g, "\n"),
          callbackURL: process.env.APPLE_CALLBACK_URL || "/api/auth/apple/callback",
          passReqToCallback: false,
        },
        async (_accessToken: string, _refreshToken: string, _idToken: unknown, profile: any, done: (err: Error | null, user?: any) => void) => {
          try {
            const appleId = profile.id || profile.sub;
            const email = profile.email;

            let user = await storage.getUserByAppleId(appleId);

            if (!user && email) {
              user = await storage.getUserByEmail(email);
              if (user) {
                user = await storage.updateUser(user.id, { appleId });
              }
            }

            if (!user) {
              const username = await getUniqueUsername(
                email?.split("@")[0] || `apple_${String(appleId).slice(0, 8)}`
              );
              user = await storage.createUser({
                username,
                email,
                appleId,
              });
            }

            return done(null, user);
          } catch (err) {
            return done(err as Error);
          }
        }
      )
    );
    console.log("[passport] Apple Sign In configured");
  } catch (e) {
    console.log("[passport] passport-apple not available:", e);
  }
}

setupAppleStrategy();

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function getUniqueUsername(base: string): Promise<string> {
  const sanitized = base.replace(/[^a-zA-Z0-9_]/g, "_").slice(0, 20);
  let username = sanitized;
  let counter = 1;
  while (await storage.getUserByUsername(username)) {
    username = `${sanitized}_${counter++}`;
  }
  return username;
}
