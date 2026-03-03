/**
 * Contact page
 */

import { i18n } from '../services/i18n.js';
import { dataService } from '../services/data.js';
import { render } from '../utils/dom.js';
import { toast } from '../components/ui/Toast.js';
import { loading } from '../components/ui/Loading.js';

/**
 * Render contact page
 */
export async function renderContact() {
  const contactHTML = `
    <div>
      <!-- Hero Section -->
      <section class="about-hero text-white py-5">
        <div class="container text-center py-5">
          <h1 class="display-3 fw-bold text-accent mb-5">
            ${i18n.t('contact.title') || 'Контакти'}
          </h1>
        </div>
      </section>

<!-- Contact Information Section -->
<section class="bg-dark py-5">
    <div class="container py-4">
        <div class="row g-4 mb-5">
            <!-- Address -->
            <div class="col-md-4">
                <div class="contact-card text-center">
                    <div class="contact-icon mb-3">
                        <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                    </div>
                    <h3 class="h5 text-accent mb-3">${i18n.t('contact.address') || 'Адрес'}</h3>
                    <p class="text-muted mb-0">ул. "Васил Левски" 123<br>Плевен, България</p>
                </div>
            </div>

            <!-- Phone -->
            <div class="col-md-4">
                <div class="contact-card text-center">
                    <div class="contact-icon mb-3">
                        <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                    </div>
                    <h3 class="h5 text-accent mb-3">${i18n.t('contact.phone') || 'Телефон'}</h3>
                    <p class="text-muted mb-0">+359 888 123 456</p>
                </div>
            </div>

            <!-- Hours -->
            <div class="col-md-4">
                <div class="contact-card text-center">
                    <div class="contact-icon mb-3">
                        <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <h3 class="h5 text-accent mb-3">${i18n.t('contact.hours') || 'Работно време'}</h3>
                    <p class="text-muted mb-1">Пон - Пет: 17:00 - 21:00</p>
                    <p class="text-muted mb-1">Събота: 10:00 - 14:00</p>
                    <p class="text-muted mb-0">Неделя: Почивен ден</p>
                </div>
            </div>
        </div>
    </div>
</section>
</div>
`;

render('#app', contactHTML);
attachContactEvents();
}

/**
* Attach event listeners
*/
function attachContactEvents() {
const form = document.getElementById('contact-form');
const submitBtn = document.getElementById('submit-btn');

if (form) {
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (!form.checkValidity()) {
            form.classList.add('was-validated');
            return;
        }

        const name = document.getElementById('name').value;
        const email = document.getElementById('contact-email').value;
        const message = document.getElementById('message').value;

        submitBtn.disabled = true;
        submitBtn.textContent = i18n.t('contact.form.sending') || 'Изпращане...';
        loading.show();

        try {
            await dataService.createSubmission({ name, email, message });

            toast.success(i18n.t('contact.form.success') || 'Съобщението е изпратено успешно!');
            form.reset();
            form.classList.remove('was-validated');
        } catch (error) {
            console.error('Contact form error:', error);
            toast.error(i18n.t('contact.form.error') || 'Грешка при изпращане. Моля, опитайте отново.');
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = i18n.t('contact.form.send') || 'Изпрати';
            loading.hide();
        }
    });
}
}
