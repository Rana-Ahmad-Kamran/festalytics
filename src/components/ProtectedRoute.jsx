import React, { useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';

const ProtectedRoute = ({ children, allowedRole }) => {
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);
    const [isAuthorized, setIsAuthorized] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (!currentUser) {
                setLoading(false);
                setUser(null);
                return;
            }

            setUser(currentUser);

            try {
                // Fetch user role from Firestore to double-check access
                const userDocRef = doc(db, 'users', currentUser.uid);
                const userDocSnap = await getDoc(userDocRef);

                if (userDocSnap.exists()) {
                    const userData = userDocSnap.data();
                    if (userData.role === allowedRole) {
                        setIsAuthorized(true);
                    } else {
                        console.warn(`Role mismatch: Expected ${allowedRole}, got ${userData.role}`);
                        setIsAuthorized(false);
                    }
                } else {
                    // Fallback: If no doc, we might want to check if the allowedRole matches what we expect or just allow 'user'
                    // For strict security, we deny if no role is found
                    console.warn("No user document found for role verification.");
                    setIsAuthorized(false);
                }
            } catch (error) {
                console.error("Error verifying access:", error);
                setIsAuthorized(false);
            } finally {
                setLoading(false);
            }
        });

        return () => unsubscribe();
    }, [allowedRole, navigate]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-800"></div>
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/" replace />;
    }

    if (!isAuthorized) {
        // Redirect to the correct dashboard if possible, or home
        // This assumes simple logic: if you are not authorized here, go home.
        // Or we could try to redirect to the *other* dashboard, but keep it simple.
        return <Navigate to="/" replace />;
    }

    return children;
};

export default ProtectedRoute;
