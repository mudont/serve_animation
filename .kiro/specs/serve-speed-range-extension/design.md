# Design Document

## Overview

This design extends the serve speed range in the tennis serve simulator from 60-140 mph to 50-150 mph. The change is primarily a configuration update to the ControlPanel component's slider parameters, with validation that the physics engine can handle the extended range without modifications.

## Architecture

The serve speed range extension affects only the user interface layer of the application:

- **UI Layer**: ControlPanel component slider configuration
- **Physics Layer**: No changes required - existing PhysicsEngine already handles arbitrary velocity values
- **State Management**: No changes required - SimulationParams interface already supports any numerical velocity

## Components and Interfaces

### ControlPanel Component

**Current Implementation:**
```typescript
// Initial Velocity slider
<input
  type="range"
  min="60"        // Current minimum
  max="140"       // Current maximum
  step="1"
  value={params.initialVelocity}
  onChange={(e) => updateParam('initialVelocity', parseInt(e.target.value))}
  className="w-full"
/>
```

**Updated Implementation:**
```typescript
// Initial Velocity slider
<input
  type="range"
  min="50"        // New minimum
  max="150"       // New maximum
  step="1"
  value={params.initialVelocity}
  onChange={(e) => updateParam('initialVelocity', parseInt(e.target.value))}
  className="w-full"
/>
```

### Physics Engine Compatibility

The existing PhysicsEngine.mphToFtPerSec() method converts any mph value to ft/s:
```typescript
mphToFtPerSec(mph: number): number {
  return mph * 1.467;
}
```

This method has no range restrictions and will work correctly with:
- 50 mph → 73.35 ft/s
- 150 mph → 220.05 ft/s

### SimulationParams Interface

The existing interface already supports the extended range:
```typescript
interface SimulationParams {
  initialVelocity: number; // mph - no range restrictions
  // ... other properties
}
```

## Data Models

No changes required to existing data models. The `initialVelocity` property in `SimulationParams` is already typed as `number` without range constraints.

## Error Handling

### Input Validation

The HTML range input with min/max attributes provides built-in validation:
- Values below 50 mph will be automatically clamped to 50
- Values above 150 mph will be automatically clamped to 150
- The step="1" ensures integer values only

### Physics Boundary Conditions

Testing considerations for extreme values:
- **50 mph serves**: Should produce realistic slow serve trajectories
- **150 mph serves**: Should produce realistic power serve trajectories without numerical instability

## Testing Strategy

### Unit Testing
1. **Slider Range Testing**
   - Verify slider accepts values from 50-150 mph
   - Verify slider rejects values outside range
   - Verify step increments work correctly

2. **Physics Engine Testing**
   - Test velocity conversion at boundary values (50 mph, 150 mph)
   - Verify trajectory calculations remain stable at extremes
   - Compare trajectory realism across speed range

### Integration Testing
1. **End-to-End Simulation Testing**
   - Run complete simulations at 50 mph, 100 mph, and 150 mph
   - Verify ball reaches court at all speeds
   - Verify physics effects (drag, magnus, gravity) scale appropriately

### Manual Testing
1. **User Interface Testing**
   - Verify smooth slider interaction across full range
   - Verify real-time speed display updates
   - Verify visual trajectory differences are apparent

## Implementation Approach

This is a minimal change implementation:

1. **Single File Modification**: Only `src/components/ControlPanel.tsx` requires changes
2. **Configuration Change**: Update slider min/max attributes from "60"/"140" to "50"/"150"
3. **No Breaking Changes**: Existing functionality remains unchanged
4. **Backward Compatibility**: Current parameter values (60-140 mph) remain valid within new range

## Performance Considerations

- **No Performance Impact**: The change only affects UI configuration, not computational complexity
- **Physics Calculations**: Remain O(1) for velocity conversion regardless of input value
- **Memory Usage**: No additional memory requirements

## Security Considerations

- **Input Sanitization**: HTML range input provides built-in bounds checking
- **Type Safety**: TypeScript ensures `initialVelocity` remains a number type
- **No External Dependencies**: Change requires no new libraries or external resources