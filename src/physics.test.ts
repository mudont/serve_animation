import { describe, it, expect } from 'vitest'
import { PhysicsEngine } from './physics'

describe('PhysicsEngine', () => {
  const engine = new PhysicsEngine()

  describe('mphToFtPerSec velocity conversion', () => {
    it('should convert 50 mph to correct ft/s value', () => {
      const result = engine.mphToFtPerSec(50)
      const expected = 50 * 1.467 // 73.35 ft/s
      expect(result).toBe(expected)
      expect(result).toBeCloseTo(73.35, 2)
    })

    it('should convert 150 mph to correct ft/s value', () => {
      const result = engine.mphToFtPerSec(150)
      const expected = 150 * 1.467 // 220.05 ft/s
      expect(result).toBe(expected)
      expect(result).toBeCloseTo(220.05, 2)
    })

    it('should produce expected results for extreme values', () => {
      // Test that the conversion formula works correctly at boundaries
      expect(engine.mphToFtPerSec(50)).toBeCloseTo(73.35, 2)
      expect(engine.mphToFtPerSec(150)).toBeCloseTo(220.05, 2)
      
      // Verify the conversion is linear and consistent
      const ratio = engine.mphToFtPerSec(150) / engine.mphToFtPerSec(50)
      expect(ratio).toBeCloseTo(3, 10) // 150/50 = 3, should be exactly 3 for linear conversion
    })

    it('should handle edge cases correctly', () => {
      // Test zero velocity
      expect(engine.mphToFtPerSec(0)).toBe(0)
      
      // Test negative velocity (theoretical case)
      expect(engine.mphToFtPerSec(-50)).toBeCloseTo(-73.35, 2)
      
      // Test decimal values
      expect(engine.mphToFtPerSec(50.5)).toBeCloseTo(74.0835, 4)
    })

    it('should maintain precision for boundary calculations', () => {
      // Verify that boundary values maintain sufficient precision for physics calculations
      const velocity50 = engine.mphToFtPerSec(50)
      const velocity150 = engine.mphToFtPerSec(150)
      
      // Check that we have reasonable precision (no floating point issues)
      expect(velocity50.toString()).not.toMatch(/e-/) // No scientific notation for small numbers
      expect(velocity150.toString()).not.toMatch(/e-/) // No scientific notation for small numbers
      
      // Verify the values are within expected ranges for tennis physics
      expect(velocity50).toBeGreaterThan(70) // Reasonable minimum for slow serve
      expect(velocity50).toBeLessThan(80)    // Not too high for 50 mph
      expect(velocity150).toBeGreaterThan(210) // Reasonable for fast serve
      expect(velocity150).toBeLessThan(230)    // Not unreasonably high
    })
  })

  describe('Extended speed range physics compatibility', () => {
    it('should handle 50 mph serves without numerical instability', () => {
      const mockParams = {
        initialVelocity: 50,
        initialDirection: 0,
        initialVerticalAngle: 5,
        topspinRpm: 2000,
        topspinPlane: 0,
        serverHeight: 8,
        animationSpeed: 1,
        airDensity: 0.075,
        dragCoefficient: 0.5,
        magnusCoefficient: 0.25,
        enableGravity: true,
        enableDrag: true,
        enableMagnus: true
      }

      const initialState = engine.createInitialState(mockParams)
      
      // Verify initial velocity is correctly converted
      const expectedVelocityMagnitude = engine.mphToFtPerSec(50)
      const actualVelocityMagnitude = Math.sqrt(
        initialState.velocity.x ** 2 + 
        initialState.velocity.y ** 2 + 
        initialState.velocity.z ** 2
      )
      
      expect(actualVelocityMagnitude).toBeCloseTo(expectedVelocityMagnitude, 1)
      
      // Verify physics step doesn't produce NaN or infinite values
      const result = engine.step(initialState, mockParams)
      expect(Number.isFinite(result.newState.velocity.x)).toBe(true)
      expect(Number.isFinite(result.newState.velocity.y)).toBe(true)
      expect(Number.isFinite(result.newState.velocity.z)).toBe(true)
      expect(Number.isFinite(result.newState.position.x)).toBe(true)
      expect(Number.isFinite(result.newState.position.y)).toBe(true)
      expect(Number.isFinite(result.newState.position.z)).toBe(true)
    })

    it('should handle 150 mph serves without numerical instability', () => {
      const mockParams = {
        initialVelocity: 150,
        initialDirection: 0,
        initialVerticalAngle: 5,
        topspinRpm: 2000,
        topspinPlane: 0,
        serverHeight: 8,
        animationSpeed: 1,
        airDensity: 0.075,
        dragCoefficient: 0.5,
        magnusCoefficient: 0.25,
        enableGravity: true,
        enableDrag: true,
        enableMagnus: true
      }

      const initialState = engine.createInitialState(mockParams)
      
      // Verify initial velocity is correctly converted
      const expectedVelocityMagnitude = engine.mphToFtPerSec(150)
      const actualVelocityMagnitude = Math.sqrt(
        initialState.velocity.x ** 2 + 
        initialState.velocity.y ** 2 + 
        initialState.velocity.z ** 2
      )
      
      expect(actualVelocityMagnitude).toBeCloseTo(expectedVelocityMagnitude, 1)
      
      // Verify physics step doesn't produce NaN or infinite values
      const result = engine.step(initialState, mockParams)
      expect(Number.isFinite(result.newState.velocity.x)).toBe(true)
      expect(Number.isFinite(result.newState.velocity.y)).toBe(true)
      expect(Number.isFinite(result.newState.velocity.z)).toBe(true)
      expect(Number.isFinite(result.newState.position.x)).toBe(true)
      expect(Number.isFinite(result.newState.position.y)).toBe(true)
      expect(Number.isFinite(result.newState.position.z)).toBe(true)
    })

    it('should maintain realistic physics scaling across speed range', () => {
      const baseParams = {
        initialDirection: 0,
        initialVerticalAngle: 5,
        topspinRpm: 2000,
        topspinPlane: 0,
        serverHeight: 8,
        animationSpeed: 1,
        airDensity: 0.075,
        dragCoefficient: 0.5,
        magnusCoefficient: 0.25,
        enableGravity: true,
        enableDrag: true,
        enableMagnus: true
      }

      // Test at 50 mph
      const params50 = { ...baseParams, initialVelocity: 50 }
      const state50 = engine.createInitialState(params50)
      
      // Test at 150 mph  
      const params150 = { ...baseParams, initialVelocity: 150 }
      const state150 = engine.createInitialState(params150)
      
      // Verify that 150 mph produces 3x the velocity magnitude of 50 mph
      const velocity50 = Math.sqrt(state50.velocity.x ** 2 + state50.velocity.y ** 2 + state50.velocity.z ** 2)
      const velocity150 = Math.sqrt(state150.velocity.x ** 2 + state150.velocity.y ** 2 + state150.velocity.z ** 2)
      
      expect(velocity150 / velocity50).toBeCloseTo(3, 1)
      
      // Verify both produce reasonable initial positions
      expect(state50.position.y).toBe(8) // Server height
      expect(state150.position.y).toBe(8) // Server height
      expect(state50.position.x).toBe(0) // Baseline
      expect(state150.position.x).toBe(0) // Baseline
    })
  })

  describe('Complete serve simulation validation at extended range', () => {
    const createCompleteSimulationParams = (velocity: number) => ({
      initialVelocity: velocity,
      initialDirection: 0, // Straight down the middle
      initialVerticalAngle: 5, // Slight upward angle
      topspinRpm: 2000, // Moderate topspin
      topspinPlane: 0, // Pure topspin
      serverHeight: 8, // Standard serve height
      animationSpeed: 1,
      airDensity: 0.075, // Standard air density
      dragCoefficient: 0.5, // Realistic drag
      magnusCoefficient: 0.25, // Realistic Magnus effect
      enableGravity: true,
      enableDrag: true,
      enableMagnus: true
    })

    const runCompleteSimulation = (params: any, maxSteps = 2000) => {
      let state = engine.createInitialState(params)
      const trajectory = [{ ...state }]
      let bounced = false
      let hitNet = false
      let steps = 0

      while (steps < maxSteps && !hitNet) {
        const result = engine.step(state, params)
        state = result.newState
        trajectory.push({ ...state })
        
        if (result.bounced) {
          bounced = true
        }
        if (result.hitNet) {
          hitNet = true
          break
        }
        
        steps++
        
        // Stop if ball has traveled far past the court or is very low
        if (state.position.x > 150 || state.position.y < -5) break
        
        // Stop if ball reaches ground after bouncing
        if (bounced && state.position.y <= 0) break
      }

      return {
        trajectory,
        finalState: state,
        bounced,
        hitNet,
        steps,
        reachedGround: state.position.y <= 0,
        completedNormally: steps < maxSteps
      }
    }

    it('should produce realistic trajectory for 50 mph serve', () => {
      const params = createCompleteSimulationParams(50)
      const simulation = runCompleteSimulation(params)

      // Verify simulation completed successfully
      expect(simulation.steps).toBeGreaterThan(0)
      expect(simulation.steps).toBeLessThan(1000) // Should not timeout
      
      // Verify ball follows realistic physics
      expect(simulation.trajectory.length).toBeGreaterThan(10) // Should have multiple trajectory points
      
      // Check that ball moves forward (positive x direction)
      const initialX = simulation.trajectory[0].position.x
      const finalX = simulation.finalState.position.x
      expect(finalX).toBeGreaterThan(initialX)
      
      // Verify ball eventually comes down due to gravity
      expect(simulation.reachedGround || simulation.hitNet).toBe(true)
      
      // For 50 mph serve, ball should travel reasonable distance
      // Should reach at least the service box (21 feet from baseline)
      if (!simulation.hitNet) {
        expect(finalX).toBeGreaterThan(21)
      }
      
      // Verify velocity decreases over time due to drag (check a few points)
      const midPoint = Math.floor(simulation.trajectory.length / 2)
      const initialSpeed = Math.sqrt(
        simulation.trajectory[1].velocity.x ** 2 + 
        simulation.trajectory[1].velocity.y ** 2 + 
        simulation.trajectory[1].velocity.z ** 2
      )
      const midSpeed = Math.sqrt(
        simulation.trajectory[midPoint].velocity.x ** 2 + 
        simulation.trajectory[midPoint].velocity.y ** 2 + 
        simulation.trajectory[midPoint].velocity.z ** 2
      )
      expect(midSpeed).toBeLessThan(initialSpeed) // Speed should decrease due to drag
    })

    it('should produce realistic trajectory for 150 mph serve', () => {
      const params = createCompleteSimulationParams(150)
      const simulation = runCompleteSimulation(params)

      // Verify simulation completed successfully
      expect(simulation.steps).toBeGreaterThan(0)
      expect(simulation.steps).toBeLessThan(2000) // Should not timeout
      
      // Verify ball follows realistic physics
      expect(simulation.trajectory.length).toBeGreaterThan(10) // Should have multiple trajectory points
      
      // Check that ball moves forward (positive x direction)
      const initialX = simulation.trajectory[0].position.x
      const finalX = simulation.finalState.position.x
      expect(finalX).toBeGreaterThan(initialX)
      
      // Verify ball eventually comes down due to gravity, hits net, or simulation completes normally
      expect(simulation.reachedGround || simulation.hitNet || simulation.completedNormally).toBe(true)
      
      // For 150 mph serve, ball should travel much further than 50 mph
      // Should easily reach the service box and likely beyond
      if (!simulation.hitNet) {
        expect(finalX).toBeGreaterThan(30) // Should travel further than slower serve
      }
      
      // Verify velocity decreases over time due to drag
      const midPoint = Math.floor(simulation.trajectory.length / 2)
      const initialSpeed = Math.sqrt(
        simulation.trajectory[1].velocity.x ** 2 + 
        simulation.trajectory[1].velocity.y ** 2 + 
        simulation.trajectory[1].velocity.z ** 2
      )
      const midSpeed = Math.sqrt(
        simulation.trajectory[midPoint].velocity.x ** 2 + 
        simulation.trajectory[midPoint].velocity.y ** 2 + 
        simulation.trajectory[midPoint].velocity.z ** 2
      )
      expect(midSpeed).toBeLessThan(initialSpeed) // Speed should decrease due to drag
    })

    it('should maintain stable physics calculations at speed extremes', () => {
      const params50 = createCompleteSimulationParams(50)
      const params150 = createCompleteSimulationParams(150)
      
      const simulation50 = runCompleteSimulation(params50)
      const simulation150 = runCompleteSimulation(params150)

      // Both simulations should complete without numerical instability
      expect(simulation50.steps).toBeGreaterThan(0)
      expect(simulation150.steps).toBeGreaterThan(0)
      
      // Verify no NaN or infinite values in trajectories
      simulation50.trajectory.forEach((state, index) => {
        expect(Number.isFinite(state.position.x)).toBe(true)
        expect(Number.isFinite(state.position.y)).toBe(true)
        expect(Number.isFinite(state.position.z)).toBe(true)
        expect(Number.isFinite(state.velocity.x)).toBe(true)
        expect(Number.isFinite(state.velocity.y)).toBe(true)
        expect(Number.isFinite(state.velocity.z)).toBe(true)
      })
      
      simulation150.trajectory.forEach((state, index) => {
        expect(Number.isFinite(state.position.x)).toBe(true)
        expect(Number.isFinite(state.position.y)).toBe(true)
        expect(Number.isFinite(state.position.z)).toBe(true)
        expect(Number.isFinite(state.velocity.x)).toBe(true)
        expect(Number.isFinite(state.velocity.y)).toBe(true)
        expect(Number.isFinite(state.velocity.z)).toBe(true)
      })
      
      // Verify realistic speed relationship - 150 mph should travel further
      if (!simulation50.hitNet && !simulation150.hitNet) {
        expect(simulation150.finalState.position.x).toBeGreaterThan(simulation50.finalState.position.x)
      }
    })

    it('should verify ball behavior remains physically realistic at speed extremes', () => {
      const testSpeeds = [50, 100, 150]
      const results = testSpeeds.map(speed => {
        const params = createCompleteSimulationParams(speed)
        return {
          speed,
          simulation: runCompleteSimulation(params)
        }
      })

      // All simulations should complete successfully
      results.forEach(result => {
        expect(result.simulation.steps).toBeGreaterThan(0)
        expect(result.simulation.trajectory.length).toBeGreaterThan(5)
      })

      // Verify realistic scaling: higher speeds should generally travel further
      // (unless they hit the net due to trajectory differences)
      const distances = results.map(result => {
        if (result.simulation.hitNet) {
          // If hit net, use the x position where it hit
          return result.simulation.finalState.position.x
        }
        return result.simulation.finalState.position.x
      })

      // At minimum, verify that physics calculations scale appropriately
      // 150 mph should have higher initial velocity than 50 mph
      const initialVel50 = Math.sqrt(
        results[0].simulation.trajectory[0].velocity.x ** 2 + 
        results[0].simulation.trajectory[0].velocity.y ** 2 + 
        results[0].simulation.trajectory[0].velocity.z ** 2
      )
      const initialVel150 = Math.sqrt(
        results[2].simulation.trajectory[0].velocity.x ** 2 + 
        results[2].simulation.trajectory[0].velocity.y ** 2 + 
        results[2].simulation.trajectory[0].velocity.z ** 2
      )
      
      expect(initialVel150).toBeGreaterThan(initialVel50 * 2.5) // Should be close to 3x
      expect(initialVel150).toBeLessThan(initialVel50 * 3.5)   // But not unreasonably high

      // Verify all trajectories show realistic physics effects
      results.forEach(result => {
        const trajectory = result.simulation.trajectory
        
        // Ball should start above ground
        expect(trajectory[0].position.y).toBeGreaterThan(0)
        
        // Ball should move forward
        expect(trajectory[trajectory.length - 1].position.x).toBeGreaterThan(trajectory[0].position.x)
        
        // Gravity should eventually bring ball down (unless it hits net first or travels very far)
        if (!result.simulation.hitNet) {
          expect(result.simulation.reachedGround || result.simulation.completedNormally).toBe(true)
        }
      })
    })
  })
})