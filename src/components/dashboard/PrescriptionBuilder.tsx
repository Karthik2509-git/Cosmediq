'use client';
import React, { useState } from 'react';
import { Pill, Plus, Trash2, ShieldCheck, Zap } from 'lucide-react';

interface PrescriptionItem {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions?: string;
}

interface PrescriptionBuilderProps {
  prescriptions: PrescriptionItem[];
  onChange: (items: PrescriptionItem[]) => void;
}

const frequencyPresets = [
  'Once daily',
  'Twice daily',
  'Morning only',
  'Night only',
  'After food',
  'Before food'
];

export function PrescriptionBuilder({ prescriptions, onChange }: PrescriptionBuilderProps) {
  const [name, setName] = useState('');
  const [dosage, setDosage] = useState('');
  const [frequency, setFrequency] = useState('');
  const [duration, setDuration] = useState('');
  const [instructions, setInstructions] = useState('');

  const handleAddItem = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!name || !dosage || !frequency || !duration) {
      return;
    }

    const newItem: PrescriptionItem = {
      name: name.trim(),
      dosage: dosage.trim(),
      frequency: frequency.trim(),
      duration: duration.trim(),
      instructions: instructions.trim() || undefined,
    };

    const updated = [...prescriptions, newItem];
    onChange(updated);

    // Reset inputs
    setName('');
    setDosage('');
    setFrequency('');
    setDuration('');
    setInstructions('');
  };

  const handleRemoveItem = (index: number) => {
    const updated = prescriptions.filter((_, i) => i !== index);
    onChange(updated);
  };

  return (
    <div className="space-y-6 text-left">
      
      {/* 1. INPUT FORM CRITICAL BOX */}
      <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
        <h4 className="text-sm font-bold text-foreground flex items-center gap-1.5">
          <Pill className="h-4.5 w-4.5 text-primary" />
          Add Therapeutic Medication
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-foreground uppercase tracking-wider">Medication Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
              placeholder="e.g. Tretinoin 0.025% Gel"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-foreground uppercase tracking-wider">Dosage / Volume</label>
            <input
              type="text"
              value={dosage}
              onChange={(e) => setDosage(e.target.value)}
              className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
              placeholder="e.g. Apply thin layer, 1 Tablet"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Frequency with presets */}
          <div className="space-y-2">
            <label className="text-[11px] font-bold text-foreground uppercase tracking-wider block">Frequency</label>
            <input
              type="text"
              value={frequency}
              onChange={(e) => setFrequency(e.target.value)}
              className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
              placeholder="Select preset or type custom..."
            />
            {/* Speed Presets Grid */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {frequencyPresets.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setFrequency(preset)}
                  className="inline-flex items-center gap-1 rounded-lg border border-border bg-muted/30 px-2 py-1 text-[10px] font-bold text-muted-foreground hover:text-primary hover:border-primary/30 transition-colors"
                >
                  <Zap className="h-2.5 w-2.5 text-primary shrink-0" />
                  {preset}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[11px] font-bold text-foreground uppercase tracking-wider">Duration / Course</label>
            <input
              type="text"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
              placeholder="e.g. 15 Days, 1 Month"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-[11px] font-bold text-foreground uppercase tracking-wider">Additional Instructions</label>
          <input
            type="text"
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
            placeholder="e.g. Avoid direct sunlight, apply before sleep..."
          />
        </div>

        <button
          onClick={handleAddItem}
          disabled={!name || !dosage || !frequency || !duration}
          type="button"
          className="flex items-center justify-center gap-1.5 rounded-xl bg-primary/10 border border-primary/20 text-primary text-xs font-bold px-4 py-2.5 hover:bg-primary/20 transition-colors disabled:opacity-50"
        >
          <Plus className="h-4 w-4" />
          Add Prescription Item
        </button>
      </div>

      {/* 2. ACTIVE ITEMS TABLE */}
      {prescriptions.length > 0 ? (
        <div className="rounded-2xl border border-border bg-card overflow-hidden">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="border-b border-border bg-muted/40 text-muted-foreground font-bold">
                <th className="p-3">Medication</th>
                <th className="p-3">Dosage</th>
                <th className="p-3">Frequency</th>
                <th className="p-3">Duration</th>
                <th className="p-3 text-right">Delete</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-foreground font-medium">
              {prescriptions.map((item, idx) => (
                <tr key={idx} className="hover:bg-muted/10">
                  <td className="p-3">
                    <p className="font-bold">{item.name}</p>
                    {item.instructions && (
                      <p className="text-[10px] text-muted-foreground font-semibold mt-0.5">
                        Instructions: {item.instructions}
                      </p>
                    )}
                  </td>
                  <td className="p-3">{item.dosage}</td>
                  <td className="p-3">
                    <span className="bg-primary/5 text-primary border border-primary/20 px-2 py-0.5 rounded-md font-bold">
                      {item.frequency}
                    </span>
                  </td>
                  <td className="p-3">{item.duration}</td>
                  <td className="p-3 text-right">
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(idx)}
                      className="p-1.5 text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center p-6 text-center rounded-2xl border border-dashed border-border bg-muted/10">
          <ShieldCheck className="h-8 w-8 text-muted-foreground/30 mb-2" />
          <p className="text-xs text-muted-foreground font-bold">No prescription items added yet.</p>
        </div>
      )}

    </div>
  );
}
