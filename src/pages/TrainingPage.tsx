import { PlayCircle, BookOpen, Clock, CheckCircle } from 'lucide-react';

const courses = [
  {
    id: 1,
    title: 'Mastering the Big Idea',
    description: 'Learn how to craft compelling Big Ideas that resonate with your audience.',
    duration: '45 min',
    lessons: 6,
    progress: 100,
    completed: true
  },
  {
    id: 2,
    title: 'Audience Journey Framework',
    description: 'Understand how to map your audience\'s emotional journey through your presentation.',
    duration: '1h 15min',
    lessons: 8,
    progress: 60,
    completed: false
  },
  {
    id: 3,
    title: 'Visual Storytelling',
    description: 'Transform data and concepts into compelling visual narratives.',
    duration: '2h',
    lessons: 12,
    progress: 0,
    completed: false
  },
  {
    id: 4,
    title: 'Pitch Deck Essentials',
    description: 'Build investor-ready pitch decks that get meetings and funding.',
    duration: '1h 30min',
    lessons: 10,
    progress: 0,
    completed: false
  }
];

export function TrainingPage() {
  return (
    <main className="flex-1 overflow-y-auto">
      <div className="max-w-5xl mx-auto px-8 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-semibold text-phantom-900 tracking-tight mb-1">
              Training Center
            </h1>
            <p className="text-phantom-500">Master the art of presentation storytelling</p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-full text-sm">
            <CheckCircle className="w-4 h-4" />
            <span>1 course completed</span>
          </div>
        </div>

        <div className="grid gap-4">
          {courses.map(course => (
            <div
              key={course.id}
              className="group p-5 rounded-xl border border-phantom-200 bg-white hover:border-violet-300 hover:shadow-md transition-all cursor-pointer"
            >
              <div className="flex items-start gap-5">
                <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${
                  course.completed
                    ? 'bg-emerald-100'
                    : course.progress > 0
                    ? 'bg-violet-100'
                    : 'bg-phantom-100'
                }`}>
                  {course.completed ? (
                    <CheckCircle className="w-7 h-7 text-emerald-600" />
                  ) : (
                    <PlayCircle className={`w-7 h-7 ${course.progress > 0 ? 'text-violet-600' : 'text-phantom-400'}`} />
                  )}
                </div>

                <div className="flex-1">
                  <h3 className="font-semibold text-phantom-900 mb-1 group-hover:text-violet-600 transition-colors">
                    {course.title}
                  </h3>
                  <p className="text-sm text-phantom-500 mb-3">{course.description}</p>

                  <div className="flex items-center gap-4 text-xs text-phantom-500">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {course.duration}
                    </span>
                    <span className="flex items-center gap-1">
                      <BookOpen className="w-3.5 h-3.5" />
                      {course.lessons} lessons
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  {course.completed ? (
                    <span className="text-sm font-medium text-emerald-600">Completed</span>
                  ) : course.progress > 0 ? (
                    <div>
                      <span className="text-sm font-medium text-violet-600">{course.progress}%</span>
                      <div className="w-24 h-1.5 bg-phantom-100 rounded-full mt-1.5">
                        <div
                          className="h-full bg-violet-500 rounded-full"
                          style={{ width: `${course.progress}%` }}
                        />
                      </div>
                    </div>
                  ) : (
                    <span className="text-sm text-phantom-400">Not started</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
