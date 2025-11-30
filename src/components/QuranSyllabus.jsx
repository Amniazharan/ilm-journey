import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, ChevronUp, ChevronRight, Calendar } from 'lucide-react';
import { cn } from '../lib/utils';
import { useSupabaseData } from '../hooks/useSupabaseData';

const QURAN_SYLLABUS = {
    iqra: { title: 'Tahap 1: Iqra 1-6', items: ['Iqra 1', 'Iqra 2', 'Iqra 3', 'Iqra 4', 'Iqra 5', 'Iqra 6'] },
    tahap2: {
        title: 'Tahap 2: Hafalan Al-Dhuha - Al-Nas', items: [
            'Al-Dhuha', 'Al-Insyirah', 'At-Tin', 'Al-Alaq', 'Al-Qadr', 'Al-Bayyinah',
            'Az-Zalzalah', 'Al-Adiyat', 'Al-Qariah', 'At-Takathur', 'Al-Asr',
            'Al-Humazah', 'Al-Fil', 'Quraish', 'Al-Maun', 'Al-Kauthar',
            'Al-Kafirun', 'An-Nasr', 'Al-Lahab', 'Al-Ikhlas', 'Al-Falaq', 'An-Nas'
        ]
    },
    tahap3: {
        title: 'Tahap 3: Hafalan Al-Naba - Al-Lail', items: [
            'Al-Naba', 'An-Naziat', 'Abasa', 'At-Takwir', 'Al-Infitar',
            'Al-Mutaffifin', 'Al-Inshiqaq', 'Al-Buruj', 'At-Tariq', 'Al-A\'la',
            'Al-Ghashiyah', 'Al-Fajr', 'Al-Balad', 'Ash-Shams', 'Al-Lail'
        ]
    },
    tahap4: {
        title: 'Tahap 4: Surah Pilihan', items: [
            'Al-Mulk', 'Al-Sajdah', 'Al-Insan', 'Al-Waqiah', 'Yasin', 'Al-Dukhan'
        ]
    },
    tahap5: { title: 'Tahap 5: Hafalan Juz 1-30', items: Array.from({ length: 30 }, (_, i) => `Juzuk ${i + 1}`) }
};

export default function QuranSyllabus({ childId }) {
    const [expandedSection, setExpandedSection] = useState('iqra');
    const [expandedProgress, setExpandedProgress] = useState(null);
    const [progressData, setProgressData] = useState({});
    const navigate = useNavigate();
    const { fetchLogs } = useSupabaseData();

    // Fetch progress for a specific milestone
    const loadProgress = async (milestoneName) => {
        if (progressData[milestoneName]) {
            // Already loaded, just toggle
            setExpandedProgress(expandedProgress === milestoneName ? null : milestoneName);
        } else {
            // Load from database
            const logs = await fetchLogs('quran-syllabus', encodeURIComponent(milestoneName), childId);
            setProgressData(prev => ({ ...prev, [milestoneName]: logs }));
            setExpandedProgress(milestoneName);
        }
    };

    return (
        <div className="space-y-4">
            {Object.entries(QURAN_SYLLABUS).map(([key, section]) => (
                <div key={key} className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
                    <button
                        onClick={() => setExpandedSection(expandedSection === key ? null : key)}
                        className="flex w-full items-center justify-between bg-gray-50 px-4 py-3 text-left"
                    >
                        <span className="font-semibold text-gray-800">{section.title}</span>
                        {expandedSection === key ? <ChevronUp className="h-5 w-5 text-gray-500" /> : <ChevronDown className="h-5 w-5 text-gray-500" />}
                    </button>

                    {expandedSection === key && (
                        <div className="p-4 space-y-2">
                            {section.items.map((item) => (
                                <div key={item} className="space-y-2">
                                    <div className="flex items-center justify-between rounded-lg border border-gray-100 bg-white p-3">
                                        <button
                                            onClick={() => loadProgress(item)}
                                            className="flex-1 flex items-center justify-between text-left"
                                        >
                                            <span className="text-sm font-medium text-gray-700">{item}</span>
                                            <div className="flex items-center space-x-2">
                                                {progressData[item]?.length > 0 && (
                                                    <span className="text-xs text-gray-500">
                                                        {progressData[item].length} rekod
                                                    </span>
                                                )}
                                                {expandedProgress === item ? (
                                                    <ChevronUp className="h-4 w-4 text-gray-400" />
                                                ) : (
                                                    <ChevronDown className="h-4 w-4 text-gray-400" />
                                                )}
                                            </div>
                                        </button>
                                        <button
                                            onClick={() => navigate(`/child/${childId}/subject/quran-syllabus/milestone/${encodeURIComponent(item)}`)}
                                            className="ml-2 rounded-lg p-2 hover:bg-gray-50"
                                        >
                                            <ChevronRight className="h-4 w-4 text-gray-400" />
                                        </button>
                                    </div>

                                    {/* Progress logs inline */}
                                    {expandedProgress === item && (
                                        <div className="ml-4 space-y-2 border-l-2 border-gray-200 pl-4">
                                            {progressData[item]?.length === 0 ? (
                                                <p className="text-xs text-gray-500 py-2">Tiada rekod lagi</p>
                                            ) : (
                                                progressData[item]?.map((log) => (
                                                    <div key={log.id} className="rounded-lg bg-gray-50 p-3 text-sm">
                                                        <div className="flex items-center space-x-2 text-xs text-gray-500 mb-1">
                                                            <Calendar className="h-3 w-3" />
                                                            <span>{new Date(log.date).toLocaleDateString()}</span>
                                                            {log.page && (
                                                                <span className="rounded bg-blue-100 px-2 py-0.5 text-blue-700">
                                                                    {log.page}
                                                                </span>
                                                            )}
                                                        </div>
                                                        {log.notes && (
                                                            <p className="text-gray-700 text-xs">{log.notes}</p>
                                                        )}
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}
