import React from 'react';
import SlotCard from './SlotCard';
import EmptyState from './EmptyState';
import { Grid } from 'lucide-react';

export default function SlotGrid({ slots = [], selectedSlotId, onSelectSlot }) {
  if (!slots || slots.length === 0) {
    return (
      <EmptyState
        title="No Slots Found"
        message="There are currently no slots configured or available for this parking area."
        icon={Grid}
      />
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      {slots.map((slot) => (
        <SlotCard
          key={slot.slotId}
          slotId={slot.slotId}
          slotNumber={slot.slotNumber}
          status={slot.status}
          selected={selectedSlotId === slot.slotId}
          onSelect={onSelectSlot}
        />
      ))}
    </div>
  );
}
