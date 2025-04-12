# Supabase Setup Guide

## Prerequisites
1. Create a Supabase account at https://supabase.com
2. Create a new project in Supabase
3. Install the Supabase client library:
   ```bash
   npm install @supabase/supabase-js
   ```

## Setup Steps

1. **Environment Variables**
   - Copy `.env.example` to `.env.local`
   - Fill in your Supabase project URL and anon key from your Supabase project settings

2. **Database Setup**
   - Go to your Supabase project's SQL editor
   - Copy the contents of `schema.sql`
   - Run the SQL commands to create all tables

3. **Authentication Setup**
   - In your Supabase dashboard, go to Authentication > Settings
   - Configure your authentication providers (Email, Google, etc.)
   - Set up your site URL and redirect URLs

4. **Project Structure**
   - `src/lib/supabase.js` - Supabase client configuration
   - `src/hooks/useAuth.js` - Authentication hook
   - `src/contexts/AuthContext.jsx` - Authentication context provider

## Usage

1. **Wrap your app with AuthProvider**
   ```jsx
   import { AuthProvider } from './contexts/AuthContext';

   function App() {
     return (
       <AuthProvider>
         {/* Your app components */}
       </AuthProvider>
     );
   }
   ```

2. **Use authentication in components**
   ```jsx
   import { useAuthContext } from './contexts/AuthContext';

   function MyComponent() {
     const { user, signIn, signOut } = useAuthContext();
     
     // Use authentication methods
   }
   ```

3. **Access Supabase client**
   ```jsx
   import { supabase } from './lib/supabase';

   // Use Supabase client for database operations
   ```

## Next Steps
1. Implement authentication UI components
2. Set up database operations using Supabase client
3. Configure real-time subscriptions if needed
4. Set up storage for images and files 