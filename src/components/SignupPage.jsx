import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaUser, FaStore, FaGoogle, FaTimes, FaUpload, FaFileImage, FaEnvelopeOpenText } from 'react-icons/fa';

// Firebase Imports
import { createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, sendEmailVerification } from "firebase/auth";
import { auth } from '../firebase'; // Path check kar lena

const SignupPage = () => {
    const [role, setRole] = useState('user');
    const [selectedFile, setSelectedFile] = useState(null);
    const [showVerifyModal, setShowVerifyModal] = useState(false); // Verification Modal State
    const navigate = useNavigate();

    // Form States
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');

    const handleClose = () => {
        navigate('/');
    };

    // CNIC Formatting
    const handleCnicInput = (e) => {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length > 13) value = value.substring(0, 13);
        if (value.length > 12) {
            value = `${value.slice(0, 5)}-${value.slice(5, 12)}-${value.slice(12)}`;
        } else if (value.length > 5) {
            value = `${value.slice(0, 5)}-${value.slice(5)}`;
        }
        e.target.value = value;
    };

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setSelectedFile(e.target.files[0]);
        }
    };

    const removeFile = () => {
        setSelectedFile(null);
    };

    // --- MAIN SIGNUP LOGIC (Updated) ---
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            alert("Passwords match nahi kar rahe!");
            return;
        }

        try {
            // 1. Create User
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // 2. Send Verification Email
            await sendEmailVerification(user);

            // 3. Modal Show karein (Navigate nahi karna abhi)
            setShowVerifyModal(true);

        } catch (error) {
            console.error(error);
            alert(error.message);
        }
    };

    // --- CHECK VERIFICATION STATUS ---
    const checkVerification = async () => {
        const user = auth.currentUser;
        await user.reload(); // Refresh user status from Firebase

        if (user.emailVerified) {
            // Agar verified hai, tab dashboard bhejo
            if (role === 'vendor') {
                navigate('/vendor-dashboard');
            } else {
                navigate('/user-dashboard');
            }
        } else {
            alert("Abhi tak email verify nahi hui. Please inbox check karein aur link par click karein.");
        }
    };

    // --- GOOGLE SIGNUP ---
    const handleGoogleSignup = async () => {
        const provider = new GoogleAuthProvider();
        try {
            const result = await signInWithPopup(auth, provider);
            // Google users ki email automatically verified hoti hai
            navigate('/user-dashboard');
        } catch (error) {
            alert(error.message);
        }
    };

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center font-sans">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={handleClose}></div>

            {/* --- VERIFICATION MODAL (New) --- */}
            {showVerifyModal ? (
                <div className="relative w-full max-w-sm bg-[#2d2d2d] rounded-2xl border border-white/10 shadow-2xl p-6 text-center z-50">
                    <div className="flex justify-center mb-4">
                        <div className="bg-[#D6336C]/20 p-4 rounded-full">
                            <FaEnvelopeOpenText className="text-[#D6336C] text-3xl" />
                        </div>
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">Verify your Email</h3>
                    <p className="text-gray-300 text-sm mb-6">
                        Humne <strong>{email}</strong> par verification link bhej diya hai. Please apna inbox (aur spam folder) check karein aur link par click karein.
                    </p>

                    <button
                        onClick={checkVerification}
                        className="w-full bg-[#D6336C] hover:bg-[#C2255C] text-white font-bold py-2 rounded-lg transition-colors shadow-lg cursor-pointer text-sm mb-3"
                    >
                        I have Verified
                    </button>

                    <button
                        onClick={() => window.location.reload()}
                        className="text-gray-400 text-xs hover:text-white underline"
                    >
                        Resend Link / Refresh Page
                    </button>
                </div>
            ) : (
                // --- NORMAL SIGNUP FORM ---
                <div className="relative w-full max-w-md bg-[#2d2d2d] rounded-2xl border border-white/10 shadow-2xl flex flex-col max-h-[90vh]">
                    <button onClick={handleClose} className="absolute top-3 right-3 z-20 w-8 h-8 flex items-center justify-center rounded-full bg-white/10 border border-white/20 text-white transition-all hover:bg-[#D6336C] hover:border-[#D6336C] hover:rotate-90 cursor-pointer">
                        <FaTimes size={14} />
                    </button>

                    <div className="overflow-y-auto p-6 custom-scrollbar">
                        <div className="text-center">
                            <h2 className="text-xl font-bold text-white mb-1">Create Account</h2>
                            <p className="text-gray-400 text-xs mb-3">Sign up to get started</p>
                        </div>

                        <div className="border-b border-white/10 mb-4"></div>

                        {/* Role Toggle */}
                        <div className="flex bg-[#151515] rounded-lg p-1 mb-4 border border-white/5">
                            <button type="button" onClick={() => { setRole('user'); setSelectedFile(null); }} className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-sm font-semibold transition-all duration-300 ${role === 'user' ? 'bg-[#D6336C] text-white shadow-lg' : 'text-gray-400 hover:text-gray-200'}`}>
                                <FaUser className={`text-xs ${role === 'user' ? 'text-white' : 'text-gray-500'}`} /> User
                            </button>
                            <button type="button" onClick={() => { setRole('vendor'); setSelectedFile(null); }} className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-sm font-semibold transition-all duration-300 ${role === 'vendor' ? 'bg-[#D6336C] text-white shadow-lg' : 'text-gray-400 hover:text-gray-200'}`}>
                                <FaStore className={`text-xs ${role === 'vendor' ? 'text-white' : 'text-gray-500'}`} /> Vendor
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                            {/* USER INPUTS */}
                            {role === 'user' && (
                                <>
                                    <div className="flex gap-3">
                                        <div className="flex flex-col gap-1 w-1/2">
                                            <label className="text-gray-300 text-xs font-medium ml-1">First Name</label>
                                            <input type="text" onChange={(e) => setFirstName(e.target.value)} placeholder="Ali" className="w-full bg-[#151515] text-white border border-white/10 rounded-lg p-2 outline-none focus:ring-1 focus:ring-[#D6336C] text-sm" />
                                        </div>
                                        <div className="flex flex-col gap-1 w-1/2">
                                            <label className="text-gray-300 text-xs font-medium ml-1">Last Name</label>
                                            <input type="text" onChange={(e) => setLastName(e.target.value)} placeholder="Khan" className="w-full bg-[#151515] text-white border border-white/10 rounded-lg p-2 outline-none focus:ring-1 focus:ring-[#D6336C] text-sm" />
                                        </div>
                                    </div>
                                    <div className="flex gap-3">
                                        <div className="flex flex-col gap-1 w-1/2">
                                            <label className="text-gray-300 text-xs font-medium ml-1">Gender</label>
                                            <select className="w-full bg-[#151515] text-white border border-white/10 rounded-lg p-2 outline-none focus:ring-1 focus:ring-[#D6336C] text-sm">
                                                <option value="" disabled selected>Select</option>
                                                <option value="male">Male</option>
                                                <option value="female">Female</option>
                                                <option value="other">Other</option>
                                            </select>
                                        </div>
                                        <div className="flex flex-col gap-1 w-1/2">
                                            <label className="text-gray-300 text-xs font-medium ml-1">Mobile Number</label>
                                            <input type="tel" placeholder="0300-1234567" className="w-full bg-[#151515] text-white border border-white/10 rounded-lg p-2 outline-none focus:ring-1 focus:ring-[#D6336C] text-sm" />
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <label className="text-gray-300 text-xs font-medium ml-1">Email</label>
                                        <input type="email" onChange={(e) => setEmail(e.target.value)} placeholder="user@example.com" className="w-full bg-[#151515] text-white border border-white/10 rounded-lg p-2 outline-none focus:ring-1 focus:ring-[#D6336C] text-sm" />
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <label className="text-gray-300 text-xs font-medium ml-1">Birthday</label>
                                        <input type="date" className="w-full bg-[#151515] text-white border border-white/10 rounded-lg p-2 outline-none focus:ring-1 focus:ring-[#D6336C] text-sm [color-scheme:dark]" />
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <label className="text-gray-300 text-xs font-medium ml-1">Create Password</label>
                                        <input type="password" onChange={(e) => setPassword(e.target.value)} placeholder="Min 8 chars" className="w-full bg-[#151515] text-white border border-white/10 rounded-lg p-2 outline-none focus:ring-1 focus:ring-[#D6336C] text-sm" />
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <label className="text-gray-300 text-xs font-medium ml-1">Confirm Password</label>
                                        <input type="password" onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Confirm password" className="w-full bg-[#151515] text-white border border-white/10 rounded-lg p-2 outline-none focus:ring-1 focus:ring-[#D6336C] text-sm" />
                                    </div>
                                </>
                            )}

                            {/* VENDOR INPUTS */}
                            {role === 'vendor' && (
                                <>
                                    <div className="flex gap-3">
                                        <div className="flex flex-col gap-1 w-1/2">
                                            <label className="text-gray-300 text-xs font-medium ml-1">First Name</label>
                                            <input type="text" onChange={(e) => setFirstName(e.target.value)} placeholder="Ali" className="w-full bg-[#151515] text-white border border-white/10 rounded-lg p-2 outline-none focus:ring-1 focus:ring-[#D6336C] text-sm" required />
                                        </div>
                                        <div className="flex flex-col gap-1 w-1/2">
                                            <label className="text-gray-300 text-xs font-medium ml-1">Last Name</label>
                                            <input type="text" onChange={(e) => setLastName(e.target.value)} placeholder="Khan" className="w-full bg-[#151515] text-white border border-white/10 rounded-lg p-2 outline-none focus:ring-1 focus:ring-[#D6336C] text-sm" required />
                                        </div>
                                    </div>
                                    <div className="flex gap-3">
                                        <div className="flex flex-col gap-1 w-1/2">
                                            <label className="text-gray-300 text-xs font-medium ml-1">Mobile Number</label>
                                            <input type="tel" placeholder="0300-1234567" className="w-full bg-[#151515] text-white border border-white/10 rounded-lg p-2 outline-none focus:ring-1 focus:ring-[#D6336C] text-sm" required />
                                        </div>
                                        <div className="flex flex-col gap-1 w-1/2">
                                            <label className="text-gray-300 text-xs font-medium ml-1">CNIC</label>
                                            <input type="text" placeholder="42101-1234567-1" maxLength={15} onChange={handleCnicInput} className="w-full bg-[#151515] text-white border border-white/10 rounded-lg p-2 outline-none focus:ring-1 focus:ring-[#D6336C] text-sm" required />
                                        </div>
                                    </div>
                                    <div className="flex gap-3">
                                        <div className="flex flex-col gap-1 w-1/2">
                                            <label className="text-gray-300 text-xs font-medium ml-1">Gender</label>
                                            <select className="w-full bg-[#151515] text-white border border-white/10 rounded-lg p-2 outline-none focus:ring-1 focus:ring-[#D6336C] text-sm" required>
                                                <option value="" disabled selected>Select</option>
                                                <option value="male">Male</option>
                                                <option value="female">Female</option>
                                                <option value="other">Other</option>
                                            </select>
                                        </div>
                                        <div className="flex flex-col gap-1 w-1/2">
                                            <label className="text-gray-300 text-xs font-medium ml-1">Birthday</label>
                                            <input type="date" className="w-full bg-[#151515] text-white border border-white/10 rounded-lg p-2 outline-none focus:ring-1 focus:ring-[#D6336C] text-sm [color-scheme:dark]" required />
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <label className="text-gray-300 text-xs font-medium ml-1">Email</label>
                                        <input type="email" onChange={(e) => setEmail(e.target.value)} placeholder="vendor@example.com" className="w-full bg-[#151515] text-white border border-white/10 rounded-lg p-2 outline-none focus:ring-1 focus:ring-[#D6336C] text-sm" required />
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <label className="text-gray-300 text-xs font-medium ml-1">Password</label>
                                        <input type="password" onChange={(e) => { setPassword(e.target.value); setConfirmPassword(e.target.value) }} placeholder="Create password" className="w-full bg-[#151515] text-white border border-white/10 rounded-lg p-2 outline-none focus:ring-1 focus:ring-[#D6336C] text-sm" required />
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <label className="text-gray-300 text-xs font-medium ml-1">Upload ID/Doc (JPG)</label>
                                        {!selectedFile ? (
                                            <div className="relative">
                                                <input type="file" accept=".jpg, .jpeg" onChange={handleFileChange} className="w-full bg-[#151515] text-gray-400 border border-white/10 rounded-lg p-2 text-sm file:mr-4 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-[#D6336C] file:text-white hover:file:bg-[#C2255C] cursor-pointer" required />
                                                <FaUpload className="absolute right-3 top-3 text-gray-500 text-xs pointer-events-none" />
                                            </div>
                                        ) : (
                                            <div className="flex items-center justify-between w-full bg-[#151515] border border-[#D6336C] rounded-lg p-2">
                                                <div className="flex items-center gap-2 overflow-hidden">
                                                    <FaFileImage className="text-[#D6336C]" />
                                                    <span className="text-white text-sm truncate max-w-[200px]">{selectedFile.name}</span>
                                                </div>
                                                <button type="button" onClick={removeFile} className="text-gray-400 hover:text-red-500 transition-colors p-1"><FaTimes size={14} /></button>
                                            </div>
                                        )}
                                    </div>
                                </>
                            )}

                            <button type="submit" className="w-full bg-[#D6336C] hover:bg-[#C2255C] text-white font-bold py-2 rounded-lg transition-colors shadow-lg mt-2 cursor-pointer text-sm">
                                Sign Up as {role === 'user' ? 'User' : 'Vendor'}
                            </button>
                        </form>

                        {role === 'user' && (
                            <>
                                <div className="flex items-center gap-4 my-4">
                                    <div className="h-px bg-white/10 flex-1"></div>
                                    <span className="text-gray-500 text-[10px] uppercase tracking-wider">Or continue with</span>
                                    <div className="h-px bg-white/10 flex-1"></div>
                                </div>
                                <button type="button" onClick={handleGoogleSignup} className="w-full bg-white hover:bg-gray-100 text-gray-900 font-semibold py-2 rounded-lg transition-colors flex items-center justify-center gap-2 mb-4 cursor-pointer text-sm">
                                    <FaGoogle className="text-red-500" /> <span>Sign up with Google</span>
                                </button>
                            </>
                        )}

                        <p className="text-center text-gray-400 text-xs mt-3">
                            Already have an account? <button className="focus:outline-none"><Link to="/" className="text-[#D6336C] hover:underline font-medium">Log in</Link></button>
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SignupPage;