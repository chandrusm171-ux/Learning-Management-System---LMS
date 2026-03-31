import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import {
  ChevronRight, ChevronLeft, Check, BookOpen,
  Settings, Video, Send, Plus, Trash2,
  GripVertical, ChevronDown, ChevronUp, Loader2
} from 'lucide-react';
import {
  createCourseAPI, updateCourseAPI, submitCourseAPI,
  getSectionsAPI, createSectionAPI, updateSectionAPI, deleteSectionAPI,
  createLessonAPI, updateLessonAPI, deleteLessonAPI,
  getCategoriesAPI,
} from '@/api/course.api';
import ImageUploader from '@/components/video/ImageUploader';
import VideoUploader from '@/components/video/VideoUploader';

const courseSchema = z.object({
  title: z.string().min(10, 'Title must be at least 10 characters'),
  subtitle: z.string().min(10, 'Subtitle must be at least 10 characters'),
  description: z.string().min(50, 'Description must be at least 50 characters'),
  category: z.string().min(1, 'Please select a category'),
  level: z.enum(['beginner', 'intermediate', 'advanced', 'all']),
  language: z.string().min(1, 'Please select a language'),
  price: z.string(),
  isFree: z.boolean(),
});

const STEPS = [
  { id: 1, label: 'Basic Info', icon: BookOpen },
  { id: 2, label: 'Details', icon: Settings },
  { id: 3, label: 'Curriculum', icon: Video },
  { id: 4, label: 'Publish', icon: Send },
];

const LANGUAGES = ['English', 'Hindi', 'Tamil', 'Telugu', 'Malayalam', 'Kannada', 'Bengali', 'Marathi'];

export default function CourseBuilder() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [step, setStep] = useState(1);
  const [courseId, setCourseId] = useState(null);
  const [thumbnail, setThumbnail] = useState('');
  const [sections, setSections] = useState([]);
  const [openSections, setOpenSections] = useState([]);
  const [editingLesson, setEditingLesson] = useState(null);
  const [newSectionTitle, setNewSectionTitle] = useState('');
  const [addingSection, setAddingSection] = useState(false);

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: getCategoriesAPI,
    select: (res) => res.data.data?.categories || [],
  });

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm({
    resolver: zodResolver(courseSchema),
    defaultValues: {
      level: 'beginner',
      language: 'English',
      isFree: false,
      price: '0',
    },
  });

  const isFree = watch('isFree');

  const createCourseMutation = useMutation({
    mutationFn: createCourseAPI,
    onSuccess: (res) => {
      setCourseId(res.data.data.course._id);
      toast.success('Course created!');
      setStep(2);
    },
  });

  const updateCourseMutation = useMutation({
    mutationFn: ({ id, data }) => updateCourseAPI(id, data),
    onSuccess: () => {
      toast.success('Course updated!');
      setStep(3);
      loadSections();
    },
  });

  const submitCourseMutation = useMutation({
    mutationFn: submitCourseAPI,
    onSuccess: () => {
      toast.success('Course submitted for review!');
      navigate('/instructor/dashboard');
    },
  });

  const loadSections = async () => {
    if (!courseId) return;
    try {
      const res = await getSectionsAPI(courseId);
      const secs = res.data.data?.sections || [];
      const withLessons = await Promise.all(
        secs.map(async (sec) => {
          const lRes = await import('@/api/course.api').then(m => m.getLessonsAPI(sec._id));
          return { ...sec, lessons: lRes.data.data?.lessons || [] };
        })
      );
      setSections(withLessons);
    } catch {}
  };

  const handleStep1 = handleSubmit(async (data) => {
    const payload = {
      title: data.title,
      subtitle: data.subtitle,
      description: data.description,
      category: data.category,
      level: data.level,
      language: data.language,
      price: data.isFree ? 0 : Number(data.price),
      isFree: data.isFree,
      thumbnail,
    };

    if (!courseId) {
      createCourseMutation.mutate(payload);
    } else {
      updateCourseMutation.mutate({ id: courseId, data: payload });
    }
  });

  const handleStep2 = handleSubmit(async (data) => {
    const objectives = data.objectives?.split('\n').filter(Boolean) || [];
    const requirements = data.requirements?.split('\n').filter(Boolean) || [];
    await updateCourseAPI(courseId, { objectives, requirements });
    toast.success('Details saved!');
    setStep(3);
    loadSections();
  });

  const addSection = async () => {
    if (!newSectionTitle.trim()) return;
    try {
      const res = await createSectionAPI(courseId, { title: newSectionTitle });
      const newSec = { ...res.data.data.section, lessons: [] };
      setSections((prev) => [...prev, newSec]);
      setOpenSections((prev) => [...prev, newSec._id]);
      setNewSectionTitle('');
      setAddingSection(false);
      toast.success('Section added!');
    } catch {
      toast.error('Failed to add section');
    }
  };

  const deleteSection = async (sectionId) => {
    if (!confirm('Delete this section and all its lessons?')) return;
    try {
      await deleteSectionAPI(sectionId);
      setSections((prev) => prev.filter((s) => s._id !== sectionId));
      toast.success('Section deleted');
    } catch {
      toast.error('Failed to delete section');
    }
  };

  const addLesson = async (sectionId) => {
    try {
      const res = await createLessonAPI(sectionId, {
        title: 'New Lesson',
        type: 'video',
        isPublished: false,
      });
      const newLesson = res.data.data.lesson;
      setSections((prev) => prev.map((s) =>
        s._id === sectionId
          ? { ...s, lessons: [...(s.lessons || []), newLesson] }
          : s
      ));
      setEditingLesson(newLesson._id);
    } catch {
      toast.error('Failed to add lesson');
    }
  };

  const updateLesson = async (lessonId, updates) => {
    try {
      await updateLessonAPI(lessonId, updates);
      setSections((prev) => prev.map((s) => ({
        ...s,
        lessons: (s.lessons || []).map((l) =>
          l._id === lessonId ? { ...l, ...updates } : l
        ),
      })));
    } catch {
      toast.error('Failed to update lesson');
    }
  };

  const deleteLesson = async (lessonId, sectionId) => {
    if (!confirm('Delete this lesson?')) return;
    try {
      await deleteLessonAPI(lessonId);
      setSections((prev) => prev.map((s) =>
        s._id === sectionId
          ? { ...s, lessons: (s.lessons || []).filter((l) => l._id !== lessonId) }
          : s
      ));
      toast.success('Lesson deleted');
    } catch {
      toast.error('Failed to delete lesson');
    }
  };

  const toggleSection = (id) => {
    setOpenSections((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const inputClass = (err) =>
    `w-full px-4 py-3 rounded-xl border text-sm bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all ${
      err ? 'border-red-400' : 'border-gray-200 dark:border-gray-700'
    }`;

  return (
    <div className="max-w-4xl mx-auto space-y-8">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Create New Course</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Fill in the details to publish your course</p>
      </div>

      {/* Step indicator */}
      <div className="flex items-center justify-between">
        {STEPS.map((s, i) => (
          <div key={s.id} className="flex items-center flex-1">
            <div className={`flex items-center gap-2 ${step >= s.id ? 'text-violet-600 dark:text-violet-400' : 'text-gray-400'}`}>
              <div className={`w-9 h-9 rounded-full flex items-center justify-center font-semibold text-sm border-2 transition-all ${
                step > s.id
                  ? 'bg-violet-600 border-violet-600 text-white'
                  : step === s.id
                    ? 'border-violet-600 text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-900/20'
                    : 'border-gray-300 dark:border-gray-700 text-gray-400 bg-white dark:bg-gray-900'
              }`}>
                {step > s.id ? <Check className="w-4 h-4" /> : s.id}
              </div>
              <span className={`hidden sm:block text-xs font-medium ${step >= s.id ? 'text-gray-900 dark:text-white' : 'text-gray-400'}`}>
                {s.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`flex-1 h-0.5 mx-3 ${step > s.id ? 'bg-violet-600' : 'bg-gray-200 dark:bg-gray-700'}`} />
            )}
          </div>
        ))}
      </div>

      {/* Step 1: Basic Info */}
      {step === 1 && (
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 space-y-5">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">Basic Information</h2>

          {/* Thumbnail */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Course Thumbnail
            </label>
            <ImageUploader
              onUploadComplete={setThumbnail}
              existingUrl={thumbnail}
              label="Upload course thumbnail (16:9 recommended)"
            />
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Course Title *
            </label>
            <input {...register('title')} placeholder="e.g. Complete React Developer Course 2024"
              className={inputClass(errors.title)} />
            {errors.title && <p className="mt-1 text-xs text-red-500">{errors.title.message}</p>}
          </div>

          {/* Subtitle */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Subtitle *
            </label>
            <input {...register('subtitle')} placeholder="Brief description of what students will learn"
              className={inputClass(errors.subtitle)} />
            {errors.subtitle && <p className="mt-1 text-xs text-red-500">{errors.subtitle.message}</p>}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Description *
            </label>
            <textarea {...register('description')} rows={5}
              placeholder="Describe your course in detail. What will students learn? Who is it for?"
              className={inputClass(errors.description)} />
            {errors.description && <p className="mt-1 text-xs text-red-500">{errors.description.message}</p>}
          </div>

          {/* Category + Level */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Category *
              </label>
              <select {...register('category')} className={inputClass(errors.category)}>
                <option value="">Select category</option>
                {(categories || []).map((cat) => (
                  <option key={cat._id} value={cat._id}>{cat.name}</option>
                ))}
              </select>
              {errors.category && <p className="mt-1 text-xs text-red-500">{errors.category.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Level *
              </label>
              <select {...register('level')} className={inputClass(errors.level)}>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
                <option value="all">All Levels</option>
              </select>
            </div>
          </div>

          {/* Language */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Language
            </label>
            <select {...register('language')} className={inputClass(false)}>
              {LANGUAGES.map((l) => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>

          {/* Pricing */}
          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl space-y-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" {...register('isFree')}
                className="w-4 h-4 text-violet-600 rounded focus:ring-violet-500" />
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">Free Course</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Students can enroll without payment</p>
              </div>
            </label>
            {!isFree && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Price (₹)
                </label>
                <input {...register('price')} type="number" min="0" placeholder="e.g. 999"
                  className={inputClass(false)} />
              </div>
            )}
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleStep1}
              disabled={createCourseMutation.isPending || updateCourseMutation.isPending}
              className="flex items-center gap-2 px-6 py-3 bg-violet-600 hover:bg-violet-700 text-white font-semibold rounded-xl transition-colors disabled:opacity-50"
            >
              {(createCourseMutation.isPending || updateCourseMutation.isPending)
                ? <Loader2 className="w-4 h-4 animate-spin" />
                : null}
              Save & Continue <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Details */}
      {step === 2 && (
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 space-y-5">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">Course Details</h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              What students will learn
            </label>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">One objective per line</p>
            <textarea
              {...register('objectives')}
              rows={5}
              placeholder={"Build full-stack web apps\nMaster React hooks\nDeploy to production"}
              className={inputClass(false)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Requirements
            </label>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">One requirement per line</p>
            <textarea
              {...register('requirements')}
              rows={4}
              placeholder={"Basic JavaScript knowledge\nHTML & CSS basics"}
              className={inputClass(false)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Welcome Message
            </label>
            <textarea
              {...register('welcomeMessage')}
              rows={3}
              placeholder="Welcome message shown to students after enrollment"
              className={inputClass(false)}
            />
          </div>

          <div className="flex justify-between">
            <button onClick={() => setStep(1)}
              className="flex items-center gap-2 px-5 py-2.5 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-medium rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
              <ChevronLeft className="w-4 h-4" /> Back
            </button>
            <button onClick={handleStep2}
              className="flex items-center gap-2 px-6 py-3 bg-violet-600 hover:bg-violet-700 text-white font-semibold rounded-xl transition-colors">
              Save & Continue <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Curriculum */}
      {step === 3 && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Build Curriculum</h2>
              <button
                onClick={() => setAddingSection(true)}
                className="flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium rounded-xl transition-colors"
              >
                <Plus className="w-4 h-4" /> Add Section
              </button>
            </div>

            {/* Add section input */}
            {addingSection && (
              <div className="flex gap-2 mb-4">
                <input
                  type="text"
                  value={newSectionTitle}
                  onChange={(e) => setNewSectionTitle(e.target.value)}
                  placeholder="Section title e.g. Getting Started"
                  className="flex-1 px-4 py-2.5 text-sm bg-gray-50 dark:bg-gray-800 border border-violet-300 dark:border-violet-700 rounded-xl outline-none focus:ring-2 focus:ring-violet-500 text-gray-900 dark:text-white"
                  onKeyDown={(e) => e.key === 'Enter' && addSection()}
                  autoFocus
                />
                <button onClick={addSection}
                  className="px-4 py-2 bg-violet-600 text-white text-sm font-medium rounded-xl hover:bg-violet-700 transition-colors">
                  Add
                </button>
                <button onClick={() => { setAddingSection(false); setNewSectionTitle(''); }}
                  className="px-4 py-2 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 text-sm rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                  Cancel
                </button>
              </div>
            )}

            {sections.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl">
                <Video className="w-10 h-10 mx-auto text-gray-300 dark:text-gray-600 mb-3" />
                <p className="text-gray-500 dark:text-gray-400 text-sm">No sections yet</p>
                <p className="text-gray-400 dark:text-gray-600 text-xs mt-1">Click "Add Section" to start building your curriculum</p>
              </div>
            ) : (
              <div className="space-y-3">
                {sections.map((section, sIdx) => (
                  <div key={section._id} className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">

                    {/* Section header */}
                    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800">
                      <div className="flex items-center gap-3">
                        <GripVertical className="w-4 h-4 text-gray-400 cursor-grab" />
                        <button onClick={() => toggleSection(section._id)}>
                          {openSections.includes(section._id)
                            ? <ChevronUp className="w-4 h-4 text-gray-500" />
                            : <ChevronDown className="w-4 h-4 text-gray-500" />}
                        </button>
                        <div>
                          <p className="text-sm font-semibold text-gray-900 dark:text-white">
                            Section {sIdx + 1}: {section.title}
                          </p>
                          <p className="text-xs text-gray-500">{section.lessons?.length || 0} lessons</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => addLesson(section._id)}
                          className="flex items-center gap-1 text-xs px-3 py-1.5 bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 rounded-lg hover:bg-violet-200 transition-colors font-medium"
                        >
                          <Plus className="w-3 h-3" /> Lesson
                        </button>
                        <button
                          onClick={() => deleteSection(section._id)}
                          className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Lessons */}
                    {openSections.includes(section._id) && (
                      <div className="divide-y divide-gray-100 dark:divide-gray-800">
                        {(section.lessons || []).map((lesson) => (
                          <div key={lesson._id} className="p-4">
                            {editingLesson === lesson._id ? (
                              <LessonEditor
                                lesson={lesson}
                                onSave={async (updates) => {
                                  await updateLesson(lesson._id, updates);
                                  setEditingLesson(null);
                                  toast.success('Lesson saved!');
                                }}
                                onCancel={() => setEditingLesson(null)}
                              />
                            ) : (
                              <div className="flex items-center gap-3">
                                <GripVertical className="w-4 h-4 text-gray-400 cursor-grab flex-shrink-0" />
                                <div className="w-7 h-7 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center flex-shrink-0">
                                  <Video className="w-3.5 h-3.5 text-gray-500" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{lesson.title}</p>
                                  <div className="flex items-center gap-2 mt-0.5">
                                    {lesson.isFreePreview && (
                                      <span className="text-xs text-green-600 dark:text-green-400 font-medium">Free preview</span>
                                    )}
                                    {lesson.videoUrl && (
                                      <span className="text-xs text-violet-600 dark:text-violet-400">Video uploaded ✓</span>
                                    )}
                                  </div>
                                </div>
                                <div className="flex items-center gap-1">
                                  <button
                                    onClick={() => setEditingLesson(lesson._id)}
                                    className="text-xs px-3 py-1.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 transition-colors"
                                  >
                                    Edit
                                  </button>
                                  <button
                                    onClick={() => deleteLesson(lesson._id, section._id)}
                                    className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                        {!section.lessons?.length && (
                          <div className="p-4 text-center text-xs text-gray-400">
                            No lessons yet. Click "+ Lesson" to add.
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-between">
            <button onClick={() => setStep(2)}
              className="flex items-center gap-2 px-5 py-2.5 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-medium rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
              <ChevronLeft className="w-4 h-4" /> Back
            </button>
            <button onClick={() => setStep(4)}
              className="flex items-center gap-2 px-6 py-3 bg-violet-600 hover:bg-violet-700 text-white font-semibold rounded-xl transition-colors">
              Continue <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Step 4: Publish */}
      {step === 4 && (
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 space-y-6">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">Ready to Publish?</h2>

          <div className="space-y-3">
            {[
              { label: 'Course information complete', done: true },
              { label: 'Curriculum has at least 1 section', done: sections.length > 0 },
              { label: 'At least 1 lesson added', done: sections.some((s) => s.lessons?.length > 0) },
              { label: 'Course thumbnail uploaded', done: !!thumbnail },
            ].map(({ label, done }) => (
              <div key={label} className={`flex items-center gap-3 p-3 rounded-xl ${done ? 'bg-green-50 dark:bg-green-900/10' : 'bg-yellow-50 dark:bg-yellow-900/10'}`}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${done ? 'bg-green-500' : 'bg-yellow-500'}`}>
                  <Check className="w-3.5 h-3.5 text-white" />
                </div>
                <p className={`text-sm font-medium ${done ? 'text-green-700 dark:text-green-400' : 'text-yellow-700 dark:text-yellow-400'}`}>
                  {label}
                </p>
              </div>
            ))}
          </div>

          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl">
            <p className="text-sm text-blue-700 dark:text-blue-300 font-medium mb-1">What happens next?</p>
            <p className="text-xs text-blue-600 dark:text-blue-400">
              Your course will be submitted for admin review. Once approved, it will be visible to all students on the platform.
            </p>
          </div>

          <div className="flex justify-between">
            <button onClick={() => setStep(3)}
              className="flex items-center gap-2 px-5 py-2.5 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-medium rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
              <ChevronLeft className="w-4 h-4" /> Back
            </button>
            <button
              onClick={() => submitCourseMutation.mutate(courseId)}
              disabled={submitCourseMutation.isPending}
              className="flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl transition-colors disabled:opacity-50"
            >
              {submitCourseMutation.isPending
                ? <Loader2 className="w-4 h-4 animate-spin" />
                : <Send className="w-4 h-4" />}
              Submit for Review
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function LessonEditor({ lesson, onSave, onCancel }) {
  const [title, setTitle] = useState(lesson.title);
  const [type, setType] = useState(lesson.type || 'video');
  const [isFreePreview, setIsFreePreview] = useState(lesson.isFreePreview || false);
  const [videoUrl, setVideoUrl] = useState(lesson.videoUrl || '');
  const [videoDuration, setVideoDuration] = useState(lesson.videoDuration || 0);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await onSave({ title, type, isFreePreview, videoUrl, videoDuration });
    setSaving(false);
  };

  return (
    <div className="space-y-4 bg-violet-50 dark:bg-violet-900/10 p-4 rounded-xl border border-violet-200 dark:border-violet-800">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Lesson Title</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg outline-none focus:border-violet-500 text-gray-900 dark:text-white"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Type</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg outline-none focus:border-violet-500 text-gray-900 dark:text-white"
          >
            <option value="video">Video</option>
            <option value="article">Article</option>
          </select>
        </div>
      </div>

      <label className="flex items-center gap-2 cursor-pointer">
        <input type="checkbox" checked={isFreePreview} onChange={(e) => setIsFreePreview(e.target.checked)}
          className="w-4 h-4 text-violet-600 rounded" />
        <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Free preview (visible without enrollment)</span>
      </label>

      {type === 'video' && (
        <div>
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">Upload Video</label>
          <VideoUploader
            existingUrl={videoUrl}
            onUploadComplete={(data) => {
              if (data) {
                setVideoUrl(data.url);
                setVideoDuration(data.duration || 0);
              } else {
                setVideoUrl('');
                setVideoDuration(0);
              }
            }}
          />
        </div>
      )}

      <div className="flex justify-end gap-2">
        <button onClick={onCancel}
          className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
          Cancel
        </button>
        <button onClick={handleSave} disabled={saving}
          className="flex items-center gap-2 px-4 py-2 text-sm bg-violet-600 hover:bg-violet-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50">
          {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
          Save Lesson
        </button>
      </div>
    </div>
  );
}