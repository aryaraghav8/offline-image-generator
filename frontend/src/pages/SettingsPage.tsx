import { useState } from 'react';
import { CheckCircle, Eye, EyeOff, Key, Monitor, Save, Server, Settings } from 'lucide-react';
import { useAppStore } from '@/stores/appStore';
import { useSettingsStore } from '@/stores/settingsStore';

const SectionTitle = ({ icon: Icon, label, color }: { icon: typeof Settings; label: string; color: string }) => (
  <div className="mb-4 flex items-center gap-2">
    <div className={`rounded-lg p-1.5 ${color}`}>
      <Icon size={14} className="text-white" />
    </div>
    <h2 className="text-sm font-semibold text-white">{label}</h2>
  </div>
);

const TextField = ({
  label,
  value,
  onChange,
  placeholder,
  secret,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  secret?: boolean;
}) => {
  const [show, setShow] = useState(false);

  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium text-dark-300">{label}</label>
      <div className="relative">
        <input
          type={secret && !show ? 'password' : 'text'}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          className="w-full rounded-xl border border-dark-700 bg-dark-800 px-3 py-2.5 pr-10 font-mono text-sm text-white placeholder:text-dark-500 focus:border-indigo-500 focus:outline-none"
        />
        {secret && (
          <button
            type="button"
            onClick={() => setShow(!show)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-500 transition-colors hover:text-dark-300"
          >
            {show ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>
        )}
      </div>
    </div>
  );
};

const Toggle = ({ label, desc, value, onChange }: { label: string; desc?: string; value: boolean; onChange: (value: boolean) => void }) => (
  <div className="flex items-center justify-between border-b border-dark-700 py-3 last:border-0">
    <div>
      <p className="text-sm font-medium text-dark-300">{label}</p>
      {desc && <p className="mt-0.5 text-xs text-dark-500">{desc}</p>}
    </div>
    <button
      type="button"
      onClick={() => onChange(!value)}
      className={`relative h-5 w-10 flex-shrink-0 rounded-full transition-colors ${value ? 'bg-indigo-500' : 'bg-dark-700'}`}
    >
      <span className={`absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white transition-transform ${value ? 'translate-x-5' : 'translate-x-0'}`} />
    </button>
  </div>
);

export const SettingsPage = () => {
  const settings = useSettingsStore();
  const addToast = useAppStore((state) => state.addToast);
  const [saved, setSaved] = useState(false);

  const save = () => {
    setSaved(true);
    addToast('Settings saved', 'success');
    window.setTimeout(() => setSaved(false), 1800);
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-4 lg:p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-lg font-bold text-white">
            <Settings size={20} className="text-dark-300" />
            Settings
          </h1>
          <p className="mt-0.5 text-sm text-dark-500">Configure your AI Studio workspace</p>
        </div>
        <button
          type="button"
          onClick={save}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-all ${
            saved ? 'border border-emerald-500/30 bg-emerald-500/20 text-emerald-400' : 'btn-plasma text-white'
          }`}
        >
          {saved ? <CheckCircle size={15} /> : <Save size={15} />}
          {saved ? 'Saved' : 'Save Changes'}
        </button>
      </div>

      <section className="space-y-4 rounded-2xl border border-dark-700 bg-dark-800 p-5">
        <SectionTitle icon={Key} label="API" color="bg-indigo-500" />
        <div>
          <label className="mb-1.5 block text-xs font-medium text-dark-300">Provider</label>
          <select
            value={settings.apiSettings.provider}
            onChange={(event) => settings.updateApiSettings({ provider: event.target.value as typeof settings.apiSettings.provider })}
            className="w-full rounded-xl border border-dark-700 bg-dark-900 px-3 py-2.5 text-sm text-white focus:border-indigo-500 focus:outline-none"
          >
            <option value="local">Local</option>
            <option value="openai">OpenAI</option>
            <option value="gemini">Gemini</option>
            <option value="huggingface">Hugging Face</option>
          </select>
        </div>
        <TextField
          label="API Key"
          value={settings.apiSettings.apiKey ?? ''}
          onChange={(value) => settings.updateApiSettings({ apiKey: value })}
          placeholder="Paste provider key"
          secret
        />
        <TextField
          label="Base URL"
          value={settings.apiSettings.baseUrl ?? ''}
          onChange={(value) => settings.updateApiSettings({ baseUrl: value })}
          placeholder="http://localhost:5000"
        />
      </section>

      <section className="space-y-4 rounded-2xl border border-dark-700 bg-dark-800 p-5">
        <SectionTitle icon={Server} label="Local AI" color="bg-violet-500" />
        <Toggle
          label="Enable local backend"
          desc="Use an on-device or LAN generation service"
          value={settings.localSettings.enabled}
          onChange={(value) => settings.updateLocalSettings({ enabled: value })}
        />
        <div>
          <label className="mb-1.5 block text-xs font-medium text-dark-300">Backend Type</label>
          <select
            value={settings.localSettings.type}
            onChange={(event) => settings.updateLocalSettings({ type: event.target.value as typeof settings.localSettings.type })}
            className="w-full rounded-xl border border-dark-700 bg-dark-900 px-3 py-2.5 text-sm text-white focus:border-indigo-500 focus:outline-none"
          >
            <option value="ollama">Ollama</option>
            <option value="stable-diffusion">Stable Diffusion WebUI</option>
            <option value="comfyui">ComfyUI</option>
          </select>
        </div>
        <div className="grid gap-3 sm:grid-cols-[1fr_120px]">
          <TextField
            label="Endpoint"
            value={settings.localSettings.baseUrl}
            onChange={(value) => settings.updateLocalSettings({ baseUrl: value })}
            placeholder="http://localhost"
          />
          <TextField
            label="Port"
            value={String(settings.localSettings.port)}
            onChange={(value) => settings.updateLocalSettings({ port: Number(value) || settings.localSettings.port })}
            placeholder="11434"
          />
        </div>
      </section>

      <section className="space-y-4 rounded-2xl border border-dark-700 bg-dark-800 p-5">
        <SectionTitle icon={Monitor} label="Interface" color="bg-cyan-600" />
        <div>
          <label className="mb-1.5 block text-xs font-medium text-dark-300">Grid Size</label>
          <div className="flex gap-2">
            {(['sm', 'md', 'lg'] as const).map((size) => (
              <button
                key={size}
                type="button"
                onClick={() => settings.updateSettings({ gridSize: size })}
                className={`flex-1 rounded-xl border py-2 text-sm font-medium capitalize transition-all ${
                  settings.gridSize === size
                    ? 'border-indigo-500/40 bg-indigo-500/20 text-indigo-300'
                    : 'border-dark-700 bg-dark-900 text-dark-300 hover:text-white'
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>
        <Toggle
          label="Generation notifications"
          desc="Notify when generations complete"
          value={settings.notifications.generationComplete}
          onChange={(value) =>
            settings.updateSettings({
              notifications: { ...settings.notifications, generationComplete: value },
            })
          }
        />
      </section>
    </div>
  );
};
