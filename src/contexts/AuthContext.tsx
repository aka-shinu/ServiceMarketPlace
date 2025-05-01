import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';
import { useCartStore } from '../stores/cartStore';

interface AuthContextType {
  user: any;
  profile: any;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<any>;
  signUp: (email: string, password: string, userData: any) => Promise<any>;
  signOut: () => Promise<any>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface Profile {
  id: string;
  email: string;
  full_name: string;
  is_banned: boolean;
  clear_cart: boolean;
  // ... other fields
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
  const run  = async () =>{
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      console.log("1212")
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setTimeout(async ()=>{console.log(session,_event)
      setUser(session?.user ?? null);
      if (session?.user) {
        console.log("hi")
        var r = await fetchProfile(session.user.id);
        console.log(r);
        await supabase
          .from('profiles')
          .update({ last_login: new Date().toISOString() })
          .eq('id', session.user.id);
        console.log("done")
      } else {
        setProfile(null);
      }},0)

    });

    return () => subscription.unsubscribe();

  }
  run()
  }, []);

  useEffect(() => {
    if (user) {
      const checkClearCart = async () => {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('clear_cart')
          .eq('id', user.id)
          .single();

        if (!error && profile?.clear_cart) {
          // Clear the cart
          useCartStore.getState().clearCart();
          
          // Reset the clear_cart flag
          await supabase
            .from('profiles')
            .update({ clear_cart: false })
            .eq('id', user.id);
        }
      };

      checkClearCart();
    }
  }, [user]);

  async function fetchProfile(userId: string) {
     
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();
      console.log("gi1")
      if (error) {
        console.error('Error fetching profile:', error);
        return;
      }

      if (data?.is_banned) {
        await signOut();
        toast.error('Your account has been banned. Please contact support.');
        return;
      }

      setProfile(data);
  }

  const signIn = async (email: string, password: string) => {
    console.log(user)
    try {
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
       if (error) throw error;

      // Check if user is banned
      const { data: profile } = await supabase
        .from('profiles')
         .select('is_banned')
         .eq('id', data.user?.id)
         .single();

      if (profile?.is_banned) {
       await signOut();
       throw new Error('Your account has been banned. Please contact support.');
      }

      return data;
    } catch (error: any) {
      console.log(error)
      if (error.message === 'Invalid login credentials') {
        throw new Error('Invalid email or password. Please try again.');
      }
      throw error;
    }
  };

  const signUp = async (email: string, password: string, userData: any) => {
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });
      
      if (authError) throw authError;

      if (authData.user) {
        // Wait a brief moment to ensure the auth session is established
        await new Promise(resolve => setTimeout(resolve, 1000));
        const {
          data: { session },
          error
        } = await supabase.auth.getSession();
        
        console.log("Session:", session);
        const { error: profileError } = await supabase.from('profiles').insert([
          {
            id: authData.user.id,
            ...userData,
            last_login: new Date().toISOString()
          }
        ]);

        if (profileError) {
          // If profile creation fails, delete the auth user to maintain consistency
          await supabase.auth.admin.deleteUser(authData.user.id);
          throw new Error('Failed to create user profile. Please try again.');
        }
      }

      return authData;
    } catch (error: any) {
      if (error.message.includes('User already registered')) {
        throw new Error('This email is already registered. Please login instead.');
      }
      throw error;
    }
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    setProfile(null);
    setUser(null);
  };

  const value = {
    user,
    profile,
    loading,
    signIn,
    signUp,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
