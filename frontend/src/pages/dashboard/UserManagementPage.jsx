import React, { useState, useEffect } from 'react';
import GlassCard from '../../components/ui/GlassCard.jsx';
import StatCard from '../../components/ui/StatCard.jsx';
import DataTable from '../../components/ui/DataTable.jsx';
import Button from '../../components/ui/Button.jsx';
import Modal from '../../components/ui/Modal.jsx';
import Input from '../../components/ui/Input.jsx';
import Avatar from '../../components/ui/Avatar.jsx';
import { mockApi } from '../../services/mockApi.js';
import { useAuth } from '../../context/AuthContext.jsx';
import {
  Users,
  UserPlus,
  ShieldCheck,
  Briefcase,
  Edit3,
  Power,
  CheckCircle2,
  XCircle,
  GraduationCap,
} from 'lucide-react';
import { ContactActionButtons } from '../../components/ui/ContactActionButtons.jsx';

export default function UserManagementPage() {
  const { showToast, refreshStudentsCache } = useAuth();
  const [activeTab, setActiveTab] = useState('staff'); // 'staff' | 'students'
  const [staffAccounts, setStaffAccounts] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  // Create / Edit Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState(null);
  const [formRole, setFormRole] = useState('STAFF'); // 'STAFF' | 'ADMIN' | 'STUDENT'
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formRollOrId, setFormRollOrId] = useState('');
  const [formPhone, setFormPhone] = useState('+91 98200 12345');
  const [formDepartment, setFormDepartment] = useState('Computer Science');
  const [formTitle, setFormTitle] = useState('Placement Coordinator (TPO)');
  const [formCgpa, setFormCgpa] = useState('8.5');
  const [formBacklogs, setFormBacklogs] = useState('0');

  useEffect(() => {
    loadAllAccounts();
  }, []);

  async function loadAllAccounts() {
    setLoading(true);
    try {
      const [stf, std] = await Promise.all([
        mockApi.getStaffAccounts(),
        mockApi.getStudents(),
      ]);
      setStaffAccounts(stf);
      setStudents(std);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const openCreateModal = (defaultRole = activeTab === 'staff' ? 'STAFF' : 'STUDENT') => {
    setEditingAccount(null);
    setFormRole(defaultRole);
    setFormName('');
    setFormEmail('');
    setFormRollOrId(defaultRole === 'STUDENT' ? '21CS145' : 'CDC-TPO-031');
    setFormPhone('+91 98200 54321');
    setFormDepartment(
      defaultRole === 'STUDENT' ? 'Computer Science' : 'Training & Placement Office (TPO)'
    );
    setFormTitle('Placement Coordinator (TPO)');
    setFormCgpa('8.6');
    setFormBacklogs('0');
    setIsModalOpen(true);
  };

  const openEditModal = (account, roleType) => {
    setEditingAccount(account);
    setFormRole(roleType);
    setFormName(account.name || '');
    setFormEmail(account.email || '');
    setFormRollOrId(account.roll_number || '');
    setFormPhone(account.phone || '+91 98200 00000');
    setFormDepartment(account.department || 'Computer Science');
    setFormTitle(account.title || 'Placement Coordinator (TPO)');
    setFormCgpa(String(account.cgpa ?? 8.5));
    setFormBacklogs(String(account.active_backlogs ?? 0));
    setIsModalOpen(true);
  };

  const handleSaveAccount = async (e) => {
    e.preventDefault();
    if (!formName.trim() || !formEmail.trim()) return;

    if (editingAccount) {
      await mockApi.updateUserAccount(editingAccount.id, formRole, {
        name: formName.trim(),
        email: formEmail.trim(),
        roll_number: formRollOrId.trim(),
        phone: formPhone.trim(),
        department: formDepartment,
        title: formTitle.trim(),
        ...(formRole === 'STUDENT'
          ? {
              cgpa: parseFloat(formCgpa) || 8.0,
              active_backlogs: parseInt(formBacklogs, 10) || 0,
            }
          : {}),
      });
      showToast(`Updated account: ${formName}`);
    } else {
      await mockApi.createUserAccount({
        role: formRole,
        name: formName.trim(),
        email: formEmail.trim(),
        roll_number: formRollOrId.trim(),
        phone: formPhone.trim(),
        department: formDepartment,
        title: formTitle.trim(),
        cgpa: parseFloat(formCgpa) || 8.4,
        active_backlogs: parseInt(formBacklogs, 10) || 0,
      });
      showToast(`Created new ${formRole} account: ${formName}`);
    }

    await loadAllAccounts();
    await refreshStudentsCache();
    setIsModalOpen(false);
  };

  const handleToggleAccountStatus = async (account, roleType) => {
    const updated = await mockApi.toggleUserAccountStatus(account.id, roleType);
    await loadAllAccounts();
    await refreshStudentsCache();
    showToast(
      `${updated.name} is now ${updated.account_status}`,
      updated.account_status === 'ACTIVE' ? 'success' : 'warning'
    );
  };

  const staffColumns = [
    {
      header: 'Staff / Admin Member',
      accessor: 'name',
      render: (row) => (
        <div className="flex items-center gap-3">
          <Avatar src={row.photo_url || row.avatar} name={row.name} size="sm" />
          <div>
            <div className="flex items-center gap-1.5">
              <p className="font-bold text-xs text-[#0B0B0F]">{row.name}</p>
              <span
                className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full ${
                  row.role === 'ADMIN'
                    ? 'bg-violet-100 text-violet-800'
                    : 'bg-blue-100 text-blue-800'
                }`}
              >
                {row.role}
              </span>
            </div>
            <p className="text-[11px] text-[#64748B]">
              {row.email} · {row.roll_number}
            </p>
          </div>
        </div>
      ),
    },
    {
      header: 'Designation & Office',
      accessor: 'title',
      render: (row) => (
        <div>
          <p className="text-xs font-bold text-[#0B0B0F]">{row.title}</p>
          <p className="text-[11px] text-[#64748B]">{row.department}</p>
        </div>
      ),
    },
    {
      header: 'Account Status',
      accessor: 'account_status',
      render: (row) => {
        const isActive = (row.account_status || 'ACTIVE') === 'ACTIVE';
        return (
          <span
            className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full border ${
              isActive
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-rose-50 text-rose-700 border-rose-200'
            }`}
          >
            {isActive ? (
              <CheckCircle2 className="w-3 h-3" />
            ) : (
              <XCircle className="w-3 h-3" />
            )}
            {row.account_status || 'ACTIVE'}
          </span>
        );
      },
    },
    {
      header: 'Actions',
      sortable: false,
      align: 'right',
      render: (row) => (
        <div className="flex flex-wrap items-center justify-end gap-2">
          <ContactActionButtons
            compact
            target={{
              id: row.id,
              name: row.name,
              role: row.role,
              phone: row.phone,
              email: row.email,
              subtitle: `${row.title || row.role} · ${row.department}`,
            }}
            subject={`CDC Governance Message — ${row.name}`}
          />
          <Button
            variant="secondary"
            size="sm"
            icon={Edit3}
            onClick={(e) => {
              e.stopPropagation();
              openEditModal(row, row.role);
            }}
          >
            Edit
          </Button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleToggleAccountStatus(row, row.role);
            }}
            className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-colors flex items-center gap-1 ${
              (row.account_status || 'ACTIVE') === 'ACTIVE'
                ? 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
            }`}
          >
            <Power className="w-3 h-3" />
            {(row.account_status || 'ACTIVE') === 'ACTIVE' ? 'Deactivate' : 'Activate'}
          </button>
        </div>
      ),
    },
  ];

  const studentColumns = [
    {
      header: 'Student Account',
      accessor: 'name',
      render: (row) => (
        <div className="flex items-center gap-3">
          <Avatar src={row.photo_url || row.avatar} name={row.name} size="sm" />
          <div>
            <p className="font-bold text-xs text-[#0B0B0F]">{row.name}</p>
            <p className="text-[11px] text-[#64748B]">
              {row.roll_number} · {row.email}
            </p>
          </div>
        </div>
      ),
    },
    {
      header: 'Department & CGPA',
      accessor: 'department',
      render: (row) => (
        <div>
          <p className="text-xs font-semibold text-[#0B0B0F]">{row.department}</p>
          <p className="text-[11px] text-[#64748B]">
            CGPA: <strong>{row.cgpa}</strong> · Backlogs: {row.active_backlogs ?? 0}
          </p>
        </div>
      ),
    },
    {
      header: 'Account Status',
      accessor: 'account_status',
      render: (row) => {
        const isActive = (row.account_status || 'ACTIVE') === 'ACTIVE';
        return (
          <span
            className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full border ${
              isActive
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-rose-50 text-rose-700 border-rose-200'
            }`}
          >
            {isActive ? (
              <CheckCircle2 className="w-3 h-3" />
            ) : (
              <XCircle className="w-3 h-3" />
            )}
            {row.account_status || 'ACTIVE'}
          </span>
        );
      },
    },
    {
      header: 'Actions',
      sortable: false,
      align: 'right',
      render: (row) => (
        <div className="flex flex-wrap items-center justify-end gap-2">
          <ContactActionButtons
            compact
            target={{
              id: row.id,
              name: row.name,
              role: 'STUDENT',
              phone: row.phone,
              email: row.email,
              subtitle: `${row.roll_number} · ${row.department}`,
            }}
            subject={`Student Account Notice — ${row.name}`}
          />
          <Button
            variant="secondary"
            size="sm"
            icon={Edit3}
            onClick={(e) => {
              e.stopPropagation();
              openEditModal(row, 'STUDENT');
            }}
          >
            Edit
          </Button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleToggleAccountStatus(row, 'STUDENT');
            }}
            className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-colors flex items-center gap-1 ${
              (row.account_status || 'ACTIVE') === 'ACTIVE'
                ? 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
            }`}
          >
            <Power className="w-3 h-3" />
            {(row.account_status || 'ACTIVE') === 'ACTIVE' ? 'Deactivate' : 'Activate'}
          </button>
        </div>
      ),
    },
  ];

  if (loading) {
    return (
      <div className="h-96 flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-violet-600 border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full bg-violet-100 text-violet-800">
            Admin-Only Governance
          </span>
          <h2 className="font-display font-bold text-2xl text-[#0B0B0F] mt-1">
            Placement Staff & User Account Management
          </h2>
          <p className="text-xs text-[#64748B]">
            Create, edit, and activate or deactivate fictional Placement Staff (TPO) and Student accounts
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="secondary"
            size="sm"
            icon={GraduationCap}
            onClick={() => openCreateModal('STUDENT')}
          >
            New Student Account
          </Button>
          <Button
            variant="primary"
            size="sm"
            icon={UserPlus}
            onClick={() => openCreateModal('STAFF')}
          >
            New Placement Staff
          </Button>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <StatCard
          title="Placement Staff & Admins"
          value={staffAccounts.length}
          suffix="Accounts"
          trend={`${staffAccounts.filter((s) => s.account_status !== 'DEACTIVATED').length} Active`}
          trendPositive={true}
          icon={Briefcase}
          accentColor="lavender"
        />
        <StatCard
          title="Enrolled Student Accounts"
          value={students.length}
          suffix="Candidates"
          trend={`${students.filter((s) => s.account_status !== 'DEACTIVATED').length} Active`}
          trendPositive={true}
          icon={Users}
          accentColor="mint"
        />
        <StatCard
          title="Deactivated Accounts"
          value={
            staffAccounts.filter((s) => s.account_status === 'DEACTIVATED').length +
            students.filter((s) => s.account_status === 'DEACTIVATED').length
          }
          suffix="Suspended"
          trend="Instant access revocation"
          trendPositive={true}
          icon={ShieldCheck}
          accentColor="yellow"
        />
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 bg-white/80 backdrop-blur-md p-1.5 rounded-full border border-black/5 w-fit">
        <button
          type="button"
          onClick={() => setActiveTab('staff')}
          className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
            activeTab === 'staff'
              ? 'bg-[#0B0B0F] text-white shadow-xs'
              : 'text-[#64748B] hover:text-[#0B0B0F]'
          }`}
        >
          Placement Staff & Admins ({staffAccounts.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('students')}
          className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
            activeTab === 'students'
              ? 'bg-[#0B0B0F] text-white shadow-xs'
              : 'text-[#64748B] hover:text-[#0B0B0F]'
          }`}
        >
          Student Accounts ({students.length})
        </button>
      </div>

      {/* Table */}
      {activeTab === 'staff' ? (
        <DataTable
          columns={staffColumns}
          data={staffAccounts}
          searchPlaceholder="Search staff accounts by name, email, or employee ID..."
        />
      ) : (
        <DataTable
          columns={studentColumns}
          data={students}
          searchPlaceholder="Search student accounts by name, roll number, or email..."
        />
      )}

      {/* Create / Edit Account Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={
          editingAccount
            ? `Edit ${formRole} Account — ${editingAccount.name}`
            : `Create Fictional ${formRole} Account`
        }
        subtitle="Changes persist in the centralized frontend mock store"
      >
        <form onSubmit={handleSaveAccount} className="space-y-4">
          {!editingAccount && (
            <div>
              <label className="block text-xs font-semibold text-[#475569] mb-1">
                Account Role Type
              </label>
              <select
                value={formRole}
                onChange={(e) => setFormRole(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-2xl border border-black/15 text-xs font-bold text-[#0B0B0F] bg-white outline-none"
              >
                <option value="STAFF">STAFF — Placement Staff (TPO)</option>
                <option value="STUDENT">STUDENT — Graduating Candidate</option>
                <option value="ADMIN">ADMIN — CDC Administrator</option>
              </select>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Full Name"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              placeholder="e.g. Dr. Kavita Nair"
              required
            />
            <Input
              label="Campus Email"
              type="email"
              value={formEmail}
              onChange={(e) => setFormEmail(e.target.value)}
              placeholder="e.g. kavita.tpo@placetrack.edu"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label={formRole === 'STUDENT' ? 'Roll Number' : 'Staff / Employee ID'}
              value={formRollOrId}
              onChange={(e) => setFormRollOrId(e.target.value)}
              placeholder={formRole === 'STUDENT' ? '21CS145' : 'CDC-TPO-031'}
              required
            />
            <Input
              label="Phone Number"
              value={formPhone}
              onChange={(e) => setFormPhone(e.target.value)}
              placeholder="+91 98200 12345"
            />
          </div>

          {formRole === 'STUDENT' ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#475569] mb-1">
                  Department
                </label>
                <select
                  value={formDepartment}
                  onChange={(e) => setFormDepartment(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-2xl border border-black/15 text-xs font-bold text-[#0B0B0F] bg-white outline-none"
                >
                  <option value="Computer Science">Computer Science</option>
                  <option value="Information Tech.">Information Tech.</option>
                  <option value="Electronics & Comm.">Electronics & Comm.</option>
                  <option value="Mechanical Eng.">Mechanical Eng.</option>
                </select>
              </div>
              <Input
                label="Verified CGPA"
                type="number"
                step="0.1"
                value={formCgpa}
                onChange={(e) => setFormCgpa(e.target.value)}
              />
              <Input
                label="Active Backlogs"
                type="number"
                value={formBacklogs}
                onChange={(e) => setFormBacklogs(e.target.value)}
              />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Official Title / Designation"
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                placeholder="Placement Coordinator (TPO)"
              />
              <Input
                label="Office / Department"
                value={formDepartment}
                onChange={(e) => setFormDepartment(e.target.value)}
                placeholder="Training & Placement Office (TPO)"
              />
            </div>
          )}

          <div className="pt-3 flex justify-end gap-2">
            <Button variant="ghost" type="button" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              {editingAccount ? 'Save Account Changes' : `Create ${formRole} Account`}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
