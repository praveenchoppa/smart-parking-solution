package com.smartparking.backend.ai.ai1.service;

import java.util.Locale;

import org.springframework.stereotype.Component;

import com.smartparking.backend.common.exception.InvalidOperationException;
import com.smartparking.backend.parkingslot.entity.SlotStatus;

@Component
public class Ai1SlotStatusMapper {

    public SlotStatus toPhysicalStatus(String ai1Status) {
        if (ai1Status == null || ai1Status.isBlank()) {
            throw new InvalidOperationException("AI-1 returned a slot without a physical status.");
        }

        try {
            SlotStatus physicalStatus = SlotStatus.valueOf(ai1Status.trim().toUpperCase(Locale.ROOT));
            if (physicalStatus == SlotStatus.RESERVED) {
                throw new InvalidOperationException("AI-1 returned an unsupported slot status: RESERVED");
            }
            return physicalStatus;
        } catch (IllegalArgumentException ex) {
            throw new InvalidOperationException("AI-1 returned an unsupported slot status: " + ai1Status);
        }
    }

    public SlotStatus mergeWithBusinessRules(SlotStatus currentStatus, SlotStatus aiPhysicalStatus) {
        if (currentStatus == SlotStatus.RESERVED || currentStatus == SlotStatus.OCCUPIED) {
            return currentStatus;
        }
        return aiPhysicalStatus;
    }

    public String normalizeSlotNumber(String slotNumber) {
        if (slotNumber == null) {
            return "";
        }
        return slotNumber.replace("-", "")
                .replace(" ", "")
                .toUpperCase(Locale.ROOT);
    }
}
