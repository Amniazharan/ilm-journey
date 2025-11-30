import { useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

export function useSupabaseData() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // --- Children ---

    const fetchChildren = useCallback(async () => {
        if (!user) return [];
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('children')
                .select(`
                    *,
                    subjects (
                        *,
                        milestones (*)
                    )
                `)
                .eq('user_id', user.id)
                .order('created_at', { ascending: true });
            if (error) throw error;
            return data;
        } catch (err) {
            setError(err.message);
            return [];
        } finally {
            setLoading(false);
        }
    }, [user]);

    const addChild = async (childData) => {
        if (!user) return null;
        setLoading(true);
        try {
            console.log('Adding child with data:', childData);
            const { data, error } = await supabase
                .from('children')
                .insert([{ ...childData, user_id: user.id }])
                .select()
                .single();
            if (error) {
                console.error('Supabase error:', error);
                throw error;
            }
            return data;
        } catch (err) {
            console.error('Caught error:', err);
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const updateChild = async (id, updates) => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('children')
                .update(updates)
                .eq('id', id)
                .select()
                .single();
            if (error) throw error;
            return data;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const deleteChild = async (id) => {
        setLoading(true);
        try {
            const { error } = await supabase
                .from('children')
                .delete()
                .eq('id', id);
            if (error) throw error;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    // --- Subjects ---

    const fetchSubjects = useCallback(async (childId) => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('subjects')
                .select(`
                    *,
                    milestones (*)
                `)
                .eq('child_id', childId)
                .order('created_at', { ascending: true });

            if (error) throw error;

            // Sort milestones by created_at within subjects
            const sortedData = data.map(subject => ({
                ...subject,
                milestones: (subject.milestones || []).sort((a, b) =>
                    new Date(a.created_at) - new Date(b.created_at)
                )
            }));

            return sortedData;
        } catch (err) {
            setError(err.message);
            return [];
        } finally {
            setLoading(false);
        }
    }, []);

    const addSubject = async (subjectData) => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('subjects')
                .insert([subjectData])
                .select()
                .single();
            if (error) throw error;
            return data;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const updateSubject = async (id, updates) => {
        setLoading(true);
        try {
            const { error } = await supabase
                .from('subjects')
                .update(updates)
                .eq('id', id);
            if (error) throw error;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const deleteSubject = async (id) => {
        setLoading(true);
        try {
            const { error } = await supabase
                .from('subjects')
                .delete()
                .eq('id', id);
            if (error) throw error;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    // --- Milestones ---

    const addMilestone = async (milestoneData) => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('milestones')
                .insert([milestoneData])
                .select()
                .single();
            if (error) throw error;
            return data;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const updateMilestone = async (id, updates) => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('milestones')
                .update(updates)
                .eq('id', id)
                .select()
                .single();
            if (error) throw error;
            return data;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const deleteMilestone = async (id) => {
        setLoading(true);
        try {
            const { error } = await supabase
                .from('milestones')
                .delete()
                .eq('id', id);
            if (error) throw error;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    // --- Logs ---

    const fetchLogs = useCallback(async (subjectId, milestoneId = null, childId = null) => {
        setLoading(true);
        try {
            let query = supabase
                .from('progress_logs')
                .select('*')
                .order('date', { ascending: false });

            // For Quran syllabus, filter by milestone_name AND child_id
            if (subjectId === 'quran-syllabus') {
                query = query.is('subject_id', null);

                // Only filter by milestone_name if provided
                if (milestoneId) {
                    query = query.eq('milestone_name', decodeURIComponent(milestoneId));
                }

                if (childId) {
                    query = query.eq('child_id', childId);
                }
            } else {
                query = query.eq('subject_id', subjectId);
                if (milestoneId) {
                    query = query.eq('milestone_id', milestoneId);
                }
            }

            const { data, error } = await query;
            if (error) throw error;
            return data;
        } catch (err) {
            setError(err.message);
            return [];
        } finally {
            setLoading(false);
        }
    }, []);

    const addLog = async (logData) => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('progress_logs')
                .insert([logData])
                .select()
                .single();
            if (error) throw error;
            return data;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const deleteLog = async (id) => {
        setLoading(true);
        try {
            const { error } = await supabase
                .from('progress_logs')
                .delete()
                .eq('id', id);
            if (error) throw error;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const fetchCompletionStatus = async (childId) => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('progress_logs')
                .select('milestone_id, milestone_name')
                .eq('child_id', childId)
                .eq('page', 'SELESAI');
            if (error) throw error;
            return data;
        } catch (err) {
            setError(err.message);
            return [];
        } finally {
            setLoading(false);
        }
    };

    const fetchRecentAchievements = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('progress_logs')
                .select(`
                    *,
                    children (name, gender),
                    milestones (description)
                `)
                .eq('page', 'SELESAI')
                .order('date', { ascending: false })
                .limit(5);

            if (error) throw error;
            return data;
        } catch (err) {
            setError(err.message);
            return [];
        } finally {
            setLoading(false);
        }
    };

    return {
        loading,
        error,
        fetchChildren,
        addChild,
        updateChild,
        deleteChild,
        fetchSubjects,
        addSubject,
        updateSubject,
        deleteSubject,
        addMilestone,
        updateMilestone,
        deleteMilestone,
        fetchLogs,
        addLog,
        deleteLog,
        fetchCompletionStatus,
        fetchRecentAchievements
    };
}
