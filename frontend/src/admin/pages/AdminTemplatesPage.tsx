import { useEffect, useState } from 'react';
import { Pencil, Plus, Sparkles, Trash2 } from 'lucide-react';
import { AdminPageHeader, AdminEmptyState, StatusPill, Toggle } from '@/admin/components/AdminPrimitives';
import { Skeleton } from '@/components/ui/AdvancedComponents';
import { Modal } from '@/components/ui/AdvancedComponents';
import { Button, Input, TextArea } from '@/components/ui/BaseComponents';
import { useAppStore } from '@/stores/appStore';
import {
  deleteTemplate,
  fetchAdminTemplates,
  saveTemplate,
  setTemplatePublished,
} from '@/admin/services/adminApi';
import type { AdminTemplate } from '@/admin/types';
import { formatDate } from '@/utils';

const EMPTY_DRAFT: AdminTemplate = {
  id: '',
  name: '',
  category: '',
  description: '',
  content: '',
  published: false,
  usageCount: 0,
  createdAt: '',
  updatedAt: '',
  author: '',
};

export const AdminTemplatesPage = () => {
  const [templates, setTemplates] = useState<AdminTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [draft, setDraft] = useState<AdminTemplate>(EMPTY_DRAFT);
  const [saving, setSaving] = useState(false);
  const addToast = useAppStore((s) => s.addToast);

  useEffect(() => {
    fetchAdminTemplates().then((res) => {
      setTemplates(res);
      setLoading(false);
    });
  }, []);

  const openCreate = () => {
    setDraft({ ...EMPTY_DRAFT, id: `tpl-${Date.now()}` });
    setModalOpen(true);
  };

  const openEdit = (template: AdminTemplate) => {
    setDraft(template);
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!draft.name.trim() || !draft.content.trim()) {
      addToast('Name and prompt content are required', 'error');
      return;
    }
    setSaving(true);
    const now = new Date().toISOString();
    const isNew = !templates.some((t) => t.id === draft.id);
    const payload: AdminTemplate = {
      ...draft,
      createdAt: isNew ? now : draft.createdAt,
      updatedAt: now,
      author: draft.author || 'Aditya',
    };
    const saved = await saveTemplate(payload);
    setTemplates((prev) => (isNew ? [saved, ...prev] : prev.map((t) => (t.id === saved.id ? saved : t))));
    addToast(isNew ? 'Template created' : 'Template updated', 'success');
    setSaving(false);
    setModalOpen(false);
  };

  const handleDelete = async (template: AdminTemplate) => {
    await deleteTemplate(template.id);
    setTemplates((prev) => prev.filter((t) => t.id !== template.id));
    addToast(`Deleted "${template.name}"`, 'info');
  };

  const handleTogglePublished = async (template: AdminTemplate, published: boolean) => {
    setTemplates((prev) => prev.map((t) => (t.id === template.id ? { ...t, published } : t)));
    await setTemplatePublished(template.id, published);
  };

  return (
    <>
      <AdminPageHeader
        title="Templates"
        description="Curate the prompt templates available to users in the prompt editor."
        actions={
          <Button size="sm" onClick={openCreate}>
            <Plus size={15} />
            New template
          </Button>
        }
      />

      {loading ? (
        <Skeleton className="h-32" count={4} />
      ) : templates.length === 0 ? (
        <AdminEmptyState
          icon={<Sparkles size={28} />}
          title="No templates yet"
          description="Create a prompt template to help users get started faster."
          action={<Button size="sm" onClick={openCreate}>New template</Button>}
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {templates.map((template) => (
            <div key={template.id} className="rounded-xl border border-dark-700 bg-dark-900/60 p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="truncate font-semibold text-white">{template.name}</h3>
                    <span className="rounded-full bg-dark-800 px-2 py-0.5 text-[10px] uppercase tracking-wide text-dark-400">
                      {template.category}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-dark-400">{template.description}</p>
                </div>
                <StatusPill tone={template.published ? 'success' : 'neutral'}>
                  {template.published ? 'Published' : 'Draft'}
                </StatusPill>
              </div>

              <pre className="mt-3 max-h-20 overflow-hidden rounded-lg bg-dark-950 p-3 text-xs text-dark-400">
                {template.content}
              </pre>

              <div className="mt-4 flex items-center justify-between">
                <div className="flex items-center gap-4 text-xs text-dark-500">
                  <span>{template.usageCount.toLocaleString()} uses</span>
                  <span>Updated {formatDate(template.updatedAt)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Toggle checked={template.published} onChange={(v) => handleTogglePublished(template, v)} />
                  <button
                    type="button"
                    onClick={() => openEdit(template)}
                    className="rounded-md p-1.5 text-dark-500 transition-colors hover:bg-dark-800 hover:text-white"
                  >
                    <Pencil size={15} />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(template)}
                    className="rounded-md p-1.5 text-dark-500 transition-colors hover:bg-dark-800 hover:text-rose-400"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={templates.some((t) => t.id === draft.id) ? 'Edit template' : 'New template'}
        size="lg"
        footer={
          <>
            <Button variant="secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button isLoading={saving} onClick={handleSave}>
              Save template
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Name"
              value={draft.name}
              onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
              placeholder="Cinematic Portrait"
            />
            <Input
              label="Category"
              value={draft.category}
              onChange={(e) => setDraft((d) => ({ ...d, category: e.target.value }))}
              placeholder="Portrait"
            />
          </div>
          <Input
            label="Description"
            value={draft.description}
            onChange={(e) => setDraft((d) => ({ ...d, description: e.target.value }))}
            placeholder="One line shown to users in the template picker"
          />
          <TextArea
            label="Prompt content"
            value={draft.content}
            onChange={(e) => setDraft((d) => ({ ...d, content: e.target.value }))}
            placeholder="Use {subject} as a placeholder users will fill in"
            rows={4}
            maxLength={1000}
            showCharCount
          />
        </div>
      </Modal>
    </>
  );
};
