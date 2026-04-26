var c = document.createElement("canvas");
var ctx = c.getContext("2d");
c.width = window.innerWidth;
c.height = window.innerHeight;

// c.width = 500
// c.height = 350

const track = 0.50
document.body.appendChild(c);

window.addEventListener('resize', () => {
    c.width = window.innerWidth;
    c.height = window.innerHeight;
});

var perm = [];
while (perm.length < 255) {
    while (perm.includes(val = Math.floor(Math.random() * 255)));
    perm.push(val);
}

// Particle System
var particles = [];
function spawnParticle(x, y) {
    particles.push({
        x: x, y: y,
        xv: (Math.random() - 0.5) * 2 - speed * 2,
        yv: (Math.random() - 0.5) * 2 - 1,
        life: 20 + Math.random() * 20
    });
}

// Coin System
var coins = [];
var bestScore = localStorage.getItem("bestScore") || 0;
var score = 0;

var lerp = (a, b, t) => a + (b - a) * (1 - Math.cos(t * Math.PI)) / 2;
var noise = x => {
    x = x * 0.01 % 255;
    return lerp(perm[Math.floor(x)], perm[Math.ceil(x)], x - Math.floor(x));
}

var player = new function () {
    this.x = c.width / 4;
    this.y = 100;
    this.yspeed = 0;
    this.rot = 0;
    this.rspeed = 0
    
    // Sound logic
    this.audioCtx = null;
    this.osc = null;

    this.startSound = function() {
        if (this.audioCtx) return;
        this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        this.osc = this.audioCtx.createOscillator();
        this.gain = this.audioCtx.createGain();
        this.osc.type = 'sawtooth';
        this.osc.frequency.setValueAtTime(50, this.audioCtx.currentTime);
        this.gain.gain.setValueAtTime(0, this.audioCtx.currentTime);
        this.osc.connect(this.gain);
        this.gain.connect(this.audioCtx.destination);
        this.osc.start();
    };

    this.updateSound = function() {
        if (!this.osc) return;
        let freq = 50 + Math.abs(speed) * 100 + Math.abs(this.rspeed) * 10;
        this.osc.frequency.setTargetAtTime(freq, this.audioCtx.currentTime, 0.1);
        this.gain.gain.setTargetAtTime(plaing ? 0.05 : 0, this.audioCtx.currentTime, 0.1);
    };

    this.img = new Image();
    this.img.src = "/bike.png";
    this.draw = function () {


        var p1 = c.height - noise(t + this.x) * track;
        var p2 = c.height - noise(t + 5 + this.x) * track;

        var grounded = 0
        if (p1 - 15 > this.y) {
            this.yspeed += 0.1;
        } else {
            this.yspeed -= this.y - (p1 - 15);
            this.y = p1 - 15;
            grounded = 1;
            
            // Spawn particles when grounded and moving
            if (plaing && Math.abs(speed) > 0.1 && Math.random() > 0.5) {
                spawnParticle(this.x - 10, this.y + 10);
            }
        }

        // Collect coins
        coins = coins.filter(c => {
            let dx = this.x - c.x;
            let dy = this.y - c.y;
            let dist = Math.sqrt(dx*dx + dy*dy);
            if (dist < 30) {
                score += 100;
                return false;
            }
            return c.x > -50; // Remove off-screen coins
        });




        if (!plaing || grounded && Math.abs(this.rot) > Math.PI * 0.5) {
            if (plaing) {
                plaing = false;
                if (score > bestScore) {
                    bestScore = score;
                    localStorage.setItem("bestScore", bestScore);
                }
            }
            this.rspeed = 5;
            k.ArrowUp = 1;
            this.x -= speed * 2.5;
        }



        var angle = Math.atan2((p2 - 15) - this.y, (this.x + 5) - this.x)
        this.y += this.yspeed;

        if (grounded && plaing) {
            this.rot -= (this.rot - angle) * 0.5
            this.rspeed = this.rspeed - (angle - this.rot);
        }
        this.rspeed += (k.ArrowLeft - k.ArrowRight) * 0.05
        this.rot -= this.rspeed * 0.005;

        if (this.rot > Math.PI) this.rot = -Math.PI
        if (this.rot < -Math.PI) this.rot = Math.PI

        // this.rot = angle;
        ctx.save();
        ctx.translate(this.x, this.y)
        ctx.rotate(this.rot)
        ctx.drawImage(this.img, -15, -15, 30, 30);
        ctx.restore();

        this.updateSound();
    }


}

var t = 0;
var plaing = true;
var speed = 0;
var k = { ArrowUp: 0, ArrowDown: 0, ArrowLeft: 0, ArrowRight: 0 }
function loop() {
    speed -= (speed - (k.ArrowUp - k.ArrowDown)) * 0.01;
    t += 3 * speed;

    // Neon Background (Dark Void with Grid)
    ctx.fillStyle = "#050508";
    ctx.fillRect(0, 0, c.width, c.height);
    
    // Draw subtle grid
    ctx.strokeStyle = "rgba(0, 255, 255, 0.05)";
    ctx.lineWidth = 1;
    for(let i=0; i<c.width; i+=50) {
        ctx.beginPath();
        ctx.moveTo(i - (t % 50), 0);
        ctx.lineTo(i - (t % 50), c.height);
        ctx.stroke();
    }
    for(let i=0; i<c.height; i+=50) {
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(c.width, i);
        ctx.stroke();
    }

    // Parallax Background (Neon Mountains)
    ctx.strokeStyle = "#300030";
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let i = 0; i < c.width; i++)
        ctx.lineTo(i, c.height - noise(t * 0.2 + i) * (track * 0.4) - 100);
    ctx.stroke();

    // Main Ground (Glowing Neon Line)
    ctx.fillStyle = "rgba(255, 0, 255, 0.05)"; // Faint fill under the line
    ctx.beginPath();
    ctx.moveTo(0, c.height);
    for (let i = 0; i < c.width; i++)
        ctx.lineTo(i, c.height - noise(t + i) * track);
    ctx.lineTo(c.width, c.height);
    ctx.fill();

    ctx.strokeStyle = "#ff00ff"; // Neon Magenta
    ctx.lineWidth = 4;
    ctx.shadowBlur = 15;
    ctx.shadowColor = "#ff00ff";
    ctx.beginPath();
    ctx.moveTo(0, c.height - noise(t) * track);
    for (let i = 0; i < c.width; i++)
        ctx.lineTo(i, c.height - noise(t + i) * track);
    ctx.stroke();
    ctx.shadowBlur = 0; // Reset for other elements

    // Draw Particles (Neon Sparks)
    ctx.fillStyle = "#00ffff"; // Neon Cyan
    ctx.shadowBlur = 10;
    ctx.shadowColor = "#00ffff";
    particles.forEach((p, i) => {
        p.x += p.xv;
        p.y += p.yv;
        p.life--;
        ctx.fillRect(p.x, p.y, 4, 4);
        if (p.life <= 0) particles.splice(i, 1);
    });
    ctx.shadowBlur = 0;

    // Draw & Spawn Coins (Neon Rings)
    if (Math.random() > 0.98 && plaing) {
        let cx = c.width + 50;
        let cy = c.height - noise(t + cx) * track - 50;
        coins.push({ x: cx, y: cy });
    }
    
    coins.forEach(coin => {
        coin.x -= speed * 3;
        ctx.strokeStyle = "#00ffff"; // Neon Cyan
        ctx.lineWidth = 3;
        ctx.shadowBlur = 15;
        ctx.shadowColor = "#00ffff";
        ctx.beginPath();
        ctx.arc(coin.x, coin.y, 10, 0, Math.PI * 2);
        ctx.stroke();
        
        // Inner Glow
        ctx.fillStyle = "rgba(0, 255, 255, 0.2)";
        ctx.fill();
        ctx.shadowBlur = 0;
    });

    // Add glow to bike
    ctx.shadowBlur = 20;
    ctx.shadowColor = "#00ffff";
    player.draw();
    ctx.shadowBlur = 0;

    // Score display (Neon UI)
    score = Math.max(score, Math.floor(t / 10));
    ctx.fillStyle = "#00ffff";
    ctx.textAlign = "left";
    ctx.shadowBlur = 10;
    ctx.shadowColor = "#00ffff";
    ctx.font = "bold 28px 'Outfit'";
    ctx.fillText("SCORE: " + score, 30, 50);
    ctx.fillStyle = "#ff00ff";
    ctx.shadowColor = "#ff00ff";
    ctx.font = "18px 'Outfit'";
    ctx.fillText("BEST: " + bestScore, 30, 80);
    ctx.shadowBlur = 0;

    if (plaing) {
        requestAnimationFrame(loop);
    } else {
        // Neon Game Over Screen
        ctx.fillStyle = "rgba(0,0,0,0.85)";
        ctx.fillRect(0, 0, c.width, c.height);
        ctx.fillStyle = "#ff00ff";
        ctx.textAlign = "center";
        ctx.shadowBlur = 30;
        ctx.shadowColor = "#ff00ff";
        ctx.font = "bold 80px 'Outfit'";
        ctx.fillText("GAME OVER", c.width / 2, c.height / 2);
        ctx.fillStyle = "#00ffff";
        ctx.shadowColor = "#00ffff";
        ctx.font = "20px 'Outfit'";
        ctx.fillText("Press 'Enter' to Restart", c.width / 2, c.height / 2 + 70);
        ctx.shadowBlur = 0;
    }

    // Mobile Controls UI (Neon cues)
    if ('ontouchstart' in window) {
        ctx.strokeStyle = "rgba(0, 255, 255, 0.2)";
        ctx.lineWidth = 2;
        ctx.strokeRect(20, c.height - 100, c.width/2 - 40, 80);
        ctx.strokeRect(c.width/2 + 20, c.height - 100, c.width/2 - 40, 80);
        
        ctx.fillStyle = "rgba(0, 255, 255, 0.5)";
        ctx.font = "bold 16px 'Outfit'";
        ctx.textAlign = "center";
        ctx.fillText("ROTATE", c.width / 4, c.height - 50);
        ctx.fillText("GAS", c.width * 0.75, c.height - 50);
    }
}

onkeydown = (e) => {
    player.startSound();
    k[e.key] = true;
    if (e.key === "Enter" && !plaing) {
        location.reload();
    }
}
onkeyup = (e) => k[e.key] = false

// Touch Controls
ontouchstart = (e) => {
    player.startSound();
    if (!plaing) location.reload();
    let t = e.touches[0];
    if (t.clientX < window.innerWidth / 2) {
        k.ArrowLeft = true;
    } else {
        k.ArrowUp = true;
    }
}
ontouchend = (e) => {
    k.ArrowUp = false;
    k.ArrowLeft = false;
}

loop();