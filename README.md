# Double Pendulum Stability Simulation

An interactive visualization of double pendulum chaos theory, revealing the stunning fractal patterns that emerge from the system's sensitive dependence on initial conditions.

![preview](https://github.com/sihooleebd/emergence/blob/master/download%20(3).png)
![preview-2](https://github.com/sihooleebd/emergence/blob/master/double-pendulum-16k-1764487495898.png)

## Overview

This project creates a mesmerizing visualization of the double pendulum's chaotic behavior by simulating thousands of different initial conditions and mapping the time it takes for the system to "flip" (undergo significant angular change). The result is a beautiful fractal-like pattern that illustrates the boundary between stable and chaotic regions in the pendulum's phase space.

## Features

- **Real-time Simulation**: Progressive rendering of the stability space using the Runge-Kutta 4th order integration method
- **Adjustable Resolution**: Choose between low, medium, and high resolution for speed vs. quality
- **Interactive Controls**: Start, pause, and reset the simulation at any time
- **Progress Tracking**: Visual progress bar and status indicators
- **Modern UI**: Glassmorphic design with smooth animations and responsive layout
- **Full-Screen Canvas**: Immersive visualization that scales to your viewport

## How It Works

### The Physics

The simulation models a double pendulum system with two point masses connected by rigid, massless rods. The equations of motion are derived from the Lagrangian mechanics and solved numerically using the RK4 integration method.

**Configuration:**
- Gravitational acceleration: g = 9.81 m/s²
- Equal masses: m₁ = m₂ = 1.0 kg
- Equal rod lengths: l₁ = l₂ = 1.0 m
- Time step: dt = 0.01 s
- Maximum simulation time: 15.0 s

### The Visualization

Each pixel on the canvas represents a unique initial condition:
- **X-axis**: Initial angle of the first pendulum (θ₁), ranging from -π to π
- **Y-axis**: Initial angle of the second pendulum (θ₂), ranging from -π to π
- Both pendulums start at rest (ω₁ = ω₂ = 0)

The simulation runs each initial condition forward in time and measures how long it takes for either pendulum to flip more than π radians from its starting position. This "time to flip" is then mapped to color:
- **Hue**: Represents time to flip (0-15 seconds maps to 0-360° on the color wheel)
- **Black regions**: Stable configurations where no flip occurs within 15 seconds
- **Colored regions**: Chaotic configurations, with hue indicating flip time

## Getting Started

### Prerequisites

Modern web browser with JavaScript enabled (Chrome, Firefox, Safari, Edge)

### Installation

1. Clone or download this repository
2. No build process required - pure vanilla JavaScript!

### Running the Simulation

1. Open `index.html` in your web browser
2. Select your desired resolution:
   - **Low (Fast)**: Quick rendering, lower detail
   - **Medium**: Balanced quality and speed (default)
   - **High (Slow)**: Maximum detail, longer computation time
3. Click **Start Simulation** to begin
4. Watch as the fractal patterns emerge
5. Click **Reset** to clear and start over

## Project Structure

```
emergence/
├── index.html          # Main HTML structure
├── style.css           # Glassmorphic UI styling
├── script.js           # Double pendulum physics and simulation logic
├── download (3).png    # Example output visualization
└── README.md           # This file
```

## Technical Details

### Physics Implementation

The `DoublePendulum` class implements:
- **Equations of motion**: Derived from Lagrangian mechanics for a double pendulum
- **RK4 Integration**: 4th-order Runge-Kutta method for accurate numerical integration
- **State vector**: [θ₁, θ₂, ω₁, ω₂] tracking both angles and angular velocities

### Rendering Strategy

The `Simulation` class uses:
- **Chunked rendering**: Processes 1000 pixels per frame to keep UI responsive
- **Progressive enhancement**: Renders pixels incrementally using `requestAnimationFrame`
- **Canvas API**: Direct pixel manipulation for maximum performance
- **HSL color space**: Creates smooth, perceptually uniform color gradients

## Customization

You can modify the simulation parameters in `script.js`:

```javascript
const CONFIG = {
    g: 9.81,           // Gravitational acceleration
    m1: 1.0,           // Mass of first pendulum
    m2: 1.0,           // Mass of second pendulum
    l1: 1.0,           // Length of first rod
    l2: 1.0,           // Length of second rod
    dt: 0.01,          // Time step for integration
    maxTime: 15.0,     // Maximum simulation time
    chunkSize: 1000    // Pixels rendered per frame
};
```

## Mathematical Background

The double pendulum is a classic example of a **chaotic dynamical system**. Despite being completely deterministic, tiny differences in initial conditions lead to dramatically different outcomes - the "butterfly effect." This sensitive dependence on initial conditions creates the intricate fractal boundaries visible in the visualization.

The system exhibits:
- **Deterministic chaos**: Predictable equations, unpredictable behavior
- **Fractal geometry**: Self-similar patterns at different scales
- **Phase space structure**: Complex topology of stable vs. chaotic regions
- **Lyapunov exponents**: Positive values indicating exponential divergence

## Performance Notes

- **Resolution scaling**: Computation time scales quadratically with resolution
- **Browser threading**: Simulation runs on main thread; browser may feel unresponsive during high-resolution renders
- **Memory usage**: Minimal - no large data structures, direct canvas rendering
- **GPU acceleration**: Canvas operations are hardware-accelerated by most browsers

## Future Enhancements

Potential improvements:
- [ ] Add Web Workers for off-thread computation
- [ ] Export functionality (save PNG/GIF)
- [ ] Real-time pendulum animation overlay
- [ ] Interactive initial condition selection (click to see trajectory)
- [ ] Alternative metrics (Lyapunov exponents, energy conservation)
- [ ] Parameter sliders for masses, lengths, and gravity
- [ ] Zoom and pan functionality

## License

This project is open source and available for educational and personal use.

## Acknowledgments

Inspired by the beautiful complexity of classical mechanics and the emergent patterns of chaos theory.

---

**Enjoy exploring the edge of chaos!** 🎨🔬
