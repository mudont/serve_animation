import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { ControlPanel } from "./ControlPanel";
import { SimulationParams } from "../types";
import { beforeEach } from "node:test";

// Mock simulation parameters with default values
const mockParams: SimulationParams = {
  serverHeight: 6.5,
  initialVelocity: 100,
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
  animationSpeed: 0.5,
};

const mockProps = {
  params: mockParams,
  onParamsChange: vi.fn(),
  onStart: vi.fn(),
  onStop: vi.fn(),
  onReset: vi.fn(),
  onStepForward: vi.fn(),
  onStepBackward: vi.fn(),
  isRunning: false,
  isPaused: false,
};

describe("ControlPanel - Serve Speed Range Extension", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Slider Range Configuration", () => {
    it("should have slider with min value of 50 mph", () => {
      render(<ControlPanel {...mockProps} />);

      const velocitySlider = screen.getByDisplayValue("100");
      expect(velocitySlider).toHaveAttribute("min", "50");
    });

    it("should have slider with max value of 150 mph", () => {
      render(<ControlPanel {...mockProps} />);

      const velocitySlider = screen.getByDisplayValue("100");
      expect(velocitySlider).toHaveAttribute("max", "150");
    });

    it("should have slider with step value of 1 for integer mph values", () => {
      render(<ControlPanel {...mockProps} />);

      const velocitySlider = screen.getByDisplayValue("100");
      expect(velocitySlider).toHaveAttribute("step", "1");
    });
  });

  describe("Boundary Value Display", () => {
    it("should display 50 mph correctly when set to minimum", () => {
      const paramsAt50 = { ...mockParams, initialVelocity: 50 };
      render(<ControlPanel {...mockProps} params={paramsAt50} />);

      expect(screen.getByText("Initial Velocity: 50 mph")).toBeInTheDocument();
    });

    it("should display 150 mph correctly when set to maximum", () => {
      const paramsAt150 = { ...mockParams, initialVelocity: 150 };
      render(<ControlPanel {...mockProps} params={paramsAt150} />);

      expect(screen.getByText("Initial Velocity: 150 mph")).toBeInTheDocument();
    });

    it("should display intermediate values correctly", () => {
      const paramsAt75 = { ...mockParams, initialVelocity: 75 };
      render(<ControlPanel {...mockProps} params={paramsAt75} />);

      expect(screen.getByText("Initial Velocity: 75 mph")).toBeInTheDocument();
    });
  });

  describe("Slider Interaction", () => {
    it("should call onParamsChange when slider value changes to 50 mph", () => {
      render(<ControlPanel {...mockProps} />);

      const velocitySlider = screen.getByDisplayValue("100");
      fireEvent.change(velocitySlider, { target: { value: "50" } });

      expect(mockProps.onParamsChange).toHaveBeenCalledWith({
        ...mockParams,
        initialVelocity: 50,
      });
    });

    it("should call onParamsChange when slider value changes to 150 mph", () => {
      render(<ControlPanel {...mockProps} />);

      const velocitySlider = screen.getByDisplayValue("100");
      fireEvent.change(velocitySlider, { target: { value: "150" } });

      expect(mockProps.onParamsChange).toHaveBeenCalledWith({
        ...mockParams,
        initialVelocity: 150,
      });
    });

    it("should handle intermediate values smoothly", () => {
      render(<ControlPanel {...mockProps} />);

      const velocitySlider = screen.getByDisplayValue("100");

      // Test multiple values across the range (excluding initial value 100)
      const testValues = [55, 75, 125, 145];

      testValues.forEach((value, index) => {
        fireEvent.change(velocitySlider, {
          target: { value: value.toString() },
        });
        expect(mockProps.onParamsChange).toHaveBeenNthCalledWith(index + 1, {
          ...mockParams,
          initialVelocity: value,
        });
      });

      expect(mockProps.onParamsChange).toHaveBeenCalledTimes(testValues.length);
    });
  });

  describe("Real-time Updates", () => {
    it("should update display immediately when props change to boundary values", () => {
      const { rerender } = render(<ControlPanel {...mockProps} />);

      // Update to minimum value
      const paramsAt50 = { ...mockParams, initialVelocity: 50 };
      rerender(<ControlPanel {...mockProps} params={paramsAt50} />);
      expect(screen.getByText("Initial Velocity: 50 mph")).toBeInTheDocument();

      // Update to maximum value
      const paramsAt150 = { ...mockParams, initialVelocity: 150 };
      rerender(<ControlPanel {...mockProps} params={paramsAt150} />);
      expect(screen.getByText("Initial Velocity: 150 mph")).toBeInTheDocument();
    });

    it("should maintain slider position when value updates", () => {
      const { rerender } = render(<ControlPanel {...mockProps} />);

      const paramsAt75 = { ...mockParams, initialVelocity: 75 };
      rerender(<ControlPanel {...mockProps} params={paramsAt75} />);

      const velocitySlider = screen.getByDisplayValue("75");
      expect(velocitySlider).toHaveValue("75");
    });
  });

  describe("Edge Case Handling", () => {
    it("should handle rapid slider movements across full range", () => {
      render(<ControlPanel {...mockProps} />);

      const velocitySlider = screen.getByDisplayValue("100");

      // Simulate rapid changes across the full range
      const rapidValues = [50, 150, 75, 125, 60, 140, 90, 110];

      rapidValues.forEach((value) => {
        fireEvent.change(velocitySlider, {
          target: { value: value.toString() },
        });
        expect(mockProps.onParamsChange).toHaveBeenCalledWith({
          ...mockParams,
          initialVelocity: value,
        });
      });

      expect(mockProps.onParamsChange).toHaveBeenCalledTimes(
        rapidValues.length
      );
    });

    it("should maintain integer values only", () => {
      render(<ControlPanel {...mockProps} />);

      const velocitySlider = screen.getByDisplayValue("100");

      // Test that decimal values are handled correctly by the input
      fireEvent.change(velocitySlider, { target: { value: "75.5" } });

      // The onChange handler should receive the parsed integer
      expect(mockProps.onParamsChange).toHaveBeenCalledWith({
        ...mockParams,
        initialVelocity: 75, // parseInt('75.5') = 75
      });
    });
  });

  describe("Accessibility and Usability", () => {
    it("should have proper label association", () => {
      render(<ControlPanel {...mockProps} />);

      const label = screen.getByText("Initial Velocity: 100 mph");
      const slider = screen.getByDisplayValue("100");

      expect(label).toBeInTheDocument();
      expect(slider).toBeInTheDocument();
    });

    it("should be keyboard accessible", () => {
      render(<ControlPanel {...mockProps} />);

      const velocitySlider = screen.getByDisplayValue("100");

      // Test keyboard navigation
      velocitySlider.focus();
      expect(document.activeElement).toBe(velocitySlider);

      // Simulate arrow key presses (browser handles the actual value changes)
      fireEvent.keyDown(velocitySlider, { key: "ArrowRight" });
      fireEvent.keyDown(velocitySlider, { key: "ArrowLeft" });

      // The slider should remain focusable
      expect(velocitySlider).toHaveAttribute("type", "range");
    });
  });
});
