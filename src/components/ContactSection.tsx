import React, { useState } from 'react';
import { Mail, MapPin, Phone, Send, CheckCircle2 } from 'lucide-react';
import { CompanyConfig, ContactFormData, ServiceItem } from '../types';

interface ContactSectionProps {
  company: CompanyConfig;
  services: ServiceItem[];
  preselectedServiceId?: string;
  preselectedProjectName?: string;
}

export const ContactSection: React.FC<ContactSectionProps> = ({
  company,
  services,
  preselectedServiceId,
  preselectedProjectName,
}) => {
  const [formData, setFormData] = useState<ContactFormData>({
    name: '',
    email: '',
    phone: '',
    service: preselectedServiceId || 'holzbuehnen',
    region: 'dresden',
    message: preselectedProjectName
      ? `Anfrage zu: ${preselectedProjectName}`
      : '',
  });

  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; email?: string; message?: string }>({});

  React.useEffect(() => {
    if (preselectedServiceId) {
      setFormData((prev) => ({ ...prev, service: preselectedServiceId }));
    }
  }, [preselectedServiceId]);

  React.useEffect(() => {
    if (preselectedProjectName) {
      setFormData((prev) => ({
        ...prev,
        message: `Anfrage bezüglich: ${preselectedProjectName}`,
      }));
    }
  }, [preselectedProjectName]);

  const validate = () => {
    const errs: { name?: string; email?: string; message?: string } = {};
    if (!formData.name.trim()) errs.name = 'Bitte Namen angeben.';
    if (!formData.email.trim()) {
      errs.email = 'Bitte E-Mail angeben.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errs.email = 'Ungültige E-Mail-Adresse.';
    }
    if (!formData.message.trim()) errs.message = 'Bitte Nachricht eingeben.';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitted(true);
  };

  return (
    <section id="kontakt" className="py-20 md:py-28 bg-neutral-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Direct header */}
        <div className="max-w-xl mb-12">
          <div className="text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-2">
            Kontakt & Anfrage
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-neutral-900 tracking-tight">
            Projekt anfragen
          </h2>
          <p className="mt-2 text-base text-neutral-600">
            Schreiben Sie uns oder rufen Sie direkt an für Holzbühnen-Miete oder Festival-Bühnenplanung.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          
          {/* Direct Contact Info */}
          <div className="lg:col-span-5 bg-white p-7 sm:p-8 rounded-2xl border border-neutral-200 space-y-6">
            <h3 className="text-base font-bold text-neutral-900 pb-3 border-b border-neutral-100">
              Kontaktdaten
            </h3>

            <div className="space-y-4 text-sm">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-neutral-100 rounded-lg text-neutral-800 shrink-0 mt-0.5">
                  <Phone className="w-4 h-4 text-[#a4784a]" />
                </div>
                <div>
                  <div className="text-xs text-neutral-500 font-medium">Telefon</div>
                  <a
                    href={`tel:${company.phone.replace(/\s+/g, '')}`}
                    className="font-semibold text-neutral-900 hover:underline block text-base"
                  >
                    {company.phone}
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 bg-neutral-100 rounded-lg text-neutral-800 shrink-0 mt-0.5">
                  <Mail className="w-4 h-4 text-[#5e7c65]" />
                </div>
                <div>
                  <div className="text-xs text-neutral-500 font-medium">E-Mail</div>
                  <a
                    href={`mailto:${company.email}`}
                    className="font-semibold text-neutral-900 hover:underline block"
                  >
                    {company.email}
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 bg-neutral-100 rounded-lg text-neutral-800 shrink-0 mt-0.5">
                  <MapPin className="w-4 h-4 text-[#a4784a]" />
                </div>
                <div>
                  <div className="text-xs text-neutral-500 font-medium">Standort</div>
                  <p className="font-semibold text-neutral-900">
                    {company.name}
                    <br />
                    {company.street}
                    <br />
                    {company.postalCode} {company.city}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Clean Contact Form */}
          <div className="lg:col-span-7">
            {submitted ? (
              <div className="bg-white p-8 rounded-2xl border border-neutral-200 text-center space-y-4">
                <div className="inline-flex p-3 bg-[#5e7c65]/10 text-[#5e7c65] rounded-full">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-neutral-900">
                  Nachricht erhalten
                </h3>
                <p className="text-sm text-neutral-600 max-w-md mx-auto">
                  Vielen Dank für Ihre Anfrage. Wir melden uns zeitnah per E-Mail an <strong>{formData.email}</strong> oder telefonisch bei Ihnen.
                </p>
                <div className="pt-4">
                  <button
                    onClick={() => {
                      setSubmitted(false);
                      setFormData({
                        name: '',
                        email: '',
                        phone: '',
                        service: 'holzbuehnen',
                        region: 'dresden',
                        message: '',
                      });
                    }}
                    className="px-5 py-2 text-xs font-semibold text-neutral-800 bg-neutral-100 hover:bg-neutral-200 rounded-lg cursor-pointer"
                  >
                    Neue Nachricht verfassen
                  </button>
                </div>
              </div>
            ) : (
              <form
                onSubmit={handleSubmit}
                noValidate
                className="bg-white p-7 sm:p-9 rounded-2xl border border-neutral-200 space-y-5"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-neutral-800 mb-1.5">
                      Name *
                    </label>
                    <input
                      type="text"
                      value={formData.name ?? ''}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Ihr Name"
                      className="w-full px-3.5 py-2.5 text-sm bg-neutral-50 border border-neutral-200 rounded-lg focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-neutral-900"
                    />
                    {errors.name && <p className="mt-1 text-xs text-rose-600">{errors.name}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-neutral-800 mb-1.5">
                      E-Mail-Adresse *
                    </label>
                    <input
                      type="email"
                      value={formData.email ?? ''}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="ihre@email.de"
                      className="w-full px-3.5 py-2.5 text-sm bg-neutral-50 border border-neutral-200 rounded-lg focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-neutral-900"
                    />
                    {errors.email && <p className="mt-1 text-xs text-rose-600">{errors.email}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-neutral-800 mb-1.5">
                      Telefonnummer (optional)
                    </label>
                    <input
                      type="tel"
                      value={formData.phone ?? ''}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="z.B. 0157 56660270"
                      className="w-full px-3.5 py-2.5 text-sm bg-neutral-50 border border-neutral-200 rounded-lg focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-neutral-900"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-neutral-800 mb-1.5">
                      Bereich
                    </label>
                    <select
                      value={formData.service ?? 'holzbuehnen'}
                      onChange={(e) => setFormData({ ...formData, service: e.target.value })}
                      className="w-full px-3.5 py-2.5 text-sm bg-neutral-50 border border-neutral-200 rounded-lg focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-neutral-900"
                    >
                      <option value="holzbuehnen">Vermietung modularer Holzbühnen</option>
                      <option value="stage-planung">Stage-Planung für Festivals</option>
                      <option value="beides">Bühnenmiete & Festivalplanung kombiniert</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-800 mb-1.5">
                    Nachricht *
                  </label>
                  <textarea
                    rows={4}
                    value={formData.message ?? ''}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Event-Datum, Ort, gewünschte Bühnengröße (bis 150 m²) oder Anliegen..."
                    className="w-full px-3.5 py-2.5 text-sm bg-neutral-50 border border-neutral-200 rounded-lg focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-neutral-900"
                  />
                  {errors.message && <p className="mt-1 text-xs text-rose-600">{errors.message}</p>}
                </div>

                <button
                  type="submit"
                  className="inline-flex items-center gap-2 px-6 py-3 text-xs font-semibold uppercase tracking-wider text-white bg-neutral-900 hover:bg-neutral-800 rounded-lg transition-colors cursor-pointer"
                >
                  <span>Anfrage senden</span>
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            )}
          </div>

        </div>

      </div>
    </section>
  );
};
