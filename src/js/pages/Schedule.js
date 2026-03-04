/**
 * Schedule page
 */

import { i18n } from '../services/i18n.js';
import { dataService } from '../services/data.js';
import { render } from '../utils/dom.js';
import { toast } from '../components/ui/Toast.js';
import { loading } from '../components/ui/Loading.js';

/**
 * Render schedule page
 */
export async function renderSchedule() {
  loading.show();

  try {
    // Fetch classes with instructors and martial arts
    const classes = await dataService.getClasses();

    const scheduleHTML = `
      <div>
        <!-- Hero Section -->
        <section class="about-hero text-white py-5">
          <div class="container text-center py-5">
            <h1 class="display-3 fw-bold text-accent mb-3">
              ${i18n.t('schedule.title') || 'Разписание'}
            </h1>
            <p class="lead text-muted">
              ${i18n.t('schedule.subtitle') || 'Провери разписанието на нашите тренировки'}
            </p>
          </div>
        </section>

        <!-- Schedule Section -->
        <section class="bg-dark py-5">
          <div class="container py-4">
            ${renderScheduleByDay(classes)}
          </div>
        </section>
      </div>
    `;

    render('#app', scheduleHTML);
  } catch (error) {
    console.error('Error loading schedule:', error);
    toast.error(i18n.t('schedule.loadError') || 'Грешка при зареждане на разписанието');

    const errorHTML = `
      <div class="container py-5 text-center">
        <h1 class="text-accent mb-4">${i18n.t('schedule.title') || 'Разписание'}</h1>
        <p class="text-muted">${i18n.t('schedule.loadError') || 'Грешка при зареждане на разписанието'}</p>
      </div>
    `;
    render('#app', errorHTML);
  } finally {
    loading.hide();
  }
}

/**
 * Group classes by day and render
 */
function renderScheduleByDay(classes) {
  const days = [
    { id: 0, name: i18n.t('days.monday') || 'Понеделник', classes: [] },
    { id: 1, name: i18n.t('days.tuesday') || 'Вторник', classes: [] },
    { id: 2, name: i18n.t('days.wednesday') || 'Сряда', classes: [] },
    { id: 3, name: i18n.t('days.thursday') || 'Четвъртък', classes: [] },
    { id: 4, name: i18n.t('days.friday') || 'Петък', classes: [] },
    { id: 5, name: i18n.t('days.saturday') || 'Събота', classes: [] },
    { id: 6, name: i18n.t('days.sunday') || 'Неделя', classes: [] }
  ];

  // Group classes by day
  classes.forEach(classItem => {
    const day = days.find(d => d.id === classItem.day_of_week);
    if (day) {
      day.classes.push(classItem);
    }
  });

  // Render each day
  return days.map(day => `
    <div class="mb-5">
      <h2 class="h3 text-accent mb-4 border-bottom border-accent pb-2">
        ${day.name}
      </h2>
      ${day.classes.length > 0 ? renderDayClasses(day.classes) : renderNoClasses()}
    </div>
  `).join('');
}

/**
 * Render classes for a specific day
 */
function renderDayClasses(classes) {
  // Sort by start time
  const sortedClasses = [...classes].sort((a, b) => {
    return a.start_time.localeCompare(b.start_time);
  });

  return `
    <div class="row g-4">
      ${sortedClasses.map(classItem => `
        <div class="col-md-6 col-lg-4">
          <div class="class-card">
            <div class="class-header">
              <h3 class="h5 text-accent mb-2">${classItem.discipline || 'Unknown'}</h3>
              <div class="class-time text-white">
                <svg class="me-1" width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                ${formatTime(classItem.start_time)} - ${formatTime(classItem.end_time)}
              </div>
            </div>

            <div class="class-body">
              ${classItem.age_group ? `
                <div class="class-age-group mb-2">
                  <svg class="me-1" width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <span class="text-muted">${formatAgeGroup(classItem.age_group)}</span>
                </div>
              ` : ''}
            </div>
          </div>
        </div>
      `).join('')}
    </div>
  `;
}

/**
 * Render message when no classes
 */
function renderNoClasses() {
  return `
    <div class="text-center text-muted py-4">
      <p>${i18n.t('schedule.noClasses') || 'Няма тренировки за този ден'}</p>
    </div>
  `;
}

/**
 * Format time from HH:MM:SS to HH:MM
 */
function formatTime(timeString) {
  if (!timeString) return '';
  return timeString.substring(0, 5);
}

/**
 * Format age group for display
 */
function formatAgeGroup(ageGroup) {
  const ageGroupMap = {
    'adult': 'Adult Classes',
    'kids': '8-13 yrs',
    'youth': '14-17 yrs',
    'all': 'All Ages'
  };
  return ageGroupMap[ageGroup] || ageGroup;
}

/**
 * Get badge class based on level
 */
function getLevelBadgeClass(level) {
  switch (level) {
    case 'beginner':
      return 'bg-success';
    case 'intermediate':
      return 'bg-warning text-dark';
    case 'advanced':
      return 'bg-danger';
    case 'all':
      return 'bg-info text-dark';
    default:
      return 'bg-secondary';
  }
}

/**
 * Translate level to Bulgarian
 */
function translateLevel(level) {
  const translations = {
    beginner: i18n.t('schedule.levels.beginner') || 'Начинаещи',
    intermediate: i18n.t('schedule.levels.intermediate') || 'Напреднали',
    advanced: i18n.t('schedule.levels.advanced') || 'Експерти',
    all: i18n.t('schedule.levels.all') || 'Всички нива'
  };
  return translations[level] || level;
}
