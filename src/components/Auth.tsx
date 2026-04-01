import React, { useState, useEffect } from 'react';
import { auth, googleProvider, signInWithPopup, signOut, onAuthStateChanged, User, db, doc, setDoc, serverTimestamp } from '../firebase';
import { LogIn, LogOut, User as UserIcon, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

export default function Auth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      setLoading(false);
      
      if (currentUser) {
        // Sync user to Firestore
        const userRef = doc(db, 'users', currentUser.uid);
        await setDoc(userRef, {
          uid: currentUser.uid,
          email: currentUser.email,
          displayName: currentUser.displayName,
          photoURL: currentUser.photoURL,
          lastLogin: serverTimestamp()
        }, { merge: true });
      }
    });
    return () => unsubscribe();
  }, []);

  const handleSignIn = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      toast.success('Signed in successfully!');
    } catch (error) {
      console.error(error);
      toast.error('Failed to sign in.');
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      toast.success('Signed out!');
    } catch (error) {
      console.error(error);
      toast.error('Failed to sign out.');
    }
  };

  if (loading) return <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />;

  if (!user) {
    return (
      <button onClick={handleSignIn} className="flex items-center gap-2 px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors">
        <LogIn size={18} />
        <span>Sign In</span>
      </button>
    );
  }

  return (
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-full border border-slate-200">
        {user.photoURL ? (
          <img src={user.photoURL} alt={user.displayName || ''} className="w-6 h-6 rounded-full" referrerPolicy="no-referrer" />
        ) : (
          <UserIcon size={16} className="text-slate-500" />
        )}
        <span className="text-sm font-medium text-slate-700 max-w-[100px] truncate">
          {user.displayName || user.email}
        </span>
      </div>
      <button onClick={handleSignOut} className="p-2 text-slate-500 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all" title="Sign Out">
        <LogOut size={18} />
      </button>
    </div>
  );
}
