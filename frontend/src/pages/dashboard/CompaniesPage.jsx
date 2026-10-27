import React, { useState, useEffect } from 'react';
import GlassCard from '../../components/ui/GlassCard.jsx';
import Button from '../../components/ui/Button.jsx';
import Modal from '../../components/ui/Modal.jsx';
import Input from '../../components/ui/Input.jsx';
import companiesService from '../../services/companiesService.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
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
  ExternalLink,
  MapPin,
} from 'lucide-react';
import { ContactActionButtons } from '../../components/ui/ContactActionButtons.jsx';

export default function CompaniesPage() {
  const { activeRole } = useAuth();
  const toast = useToast();
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState(null);
  const [tierFilter, setTierFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Form State
  const [name, setName] = useState('');
  const [industry, setIndustry] = useState('IT Services');
  const [location, setLocation] = useState('Pune');
  const [website, setWebsite] = useState('https://company.example.com');
  const [description, setDescription] = useState('');
  const [tier, setTier] = useState('CORE'); // 'CORE' | 'DREAM' | 'SUPER_DREAM'
  const [logoUrl, setLogoUrl] = useState('');
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const loadCompanies = async () => {
    setLoading(true);
    try {
      const params = {};
      if (tierFilter !== 'ALL') params.tier = tierFilter;
      if (searchQuery.trim()) params.q = searchQuery.trim();

      const res = await companiesService.getCompanies(params);
      const items = res.items || (Array.isArray(res) ? res : []);
      setCompanies(items);
    } catch (err) {
      console.error('Failed to load companies:', err);
      toast.error('Failed to load companies', err.response?.data?.detail || err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCompanies();
  }, [tierFilter, searchQuery]);

  const openCreateCompanyModal = () => {
    setEditingCompany(null);
    setName('');
    setIndustry('IT Services');
    setLocation('Pune');
    setWebsite('https://company.example.com');
    setDescription('Campus Recruitment Partner');
    setTier('CORE');
    setLogoUrl('');
    setFormError('');
    setIsModalOpen(true);
  };

  const openEditCompanyModal = (company) => {
    setEditingCompany(company);
    setName(company.name || '');
    setIndustry(company.industry || 'IT Services');
    setLocation(company.location || '');
    setWebsite(company.website || '');
    setDescription(company.description || '');
    setTier(company.tier || 'CORE');
    setLogoUrl(company.logo_url || '');
    setFormError('');
    setIsModalOpen(true);
  };

  const handleSaveCompany = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setFormError('Company name is required');
      return;
    }
    setFormSubmitting(true);
    setFormError('');
    try {
      const payload = {
        name: name.trim(),
        industry: industry.trim() || null,
        location: location.trim() || null,
        website: website.trim() || null,
        description: description.trim() || null,
        tier: tier.toUpperCase(),
        logo_url: logoUrl.trim() || null,
      };

      if (editingCompany) {
        await companiesService.updateCompany(editingCompany.id, payload);
        toast.success('Company Updated', `${payload.name} (${payload.tier})`);
      } else {
        await companiesService.createCompany(payload);
        toast.success('Company Created', `${payload.name} added to recruiting partners`);
      }
      setIsModalOpen(false);
      loadCompanies();
    } catch (err) {
      const msg = err.response?.data?.detail || err.message || 'Operation failed';
      setFormError(msg);
      toast.error('Save Failed', msg);
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleDeleteCompany = async (companyId, companyName, e) => {
    if (e) e.stopPropagation();
    if (!window.confirm(`Delete partner company "${companyName}"?`)) return;
    try {
      await companiesService.deleteCompany(companyId);
      toast.success('Company Deleted', `${companyName} removed`);
      loadCompanies();
    } catch (err) {
      // 409 Conflict if active jobs/placements exist
      const msg =
        err.response?.data?.detail ||
        err.message ||
        'Cannot delete company with active recruitment drives or placement history.';
      toast.error('Deletion Conflict', msg);
    }
  };

  const filteredCompanies = companies.filter((c) => {
    if (tierFilter !== 'ALL' && c.tier !== tierFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = (c.name || '').toLowerCase().includes(q);
      const matchInd = (c.industry || '').toLowerCase().includes(q);
      const matchLoc = (c.location || '').toLowerCase().includes(q);
      if (!matchName && !matchInd && !matchLoc) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-display font-extrabold text-2xl text-[#0B0B0F] tracking-tight">
            Corporate Hiring Partners
          </h2>
          <p className="text-xs text-[#64748B] mt-0.5">
            Verified corporate recruiters, tier classifications, and campus recruitment drives ({filteredCompanies.length} partners).
          </p>
        </div>

        {(activeRole === 'ADMIN' || activeRole === 'STAFF') && (
          <Button variant="primary" size="sm" icon={Plus} onClick={openCreateCompanyModal}>
            Add Partner Company
          </Button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-black/5 shadow-2xs">
        <div className="flex items-center gap-2">
          <select
            value={tierFilter}
            onChange={(e) => setTierFilter(e.target.value)}
            className="text-xs font-semibold bg-[#F6F6F8] border border-black/10 rounded-full px-3 py-1.5 text-[#0B0B0F] focus:outline-none"
          >
            <option value="ALL">All Placement Tiers</option>
            <option value="CORE">CORE Tier</option>
            <option value="DREAM">DREAM Tier</option>
            <option value="SUPER_DREAM">SUPER_DREAM Tier</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Search company, industry, city..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="text-xs bg-[#F6F6F8] border border-black/10 rounded-full px-3 py-1.5 text-[#0B0B0F] w-48 sm:w-64 focus:outline-none focus:border-[#0B0B0F]"
          />
        </div>
      </div>

      {/* Loading Skeleton */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-64 rounded-3xl bg-slate-100 animate-pulse border border-black/5" />
          ))}
        </div>
      ) : filteredCompanies.length === 0 ? (
        <div className="py-16 text-center text-xs text-slate-400 bg-white rounded-3xl border border-black/5">
          <Building2 className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <p>No companies found matching the active criteria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCompanies.map((company) => {
            const tierStr = company.tier || 'CORE';
            const tierBadgeClass =
              tierStr === 'SUPER_DREAM'
                ? 'bg-amber-100 text-amber-800 border-amber-200'
                : tierStr === 'DREAM'
                ? 'bg-violet-100 text-violet-700 border-violet-200'
                : 'bg-blue-100 text-blue-700 border-blue-200';

            return (
              <GlassCard key={company.id} className="p-6 relative flex flex-col justify-between group">
                <div>
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-white border border-black/10 flex items-center justify-center font-display font-extrabold text-base shadow-xs text-violet-600">
                      {company.name?.charAt(0) || 'C'}
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${tierBadgeClass}`}>
                        {tierStr.replace('_', ' ')}
                      </span>
                    </div>
                  </div>

                  <h3 className="font-display font-bold text-lg text-[#0B0B0F] group-hover:text-violet-600 transition-colors">
                    {company.name}
                  </h3>
                  <p className="text-xs text-[#64748B] mb-2 line-clamp-2">
                    {company.description || company.industry || 'Recruiting Partner'}
                  </p>

                  <div className="flex flex-wrap items-center gap-2 text-[11px] text-[#475569] mt-3">
                    {company.industry && (
                      <span className="text-[10px] font-bold uppercase tracking-wider text-violet-700 bg-violet-50 px-2.5 py-0.5 rounded-full">
                        {company.industry}
                      </span>
                    )}
                    {company.location && (
                      <span className="flex items-center gap-1 text-[#64748B]">
                        <MapPin className="w-3 h-3" />
                        {company.location}
                      </span>
                    )}
                  </div>
                </div>

                <div className="pt-4 mt-5 border-t border-black/5 flex items-center justify-between gap-2 text-xs">
                  {company.website ? (
                    <a
                      href={company.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-violet-600 hover:underline flex items-center gap-1 text-xs font-semibold"
                    >
                      Website
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  ) : (
                    <span className="text-slate-400 text-xs">No website</span>
                  )}

                  {(activeRole === 'ADMIN' || activeRole === 'STAFF') && (
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => openEditCompanyModal(company)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-100 hover:bg-slate-200 text-[#0B0B0F] transition-colors"
                      >
                        <Edit3 className="w-3 h-3" />
                        Edit
                      </button>
                      {activeRole === 'ADMIN' && (
                        <button
                          type="button"
                          onClick={(e) => handleDeleteCompany(company.id, company.name, e)}
                          className="p-1 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50 transition-colors"
                          title="Delete company"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </GlassCard>
            );
          })}
        </div>
      )}

      {/* CREATE / EDIT COMPANY MODAL */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingCompany ? 'Edit Partner Company' : 'Onboard Partner Company'}
        maxWidth="max-w-md"
      >
        <form onSubmit={handleSaveCompany} className="space-y-4 pt-2">
          <Input
            label="Company Name"
            placeholder="TechNova Solutions"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#0B0B0F] mb-1.5">
                Placement Tier
              </label>
              <select
                value={tier}
                onChange={(e) => setTier(e.target.value)}
                className="w-full bg-white border border-black/10 rounded-xl px-3 py-2 text-xs font-semibold text-[#0B0B0F] focus:outline-none"
              >
                <option value="CORE">CORE Tier</option>
                <option value="DREAM">DREAM Tier</option>
                <option value="SUPER_DREAM">SUPER_DREAM Tier</option>
              </select>
            </div>
            <Input
              label="Industry / Domain"
              placeholder="IT Services"
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Location / HQ"
              placeholder="Pune, India"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
            <Input
              label="Website URL"
              placeholder="https://company.example.com"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#0B0B0F] mb-1.5">
              Description / Overview
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Overview of hiring needs, technical stack and profile..."
              className="w-full bg-white border border-black/10 rounded-xl p-3 text-xs text-[#0B0B0F] focus:outline-none"
            />
          </div>

          {formError && (
            <p className="text-xs text-rose-600 bg-rose-50 border border-rose-200 px-3 py-2 rounded-xl">
              {formError}
            </p>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" size="md" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="md" type="submit" loading={formSubmitting}>
              {editingCompany ? 'Save Changes' : 'Onboard Company'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
