import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, RefreshCw } from 'lucide-react';
import DashboardHeader from './DashboardHeader';
import Footer from './Footer';

// Internal Components
import FileUpload from './find-my-decor/FileUpload';
import Loader from './find-my-decor/Loader';
import AnalysisResult from './find-my-decor/AnalysisResult';
import { analyzeImage } from './find-my-decor/decorAIService';

const FindMyDecor = () => {
    const [image, setImage] = useState(null);
    const [isScanning, setIsScanning] = useState(false);
    const [analysisResult, setAnalysisResult] = useState(null);

    const handleFileSelect = async (imageData) => {
        setImage(imageData);
        setIsScanning(true);
        // Reset previous results
        setAnalysisResult(null);

        try {
            const results = await analyzeImage(imageData);
            setAnalysisResult(results);
        } catch (error) {
            console.error("Analysis failed", error);
            // Handle error state appropriately (alert for now)
            alert("Could not analyze image. Please try again.");
            setImage(null);
        } finally {
            setIsScanning(false);
        }
    };

    const handleReset = () => {
        setImage(null);
        setAnalysisResult(null);
        setIsScanning(false);
    };

    const handleSave = () => {
        // Logic to save to backend would go here
        console.log("Saving to moodboard:", analysisResult);
    };

    return (
        <div className="min-h-screen bg-[#FAFAFA] text-slate-800 font-sans flex flex-col">
            <DashboardHeader />

            <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10">

                {/* Header Section */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-10 space-y-3"
                >
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-gradient-to-r from-pink-50 to-purple-50 rounded-full border border-pink-100 mb-2">
                        <Sparkles className="w-3.5 h-3.5 text-[#D6336C]" />
                        <span className="text-[10px] font-bold text-[#D6336C] uppercase tracking-wider">AI Powered Beta</span>
                    </div>
                    <h1 className="text-3xl sm:text-5xl font-extrabold text-gray-900 tracking-tight">
                        Find My <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#D6336C] to-purple-600">Dream Decor</span>
                    </h1>
                    <p className="text-base text-gray-500 max-w-xl mx-auto">
                        Upload an inspiration photo and let our AI curate the perfect color palette, style tags, and local vendors for you.
                    </p>
                </motion.div>

                {/* Main Content Area */}
                <div className="w-full max-w-6xl mx-auto">
                    <AnimatePresence mode="wait">
                        {!image ? (
                            // 1. Upload State
                            <div className="max-w-xl mx-auto" key="upload-container">
                                <FileUpload onFileSelect={handleFileSelect} />
                            </div>
                        ) : (
                            // 2. Results / Split View
                            <motion.div
                                key="dashboard"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="grid lg:grid-cols-2 gap-8 items-start"
                            >
                                {/* Left Column: Image Preview */}
                                <div className="lg:sticky lg:top-24 space-y-4">
                                    <FileUpload
                                        currentImage={image}
                                        onReset={handleReset}
                                    />
                                    {analysisResult && (
                                        <button
                                            onClick={handleReset}
                                            className="w-full py-3 text-gray-500 font-medium hover:text-[#D6336C] hover:bg-pink-50 rounded-xl transition-colors flex items-center justify-center gap-2"
                                        >
                                            <RefreshCw className="w-4 h-4" /> Analyse Another Image
                                        </button>
                                    )}
                                </div>

                                {/* Right Column: Analysis or Loader */}
                                <div className="bg-white rounded-[2rem] p-6 sm:p-8 border border-gray-100 shadow-xl min-h-[500px] flex flex-col relative overflow-hidden">
                                    {isScanning ? (
                                        <div className="flex-1 flex items-center justify-center">
                                            <Loader />
                                        </div>
                                    ) : (
                                        <AnalysisResult result={analysisResult} onSave={handleSave} />
                                    )}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

            </main>
            <Footer />
        </div>
    );
};

export default FindMyDecor;
