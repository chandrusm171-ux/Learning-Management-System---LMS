import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import {
  ChevronLeft, ChevronRight, ChevronDown, ChevronUp,
  Check, Play, BookOpen, FileText, StickyNote,
  X, Plus, Clock, Award, Menu, Sun, Moon,
  CheckCircle, Circle
} from 'lucide-react';
import { getCourseByIdAPI } from '@/api/course.api';
import { getLessonAPI, getEnrollmentProgressAPI, updateProgressAPI, addNoteAPI, deleteNoteAPI } from '@/api/enrollment.api';
import { useAuthStore } from '@/store/authStore';
import { useUIStore } from '@/store/uiStore';
import ProgressBar from '@/components/common/ProgressBar';

export default function CoursePlayer() {
  const { courseId, lessonId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { isDark, toggleDark } = useUIStore();

  const [currentLessonId, setCurrentLessonId] = useState(lessonId || null);
  const [currentLesson, setCurrentLesson] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [openSections, setOpenSections] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [noteText, setNoteText] = useState('');
  const [videoTime, setVideoTime] = useState(0);
  const [lessonLoading, setLessonLoading] = useState(false);
  const videoRef = useRef(null);

  const { data: courseData, isLoading: courseLoading } = useQuery({
    queryKey: ['course-player', courseId],
    queryFn: () => getCourseByIdAPI(courseId),
    select: (res) => res.data.data,
  });

  const { data: enrollment, refetch: refetchProgress } = useQuery({
    queryKey: ['enrollment-progress', courseId],
    queryFn: () => getEnrollmentProgressAPI(courseId),
    select: (res) => res.data.data?.enrollment,
    retry: false,
  });

  const updateProgressMutation = useMutation({
    mutationFn: (data) => updateProgressAPI(courseId, data),
    onSuccess: () => refetchProgress(),
  });

  const addNoteMutation = useMutation({
    mutationFn: (data) => addNoteAPI(courseId, data),
    onSuccess: () => {
      setNoteText('');
      refetchProgress();
      toast.success('Note saved!');
    },
  });

  const deleteNoteMutation = useMutation({
    mutationFn: (noteId) => deleteNoteAPI(courseId, noteId),
    onSuccess: () => refetchProgress(),
  });

  const curriculum = courseData?.curriculum || [];
  const course = courseData?.course;

  // Open all sections by default
  useEffect(() => {
    if (curriculum.length > 0 && openSections.length === 0) {
      setOpenSections(curriculum.map((s) => s._id));
    }
  }, [curriculum.length]);

  // Auto-load first lesson
  useEffect(() => {
    if (!currentLessonId && curriculum.length > 0) {
      const firstLesson = curriculum[0]?.lessons?.[0];
      if (firstLesson) {
        loadLesson(firstLesson._id);
      }
    }
  }, [curriculum.length]);

  // Load lesson when URL lessonId changes
  useEffect(() => {
    if (lessonId && lessonId !== currentLessonId) {
      loadLesson(lessonId);
    }
  }, [lessonId]);

  const loadLesson = async (id) => {
    if (!id) return;
    setLessonLoading(true);
    try {
      const res = await getLessonAPI(id);
      setCurrentLesson(res.data.data?.lesson);
      setCurrentLessonId(id);
      navigate(`/learn/${courseId}/${id}`, { replace: true });
    } catch (err) {
      toast.error('Cannot access this lesson. Please enroll first.');
    } finally {
      setLessonLoading(false);
    }
  };

  const markComplete = () => {
    if (!currentLessonId) return;
    updateProgressMutation.mutate({
      lessonId: currentLessonId,
      completed: true,
      lastPosition: videoRef.current?.currentTime || 0,
    });
    toast.success('Lesson marked as complete! ✓');
  };

  const handleVideoProgress = () => {
    if (!videoRef.current || !currentLessonId) return;
    const time = videoRef.current.currentTime;
    setVideoTime(time);
    const duration = videoRef.current.duration;
    if (duration && time / duration > 0.9) {
      updateProgressMutation.mutate({
        lessonId: currentLessonId,
        completed: true,
        lastPosition: time,
        watchedDuration: Math.round(time),
      });
    }
  };

  const isLessonCompleted = (id) => {
    return enrollment?.progress?.find((p) => p.lesson === id)?.completed || false;
  };

  const toggleSection = (id) => {
    setOpenSections((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const getAllLessons = () => curriculum.flatMap((s) => s.lessons || []);

  const getNextLesson = () => {
    const all = getAllLessons();
    const idx = all.findIndex((l) => l._id === currentLessonId);
    return idx >= 0 && idx < all.length - 1 ? all[idx + 1] : null;
  };

  const getPrevLesson = () => {
    const all = getAllLessons();
    const idx = all.findIndex((l) => l._id === currentLessonId);
    return idx > 0 ? all[idx - 1] : null;
  };

  const formatTime = (secs) => {
    if (!secs) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  if (courseLoading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center text-white space-y-3">
          <div className="w-12 h-12 border-4 border-violet-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-gray-400 text-sm">Loading course...</p>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center text-white">
          <h2 className="text-xl font-bold mb-2">Course not found</h2>
          <Link to="/dashboard" className="text-violet-400 hover:underline text-sm">
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const allLessons = getAllLessons();
  const currentLessonIndex = allLessons.findIndex((l) => l._id === currentLessonId);

  return (
    <div className="flex flex-col h-screen bg-gray-950 text-white overflow-hidden">

      {/* Top navbar */}
      <header className="flex items-center justify-between px-4 h-14 bg-gray-900 border-b border-gray-800 flex-shrink-0 z-20">
        <div className="flex items-center gap-3">
          <Link to="/dashboard"
            className="flex items-center gap-1.5 text-gray-400 hover:text-white transition-colors text-sm">
            <ChevronLeft className="w-4 h-4" />
            <span className="hidden sm:block">My Learning</span>
          </Link>
          <div className="w-px h-5 bg-gray-700" />
          <Link to="/" className="flex items-center gap-1.5">
            <div className="w-6 h-6 bg-violet-600 rounded flex items-center justify-center">
              <BookOpen className="w-3 h-3 text-white" />
            </div>
            <span className="font-bold text-sm hidden sm:block">
              LMS<span className="text-violet-400">Pro</span>
            </span>
          </Link>
        </div>

        <h1 className="text-sm font-medium text-gray-200 truncate max-w-xs lg:max-w-md hidden md:block">
          {course?.title}
        </h1>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2">
            <div className="w-24">
              <ProgressBar value={enrollment?.completionPercentage || 0} size="sm" color="violet" />
            </div>
            <span className="text-xs text-gray-400 flex-shrink-0">
              {enrollment?.completionPercentage || 0}%
            </span>
          </div>

          <button
            onClick={toggleDark}
            className="p-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-gray-800"
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-medium rounded-lg transition-colors"
          >
            <Menu className="w-3.5 h-3.5" />
            <span className="hidden sm:block">Content</span>
          </button>
        </div>
      </header>

      {/* Body */}
      <div className="flex flex-1 overflow-hidden">

        {/* Main content area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto">

            {/* Video / Content */}
            {lessonLoading ? (
              <div className="flex items-center justify-center bg-black" style={{ minHeight: '50vh' }}>
                <div className="w-10 h-10 border-4 border-violet-600 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : currentLesson?.videoUrl ? (
              <div className="bg-black w-full">
                <video
                  ref={videoRef}
                  src={currentLesson.videoUrl}
                  controls
                  className="w-full"
                  style={{ maxHeight: '65vh' }}
                  onTimeUpdate={handleVideoProgress}
                  onEnded={markComplete}
                />
              </div>
            ) : currentLesson ? (
              <div className="flex items-center justify-center bg-gray-900 border-b border-gray-800"
                style={{ minHeight: '30vh' }}>
                <div className="text-center text-gray-400">
                  <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p className="text-sm">Article lesson — read content below</p>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center bg-gray-950"
                style={{ minHeight: '50vh' }}>
                <div className="text-center text-gray-500">
                  <Play className="w-16 h-16 mx-auto mb-4 opacity-20" />
                  <p className="text-lg font-medium">Select a lesson to start learning</p>
                  <p className="text-sm mt-1 opacity-60">Choose from the course content panel →</p>
                </div>
              </div>
            )}

            {/* Lesson content below video */}
            {currentLesson && (
              <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-6">

                {/* Lesson title + complete button */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="flex-1">
                    <h2 className="text-xl font-bold text-white leading-tight">
                      {currentLesson.title}
                    </h2>
                    {currentLesson.description && (
                      <p className="text-sm text-gray-400 mt-1 leading-relaxed">
                        {currentLesson.description}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={markComplete}
                    disabled={isLessonCompleted(currentLessonId) || updateProgressMutation.isPending}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all flex-shrink-0 ${
                      isLessonCompleted(currentLessonId)
                        ? 'bg-green-900/30 text-green-400 border border-green-800 cursor-default'
                        : 'bg-violet-600 hover:bg-violet-700 text-white shadow-lg shadow-violet-900/30'
                    }`}
                  >
                    {isLessonCompleted(currentLessonId) ? (
                      <><CheckCircle className="w-4 h-4" /> Completed</>
                    ) : (
                      <><Check className="w-4 h-4" /> Mark Complete</>
                    )}
                  </button>
                </div>

                {/* Prev / Next navigation */}
                <div className="flex items-center justify-between py-3 border-t border-b border-gray-800">
                  <button
                    onClick={() => { const p = getPrevLesson(); if (p) loadLesson(p._id); }}
                    disabled={!getPrevLesson()}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed text-gray-300 text-sm font-medium rounded-xl transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" /> Previous
                  </button>

                  <span className="text-xs text-gray-500">
                    {currentLessonIndex + 1} of {allLessons.length} lessons
                  </span>

                  <button
                    onClick={() => { const n = getNextLesson(); if (n) loadLesson(n._id); }}
                    disabled={!getNextLesson()}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed text-gray-300 text-sm font-medium rounded-xl transition-colors"
                  >
                    Next <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                {/* Tabs */}
                <div className="flex gap-1 bg-gray-900 rounded-xl p-1 border border-gray-800 w-fit">
                  {['overview', 'notes', 'resources'].map((tab) => (
                    <button key={tab} onClick={() => setActiveTab(tab)}
                      className={`px-4 py-2 text-sm font-medium rounded-lg capitalize transition-colors ${
                        activeTab === tab
                          ? 'bg-violet-600 text-white shadow-sm'
                          : 'text-gray-400 hover:text-white'
                      }`}>
                      {tab}
                    </button>
                  ))}
                </div>

                {/* Overview tab */}
                {activeTab === 'overview' && (
                  <div className="bg-gray-900 rounded-2xl border border-gray-800 p-5 space-y-4">
                    <h3 className="font-semibold text-white">About this lesson</h3>
                    <p className="text-sm text-gray-400 leading-relaxed">
                      {currentLesson.description || 'No description provided for this lesson.'}
                    </p>
                    {currentLesson.article && (
                      <div
                        className="text-sm text-gray-300 leading-relaxed mt-4 pt-4 border-t border-gray-800"
                        dangerouslySetInnerHTML={{ __html: currentLesson.article }}
                      />
                    )}
                    <div className="pt-4 border-t border-gray-800">
                      <p className="text-xs text-gray-500 font-medium mb-3">About the course</p>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-violet-700 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                          {course?.instructor?.name?.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white">{course?.instructor?.name}</p>
                          <p className="text-xs text-gray-500">{course?.instructor?.headline}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Notes tab */}
                {activeTab === 'notes' && (
                  <div className="space-y-4">
                    <div className="bg-gray-900 rounded-2xl border border-gray-800 p-5">
                      <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
                        <StickyNote className="w-4 h-4 text-violet-400" />
                        Add a note
                        {currentLesson?.videoUrl && videoTime > 0 && (
                          <span className="text-xs text-gray-500 font-normal">
                            at {formatTime(videoTime)}
                          </span>
                        )}
                      </h3>
                      <textarea
                        value={noteText}
                        onChange={(e) => setNoteText(e.target.value)}
                        placeholder="Write your note here..."
                        rows={3}
                        className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-violet-500 resize-none transition-colors"
                      />
                      <div className="flex justify-end mt-3">
                        <button
                          onClick={() => {
                            if (!noteText.trim()) return;
                            addNoteMutation.mutate({
                              lessonId: currentLessonId,
                              content: noteText,
                              timestamp: Math.round(videoTime),
                            });
                          }}
                          disabled={!noteText.trim() || addNoteMutation.isPending}
                          className="flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white text-sm font-medium rounded-xl transition-colors"
                        >
                          <Plus className="w-4 h-4" /> Save Note
                        </button>
                      </div>
                    </div>

                    {/* Notes list */}
                    <div className="space-y-3">
                      {(enrollment?.notes || [])
                        .filter((n) => n.lesson === currentLessonId)
                        .length === 0 ? (
                        <div className="text-center py-8 text-gray-600 text-sm">
                          No notes for this lesson yet
                        </div>
                      ) : (
                        (enrollment?.notes || [])
                          .filter((n) => n.lesson === currentLessonId)
                          .map((note) => (
                            <div key={note._id}
                              className="bg-gray-900 rounded-xl border border-gray-800 p-4">
                              <div className="flex items-start justify-between gap-3">
                                <div className="flex-1">
                                  {note.timestamp > 0 && (
                                    <button
                                      onClick={() => {
                                        if (videoRef.current) {
                                          videoRef.current.currentTime = note.timestamp;
                                        }
                                      }}
                                      className="text-xs text-violet-400 hover:text-violet-300 font-medium mb-1.5 flex items-center gap-1"
                                    >
                                      <Clock className="w-3 h-3" />
                                      {formatTime(note.timestamp)}
                                    </button>
                                  )}
                                  <p className="text-sm text-gray-300 leading-relaxed">
                                    {note.content}
                                  </p>
                                  <p className="text-xs text-gray-600 mt-2">
                                    {new Date(note.createdAt).toLocaleDateString()}
                                  </p>
                                </div>
                                <button
                                  onClick={() => deleteNoteMutation.mutate(note._id)}
                                  className="p-1 text-gray-600 hover:text-red-400 transition-colors flex-shrink-0"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          ))
                      )}
                    </div>
                  </div>
                )}

                {/* Resources tab */}
                {activeTab === 'resources' && (
                  <div className="bg-gray-900 rounded-2xl border border-gray-800 p-5">
                    <h3 className="font-semibold text-white mb-4">Lesson Resources</h3>
                    {currentLesson.resources?.length > 0 ? (
                      <div className="space-y-2">
                        {currentLesson.resources.map((r, i) => (
                          <a key={i} href={r.url} target="_blank" rel="noreferrer"
                            className="flex items-center gap-3 p-3 bg-gray-800 hover:bg-gray-700 rounded-xl transition-colors">
                            <FileText className="w-4 h-4 text-violet-400 flex-shrink-0" />
                            <span className="text-sm text-gray-300">{r.name}</span>
                          </a>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-600 text-sm text-center py-4">
                        No resources for this lesson
                      </p>
                    )}
                  </div>
                )}

                {/* Course completion banner */}
                {enrollment?.isCompleted && (
                  <div className="bg-gradient-to-r from-green-900/50 to-teal-900/50 border border-green-700/50 rounded-2xl p-6 text-center">
                    <Award className="w-12 h-12 mx-auto text-yellow-400 mb-3" />
                    <h3 className="text-lg font-bold text-white mb-1">
                      🎉 Course Completed!
                    </h3>
                    <p className="text-green-300 text-sm mb-4">
                      Congratulations on finishing the course!
                    </p>
                    <Link to="/dashboard"
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white font-medium rounded-xl transition-colors text-sm">
                      <Award className="w-4 h-4" /> View Certificate
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right sidebar — course curriculum */}
        {sidebarOpen && (
          <div className="w-80 xl:w-96 flex-shrink-0 flex flex-col bg-gray-900 border-l border-gray-800 overflow-hidden">

            {/* Sidebar header */}
            <div className="px-4 py-3 border-b border-gray-800 flex-shrink-0">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold text-white">Course Content</h3>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="p-1 text-gray-500 hover:text-gray-300 transition-colors rounded-lg hover:bg-gray-800"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex-1">
                  <ProgressBar value={enrollment?.completionPercentage || 0} size="sm" color="violet" />
                </div>
                <span className="text-xs text-gray-400 flex-shrink-0">
                  {enrollment?.completedLessons || 0}/{enrollment?.totalLessons || allLessons.length} lessons
                </span>
              </div>
            </div>

            {/* Sections + Lessons */}
            <div className="flex-1 overflow-y-auto">
              {curriculum.length === 0 ? (
                <div className="flex items-center justify-center h-32 text-gray-600 text-sm">
                  No content available
                </div>
              ) : curriculum.map((section, sIdx) => (
                <div key={section._id}>

                  {/* Section header */}
                  <button
                    onClick={() => toggleSection(section._id)}
                    className="w-full flex items-center justify-between px-4 py-3 bg-gray-800/60 hover:bg-gray-800 transition-colors border-b border-gray-700/50 text-left"
                  >
                    <div className="flex items-center gap-2">
                      {openSections.includes(section._id)
                        ? <ChevronUp className="w-3.5 h-3.5 text-gray-500 flex-shrink-0" />
                        : <ChevronDown className="w-3.5 h-3.5 text-gray-500 flex-shrink-0" />}
                      <div>
                        <p className="text-xs font-semibold text-gray-200 leading-snug">
                          Section {sIdx + 1}: {section.title}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {(section.lessons || []).filter((l) => isLessonCompleted(l._id)).length}/
                          {section.lessons?.length || 0} completed
                        </p>
                      </div>
                    </div>
                  </button>

                  {/* Lessons list */}
                  {openSections.includes(section._id) && (
                    <div>
                      {(section.lessons || []).length === 0 ? (
                        <div className="px-4 py-3 text-xs text-gray-600 italic">
                          No lessons in this section
                        </div>
                      ) : (section.lessons || []).map((lesson) => {
                        const isActive = lesson._id === currentLessonId;
                        const isDone = isLessonCompleted(lesson._id);

                        return (
                          <button
                            key={lesson._id}
                            onClick={() => loadLesson(lesson._id)}
                            className={`w-full flex items-start gap-3 px-4 py-3 text-left transition-all border-b border-gray-800/40 last:border-0 ${
                              isActive
                                ? 'bg-violet-900/30 border-l-2 border-l-violet-500 pl-3.5'
                                : 'hover:bg-gray-800/40'
                            }`}
                          >
                            {/* Completion circle */}
                            <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors ${
                              isDone
                                ? 'bg-green-600'
                                : isActive
                                  ? 'border-2 border-violet-400'
                                  : 'border-2 border-gray-600'
                            }`}>
                              {isDone && <Check className="w-3 h-3 text-white" />}
                              {isActive && !isDone && (
                                <div className="w-2 h-2 bg-violet-400 rounded-full" />
                              )}
                            </div>

                            <div className="flex-1 min-w-0">
                              <p className={`text-xs font-medium leading-snug ${
                                isActive
                                  ? 'text-violet-300'
                                  : isDone
                                    ? 'text-gray-500'
                                    : 'text-gray-300'
                              }`}>
                                {lesson.title}
                              </p>
                              <div className="flex items-center gap-2 mt-1">
                                {lesson.isFreePreview && (
                                  <span className="text-xs text-green-500 font-medium">Preview</span>
                                )}
                                {lesson.videoDuration > 0 && (
                                  <span className="text-xs text-gray-600 flex items-center gap-0.5">
                                    <Clock className="w-2.5 h-2.5" />
                                    {Math.floor(lesson.videoDuration / 60)}m
                                  </span>
                                )}
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}