import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import '@testing-library/jest-dom';
import SlotCard from '../components/parking/SlotCard';
import StatusBadge from '../components/common/StatusBadge';
import QRCard from '../components/booking/QRCard';

describe('Smart Urban Parking - Unit Component Suite', () => {

  it('renders AVAILABLE slot as selectable', () => {
    const slot = { slotId: 101, slotNumber: 'A-01', status: 'AVAILABLE' };
    const handleSelect = vi.fn();

    render(<SlotCard slot={slot} isSelected={false} onSelect={handleSelect} />);
    const slotBtn = screen.getByRole('button');
    expect(slotBtn).not.toBeDisabled();

    fireEvent.click(slotBtn);
    expect(handleSelect).toHaveBeenCalledWith(slot);
  });

  it('disables RESERVED and OCCUPIED slots from selection', () => {
    const reservedSlot = { slotId: 102, slotNumber: 'A-02', status: 'RESERVED' };
    const occupiedSlot = { slotId: 103, slotNumber: 'A-03', status: 'OCCUPIED' };

    const { rerender } = render(<SlotCard slot={reservedSlot} isSelected={false} />);
    expect(screen.getByRole('button')).toBeDisabled();

    rerender(<SlotCard slot={occupiedSlot} isSelected={false} />);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('maps backend status enums correctly to StatusBadge', () => {
    const { rerender } = render(<StatusBadge status="AVAILABLE" />);
    expect(screen.getByText('Available')).toBeInTheDocument();

    rerender(<StatusBadge status="CHECKED_IN" />);
    expect(screen.getByText('Checked In')).toBeInTheDocument();

    rerender(<StatusBadge status="COMPLETED" />);
    expect(screen.getByText('Completed')).toBeInTheDocument();
  });

  it('renders QR Pass boarding pass with reference code and bay', () => {
    const booking = {
      bookingCode: 'BK101-TEST',
      parkingAreaName: 'TechHub Central Garage',
      slotNumber: 'A-01',
      vehicleNumber: 'KL05AB1234',
      durationHours: 2,
      totalAmount: 80.00,
      status: 'PENDING_CHECK_IN'
    };

    render(<QRCard booking={booking} showActions={false} />);
    expect(screen.getAllByText('BK101-TEST').length).toBeGreaterThan(0);
  });

});
