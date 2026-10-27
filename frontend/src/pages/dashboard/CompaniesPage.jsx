import React, { useState, useEffect } from 'react';
import GlassCard from '../../components/ui/GlassCard.jsx';
import Button from '../../components/ui/Button.jsx';
import Modal from '../../components/ui/Modal.jsx';
import Input from '../../components/ui/Input.jsx';
import { mockApi } from '../../services/mockApi.js';
import { useAuth } from '../../context/AuthContext.jsx';
import {
  Star,
  Users,
  Plus,
  Mail,
  Phone,
  User,
  Trash2,
  Building2,
  Edit3,
} from 'lucide-react';
import { ContactActionButtons } from '../../components/ui/ContactActionButtons.jsx';

export default function CompaniesPage() {
  const { activeRole, showToast } = useAuth();
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState(null);

  // Admin Company Form State (Requirement 5)
  const [name, setName] = useState('');
  const [tagline, setTagline] = useState('');
  const [sector, setSector] = useState('Enterprise Software');
  const [tier, setTier] = useState('Dream'); // 'Core' | 'Dream' | 'Super Dream'
  const [logoUrl, setLogoUrl] = useState('');
  const [avgLpa, setAvgLpa] = useState('16.0');
  const [highestLpa, setHighestLpa] = useState('22.0');
  const [hrContacts, setHrContacts] = useState([
    { name: 'Ananya Deshmukh', email: 'hr@company.com', phone: '+91 98201 12345' },
  ]);

  useEffect(() => {
    async function load() {
      try {
        const data = await mockApi.getCompanies();
        setCompanies(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleAddHrContact = () => {
    setHrContacts((prev) => [...prev, { name: '', email: '', phone: '' }]);
  };

  const handleUpdateHrContact = (index, field, value) => {
    setHrContacts((prev) =>
      prev.map((c, i) => (i === index ? { ...c, [field]: value } : c))
    );
  };

  const handleRemoveHrContact = (index) => {
    setHrContacts((prev) => prev.filter((_, i) => i !== index));
  };

  const openCreateCompanyModal = () => {
    setEditingCompany(null);
    setName('');
    setTagline('');
    setSector('Enterprise Software');
    setTier('Dream');
    setLogoUrl('');
    setAvgLpa('16.0');
    setHighestLpa('22.0');
    setHrContacts([
      { name: 'Ananya Deshmukh', email: 'hr@company.com', phone: '+91 98201 12345' },
    ]);
    setIsModalOpen(true);
  };

  const openEditCompanyModal = (company) => {
    setEditingCompany(company);
    setName(company.name || '');
    setTagline(company.tagline || '');
    setSector(company.sector || 'Enterprise Software');
    setTier(company.tier || 'Dream');
    setLogoUrl(company.logo_url || '');
    setAvgLpa(String(company.avg_package_lpa ?? company.avgPackageLPA ?? 15.0));
    setHighestLpa(String(company.highest_package_lpa ?? company.highestPackageLPA ?? 20.0));
    setHrContacts(
      Array.isArray(company.hr_contacts) && company.hr_contacts.length > 0
        ? company.hr_contacts.map((c) => ({ ...c }))
        : [{ name: '', email: '', phone: '' }]
    );
    setIsModalOpen(true);
  };

  const handleCreateCompany = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    const validContacts = hrContacts.filter(
      (c) => c.name.trim() || c.email.trim() || c.phone.trim()
    );
    if (editingCompany) {
      const updated = await mockApi.updateCompany(editingCompany.id, {
        name: name.trim(),
        tagline: tagline.trim() || 'Campus Recruitment Partner',
        sector,
        tier,
        logo_url: logoUrl.trim(),
        hr_contacts: validContacts,
        avg_package_lpa: parseFloat(avgLpa) || 14.0,
        highest_package_lpa: parseFloat(highestLpa) || 18.0,
      });
      setCompanies((prev) =>
        prev.map((c) => (c.id === editingCompany.id ? updated : c))
      );
      setIsModalOpen(false);
      setEditingCompany(null);
      showToast(`Updated partner company: ${updated.name}`);
      return;
    }

    const created = await mockApi.createCompany({
      name: name.trim(),
      tagline: tagline.trim() || 'Campus Recruitment Partner',
      sector,
      tier,
      logo_url: logoUrl.trim(),
      hr_contacts: validContacts,
      avg_package_lpa: parseFloat(avgLpa) || 14.0,
      highest_package_lpa: parseFloat(highestLpa) || 18.0,
    });
    setCompanies([created, ...companies]);
    setIsModalOpen(false);
    setName('');
    setTagline('');
    setLogoUrl('');
    setHrContacts([{ name: '', email: '', phone: '' }]);
    showToast(`Onboarded ${created.name} (${created.tier} Tier)`);
  };

  if (loading) {
    return (
      <div className="h-96 flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-violet-600 border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-display font-bold text-2xl text-[#0B0B0F]">
            Corporate Hiring Partners
          </h2>
          <p className="text-xs text-[#64748B]">
            Verified recruiting corporations, tier classification, HR contacts, and salary benchmarks
          </p>
        </div>

        {(activeRole === 'ADMIN' || activeRole === 'STAFF') && (
          <Button
            variant="primary"
            size="sm"
            icon={Plus}
            onClick={openCreateCompanyModal}
          >
            Add Partner Company
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {companies.map((company) => (
          <GlassCard
            key={company.id}
            variant="white"
            hoverEffect={true}
            className="p-6 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between mb-4">
                {company.logo_url ? (
                  <img
                    src={company.logo_url}
                    alt={company.name}
                    className="w-12 h-12 rounded-2xl object-cover border border-black/10 shadow-xs"
                  />
                ) : (
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center font-display font-black text-sm shadow-xs"
                    style={{
                      backgroundColor: company.accent_bg || company.accentBg || '#EDE9FE',
                      color: company.accent_color || company.accentColor || '#6D28D9',
                    }}
                  >
                    {company.logo_letter || company.logoLetter}
                  </div>
                )}

                <div className="flex items-center gap-1.5">
                  <span
                    className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                      company.tier === 'Super Dream'
                        ? 'bg-amber-100 text-amber-800'
                        : company.tier === 'Dream'
                        ? 'bg-violet-100 text-violet-700'
                        : 'bg-blue-100 text-blue-700'
                    }`}
                  >
                    {company.tier || 'Dream'}
                  </span>
                  <div className="flex items-center gap-1 text-xs font-bold text-amber-500 bg-amber-50 px-2.5 py-1 rounded-full">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span>{company.rating}</span>
                  </div>
                </div>
              </div>

              <h3 className="font-display font-bold text-lg text-[#0B0B0F]">
                {company.name}
              </h3>
              <p className="text-xs text-[#64748B] mb-2">{company.tagline}</p>
              <span className="text-[10px] font-bold uppercase tracking-wider text-violet-700 bg-violet-50 px-2.5 py-0.5 rounded-full">
                {company.sector}
              </span>

              {/* Package stats grid */}
              <div className="grid grid-cols-2 gap-3 mt-5 p-3 rounded-2xl bg-[#F9F9FB] border border-black/5 text-xs">
                <div>
                  <span className="text-[10px] text-[#64748B] font-semibold block uppercase">
                    Average CTC
                  </span>
                  <span className="font-display font-bold text-sm text-[#0B0B0F]">
                    {company.avg_package_lpa ?? company.avgPackageLPA} LPA
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-[#64748B] font-semibold block uppercase">
                    Highest Package
                  </span>
                  <span className="font-display font-bold text-sm text-emerald-600">
                    {company.highest_package_lpa ?? company.highestPackageLPA} LPA
                  </span>
                </div>
              </div>

              {/* HR Contacts List (Requirement 5) */}
              {company.hr_contacts && company.hr_contacts.length > 0 && (
                <div className="mt-4 pt-3 border-t border-black/5 space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748B] block">
                    HR Points of Contact ({company.hr_contacts.length})
                  </span>
                  <div className="space-y-2">
                    {company.hr_contacts.map((hr, i) => (
                      <div
                        key={i}
                        className="p-2.5 rounded-xl bg-slate-50 border border-black/5 text-[11px] flex flex-col gap-1.5"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-bold text-[#0B0B0F] flex items-center gap-1.5">
                            <User className="w-3 h-3 text-violet-600" />
                            {hr.name}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-3 text-[#64748B] text-[10px]">
                          <span className="flex items-center gap-1">
                            <Mail className="w-2.5 h-2.5" />
                            {hr.email}
                          </span>
                          <span className="flex items-center gap-1">
                            <Phone className="w-2.5 h-2.5" />
                            {hr.phone || 'Phone not provided'}
                          </span>
                        </div>
                        <div className="pt-1">
                          <ContactActionButtons
                            compact
                            target={{
                              id: `hr-${String(hr.email || hr.name)
                                .toLowerCase()
                                .replace(/[^a-z0-9]+/g, '-')}`,
                              name: `${hr.name} (${company.name} HR)`,
                              role: 'HR_CONTACT',
                              phone: hr.phone || '',
                              email: hr.email || '',
                              subtitle: `${hr.email} · ${company.name}`,
                            }}
                            subject={`Campus Recruitment Coordination — ${company.name}`}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="pt-4 mt-4 border-t border-black/5 flex items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-1.5 text-[#64748B]">
                <Users className="w-3.5 h-3.5" />
                <span>{company.total_hired ?? company.totalHired} students hired</span>
              </div>
              <div className="flex items-center gap-2">
                {(activeRole === 'ADMIN' || activeRole === 'STAFF') && (
                  <button
                    type="button"
                    onClick={() => openEditCompanyModal(company)}
                    className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 hover:bg-slate-200 text-[#0B0B0F] transition-colors cursor-pointer"
                  >
                    <Edit3 className="w-3 h-3" />
                    Edit
                  </button>
                )}
                <span className="font-bold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full">
                  {company.active_drives ?? company.activeDrives} Live Drive
                  {(company.active_drives ?? company.activeDrives) > 1 ? 's' : ''}
                </span>
              </div>
            </div>
          </GlassCard>
        ))}
      </div>

      {/* ADMIN COMPANY FORM MODAL (Requirement 5) */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Onboard Corporate Hiring Partner"
        subtitle="Configure company tier, logo asset, and HR contact directory"
      >
        <form onSubmit={handleCreateCompany} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              variant="pill"
              label="Company Name"
              placeholder="e.g. Atlassian India"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <div>
              <label className="block text-xs font-semibold text-[#475569] mb-1.5">
                Placement Tier
              </label>
              <select
                value={tier}
                onChange={(e) => setTier(e.target.value)}
                className="w-full px-4 py-2.5 rounded-full text-xs font-bold bg-white border border-black/10 text-[#0B0B0F] outline-none"
              >
                <option value="Core">Core Tier</option>
                <option value="Dream">Dream Tier</option>
                <option value="Super Dream">Super Dream Tier</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              variant="pill"
              label="Logo URL (Optional)"
              placeholder="https://logo.clearbit.com/atlassian.com"
              value={logoUrl}
              onChange={(e) => setLogoUrl(e.target.value)}
            />
            <Input
              variant="pill"
              label="Industry Sector"
              placeholder="e.g. Cloud & DevOps"
              value={sector}
              onChange={(e) => setSector(e.target.value)}
            />
          </div>

          <Input
            variant="pill"
            label="Company Tagline"
            placeholder="e.g. Distributed Collaboration & Cloud Systems"
            value={tagline}
            onChange={(e) => setTagline(e.target.value)}
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              variant="pill"
              label="Average CTC (LPA)"
              type="number"
              step="0.5"
              value={avgLpa}
              onChange={(e) => setAvgLpa(e.target.value)}
            />
            <Input
              variant="pill"
              label="Highest CTC (LPA)"
              type="number"
              step="0.5"
              value={highestLpa}
              onChange={(e) => setHighestLpa(e.target.value)}
            />
          </div>

          {/* Dynamic List of HR Contacts */}
          <div className="space-y-3 pt-2 border-t border-black/5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-[#0B0B0F] uppercase tracking-wider">
                HR Contacts (Name, Email, Phone)
              </label>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                icon={Plus}
                onClick={handleAddHrContact}
              >
                Add HR Contact
              </Button>
            </div>

            <div className="space-y-3">
              {hrContacts.map((contact, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-2xl bg-[#F9F9FB] border border-black/5 space-y-2.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-violet-700">
                      HR Contact #{idx + 1}
                    </span>
                    {hrContacts.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveHrContact(idx)}
                        className="text-slate-400 hover:text-rose-600"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <input
                      type="text"
                      placeholder="HR Full Name"
                      value={contact.name}
                      onChange={(e) => handleUpdateHrContact(idx, 'name', e.target.value)}
                      className="px-3 py-2 rounded-xl text-xs bg-white border border-black/10 outline-none"
                      required
                    />
                    <input
                      type="email"
                      placeholder="hr@company.com"
                      value={contact.email}
                      onChange={(e) => handleUpdateHrContact(idx, 'email', e.target.value)}
                      className="px-3 py-2 rounded-xl text-xs bg-white border border-black/10 outline-none"
                      required
                    />
                    <input
                      type="text"
                      placeholder="+91 98201 00000"
                      value={contact.phone}
                      onChange={(e) => handleUpdateHrContact(idx, 'phone', e.target.value)}
                      className="px-3 py-2 rounded-xl text-xs bg-white border border-black/10 outline-none"
                      required
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 flex items-center justify-end gap-3 border-t border-black/5">
            <Button
              variant="secondary"
              size="sm"
              type="button"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit">
              Save Partner Company
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
