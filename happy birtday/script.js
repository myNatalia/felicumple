window.addEventListener("load", function () {
    const canvas = document.getElementById("fireworks-canvas");
    const ctx = canvas.getContext("2d");
    const birthdayCard = document.getElementById("birthday-card");

    // Initialize canvas size
    let maxx = window.innerWidth;
    let maxy = window.innerHeight;
    canvas.width = maxx;
    canvas.height = maxy;

    // Handle window resizing
    window.addEventListener("resize", () => {
        maxx = window.innerWidth;
        maxy = window.innerHeight;
        canvas.width = maxx;
        canvas.height = maxy;
    });

    // Utility functions for randomness
    const rand = (min, max) => Math.random() * (max - min) + min;
    const randInt = (min, max) => Math.floor(Math.random() * (max - min) + min);
    const randColor = () => `hsl(${randInt(0, 360)}, 100%, 50%)`;

    // Particle class representing individual explosion particles
    class Particle {
        constructor(x, y, color, speed, direction, gravity, friction, size) {
            this.x = x;
            this.y = y;
            this.color = color;
            this.speed = speed;
            this.direction = direction;
            this.vx = Math.cos(direction) * speed;
            this.vy = Math.sin(direction) * speed;
            this.gravity = gravity;
            this.friction = friction;
            this.alpha = 1;
            this.decay = rand(0.005, 0.02);
            this.size = size;
        }

        update() {
            this.vx *= this.friction;
            this.vy *= this.friction;
            this.vy += this.gravity;
            this.x += this.vx;
            this.y += this.vy;
            this.alpha -= this.decay;
        }

        draw(ctx) {
            ctx.save();
            ctx.globalAlpha = this.alpha;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fillStyle = this.color;
            ctx.fill();
            ctx.restore();
        }

        isAlive() {
            return this.alpha > 0;
        }
    }

    // Firework class representing ascending fireworks
    class Firework {
        constructor(x, y, targetY, color, speed, size) {
            this.x = x;
            this.y = y;
            this.targetY = targetY;
            this.color = color;
            this.speed = speed;
            this.size = size;
            this.angle = -Math.PI / 2 + rand(-0.3, 0.3);
            this.vx = Math.cos(this.angle) * this.speed;
            this.vy = Math.sin(this.angle) * this.speed;
            this.trail = [];
            this.trailLength = randInt(10, 25);
            this.exploded = false;
        }

        update() {
            this.trail.push({ x: this.x, y: this.y });
            if (this.trail.length > this.trailLength) {
                this.trail.shift();
            }

            this.x += this.vx;
            this.y += this.vy;
            this.vy += 0.02;

            if (this.vy >= 0 || this.y <= this.targetY) {
                this.explode();
                return false;
            }
            return true;
        }

        explode() {
            const numParticles = randInt(50, 150);
            for (let i = 0; i < numParticles; i++) {
                const angle = rand(0, Math.PI * 2);
                const speed = rand(2, 7);
                const particleSize = rand(1, 5);
                explosions.push(
                    new Particle(
                        this.x,
                        this.y,
                        this.color,
                        speed,
                        angle,
                        0.05,
                        0.98,
                        particleSize
                    )
                );
            }
        }

        draw(ctx) {
            ctx.save();
            ctx.beginPath();
            if (this.trail.length > 1) {
                ctx.moveTo(this.trail[0].x, this.trail[0].y);
                for (let point of this.trail) {
                    ctx.lineTo(point.x, point.y);
                }
            } else {
                ctx.moveTo(this.x, this.y);
                ctx.lineTo(this.x, this.y);
            }
            ctx.strokeStyle = this.color;
            ctx.lineWidth = this.size;
            ctx.lineCap = "round";
            ctx.stroke();
            ctx.restore();
        }
    }

    let fireworks = [];
    let explosions = [];
    let animationId;
    let startTime = Date.now();

    // Launch a new firework at random intervals
    function launchFirework() {
        const currentTime = Date.now();
        if (currentTime - startTime > 10000) {
            return; // Stop launching after 10 seconds
        }

        const x = rand(maxx * 0.1, maxx * 0.9);
        const y = maxy;
        const targetY = rand(maxy * 0.1, maxy * 0.4);
        const color = randColor();
        const speed = rand(4, 8);
        const size = rand(2, 5);
        fireworks.push(new Firework(x, y, targetY, color, speed, size));

        const timeout = rand(300, 800);
        setTimeout(launchFirework, timeout);
    }

    // Start the first firework launch
    launchFirework();

    // Animation loop
    function animate() {
        const currentTime = Date.now();
        if (currentTime - startTime > 10000 && fireworks.length === 0 && explosions.length === 0) {
            // After 10 seconds and all fireworks/explosions are gone
            canvas.style.display = 'none';
            birthdayCard.style.display = 'flex';
            document.body.style.backgroundColor = '#ffebee';
            return;
        }

        ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
        ctx.fillRect(0, 0, maxx, maxy);

        for (let i = fireworks.length - 1; i >= 0; i--) {
            const firework = fireworks[i];
            if (!firework.update()) {
                fireworks.splice(i, 1);
            } else {
                firework.draw(ctx);
            }
        }

        for (let i = explosions.length - 1; i >= 0; i--) {
            const particle = explosions[i];
            particle.update();
            if (particle.isAlive()) {
                particle.draw(ctx);
            } else {
                explosions.splice(i, 1);
            }
        }

        animationId = requestAnimationFrame(animate);
    }

    animate();

    // Optional: Launch fireworks on click (even during the 10 seconds)
    window.addEventListener("click", function (event) {
        const currentTime = Date.now();
        if (currentTime - startTime <= 10000) {
            const x = event.clientX;
            const y = maxy;
            const targetY = event.clientY;
            const color = randColor();
            const speed = rand(4, 8);
            const size = rand(2, 5);
            fireworks.push(new Firework(x, y, targetY, color, speed, size));
        }
    });
});