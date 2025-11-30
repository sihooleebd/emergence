const CONFIG = {
    g: 9.81,
    m1: 1.0,
    m2: 1.0,
    l1: 1.0,
    l2: 1.0,
    dt: 0.01,
    maxTime: 15.0,
    chunkSize: 1000
};

class DoublePendulum {
    constructor(theta1, theta2, omega1, omega2) {
        this.theta1 = theta1;
        this.theta2 = theta2;
        this.omega1 = omega1;
        this.omega2 = omega2;
    }


    getDerivatives(state) {
        const { theta1, theta2, omega1, omega2 } = state;
        const { g, m1, m2, l1, l2 } = CONFIG;

        const delta = theta1 - theta2;
        const den1 = (m1 + m2) * l1 - m2 * l1 * Math.cos(delta) * Math.cos(delta);
        const den2 = (l2 / l1) * den1;

        const dTheta1 = omega1;
        const dTheta2 = omega2;

        const dOmega1 = (-m2 * l1 * omega1 * omega1 * Math.sin(delta) * Math.cos(delta) +
            m2 * g * Math.sin(theta2) * Math.cos(delta) +
            m2 * l2 * omega2 * omega2 * Math.sin(delta) -
            (m1 + m2) * g * Math.sin(theta1)) / den1;

        const dOmega2 = (m2 * l2 * omega2 * omega2 * Math.sin(delta) * Math.cos(delta) +
            (m1 + m2) * g * Math.sin(theta1) * Math.cos(delta) +
            (m1 + m2) * l1 * omega1 * omega1 * Math.sin(delta) -
            (m1 + m2) * g * Math.sin(theta2)) / den2;

        return { dTheta1, dTheta2, dOmega1, dOmega2 };
    }

    step(dt) {
        const state = {
            theta1: this.theta1,
            theta2: this.theta2,
            omega1: this.omega1,
            omega2: this.omega2
        };

        const k1 = this.getDerivatives(state);

        const state2 = {
            theta1: state.theta1 + k1.dTheta1 * dt * 0.5,
            theta2: state.theta2 + k1.dTheta2 * dt * 0.5,
            omega1: state.omega1 + k1.dOmega1 * dt * 0.5,
            omega2: state.omega2 + k1.dOmega2 * dt * 0.5
        };
        const k2 = this.getDerivatives(state2);

        const state3 = {
            theta1: state.theta1 + k2.dTheta1 * dt * 0.5,
            theta2: state.theta2 + k2.dTheta2 * dt * 0.5,
            omega1: state.omega1 + k2.dOmega1 * dt * 0.5,
            omega2: state.omega2 + k2.dOmega2 * dt * 0.5
        };
        const k3 = this.getDerivatives(state3);

        const state4 = {
            theta1: state.theta1 + k3.dTheta1 * dt,
            theta2: state.theta2 + k3.dTheta2 * dt,
            omega1: state.omega1 + k3.dOmega1 * dt,
            omega2: state.omega2 + k3.dOmega2 * dt
        };
        const k4 = this.getDerivatives(state4);

        this.theta1 += (k1.dTheta1 + 2 * k2.dTheta1 + 2 * k3.dTheta1 + k4.dTheta1) * dt / 6;
        this.theta2 += (k1.dTheta2 + 2 * k2.dTheta2 + 2 * k3.dTheta2 + k4.dTheta2) * dt / 6;
        this.omega1 += (k1.dOmega1 + 2 * k2.dOmega1 + 2 * k3.dOmega1 + k4.dOmega1) * dt / 6;
        this.omega2 += (k1.dOmega2 + 2 * k2.dOmega2 + 2 * k3.dOmega2 + k4.dOmega2) * dt / 6;
    }
}

class Simulation {
    constructor() {
        this.canvas = document.getElementById('simulationCanvas');
        this.ctx = this.canvas.getContext('2d', { willReadFrequently: true });
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        this.isRunning = false;
        this.livePreviewEnabled = false;
        this.isRendering16K = false;

        // Simulation state
        this.pixelIndex = 0;
        this.resolution = 8; // Low res for live preview
        this.offscreenCanvas = null;
        this.offscreenCtx = null;

        this.resize();
        window.addEventListener('resize', () => this.resize());

        this.setupUI();
        this.setupParameterControls();
    }

    resize() {
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        this.canvas.width = this.width;
        this.canvas.height = this.height;
        if (this.livePreviewEnabled) {
            this.restartLivePreview();
        }
    }

    setupUI() {
        // Live preview toggle
        const livePreviewToggle = document.getElementById('livePreviewToggle');
        livePreviewToggle.addEventListener('change', (e) => {
            this.livePreviewEnabled = e.target.checked;
            if (this.livePreviewEnabled) {
                this.startLivePreview();
            } else {
                this.stopLivePreview();
            }
        });

        // 16K render button
        document.getElementById('render16KBtn').addEventListener('click', () => this.render16K());

        // Download button
        document.getElementById('downloadBtn').addEventListener('click', () => this.downloadImage());
    }

    setupParameterControls() {
        const params = [
            { id: 'g', key: 'g', display: 'gValue' },
            { id: 'm1', key: 'm1', display: 'm1Value' },
            { id: 'm2', key: 'm2', display: 'm2Value' },
            { id: 'l1', key: 'l1', display: 'l1Value' },
            { id: 'l2', key: 'l2', display: 'l2Value' },
            { id: 'dt', key: 'dt', display: 'dtValue' },
            { id: 'maxTime', key: 'maxTime', display: 'maxTimeValue' }
        ];

        params.forEach(param => {
            const slider = document.getElementById(`${param.id}Slider`);
            const display = document.getElementById(param.display);

            slider.addEventListener('input', (e) => {
                const value = parseFloat(e.target.value);
                CONFIG[param.key] = value;
                display.textContent = value.toFixed(param.id === 'dt' ? 3 : param.id === 'maxTime' ? 1 : 2);

                // Restart live preview if enabled
                if (this.livePreviewEnabled) {
                    this.restartLivePreview();
                }
            });
        });
    }

    startLivePreview() {
        this.resolution = 8; // Low resolution for speed
        this.isRunning = false;
        this.reset();
        this.isRunning = true;
        document.getElementById('statusText').innerText = 'Live Preview (Low Res)';
        this.renderLoop();
    }

    stopLivePreview() {
        this.isRunning = false;
        this.reset();
        document.getElementById('statusText').innerText = 'Ready - Enable Live Preview or click Render';
    }

    restartLivePreview() {
        if (!this.livePreviewEnabled) return;
        this.isRunning = false;
        this.reset();
        this.isRunning = true;
        this.renderLoop();
    }

    async render16K() {
        if (this.isRunning) return;

        // Stop live preview
        const wasLivePreview = this.livePreviewEnabled;
        if (wasLivePreview) {
            document.getElementById('livePreviewToggle').checked = false;
            this.livePreviewEnabled = false;
        }

        // Create offscreen 16K canvas (15360×8640 = 132.7M pixels)
        const width16K = 15360;
        const height16K = 8640;

        this.offscreenCanvas = document.createElement('canvas');
        this.offscreenCanvas.width = width16K;
        this.offscreenCanvas.height = height16K;
        this.offscreenCtx = this.offscreenCanvas.getContext('2d');

        this.isRendering16K = true;
        this.isRunning = true;
        this.pixelIndex = 0;
        this.resolution = 1; // Maximum resolution

        document.getElementById('statusText').innerText = 'Rendering 16K image... (this will take several minutes)';
        document.getElementById('progressFill').style.width = '0%';

        await this.render16KLoop(width16K, height16K);
    }

    async render16KLoop(width, height) {
        const totalPixels = (width / this.resolution) * (height / this.resolution);
        const cols = Math.ceil(width / this.resolution);

        while (this.pixelIndex < totalPixels && this.isRunning) {
            // Process large chunk (50,000 pixels per frame for much faster rendering)
            for (let i = 0; i < 50000 && this.pixelIndex < totalPixels; i++) {
                const idx = this.pixelIndex;
                const col = idx % cols;
                const row = Math.floor(idx / cols);

                const x = col * this.resolution;
                const y = row * this.resolution;

                const theta1 = (x / width) * 2 * Math.PI - Math.PI;
                const theta2 = (y / height) * 2 * Math.PI - Math.PI;

                const value = this.simulateTimeToFlip(theta1, theta2);

                const hue = (value / CONFIG.maxTime) * 360;
                const saturation = 100;
                const lightness = value === CONFIG.maxTime ? 0 : 50;

                this.offscreenCtx.fillStyle = `hsl(${hue}, ${saturation}%, ${lightness}%)`;
                this.offscreenCtx.fillRect(x, y, this.resolution, this.resolution);

                this.pixelIndex++;
            }

            const progress = (this.pixelIndex / totalPixels) * 100;
            document.getElementById('progressFill').style.width = `${progress}%`;
            document.getElementById('statusText').innerText = `Rendering 16K: ${progress.toFixed(1)}%`;

            // Yield to browser
            await new Promise(resolve => setTimeout(resolve, 0));
        }

        if (this.pixelIndex >= totalPixels) {
            this.isRunning = false;
            this.isRendering16K = false;
            document.getElementById('statusText').innerText = '16K Render Complete! Click Download.';
            document.getElementById('downloadBtn').style.display = 'block';

            // Display preview on main canvas
            this.ctx.clearRect(0, 0, this.width, this.height);
            this.ctx.drawImage(this.offscreenCanvas, 0, 0, this.width, this.height);
        }
    }

    downloadImage() {
        if (!this.offscreenCanvas) return;

        this.offscreenCanvas.toBlob((blob) => {
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `double-pendulum-16k-${Date.now()}.png`;
            a.click();
            URL.revokeObjectURL(url);
        }, 'image/png');
    }

    reset() {
        this.isRunning = false;
        this.ctx.clearRect(0, 0, this.width, this.height);
        this.pixelIndex = 0;
        document.getElementById('progressFill').style.width = '0%';
        if (!this.livePreviewEnabled && !this.isRendering16K) {
            document.getElementById('statusText').innerText = 'Ready - Enable Live Preview or click Render';
        }
        document.getElementById('downloadBtn').style.display = 'none';
    }

    getInitialConditions(x, y, width, height) {
        const theta1 = (x / width) * 2 * Math.PI - Math.PI;
        const theta2 = (y / height) * 2 * Math.PI - Math.PI;
        return { theta1, theta2, omega1: 0, omega2: 0 };
    }

    simulatePoint(theta1, theta2) {
        const pendulum = new DoublePendulum(theta1, theta2, 0, 0);
        let timeToFlip = CONFIG.maxTime;
        let flipped = false;

        for (let t = 0; t < CONFIG.maxTime; t += CONFIG.dt) {
            pendulum.step(CONFIG.dt);

        }


        return Math.abs(pendulum.omega1 + pendulum.omega2);
    }

    simulateTimeToFlip(theta1, theta2) {
        const pendulum = new DoublePendulum(theta1, theta2, 0, 0);
        let t = 0;
        const startTheta1 = theta1;
        const startTheta2 = theta2;

        for (t = 0; t < CONFIG.maxTime; t += CONFIG.dt) {
            pendulum.step(CONFIG.dt);

            if (Math.abs(pendulum.theta2 - startTheta2) > Math.PI) {
                return t;
            }
            if (Math.abs(pendulum.theta1 - startTheta1) > Math.PI) {
                return t;
            }
        }
        return CONFIG.maxTime;
    }

    renderLoop() {
        if (!this.isRunning) return;

        const totalPixels = (this.width / this.resolution) * (this.height / this.resolution);
        const cols = Math.ceil(this.width / this.resolution);

        for (let i = 0; i < CONFIG.chunkSize; i++) {
            if (this.pixelIndex >= totalPixels) {
                if (this.livePreviewEnabled) {
                    // Live preview complete, keep it running
                    document.getElementById('statusText').innerText = 'Live Preview (Low Res) - Complete';
                } else {
                    this.isRunning = false;
                    document.getElementById('statusText').innerText = 'Done';
                }
                document.getElementById('progressFill').style.width = '100%';
                return;
            }

            const idx = this.pixelIndex;
            const col = idx % cols;
            const row = Math.floor(idx / cols);

            const x = col * this.resolution;
            const y = row * this.resolution;

            const { theta1, theta2 } = this.getInitialConditions(x, y, this.width, this.height);

            const value = this.simulateTimeToFlip(theta1, theta2);

            const hue = (value / CONFIG.maxTime) * 360;
            const saturation = 100;
            const lightness = value === CONFIG.maxTime ? 0 : 50;

            this.ctx.fillStyle = `hsl(${hue}, ${saturation}%, ${lightness}%)`;
            this.ctx.fillRect(x, y, this.resolution, this.resolution);

            this.pixelIndex++;
        }

        const progress = (this.pixelIndex / totalPixels) * 100;
        document.getElementById('progressFill').style.width = `${progress}%`;

        requestAnimationFrame(() => this.renderLoop());
    }
}

// Initialize
const sim = new Simulation();
window.sim = sim; // Make globally accessible for debugging and event handlers
