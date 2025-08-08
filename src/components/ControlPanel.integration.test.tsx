import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ControlPanel } from './ControlPanel';
import { SimulationParams } from '../types';

// Integration test to verify complete UI functionality with extended range
describe('ControlPanel - Integration Tests for Extended Range', () => {
  const createMockParams = (velocity: number): SimulationParams => ({
    serverHeight: 6.5,
    initialVelocity: velocity,
    topspinRpm: 2000,
    topspinPlane: 0,
    initialDirection: 0,
    initialVerticalAngle: 0,
    airDensity: 0.0765,
    dragCoefficient: 0.5,
    magnusCoefficient: 0.15,
    enableGravity: true,
    enableDrag: true,
    enableMagnus: true,
    animationSpeed: 0.5
  });

  const mockHandlers = {
    onParamsChange: vi.fn(),
    onStart: vi.fn(),
    onStop: vi.fn(),
    onReset: vi.fn(),
    onStepForward: vi.fn(),
    onStepBackward: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Complete Range Verification', () => {
    it('should support the complete 50-150 mph range with smooth transitions', () => {
      const { rerender } = render(
        <ControlPanel 
          {...mockHandlers}
          params={createMockParams(100)}
          isRunning={false}
          isPaused={false}
        />
      );

      const velocitySlider = screen.getByDisplayValue('100');

      // Test boundary values
      fireEvent.change(velocitySlider, { target: { value: '50' } });
      expect(mockHandlers.onParamsChange).toHaveBeenCalledWith(
        expect.objectContaining({ initialVelocity: 50 })
      );

      fireEvent.change(velocitySlider, { target: { value: '150' } });
      expect(mockHandlers.onParamsChange).toHaveBeenCalledWith(
        expect.objectContaining({ initialVelocity: 150 })
      );

      // Test that display updates correctly for boundary values
      rerender(
        <ControlPanel 
          {...mockHandlers}
          params={createMockParams(50)}
          isRunning={false}
          isPaused={false}
        />
      );
      expect(screen.getByText('Initial Velocity: 50 mph')).toBeInTheDocument();

      rerender(
        <ControlPanel 
          {...mockHandlers}
          params={createMockParams(150)}
          isRunning={false}
          isPaused={false}
        />
      );
      expect(screen.getByText('Initial Velocity: 150 mph')).toBeInTheDocument();
    });

    it('should handle the full range with consistent behavior', () => {
      render(
        <ControlPanel 
          {...mockHandlers}
          params={createMockParams(100)}
          isRunning={false}
          isPaused={false}
        />
      );

      const velocitySlider = screen.getByDisplayValue('100');

      // Test values across the entire range
      const testRange = [50, 60, 75, 90, 110, 125, 140, 150];
      
      testRange.forEach(velocity => {
        fireEvent.change(velocitySlider, { target: { value: velocity.toString() } });
        expect(mockHandlers.onParamsChange).toHaveBeenCalledWith(
          expect.objectContaining({ initialVelocity: velocity })
        );
      });

      expect(mockHandlers.onParamsChange).toHaveBeenCalledTimes(testRange.length);
    });
  });

  describe('Real-world Usage Scenarios', () => {
    it('should handle beginner serve speeds (50-70 mph)', () => {
      const { rerender } = render(
        <ControlPanel 
          {...mockHandlers}
          params={createMockParams(50)}
          isRunning={false}
          isPaused={false}
        />
      );

      // Verify display for beginner speeds
      expect(screen.getByText('Initial Velocity: 50 mph')).toBeInTheDocument();
      
      const velocitySlider = screen.getByDisplayValue('50');
      
      // Test beginner range adjustments
      fireEvent.change(velocitySlider, { target: { value: '65' } });
      expect(mockHandlers.onParamsChange).toHaveBeenCalledWith(
        expect.objectContaining({ initialVelocity: 65 })
      );

      // Update display
      rerender(
        <ControlPanel 
          {...mockHandlers}
          params={createMockParams(65)}
          isRunning={false}
          isPaused={false}
        />
      );
      expect(screen.getByText('Initial Velocity: 65 mph')).toBeInTheDocument();
    });

    it('should handle professional serve speeds (130-150 mph)', () => {
      const { rerender } = render(
        <ControlPanel 
          {...mockHandlers}
          params={createMockParams(150)}
          isRunning={false}
          isPaused={false}
        />
      );

      // Verify display for professional speeds
      expect(screen.getByText('Initial Velocity: 150 mph')).toBeInTheDocument();
      
      const velocitySlider = screen.getByDisplayValue('150');
      
      // Test professional range adjustments
      fireEvent.change(velocitySlider, { target: { value: '135' } });
      expect(mockHandlers.onParamsChange).toHaveBeenCalledWith(
        expect.objectContaining({ initialVelocity: 135 })
      );

      // Update display
      rerender(
        <ControlPanel 
          {...mockHandlers}
          params={createMockParams(135)}
          isRunning={false}
          isPaused={false}
        />
      );
      expect(screen.getByText('Initial Velocity: 135 mph')).toBeInTheDocument();
    });
  });

  describe('User Experience Validation', () => {
    it('should provide immediate visual feedback for all range values', () => {
      const { rerender } = render(
        <ControlPanel 
          {...mockHandlers}
          params={createMockParams(100)}
          isRunning={false}
          isPaused={false}
        />
      );

      // Test that every value in the range provides immediate feedback
      const criticalValues = [50, 75, 100, 125, 150];
      
      criticalValues.forEach(velocity => {
        rerender(
          <ControlPanel 
            {...mockHandlers}
            params={createMockParams(velocity)}
            isRunning={false}
            isPaused={false}
          />
        );
        
        // Verify display updates immediately
        expect(screen.getByText(`Initial Velocity: ${velocity} mph`)).toBeInTheDocument();
        
        // Verify slider position matches
        const slider = screen.getByDisplayValue(velocity.toString());
        expect(slider).toHaveValue(velocity.toString());
      });
    });

    it('should maintain smooth interaction during rapid changes', () => {
      render(
        <ControlPanel 
          {...mockHandlers}
          params={createMockParams(100)}
          isRunning={false}
          isPaused={false}
        />
      );

      const velocitySlider = screen.getByDisplayValue('100');

      // Simulate rapid user interactions across the full range
      const rapidSequence = [50, 150, 75, 125, 60, 140, 90, 110];
      
      rapidSequence.forEach((velocity, index) => {
        fireEvent.change(velocitySlider, { target: { value: velocity.toString() } });
        
        // Verify each change is handled correctly
        expect(mockHandlers.onParamsChange).toHaveBeenNthCalledWith(
          index + 1,
          expect.objectContaining({ initialVelocity: velocity })
        );
      });

      // Verify all changes were processed
      expect(mockHandlers.onParamsChange).toHaveBeenCalledTimes(rapidSequence.length);
    });
  });

  describe('Edge Case Handling', () => {
    it('should handle boundary transitions correctly', () => {
      render(
        <ControlPanel 
          {...mockHandlers}
          params={createMockParams(51)}
          isRunning={false}
          isPaused={false}
        />
      );

      const velocitySlider = screen.getByDisplayValue('51');

      // Test transition to minimum boundary
      fireEvent.change(velocitySlider, { target: { value: '50' } });
      expect(mockHandlers.onParamsChange).toHaveBeenCalledWith(
        expect.objectContaining({ initialVelocity: 50 })
      );

      // Test transition to maximum boundary
      fireEvent.change(velocitySlider, { target: { value: '150' } });
      expect(mockHandlers.onParamsChange).toHaveBeenCalledWith(
        expect.objectContaining({ initialVelocity: 150 })
      );

      // Test transition back from boundary
      fireEvent.change(velocitySlider, { target: { value: '149' } });
      expect(mockHandlers.onParamsChange).toHaveBeenCalledWith(
        expect.objectContaining({ initialVelocity: 149 })
      );
    });
  });
});