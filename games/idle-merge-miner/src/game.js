import { CONFIG, MINERAL_TYPES, UPGRADES } from "./config.js";

const MatterApi = globalThis.Matter;

if (!MatterApi) {
  throw new Error("Matter.js failed to load. Check your network connection or CDN access.");
}

const {
  Engine,
  Render,
  Runner,
  Bodies,
  Body,
  Constraint,
  Composite,
  Events,
  Query,
  Vector,
} = MatterApi;

class Crusher {
  constructor(game) {
    this.game = game;
    this.bounds = null;
    this.bodies = {};
    this.gears = [
      { index: -1, direction: 1, angle: 0 },
      { index: 0, direction: -1, angle: 0 },
      { index: 1, direction: 1, angle: 0 },
    ];
  }

  createBodies() {
    this.bounds = this.getBounds();
    this.bodies.leftWall = this.createStaticBody("crusher-left-wall", this.bounds.left + 9, this.bounds.centerY, 18, this.bounds.height);
    this.bodies.rightWall = this.createStaticBody("crusher-right-wall", this.bounds.right - 9, this.bounds.centerY, 18, this.bounds.height);
    this.bodies.bottomWall = this.createStaticBody("crusher-bottom-wall", this.bounds.centerX, this.bounds.bottom + 9, this.bounds.width, 18);
    this.bodies.leftHopperWall = this.createHopperWall("crusher-left-hopper-wall", "left");
    this.bodies.rightHopperWall = this.createHopperWall("crusher-right-hopper-wall", "right");
    Composite.add(this.game.engine.world, Object.values(this.bodies));
  }

  createStaticBody(label, x, y, width, height) {
    return Bodies.rectangle(x, y, width, height, {
      isStatic: true,
      label,
      render: { visible: false },
    });
  }

  createHopperWall(label, side) {
    const wall = this.getHopperWall(side);
    return Bodies.rectangle(wall.x, wall.y, wall.length, CONFIG.crusher.wallThickness, {
      angle: wall.angle,
      isStatic: true,
      label,
      render: { visible: false },
    });
  }

  update(deltaMs, stones) {
    for (const gear of this.gears) {
      gear.angle += CONFIG.crusher.gearSpeed * deltaMs * gear.direction;
    }

    for (const stone of stones) {
      const mineral = getMineralData(stone);
      mineral.isInsideCrusher = mineral.isInsideCrusher || this.hasPassedIntakeThreshold(stone);
      if (mineral.isInsideCrusher) {
        stone.render.visible = false;
        this.containInsideMineral(stone);
        this.tryCrushStone(stone, deltaMs);
      }
    }
  }

  containInsideMineral(stone) {
    const mineral = getMineralData(stone);
    const ceilingY = this.getInternalCeilingY();
    const inner = this.getInnerRect();

    if (stone.bounds.min.y < ceilingY) {
      const correction = ceilingY - stone.bounds.min.y + 4;
      Body.translate(stone, { x: 0, y: correction });
      if (stone.velocity.y < 0) {
        Body.setVelocity(stone, { x: stone.velocity.x * 0.72, y: Math.abs(stone.velocity.y) * 0.42 });
      }
      Body.update(stone, 16);
    }

    if (stone.bounds.min.x < inner.left) {
      Body.translate(stone, { x: inner.left - stone.bounds.min.x + 2, y: 0 });
      Body.setVelocity(stone, { x: Math.abs(stone.velocity.x) * 0.45, y: stone.velocity.y });
      Body.update(stone, 16);
    }

    if (stone.bounds.max.x > inner.right) {
      Body.translate(stone, { x: inner.right - stone.bounds.max.x - 2, y: 0 });
      Body.setVelocity(stone, { x: -Math.abs(stone.velocity.x) * 0.45, y: stone.velocity.y });
      Body.update(stone, 16);
    }

    this.clampInsideSpeed(stone);
    mineral.isInsideCrusher = true;
  }

  clampInsideSpeed(stone) {
    const speed = Vector.magnitude(stone.velocity);
    if (speed > CONFIG.crusher.crush.maxCrusherSpeed) {
      Body.setVelocity(stone, Vector.mult(Vector.normalise(stone.velocity), CONFIG.crusher.crush.maxCrusherSpeed));
    }
  }

  resize() {
    this.bounds = this.getBounds();
    this.setBody(this.bodies.leftWall, this.bounds.left + 9, this.bounds.centerY, 18, this.bounds.height);
    this.setBody(this.bodies.rightWall, this.bounds.right - 9, this.bounds.centerY, 18, this.bounds.height);
    this.setBody(this.bodies.bottomWall, this.bounds.centerX, this.bounds.bottom + 9, this.bounds.width, 18);
    this.setHopperBody(this.bodies.leftHopperWall, "left");
    this.setHopperBody(this.bodies.rightHopperWall, "right");
  }

  setBody(body, x, y, width, height) {
    Body.setPosition(body, Vector.create(x, y));
    Body.setVertices(body, Bodies.rectangle(x, y, width, height).vertices);
  }

  setHopperBody(body, side) {
    const wall = this.getHopperWall(side);
    Body.setPosition(body, Vector.create(wall.x, wall.y));
    Body.setAngle(body, wall.angle);
    Body.setVertices(body, Bodies.rectangle(wall.x, wall.y, wall.length, CONFIG.crusher.wallThickness, { angle: wall.angle }).vertices);
  }

  containsMineral(stone) {
    const inner = this.getInnerRect();
    const intake = this.getIntakeRect();
    const mineral = getMineralData(stone);
    if (mineral.isGrabbed) {
      return false;
    }
    return (
      (stone.position.x > inner.left &&
        stone.position.x < inner.right &&
        stone.position.y > inner.top &&
        stone.position.y < inner.bottom) ||
      (stone.position.x > intake.left &&
        stone.position.x < intake.right &&
        stone.bounds.min.y > intake.top &&
        stone.position.y < intake.bottom + CONFIG.crusher.hopperHeight)
    );
  }

  hasPassedIntakeThreshold(stone) {
    const throat = this.getThroatRect();
    const intake = this.getIntakeRect();
    const mineral = getMineralData(stone);
    return (
      !mineral.isGrabbed &&
      stone.position.x > intake.left &&
      stone.position.x < intake.right &&
      stone.bounds.min.y > throat.top + CONFIG.crusher.crush.internalCeilingPadding
    );
  }

  tryCrushStone(stone) {
    const mineral = getMineralData(stone);
    if (mineral.removed || mineral.isGrabbed || mineral.isCrushingComplete) {
      return;
    }

    const now = performance.now();
    if (now - mineral.lastCrushHitTime < CONFIG.crusher.crush.hitCooldownMs || !this.isInImpactZone(stone)) {
      return;
    }

    mineral.lastCrushHitTime = now;
    mineral.crushHits += 1;
    this.game.spawnCrushImpact(stone.position, mineral);

    const nextScale = CONFIG.crusher.crush.scaleSteps[mineral.crushHits - 1] ?? 0;
    if (mineral.crushHits >= CONFIG.crusher.crush.hitsRequired || nextScale <= 0) {
      mineral.isCrushingComplete = true;
      this.game.destroyCrushedMineral(stone);
      return;
    }

    this.game.scaleMineralTo(stone, nextScale);
    Body.translate(stone, { x: 0, y: -6 });
    Body.setVelocity(stone, {
      x: randomBetween(-CONFIG.crusher.crush.bounceVelocityX, CONFIG.crusher.crush.bounceVelocityX),
      y: -CONFIG.crusher.crush.bounceVelocityY,
    });
    this.clampInsideSpeed(stone);
  }

  isInImpactZone(stone) {
    const zone = this.getImpactZoneRect();
    return (
      stone.bounds.max.x > zone.left &&
      stone.bounds.min.x < zone.right &&
      stone.bounds.max.y > zone.top &&
      stone.bounds.min.y < zone.bottom
    );
  }

  draw(ctx) {
    this.drawBackPanel(ctx);
    this.drawChamberContents(ctx);
    this.drawGears(ctx);
    this.drawFrontFrame(ctx);
    this.drawDebug(ctx);
  }

  drawBackPanel(ctx) {
    const b = this.bounds;
    ctx.save();
    ctx.fillStyle = "rgba(0, 0, 0, 0.26)";
    ctx.beginPath();
    ctx.ellipse(b.centerX, b.bottom + 10, b.width * 0.48, 14, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "rgba(52, 59, 70, 0.72)";
    ctx.fillRect(b.left, b.top, b.width, b.height);
    ctx.fillStyle = CONFIG.crusher.colors.inner;
    ctx.fillRect(b.left + 24, b.top + CONFIG.crusher.hopperHeight, b.width - 48, b.height - CONFIG.crusher.hopperHeight - 22);
    ctx.fillStyle = "rgba(255, 255, 255, 0.04)";
    ctx.fillRect(b.left + 28, b.top + CONFIG.crusher.hopperHeight + 10, b.width - 56, CONFIG.crusher.chamberHeight - 18);
    ctx.restore();
  }

  drawChamberContents(ctx) {
    const clip = this.getVisibleChamberRect();
    ctx.save();
    ctx.beginPath();
    ctx.rect(clip.left, clip.top, clip.right - clip.left, clip.bottom - clip.top);
    ctx.clip();

    for (const stone of this.game.stones) {
      const mineral = getMineralData(stone);
      if (mineral.isInsideCrusher && !mineral.removed) {
        drawMineralBody(ctx, stone);
      }
    }

    this.game.drawDust(ctx, true);
    this.game.drawCoinParticles(ctx, true);
    ctx.restore();
  }

  drawFrontFrame(ctx) {
    const b = this.bounds;
    ctx.save();
    ctx.strokeStyle = CONFIG.crusher.colors.frame;
    ctx.lineWidth = 14;
    ctx.beginPath();
    ctx.moveTo(b.left + 8, b.top + 8);
    ctx.lineTo(b.left + 8, b.bottom - 8);
    ctx.lineTo(b.right - 8, b.bottom - 8);
    ctx.lineTo(b.right - 8, b.top + 8);
    ctx.stroke();

    ctx.strokeStyle = CONFIG.crusher.colors.trim;
    ctx.lineWidth = 2;
    const intake = this.getIntakeRect();
    const throat = this.getThroatRect();
    ctx.beginPath();
    ctx.moveTo(intake.left, b.top + 12);
    ctx.lineTo(throat.left, b.top + CONFIG.crusher.hopperHeight);
    ctx.lineTo(throat.right, b.top + CONFIG.crusher.hopperHeight);
    ctx.lineTo(intake.right, b.top + 12);
    ctx.stroke();

    ctx.fillStyle = "rgba(255, 255, 255, 0.08)";
    ctx.fillRect(intake.left, b.top + 6, intake.width, 3);

    const zone = this.getImpactZoneRect();
    ctx.fillStyle = "rgba(240, 179, 90, 0.04)";
    ctx.fillRect(zone.left, zone.top, zone.right - zone.left, zone.bottom - zone.top);
    ctx.restore();
  }

  drawDebug(ctx) {
    if (!CONFIG.crusher.debugCrusher) {
      return;
    }

    const intake = this.getIntakeRect();
    const chamber = this.getVisibleChamberRect();
    const impact = this.getImpactZoneRect();
    const ceilingY = this.getInternalCeilingY();

    ctx.save();
    ctx.lineWidth = 2;
    ctx.strokeStyle = "rgba(107, 229, 164, 0.8)";
    ctx.strokeRect(intake.left, intake.top, intake.right - intake.left, intake.bottom - intake.top);
    ctx.strokeStyle = "rgba(90, 141, 255, 0.75)";
    ctx.strokeRect(chamber.left, chamber.top, chamber.right - chamber.left, chamber.bottom - chamber.top);
    ctx.strokeStyle = "rgba(255, 79, 95, 0.85)";
    ctx.beginPath();
    ctx.moveTo(chamber.left, ceilingY);
    ctx.lineTo(chamber.right, ceilingY);
    ctx.stroke();
    ctx.strokeStyle = "rgba(240, 179, 90, 0.85)";
    ctx.strokeRect(impact.left, impact.top, impact.right - impact.left, impact.bottom - impact.top);

    ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
    ctx.font = "700 11px Inter, system-ui, sans-serif";
    for (const stone of this.game.stones) {
      const mineral = getMineralData(stone);
      if (mineral.isInsideCrusher) {
        ctx.fillText("inside", stone.position.x - 14, stone.position.y - mineral.radius - 8);
      }
    }
    ctx.restore();
  }

  drawGears(ctx) {
    const baseY = this.getGearY();
    const spacing = CONFIG.crusher.gearRadius * 2 + CONFIG.crusher.gearGap;
    for (const gear of this.gears) {
      this.drawGear(ctx, this.bounds.centerX + gear.index * spacing, baseY, CONFIG.crusher.gearRadius, gear.angle);
    }
  }

  drawGear(ctx, x, y, radius, angle) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    ctx.fillStyle = CONFIG.crusher.colors.gearDark;
    for (let i = 0; i < CONFIG.crusher.gearTeeth; i += 1) {
      ctx.rotate((Math.PI * 2) / CONFIG.crusher.gearTeeth);
      ctx.fillRect(radius - 4, -5, 11, 10);
    }
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.fillStyle = CONFIG.crusher.colors.gear;
    ctx.fill();
    ctx.beginPath();
    ctx.arc(0, 0, radius * 0.38, 0, Math.PI * 2);
    ctx.fillStyle = CONFIG.crusher.colors.inner;
    ctx.fill();
    ctx.restore();
  }

  getBounds() {
    const width = clamp(
      this.game.bounds.width * CONFIG.crusher.widthRatio,
      CONFIG.crusher.minWidth,
      CONFIG.crusher.maxWidth,
    );
    const height = CONFIG.crusher.height;
    const bottom = this.game.bounds.height - CONFIG.crusher.bottomOffset;
    return {
      left: 0,
      right: width,
      top: bottom - height,
      bottom,
      width,
      height,
      centerX: width / 2,
      centerY: bottom - height / 2,
      wallThickness: CONFIG.crusher.wallThickness,
    };
  }

  getIntakeRect() {
    const width = this.bounds.width * CONFIG.crusher.intakeWidthRatio;
    return {
      left: this.bounds.centerX - width / 2,
      right: this.bounds.centerX + width / 2,
      top: this.bounds.top,
      bottom: this.bounds.top + CONFIG.crusher.intakeDetectDepth,
      width,
      height: CONFIG.crusher.intakeDetectDepth,
    };
  }

  getThroatRect() {
    const width = this.bounds.width * CONFIG.crusher.throatWidthRatio;
    return {
      left: this.bounds.centerX - width / 2,
      right: this.bounds.centerX + width / 2,
      top: this.bounds.top + CONFIG.crusher.hopperHeight,
      width,
    };
  }

  getHopperWall(side) {
    const intake = this.getIntakeRect();
    const throat = this.getThroatRect();
    const start = side === "left" ? { x: intake.left, y: this.bounds.top + 8 } : { x: intake.right, y: this.bounds.top + 8 };
    const end = side === "left" ? { x: throat.left, y: throat.top } : { x: throat.right, y: throat.top };
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    return {
      x: (start.x + end.x) / 2,
      y: (start.y + end.y) / 2,
      length: Math.hypot(dx, dy),
      angle: Math.atan2(dy, dx),
    };
  }

  getImpactZoneRect() {
    const gearY = this.getGearY();
    return {
      left: this.bounds.left + 26,
      right: this.bounds.right - 26,
      top: gearY - CONFIG.crusher.gearRadius - CONFIG.crusher.crush.impactZoneHeight,
      bottom: gearY + CONFIG.crusher.gearRadius * 0.35,
    };
  }

  getVisibleChamberRect() {
    return {
      left: this.bounds.left + CONFIG.crusher.wallThickness,
      right: this.bounds.right - CONFIG.crusher.wallThickness,
      top: this.getInternalCeilingY(),
      bottom: this.bounds.bottom - 12,
    };
  }

  getInternalCeilingY() {
    return this.bounds.top + CONFIG.crusher.hopperHeight + CONFIG.crusher.crush.internalCeilingPadding;
  }

  getGearY() {
    return this.bounds.bottom - 42;
  }

  getInnerRect() {
    return {
      left: this.bounds.left + CONFIG.crusher.wallThickness,
      right: this.bounds.width - CONFIG.crusher.wallThickness,
      top: this.bounds.top + CONFIG.crusher.wallThickness,
      bottom: this.bounds.bottom - 6,
    };
  }
}

class MiningGame {
  constructor(canvas) {
    this.canvas = canvas;
    this.engine = Engine.create();
    this.runner = Runner.create();
    this.render = null;
    this.floor = null;
    this.leftWall = null;
    this.miningWall = null;
    this.minerCollider = null;
    this.crusher = new Crusher(this);
    this.hoveredStone = null;
    this.grabbedStone = null;
    this.grabConstraint = null;
    this.stones = [];
    this.dustParticles = [];
    this.coinParticles = [];
    this.mergeEffects = [];
    this.mergeCandidates = new Map();
    this.lastDebugCommand = "";
    this.gameState = {
      score: 0,
      coins: 0,
      isGameOver: false,
      dangerTimeMs: 0,
    };
    this.upgrades = this.createInitialUpgrades();
    this.stoneCount = 0;
    this.lastSwingAt = 0;
    this.lastMergeCheckAt = 0;
    this.lastUpdateAt = 0;
    this.swingProgress = 0;
    this.pointer = {
      x: 0,
      y: 0,
      previousX: 0,
      previousY: 0,
      speedX: 0,
      speedY: 0,
      active: false,
      lastMoveAt: 0,
    };
    this.bounds = { width: window.innerWidth, height: window.innerHeight };
    this.stoneCountEl = document.querySelector("#stone-count");
    this.scoreEl = document.querySelector("#score");
    this.coinsEl = document.querySelector("#coins");
    this.finalScoreEl = document.querySelector("#final-score");
    this.dangerFillEl = document.querySelector("#danger-fill");
    this.gameOverOverlayEl = document.querySelector("#game-over-overlay");
    this.restartButtonEl = document.querySelector("#restart-button");
    this.debugOutputEl = document.querySelector("#debug-output");
    this.upgradeListEl = document.querySelector("#upgrade-list");

    this.handleResize = this.handleResize.bind(this);
    this.handlePointerMove = this.handlePointerMove.bind(this);
    this.handlePointerUp = this.handlePointerUp.bind(this);
    this.handlePointerLeave = this.handlePointerLeave.bind(this);
    this.handleDebugCommand = this.handleDebugCommand.bind(this);
    this.restartGame = this.restartGame.bind(this);
    this.update = this.update.bind(this);
  }

  start() {
    this.engine.gravity.y = CONFIG.world.gravityY;
    this.createRenderer();
    this.createStaticBodies();
    this.bindEvents();
    Runner.run(this.runner, this.engine);
    Render.run(this.render);
    this.renderUpgradeUi();
    this.runUrlDebugScenario();
  }

  createRenderer() {
    this.render = Render.create({
      canvas: this.canvas,
      engine: this.engine,
      options: {
        width: this.bounds.width,
        height: this.bounds.height,
        background: CONFIG.world.background,
        wireframes: false,
        pixelRatio: Math.min(window.devicePixelRatio || 1, CONFIG.camera.pixelRatioLimit),
      },
    });
  }

  createStaticBodies() {
    const { width, height } = this.bounds;
    const floorY = height + CONFIG.floor.thickness / 2 - 26;

    this.floor = Bodies.rectangle(width / 2, floorY, width + 400, CONFIG.floor.thickness, {
      isStatic: true,
      label: "floor",
      render: { visible: false },
    });

    this.leftWall = Bodies.rectangle(-30, height / 2, 60, height + 200, {
      isStatic: true,
      label: "left-wall",
      render: { visible: false },
    });

    const wall = this.getMiningWallLayout();
    this.miningWall = Bodies.rectangle(wall.x, wall.y, wall.width, wall.height, {
      isStatic: true,
      label: "mining-wall",
      render: { visible: false },
    });

    const miner = this.getMinerLayout();
    this.minerCollider = Bodies.rectangle(
      miner.x,
      miner.y + 10,
      CONFIG.miner.collisionWidth,
      CONFIG.miner.collisionHeight,
      {
        isStatic: true,
        label: "miner-collider",
        render: { visible: false },
      },
    );

    Composite.add(this.engine.world, [this.floor, this.leftWall, this.miningWall, this.minerCollider]);
    this.crusher.createBodies();
  }

  bindEvents() {
    window.addEventListener("resize", this.handleResize);
    window.addEventListener("mining-game-debug", this.handleDebugCommand);
    this.canvas.addEventListener("pointermove", this.handlePointerMove);
    this.canvas.addEventListener("pointerdown", (event) => this.handlePointerDown(event));
    window.addEventListener("pointerup", this.handlePointerUp);
    this.canvas.addEventListener("pointerleave", this.handlePointerLeave);
    this.restartButtonEl.addEventListener("click", this.restartGame);
    Events.on(this.engine, "beforeUpdate", this.update);
    Events.on(this.render, "afterRender", () => this.drawScene());
  }

  update(event) {
    const now = event.timestamp;
    const deltaMs = this.lastUpdateAt ? now - this.lastUpdateAt : 16.67;
    this.lastUpdateAt = now;
    const elapsedSinceSwing = now - this.lastSwingAt;
    const miningInterval = this.getMiningInterval();
    const swingDuration = Math.min(CONFIG.miner.swingDurationMs, miningInterval * 0.72);
    this.swingProgress = Math.max(0, 1 - elapsedSinceSwing / swingDuration);

    if (!this.gameState.isGameOver && elapsedSinceSwing >= miningInterval) {
      this.lastSwingAt = now;
      this.swingProgress = 1;
      this.mineStone();
      this.spawnDust();
    }

    this.updateDust(now);
    this.updateCoinParticles(now);
    this.updateMergeEffects(now);
    this.crusher.update(deltaMs, this.stones);
    this.updateGrabbedStone();
    this.handleDebugDatasetCommand();
    if (!this.gameState.isGameOver) {
      this.updateMergeCandidates(now);
      this.pushStonesWithPointer();
      this.updateDangerState(deltaMs);
    }
    this.cleanupStones();
  }

  mineStone() {
    const count = this.getMiningDropCount();
    for (let index = 0; index < count; index += 1) {
      const spawn = this.getMiningHitPoint();
      const jitter = randomPointInCircle(CONFIG.stone.spawnJitterRadius + index * 5);
      const stone = this.createMineral(this.getMiningDropType(), spawn.x + jitter.x, spawn.y + jitter.y);

      Composite.add(this.engine.world, stone);
      Body.setAngularVelocity(stone, randomBetween(...CONFIG.stone.angularVelocity));
      Body.applyForce(stone, stone.position, this.getLaunchForce());
      this.clampMineralLaunchSpeed(stone);

      this.stones.push(stone);
      this.stoneCount += 1;
    }
    this.stoneCountEl.textContent = String(this.stoneCount);

    while (this.stones.length > CONFIG.world.maxLiveStones) {
      this.removeStone(this.stones[0]);
    }
  }

  createMineral(typeId, x, y) {
    const mineral = getMineralType(typeId);
    const sides = Math.round(randomBetween(CONFIG.stone.minSides, CONFIG.stone.maxSides));
    const stone = Bodies.polygon(x, y, sides, mineral.radius, {
      label: "stone",
      density: mineral.density,
      restitution: CONFIG.stone.restitution,
      friction: CONFIG.stone.friction,
      frictionAir: CONFIG.stone.frictionAir,
      render: {
        fillStyle: pick(mineral.colors),
        strokeStyle: "rgba(255, 255, 255, 0.16)",
        lineWidth: 1,
      },
    });
    Body.setVertices(stone, createIrregularVertices(stone.position, sides, mineral.radius));

    stone.plugin = {
      ...stone.plugin,
      mineral: {
        type: mineral.id,
        tier: mineral.tier,
        radius: mineral.radius,
        originalRadius: mineral.radius,
        displayName: mineral.displayName,
        createdAt: performance.now(),
        isInsideCrusher: false,
        isCrushingComplete: false,
        crushHits: 0,
        crushScale: 1,
        lastCrushHitTime: -Infinity,
        isMerging: false,
        removed: false,
      },
    };

    return stone;
  }

  getHitPoint() {
    const wall = this.getMiningWallLayout();
    return {
      x: wall.left - CONFIG.mining.hitPointInset,
      y: this.bounds.height - CONFIG.mining.hitPointFromBottom,
    };
  }

  getMiningHitPoint() {
    return this.getHitPoint();
  }

  getLaunchForce() {
    const angle =
      degreesToRadians(CONFIG.stone.launchAngleDeg + randomBetween(-CONFIG.stone.launchAngleJitterDeg, CONFIG.stone.launchAngleJitterDeg));
    const power = randomBetween(...CONFIG.stone.launchForce) * this.getMiningPowerMultiplier();
    return {
      x: Math.cos(angle) * power,
      y: Math.sin(angle) * power,
    };
  }

  spawnDust() {
    const hitPoint = this.getMiningHitPoint();
    for (let index = 0; index < CONFIG.mining.dustParticleCount; index += 1) {
      const angle = degreesToRadians(randomBetween(158, 248));
      const speed = randomBetween(...CONFIG.mining.dustSpeed);
      this.dustParticles.push({
        x: hitPoint.x,
        y: hitPoint.y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        radius: randomBetween(2, 5),
        bornAt: performance.now(),
        lifetime: CONFIG.mining.dustLifetimeMs * randomBetween(0.72, 1.2),
      });
    }
  }

  updateDust(now) {
    this.dustParticles = this.dustParticles
      .map((particle) => ({
        ...particle,
        x: particle.x + particle.vx,
        y: particle.y + particle.vy,
        vx: particle.vx * 0.94,
        vy: particle.vy * 0.94 + 0.08,
      }))
      .filter((particle) => now - particle.bornAt < particle.lifetime);
  }

  updateCoinParticles(now) {
    const target = this.getCoinUiPosition();
    this.coinParticles = this.coinParticles
      .map((particle) => {
        const toTarget = Vector.sub(target, particle);
        const pull = Vector.mult(Vector.normalise(toTarget), 0.62);
        return {
          ...particle,
          x: particle.x + particle.vx,
          y: particle.y + particle.vy,
          vx: (particle.vx + pull.x) * 0.94,
          vy: (particle.vy + pull.y) * 0.94,
        };
      })
      .filter((particle) => now - particle.bornAt < particle.lifetime && Vector.magnitude(Vector.sub(target, particle)) > 8);
  }

  getCoinUiPosition() {
    const rect = this.coinsEl.getBoundingClientRect();
    return {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
    };
  }

  updateMergeEffects(now) {
    this.mergeEffects = this.mergeEffects
      .map((particle) => ({
        ...particle,
        radius: particle.radius + particle.growth,
      }))
      .filter((particle) => now - particle.bornAt < particle.lifetime);
  }

  updateMergeCandidates(now) {
    if (now - this.lastMergeCheckAt < CONFIG.merge.checkIntervalMs) {
      return;
    }
    this.lastMergeCheckAt = now;

    const groups = this.findMergeGroups();
    const activeGroupKeys = new Set(groups.map((group) => getGroupKey(group)));

    for (const key of [...this.mergeCandidates.keys()]) {
      if (!activeGroupKeys.has(key)) {
        this.mergeCandidates.delete(key);
      }
    }

    const reservedStoneIds = new Set();
    for (const group of groups) {
      if (group.some((stone) => reservedStoneIds.has(stone.id) || !this.canMergeStone(stone))) {
        continue;
      }

      const key = getGroupKey(group);
      const candidate = this.mergeCandidates.get(key);
      if (!candidate) {
        this.mergeCandidates.set(key, { startedAt: now });
        continue;
      }

      if (now - candidate.startedAt >= CONFIG.merge.holdTimeMs) {
        group.forEach((stone) => reservedStoneIds.add(stone.id));
        this.mergeGroup(group);
        this.mergeCandidates.delete(key);
      }
    }
  }

  findMergeGroups() {
    const groups = [];
    const usedIds = new Set();
    const mergeableStones = this.stones.filter((stone) => this.canMergeStone(stone) && !isMaxTier(stone));

    for (const stone of mergeableStones) {
      if (usedIds.has(stone.id)) {
        continue;
      }

      const component = this.collectConnectedMinerals(stone, mergeableStones);
      if (component.length >= 3) {
        const group = component.slice(0, 3);
        group.forEach((item) => usedIds.add(item.id));
        groups.push(group);
      }
    }

    return groups;
  }

  collectConnectedMinerals(startStone, stones) {
    const stack = [startStone];
    const visited = new Set();
    const component = [];
    const tier = getMineralData(startStone).tier;

    while (stack.length > 0) {
      const current = stack.pop();
      if (!current || visited.has(current.id)) {
        continue;
      }

      visited.add(current.id);
      component.push(current);

      for (const other of stones) {
        if (visited.has(other.id) || getMineralData(other).tier !== tier) {
          continue;
        }

        if (areMineralsAdjacent(current, other)) {
          stack.push(other);
        }
      }
    }

    return component;
  }

  canMergeStone(stone) {
    const mineral = getMineralData(stone);
    return Boolean(stone && !mineral.removed && !mineral.isMerging && !mineral.isGrabbed && !mineral.isInsideCrusher && mineral.type);
  }

  mergeGroup(group) {
    if (group.length !== 3 || group.some((stone) => !this.canMergeStone(stone) || isMaxTier(stone))) {
      return;
    }

    const tier = getMineralData(group[0]).tier;
    if (group.some((stone) => getMineralData(stone).tier !== tier)) {
      return;
    }

    group.forEach((stone) => {
      getMineralData(stone).isMerging = true;
    });

    const mergePosition = this.getSafeMergePosition(group);
    group.forEach((stone) => this.removeStone(stone));

    const nextMineral = MINERAL_TYPES[tier + 1];
    const mergedStone = this.createMineral(nextMineral.id, mergePosition.x, mergePosition.y);
    Composite.add(this.engine.world, mergedStone);
    Body.setAngularVelocity(mergedStone, randomBetween(...CONFIG.stone.angularVelocity));
    Body.applyForce(mergedStone, mergedStone.position, { x: 0, y: -CONFIG.merge.upwardImpulse });
    this.stones.push(mergedStone);
    this.addScore(MINERAL_TYPES[tier].mergeScore);
    this.spawnMergeEffect(mergePosition, nextMineral);
  }

  addScore(amount) {
    this.gameState.score += amount;
    this.updateScoreUi();
  }

  addCoins(amount) {
    this.gameState.coins += amount;
    this.updateCoinsUi();
  }

  updateScoreUi() {
    const formattedScore = formatNumber(this.gameState.score);
    this.scoreEl.textContent = formattedScore;
    this.finalScoreEl.textContent = formattedScore;
  }

  updateCoinsUi() {
    this.coinsEl.textContent = formatNumber(this.gameState.coins);
    this.updateUpgradeUi();
  }

  createInitialUpgrades() {
    return Object.fromEntries(Object.keys(UPGRADES).map((id) => [id, { level: 0 }]));
  }

  getUpgradeLevel(id) {
    return this.upgrades[id]?.level ?? 0;
  }

  getUpgradeCost(id) {
    const upgrade = UPGRADES[id];
    return Math.floor(upgrade.baseCost * upgrade.costGrowth ** this.getUpgradeLevel(id));
  }

  buyUpgrade(id) {
    const upgrade = UPGRADES[id];
    if (!upgrade || this.gameState.isGameOver || this.getUpgradeLevel(id) >= upgrade.maxLevel) {
      return false;
    }

    const cost = this.getUpgradeCost(id);
    if (this.gameState.coins < cost) {
      return false;
    }

    this.gameState.coins -= cost;
    this.upgrades[id].level += 1;
    this.updateCoinsUi();
    this.renderUpgradeUi(id);
    return true;
  }

  renderUpgradeUi(purchasedId = null) {
    this.upgradeListEl.innerHTML = "";
    for (const id of Object.keys(UPGRADES)) {
      const upgrade = UPGRADES[id];
      const level = this.getUpgradeLevel(id);
      const cost = this.getUpgradeCost(id);
      const card = document.createElement("article");
      card.className = `upgrade-card${purchasedId === id ? " is-purchased" : ""}`;
      card.innerHTML = `
        <div class="upgrade-card__top">
          <div class="upgrade-card__name">${upgrade.name}</div>
          <div class="upgrade-card__level">Lv. ${level}</div>
        </div>
        <div class="upgrade-card__effect">${this.getUpgradeEffectText(id)}</div>
        <button type="button" data-upgrade-id="${id}">${level >= upgrade.maxLevel ? "MAX" : `Upgrade - ${formatNumber(cost)} coins`}</button>
      `;
      const button = card.querySelector("button");
      button.disabled = this.gameState.isGameOver || level >= upgrade.maxLevel || this.gameState.coins < cost;
      button.addEventListener("click", () => this.buyUpgrade(id));
      this.upgradeListEl.append(card);
    }
  }

  updateUpgradeUi() {
    if (!this.upgradeListEl.children.length) {
      return;
    }

    for (const button of this.upgradeListEl.querySelectorAll("button[data-upgrade-id]")) {
      const id = button.dataset.upgradeId;
      const level = this.getUpgradeLevel(id);
      const cost = this.getUpgradeCost(id);
      button.textContent = level >= UPGRADES[id].maxLevel ? "MAX" : `Upgrade - ${formatNumber(cost)} coins`;
      button.disabled = this.gameState.isGameOver || level >= UPGRADES[id].maxLevel || this.gameState.coins < cost;
      const card = button.closest(".upgrade-card");
      card.querySelector(".upgrade-card__level").textContent = `Lv. ${level}`;
      card.querySelector(".upgrade-card__effect").textContent = this.getUpgradeEffectText(id);
    }
  }

  getUpgradeEffectText(id) {
    if (id === "miningSpeed") {
      return `채굴 간격: ${(this.getMiningInterval() / 1000).toFixed(2)}초`;
    }
    if (id === "miningPower") {
      return `발사 힘 x${this.getMiningPowerMultiplier().toFixed(2)}, 생성량 ${this.getMiningDropCountText()}`;
    }
    if (id === "luck") {
      return `Luck +${this.getUpgradeLevel("luck") * UPGRADES.luck.luckPercentPerLevel}%`;
    }
    if (id === "mousePower") {
      return `밀기/집기 힘 x${this.getMousePowerMultiplier().toFixed(2)}`;
    }
    return "";
  }

  getMiningInterval() {
    const level = this.getUpgradeLevel("miningSpeed");
    const multiplier = Math.max(1 - UPGRADES.miningSpeed.intervalReduction * level, 0);
    return Math.max(CONFIG.miner.swingIntervalMs * multiplier, UPGRADES.miningSpeed.minIntervalMs);
  }

  getMiningPowerMultiplier() {
    const level = this.getUpgradeLevel("miningPower");
    return Math.min(1 + UPGRADES.miningPower.forcePerLevel * level, UPGRADES.miningPower.maxForceMultiplier);
  }

  getMiningDropCount() {
    const level = this.getUpgradeLevel("miningPower");
    if (level >= 12) {
      return 5;
    }
    if (level >= 9) {
      return 4;
    }
    if (level >= 6) {
      return Math.random() < 0.5 ? 3 : 2;
    }
    if (level >= 3) {
      return Math.random() < 0.42 ? 2 : 1;
    }
    return 1;
  }

  getMiningDropCountText() {
    const level = this.getUpgradeLevel("miningPower");
    if (level >= 12) return "5개";
    if (level >= 9) return "4개";
    if (level >= 6) return "2~3개";
    if (level >= 3) return "1~2개";
    return "1개";
  }

  clampMineralLaunchSpeed(stone) {
    const speed = Vector.magnitude(stone.velocity);
    if (speed > CONFIG.stone.maxLaunchSpeed) {
      Body.setVelocity(stone, Vector.mult(Vector.normalise(stone.velocity), CONFIG.stone.maxLaunchSpeed));
    }
  }

  getMiningDropType() {
    const level = this.getUpgradeLevel("luck");
    const roll = Math.random();
    const chances = [
      { id: "diamond", chance: Math.max(0, (level - 10) * 0.0008) },
      { id: "emerald", chance: Math.max(0, (level - 9) * 0.0012) },
      { id: "ruby", chance: Math.max(0, (level - 8) * 0.002) },
      { id: "sapphire", chance: Math.max(0, (level - 6) * 0.004) },
      { id: "gold", chance: Math.max(0, (level - 3) * 0.009) },
      { id: "iron", chance: level * 0.018 },
    ];

    let cursor = 0;
    for (const drop of chances) {
      cursor += drop.chance;
      if (roll < cursor) {
        return drop.id;
      }
    }
    return CONFIG.stone.baseTier;
  }

  getMousePowerMultiplier() {
    const level = this.getUpgradeLevel("mousePower");
    return Math.min(1 + UPGRADES.mousePower.pushPerLevel * level, UPGRADES.mousePower.maxMultiplier);
  }

  scaleMineralTo(stone, targetScale) {
    const mineral = getMineralData(stone);
    const factor = targetScale / mineral.crushScale;
    mineral.crushScale = targetScale;
    mineral.radius = mineral.originalRadius * targetScale;
    Body.scale(stone, factor, factor);
  }

  destroyCrushedMineral(stone) {
    const mineral = getMineralData(stone);
    const type = getMineralType(mineral.type);
    this.addCoins(type.crushValue);
    this.spawnCoinBurst(stone.position, type);
    this.removeStone(stone);
  }

  spawnCrushImpact(position, mineral) {
    for (let index = 0; index < CONFIG.crusher.crush.impactParticleCount; index += 1) {
      const angle = randomBetween(Math.PI * 1.05, Math.PI * 1.95);
      const speed = randomBetween(1.6, 4.6);
      this.dustParticles.push({
        x: position.x,
        y: position.y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        radius: randomBetween(2, 5),
        insideCrusher: true,
        bornAt: performance.now(),
        lifetime: 480,
      });
    }
  }

  spawnCoinBurst(position, mineralType) {
    for (let index = 0; index < CONFIG.crusher.crush.coinParticleCount; index += 1) {
      const angle = randomBetween(0, Math.PI * 2);
      const speed = randomBetween(2.2, 5.8);
      this.coinParticles.push({
        x: position.x,
        y: position.y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        radius: randomBetween(3, 6),
        color: "#ffd16d",
        insideCrusher: true,
        bornAt: performance.now(),
        lifetime: 900,
      });
    }
  }

  updateDangerState(deltaMs) {
    const hasDangerMineral = this.stones.some((stone) => this.isStoneInDanger(stone));

    if (hasDangerMineral) {
      this.gameState.dangerTimeMs += deltaMs;
    } else {
      this.gameState.dangerTimeMs = 0;
    }

    this.updateDangerUi();

    if (this.gameState.dangerTimeMs >= CONFIG.danger.holdTimeMs) {
      this.setGameOver();
    }
  }

  isStoneInDanger(stone) {
    const mineral = getMineralData(stone);
    const ageMs = performance.now() - mineral.createdAt;
    const speed = Vector.magnitude(stone.velocity);

    return (
      ageMs >= CONFIG.danger.minMineralAgeMs &&
      !mineral.isGrabbed &&
      !mineral.isInsideCrusher &&
      speed <= CONFIG.danger.maxVelocityForDanger &&
      stone.bounds.min.y < this.getDangerLineY()
    );
  }

  updateDangerUi() {
    const progress = clamp(this.gameState.dangerTimeMs / CONFIG.danger.holdTimeMs, 0, 1);
    this.dangerFillEl.style.width = `${progress * 100}%`;
  }

  setGameOver() {
    if (this.gameState.isGameOver) {
      return;
    }

    this.gameState.isGameOver = true;
    this.pointer.active = false;
    this.mergeCandidates.clear();
    this.gameOverOverlayEl.hidden = false;
    this.updateScoreUi();
    this.updateUpgradeUi();
  }

  restartGame() {
    this.releaseGrabbedStone();
    [...this.stones].forEach((stone) => this.removeStone(stone));
    this.mergeCandidates.clear();
    this.dustParticles = [];
    this.coinParticles = [];
    this.mergeEffects = [];
    this.stoneCount = 0;
    this.lastSwingAt = 0;
    this.lastMergeCheckAt = 0;
    this.lastUpdateAt = 0;
    this.swingProgress = 0;
    this.pointer.active = false;
    this.pointer.speedX = 0;
    this.pointer.speedY = 0;
    this.hoveredStone = null;
    this.crusher.update(0, this.stones);
    this.gameState = {
      score: 0,
      coins: 0,
      isGameOver: false,
      dangerTimeMs: 0,
    };
    this.upgrades = this.createInitialUpgrades();
    this.stoneCountEl.textContent = "0";
    this.gameOverOverlayEl.hidden = true;
    this.updateScoreUi();
    this.updateCoinsUi();
    this.updateDangerUi();
    this.renderUpgradeUi();
  }

  getSafeMergePosition(group) {
    const totalMass = group.reduce((sum, stone) => sum + stone.mass, 0);
    const center = group.reduce(
      (point, stone) => ({
        x: point.x + stone.position.x * stone.mass,
        y: point.y + stone.position.y * stone.mass,
      }),
      { x: 0, y: 0 },
    );
    const nextMineral = MINERAL_TYPES[getMineralData(group[0]).tier + 1];
    const wall = this.getMiningWallLayout();
    const groundY = this.bounds.height - 26;
    return {
      x: clamp(center.x / totalMass, nextMineral.radius + CONFIG.merge.spawnPadding, wall.left - nextMineral.radius - CONFIG.merge.spawnPadding),
      y: clamp(center.y / totalMass, nextMineral.radius + CONFIG.merge.spawnPadding, groundY - nextMineral.radius - CONFIG.merge.spawnPadding),
    };
  }

  spawnMergeEffect(position, mineral) {
    this.mergeEffects.push({
      x: position.x,
      y: position.y,
      radius: mineral.radius * 0.6,
      growth: 1.9,
      color: pick(mineral.colors),
      bornAt: performance.now(),
      lifetime: CONFIG.merge.effectLifetimeMs,
    });

    for (let index = 0; index < CONFIG.merge.effectParticleCount; index += 1) {
      const angle = randomBetween(0, Math.PI * 2);
      const speed = randomBetween(1.1, 3.6);
      this.dustParticles.push({
        x: position.x,
        y: position.y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        radius: randomBetween(2, 5),
        bornAt: performance.now(),
        lifetime: CONFIG.merge.effectLifetimeMs * randomBetween(0.7, 1.1),
      });
    }
  }

  addDebugMineral(typeId, x, y) {
    const stone = this.createMineral(typeId, x, y);
    Composite.add(this.engine.world, stone);
    this.stones.push(stone);
    return stone;
  }

  async runUrlDebugScenario() {
    const scenario = new URLSearchParams(window.location.search).get("debugScenario");
    if (!scenario) {
      return;
    }

    if (scenario === "systems") {
      this.debugOutputEl.textContent = JSON.stringify(await this.runSystemsDebugScenario());
      return;
    }

    if (scenario === "gameover") {
      this.setGameOver();
      return;
    }

    if (scenario === "crusher") {
      this.debugOutputEl.textContent = JSON.stringify(this.runCrusherDebugScenario());
      return;
    }

    if (scenario === "upgrades") {
      this.debugOutputEl.textContent = JSON.stringify(this.runUpgradeDebugScenario());
      return;
    }

    if (scenario !== "merge") {
      return;
    }

    const results = {};
    this.runner.enabled = false;

    results.stoneToIron = await this.runMergeScenario(["stone", "stone", "stone"], 10);
    results.ironToGold = await this.runMergeScenario(["iron", "iron", "iron"], 12);
    results.diamondNoMerge = await this.runMergeScenario(["diamond", "diamond", "diamond"], 18);
    results.noDuplicate = await this.runMergeScenario(["stone", "stone", "stone", "stone", "stone"], 10);

    this.debugOutputEl.textContent = JSON.stringify(results);
    this.runner.enabled = true;
  }

  async runMergeScenario(minerals, spacing) {
    [...this.stones].forEach((stone) => this.removeStone(stone));
    this.mergeCandidates.clear();
    this.lastMergeCheckAt = -CONFIG.merge.checkIntervalMs;
    this.dustParticles = [];
    this.coinParticles = [];
    this.mergeEffects = [];
    this.gameState.score = 0;
    this.gameState.coins = 0;
    this.gameState.isGameOver = false;
    this.gameState.dangerTimeMs = 0;

    const origin = { x: 420, y: this.bounds.height - 110 };
    minerals.forEach((typeId, index) => {
      this.addDebugMineral(typeId, origin.x + (index % 3) * spacing, origin.y + Math.floor(index / 3) * spacing);
    });

    for (let time = 0; time <= CONFIG.merge.holdTimeMs + CONFIG.merge.checkIntervalMs * 4; time += CONFIG.merge.checkIntervalMs) {
      this.updateMergeCandidates(time);
    }

    return this.getDebugSnapshot();
  }

  async runSystemsDebugScenario() {
    const results = {};
    this.runner.enabled = false;

    results.stoneScore = await this.runMergeScenario(["stone", "stone", "stone"], 10);
    results.ironScore = await this.runMergeScenario(["iron", "iron", "iron"], 12);

    this.restartGame();
    const fastStone = this.addDebugMineral("diamond", 420, this.getDangerLineY() - 18);
    getMineralData(fastStone).createdAt = performance.now() - CONFIG.danger.minMineralAgeMs - 100;
    Body.setVelocity(fastStone, { x: 0, y: -CONFIG.danger.maxVelocityForDanger * 3 });
    this.updateDangerState(CONFIG.danger.holdTimeMs + 100);
    results.fastPassNoGameOver = this.getDebugSnapshot();

    this.restartGame();
    const dangerStone = this.addDebugMineral("diamond", 420, this.getDangerLineY() - 18);
    getMineralData(dangerStone).createdAt = performance.now() - CONFIG.danger.minMineralAgeMs - 100;
    Body.setVelocity(dangerStone, { x: 0, y: 0 });
    this.updateDangerState(CONFIG.danger.holdTimeMs / 2);
    Body.setPosition(dangerStone, { x: 420, y: this.getDangerLineY() + 100 });
    this.updateDangerState(16);
    results.dangerCancel = this.getDebugSnapshot();

    Body.setPosition(dangerStone, { x: 420, y: this.getDangerLineY() - 18 });
    this.updateDangerState(CONFIG.danger.holdTimeMs + 20);
    results.sustainedDangerGameOver = this.getDebugSnapshot();

    this.addDebugMineral("stone", 450, this.bounds.height - 110);
    this.addDebugMineral("stone", 460, this.bounds.height - 110);
    this.addDebugMineral("stone", 470, this.bounds.height - 110);
    this.lastSwingAt = -CONFIG.miner.swingIntervalMs * 2;
    this.update({ timestamp: CONFIG.miner.swingIntervalMs * 4 });
    results.gameOverStopsMiningAndMerge = this.getDebugSnapshot();

    this.restartGame();
    results.restartClean = this.getDebugSnapshot();

    this.runner.enabled = true;
    return results;
  }

  runCrusherDebugScenario() {
    this.restartGame();
    const intake = this.crusher.getIntakeRect();
    const impact = this.crusher.getImpactZoneRect();
    const hovering = this.addDebugMineral("stone", intake.left + 28, intake.top - 40);
    this.hoveredStone = hovering;
    const grabbed = this.addDebugMineral("stone", intake.left + 58, intake.top + 20);
    getMineralData(grabbed).isGrabbed = true;
    this.crusher.update(16, this.stones);
    const grabbedPassOverIntake = getMineralData(grabbed).isInsideCrusher;
    getMineralData(grabbed).isGrabbed = false;
    this.crusher.update(16, this.stones);
    const droppedIntoIntake = getMineralData(grabbed).isInsideCrusher;
    const crushingStone = this.addDebugMineral("gold", this.crusher.bounds.centerX, impact.top + 12);
    getMineralData(crushingStone).isInsideCrusher = true;
    const initialArea = crushingStone.area;
    Body.setPosition(crushingStone, { x: this.crusher.bounds.centerX, y: this.crusher.getInternalCeilingY() - 80 });
    Body.setVelocity(crushingStone, { x: 50, y: -50 });
    this.crusher.containInsideMineral(crushingStone);
    const containment = {
      belowCeiling: crushingStone.bounds.min.y >= this.crusher.getInternalCeilingY() - 0.5,
      speedLimited: Vector.magnitude(crushingStone.velocity) <= CONFIG.crusher.crush.maxCrusherSpeed + 0.01,
    };
    Body.setPosition(crushingStone, { x: this.crusher.bounds.centerX, y: impact.top + 12 });
    Body.setVelocity(crushingStone, { x: 0, y: 0 });

    this.crusher.tryCrushStone(crushingStone);
    const afterFirstHit = {
      hits: getMineralData(crushingStone).crushHits,
      scale: getMineralData(crushingStone).crushScale,
      radius: getMineralData(crushingStone).radius,
      areaSmaller: crushingStone.area < initialArea,
      exists: this.stones.includes(crushingStone),
    };
    getMineralData(crushingStone).lastCrushHitTime = -Infinity;
    this.crusher.tryCrushStone(crushingStone);
    const afterSecondHit = {
      hits: getMineralData(crushingStone).crushHits,
      scale: getMineralData(crushingStone).crushScale,
      radius: getMineralData(crushingStone).radius,
      exists: this.stones.includes(crushingStone),
    };
    getMineralData(crushingStone).lastCrushHitTime = -Infinity;
    this.crusher.tryCrushStone(crushingStone);
    const afterThirdHit = {
      exists: this.stones.includes(crushingStone),
      coins: this.gameState.coins,
      coinParticles: this.coinParticles.length,
    };

    return {
      bodyCount: this.engine.world.bodies.length,
      gearDirections: this.crusher.gears.map((gear) => gear.direction),
      hasDoorBody: Object.keys(this.crusher.bodies).some((key) => key.toLowerCase().includes("door")),
      hoverStoneOutlined: this.hoveredStone === hovering,
      grabbedPassOverIntake,
      droppedIntoIntake,
      chamberTallerThanHopper: CONFIG.crusher.chamberHeight > CONFIG.crusher.hopperHeight,
      visibleChamber: this.crusher.getVisibleChamberRect(),
      containment,
      afterFirstHit,
      afterSecondHit,
      afterThirdHit,
    };
  }

  runUpgradeDebugScenario() {
    this.restartGame();
    const initial = this.getDebugSnapshot();
    this.addCoins(200);
    const speedCost = this.getUpgradeCost("miningSpeed");
    const speedBought = this.buyUpgrade("miningSpeed");
    const afterSpeed = {
      coins: this.gameState.coins,
      level: this.getUpgradeLevel("miningSpeed"),
      nextCost: this.getUpgradeCost("miningSpeed"),
      interval: this.getMiningInterval(),
    };

    const powerBefore = this.getMiningPowerMultiplier();
    this.buyUpgrade("miningPower");
    this.buyUpgrade("miningPower");
    this.buyUpgrade("miningPower");
    const afterPower = {
      level: this.getUpgradeLevel("miningPower"),
      multiplier: this.getMiningPowerMultiplier(),
      increased: this.getMiningPowerMultiplier() > powerBefore,
      countText: this.getMiningDropCountText(),
    };

    this.gameState.coins = 5000;
    for (let index = 0; index < 7; index += 1) {
      this.buyUpgrade("luck");
    }
    const rareSeen = Array.from({ length: 700 }, () => this.getMiningDropType()).some((type) => type !== "stone");

    const mouseBefore = this.getMousePowerMultiplier();
    this.buyUpgrade("mousePower");
    const afterMouse = {
      level: this.getUpgradeLevel("mousePower"),
      multiplier: this.getMousePowerMultiplier(),
      increased: this.getMousePowerMultiplier() > mouseBefore,
    };

    this.gameState.coins = 0;
    const poorBuy = this.buyUpgrade("mousePower");
    const beforeRestartLevel = this.getUpgradeLevel("miningSpeed");
    this.restartGame();

    return {
      initial,
      speedBought,
      speedCost,
      afterSpeed,
      afterPower,
      rareSeen,
      afterMouse,
      poorBuy,
      restartReset: this.getUpgradeLevel("miningSpeed") === 0 && this.gameState.coins === 0 && beforeRestartLevel > 0,
    };
  }

  pushStonesWithPointer() {
    if (!this.pointer.active || this.grabbedStone) {
      return;
    }

    const pointerSpeed = Vector.magnitude(Vector.create(this.pointer.speedX, this.pointer.speedY));
    if (pointerSpeed < CONFIG.mousePush.minPointerSpeed) {
      return;
    }

    const area = {
      min: {
        x: this.pointer.x - CONFIG.mousePush.radius,
        y: this.pointer.y - CONFIG.mousePush.radius,
      },
      max: {
        x: this.pointer.x + CONFIG.mousePush.radius,
        y: this.pointer.y + CONFIG.mousePush.radius,
      },
    };

    const nearbyStones = Query.region(this.stones, area);
    for (const stone of nearbyStones) {
      const mineral = getMineralData(stone);
      if (mineral.isInsideCrusher || mineral.isGrabbed) {
        continue;
      }

      const distance = Vector.magnitude(Vector.sub(stone.position, this.pointer));
      if (distance > CONFIG.mousePush.radius) {
        continue;
      }

      const falloff = 1 - distance / CONFIG.mousePush.radius;
      const force = Vector.mult(
        Vector.create(this.pointer.speedX, this.pointer.speedY),
        CONFIG.mousePush.forceScale * this.getMousePowerMultiplier() * falloff,
      );
      Body.applyForce(stone, stone.position, clampVector(force, CONFIG.mousePush.maxForce * this.getMousePowerMultiplier()));
    }
  }

  cleanupStones() {
    const margin = CONFIG.world.cleanupMargin;
    const { width, height } = this.bounds;
    for (const stone of [...this.stones]) {
      const { x, y } = stone.position;
      if (x < -margin || x > width + margin || y > height + margin) {
        this.removeStone(stone);
      }
    }
  }

  removeStone(stone) {
    if (!stone || getMineralData(stone).removed) {
      return;
    }

    getMineralData(stone).removed = true;
    Composite.remove(this.engine.world, stone);
    this.stones = this.stones.filter((item) => item.id !== stone.id);
    for (const [key] of this.mergeCandidates) {
      if (key.split(":").includes(String(stone.id))) {
        this.mergeCandidates.delete(key);
      }
    }
  }

  handleResize() {
    this.bounds = { width: window.innerWidth, height: window.innerHeight };
    this.render.options.width = this.bounds.width;
    this.render.options.height = this.bounds.height;
    this.render.canvas.width = this.bounds.width * this.render.options.pixelRatio;
    this.render.canvas.height = this.bounds.height * this.render.options.pixelRatio;
    this.render.canvas.style.width = `${this.bounds.width}px`;
    this.render.canvas.style.height = `${this.bounds.height}px`;

    const floorY = this.bounds.height + CONFIG.floor.thickness / 2 - 26;
    Body.setPosition(this.floor, Vector.create(this.bounds.width / 2, floorY));
    Body.setVertices(
      this.floor,
      Bodies.rectangle(this.bounds.width / 2, floorY, this.bounds.width + 400, CONFIG.floor.thickness).vertices,
    );
    Body.setPosition(this.leftWall, Vector.create(-30, this.bounds.height / 2));
    const wall = this.getMiningWallLayout();
    Body.setPosition(this.miningWall, Vector.create(wall.x, wall.y));
    Body.setVertices(
      this.miningWall,
      Bodies.rectangle(wall.x, wall.y, wall.width, wall.height).vertices,
    );
    const miner = this.getMinerLayout();
    Body.setPosition(this.minerCollider, Vector.create(miner.x, miner.y + 10));
    Body.setVertices(
      this.minerCollider,
      Bodies.rectangle(miner.x, miner.y + 10, CONFIG.miner.collisionWidth, CONFIG.miner.collisionHeight).vertices,
    );
    this.crusher.resize();
  }

  handlePointerMove(event) {
    const point = this.getCanvasPoint(event);
    const { x, y } = point;
    const now = performance.now();

    if (!this.pointer.active) {
      this.pointer.x = x;
      this.pointer.y = y;
      this.pointer.previousX = x;
      this.pointer.previousY = y;
      this.pointer.speedX = 0;
      this.pointer.speedY = 0;
      this.pointer.active = true;
      this.pointer.lastMoveAt = now;
      this.updateHoveredStone();
      return;
    }

    const deltaTime = Math.max(16, now - this.pointer.lastMoveAt);

    this.pointer.speedX = ((x - this.pointer.x) / deltaTime) * 16.67;
    this.pointer.speedY = ((y - this.pointer.y) / deltaTime) * 16.67;
    this.pointer.previousX = this.pointer.x;
    this.pointer.previousY = this.pointer.y;
    this.pointer.x = x;
    this.pointer.y = y;
    this.pointer.active = true;
    this.pointer.lastMoveAt = now;
    this.updateHoveredStone();
  }

  handlePointerDown(event) {
    const point = this.getCanvasPoint(event);
    const stone = this.findStoneAtPoint(point);
    if (stone) {
      this.startGrab(stone, point);
    }
  }

  handlePointerUp() {
    this.releaseGrabbedStone();
  }

  handlePointerLeave() {
    this.pointer.active = false;
    this.pointer.speedX = 0;
    this.pointer.speedY = 0;
    this.hoveredStone = null;
  }

  getCanvasPoint(event) {
    const rect = this.canvas.getBoundingClientRect();
    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    };
  }

  updateHoveredStone() {
    if (this.grabbedStone) {
      this.hoveredStone = this.grabbedStone;
      return;
    }
    this.hoveredStone = this.findStoneAtPoint(this.pointer);
  }

  findStoneAtPoint(point) {
    const candidates = Query.point(this.stones, point);
    return candidates.find((stone) => {
      const mineral = getMineralData(stone);
      return !mineral.removed && !mineral.isMerging && !mineral.isInsideCrusher;
    }) ?? null;
  }

  startGrab(stone, point) {
    this.releaseGrabbedStone();
    this.grabbedStone = stone;
    this.hoveredStone = stone;
    getMineralData(stone).isGrabbed = true;
    this.grabConstraint = Constraint.create({
      pointA: { x: point.x, y: point.y },
      bodyB: stone,
      pointB: { x: 0, y: 0 },
      stiffness: this.getGrabStiffness(stone),
      damping: CONFIG.grab.damping,
      render: { visible: false },
    });
    Composite.add(this.engine.world, this.grabConstraint);
  }

  updateGrabbedStone() {
    if (!this.grabbedStone || !this.grabConstraint) {
      return;
    }

    this.grabConstraint.pointA = { x: this.pointer.x, y: this.pointer.y };
    const speed = Vector.magnitude(this.grabbedStone.velocity);
    if (speed > CONFIG.grab.maxVelocity) {
      Body.setVelocity(this.grabbedStone, Vector.mult(Vector.normalise(this.grabbedStone.velocity), CONFIG.grab.maxVelocity));
    }
  }

  releaseGrabbedStone() {
    if (!this.grabbedStone) {
      return;
    }

    getMineralData(this.grabbedStone).isGrabbed = false;
    if (this.grabConstraint) {
      Composite.remove(this.engine.world, this.grabConstraint);
    }
    this.grabConstraint = null;
    this.grabbedStone = null;
  }

  getGrabStiffness(stone) {
    const tier = getMineralData(stone).tier ?? 0;
    return (CONFIG.grab.stiffness * this.getMousePowerMultiplier()) / (1 + tier * 0.08);
  }

  handleDebugCommand(event) {
    const { action, minerals = [], origin = { x: 260, y: 360 }, spacing = 16 } = event.detail ?? {};
    this.runDebugCommand(action, minerals, origin, spacing);
  }

  handleDebugDatasetCommand() {
    const rawCommand = localStorage.getItem("miningGameDebugCommand");
    if (!rawCommand || rawCommand === this.lastDebugCommand) {
      return;
    }

    this.lastDebugCommand = rawCommand;
    const command = JSON.parse(rawCommand);
    this.runDebugCommand(command.action, command.minerals, command.origin, command.spacing);
  }

  runDebugCommand(action, minerals = [], origin = { x: 260, y: 360 }, spacing = 16) {

    if (action === "clear") {
      [...this.stones].forEach((stone) => this.removeStone(stone));
      this.mergeCandidates.clear();
    }

    if (action === "addCluster") {
      minerals.forEach((typeId, index) => {
        this.addDebugMineral(typeId, origin.x + (index % 3) * spacing, origin.y + Math.floor(index / 3) * spacing);
      });
    }

    if (action === "snapshot") {
      localStorage.setItem("miningGameDebugSnapshot", JSON.stringify(this.getDebugSnapshot()));
    }
  }

  getDebugSnapshot() {
    const byType = {};
    for (const stone of this.stones) {
      const mineral = getMineralData(stone);
      byType[mineral.type] = (byType[mineral.type] ?? 0) + 1;
    }

    return {
      total: this.stones.length,
      byType,
      bodyCount: this.engine.world.bodies.length,
      score: this.gameState.score,
      coins: this.gameState.coins,
      isGameOver: this.gameState.isGameOver,
      dangerTimeMs: Math.round(this.gameState.dangerTimeMs),
      crusher: {
        insideCount: this.stones.filter((stone) => getMineralData(stone).isInsideCrusher).length,
      },
      upgrades: Object.fromEntries(Object.keys(UPGRADES).map((id) => [id, this.getUpgradeLevel(id)])),
    };
  }

  drawScene() {
    const ctx = this.render.context;
    this.drawGround(ctx);
    this.drawDangerLine(ctx);
    this.crusher.draw(ctx);
    this.drawMiningWall(ctx);
    this.drawDust(ctx);
    this.drawCoinParticles(ctx);
    this.drawMergeEffects(ctx);
    this.drawMergeDebug(ctx);
    this.drawHoveredStone(ctx);
    this.drawMiner(ctx);
  }

  drawGround(ctx) {
    const groundY = this.bounds.height - 26;
    ctx.save();
    ctx.fillStyle = "#252b35";
    ctx.fillRect(0, groundY, this.bounds.width, 26);
    ctx.fillStyle = "rgba(255, 255, 255, 0.08)";
    ctx.fillRect(0, groundY, this.bounds.width, 2);
    ctx.restore();
  }

  drawDangerLine(ctx) {
    const y = this.getDangerLineY();
    const dangerProgress = clamp(this.gameState.dangerTimeMs / CONFIG.danger.holdTimeMs, 0, 1);

    ctx.save();
    ctx.strokeStyle = `rgba(255, 79, 95, ${0.42 + dangerProgress * 0.48})`;
    ctx.lineWidth = 2;
    ctx.setLineDash([12, 10]);
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(this.bounds.width, y);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = `rgba(255, 116, 127, ${0.78 + dangerProgress * 0.22})`;
    ctx.font = "800 12px Inter, system-ui, sans-serif";
    ctx.fillText(CONFIG.danger.label, 18, y - 10);
    ctx.restore();
  }

  drawMiningWall(ctx) {
    const wall = this.getMiningWallLayout();
    ctx.save();
    ctx.fillStyle = CONFIG.miningWall.darkColor;
    ctx.fillRect(wall.left - 12, 0, 12, wall.height);
    ctx.fillStyle = CONFIG.miningWall.color;
    ctx.fillRect(wall.left, 0, wall.width, wall.height);

    for (let y = -CONFIG.miningWall.patternSize; y < wall.height + CONFIG.miningWall.patternSize; y += CONFIG.miningWall.patternSize) {
      for (let x = wall.left; x < this.bounds.width + CONFIG.miningWall.patternSize; x += CONFIG.miningWall.patternSize) {
        const offset = Math.floor(y / CONFIG.miningWall.patternSize) % 2 === 0 ? 0 : CONFIG.miningWall.patternSize / 2;
        ctx.fillStyle = (x + y) % 104 === 0 ? CONFIG.miningWall.lightColor : CONFIG.miningWall.color;
        ctx.beginPath();
        ctx.moveTo(x + offset + 4, y + 8);
        ctx.lineTo(x + offset + 44, y + 2);
        ctx.lineTo(x + offset + 58, y + 32);
        ctx.lineTo(x + offset + 28, y + 52);
        ctx.lineTo(x + offset - 6, y + 38);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = "rgba(255, 255, 255, 0.06)";
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    }

    ctx.strokeStyle = CONFIG.miningWall.crackColor;
    ctx.lineWidth = 3;
    for (let y = 40; y < wall.height; y += 118) {
      ctx.beginPath();
      ctx.moveTo(wall.left + randomStable(y, 8, 34), y);
      ctx.lineTo(wall.left + randomStable(y + 1, 32, 70), y + 24);
      ctx.lineTo(wall.left + randomStable(y + 2, 18, 58), y + 58);
      ctx.stroke();
    }
    ctx.restore();

    if (CONFIG.mining.showHitPoint) {
      const hitPoint = this.getMiningHitPoint();
      ctx.save();
      ctx.fillStyle = "rgba(255, 211, 90, 0.9)";
      ctx.beginPath();
      ctx.arc(hitPoint.x, hitPoint.y, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  drawDust(ctx, insideCrusher = false) {
    ctx.save();
    for (const particle of this.dustParticles) {
      if (Boolean(particle.insideCrusher) !== insideCrusher) {
        continue;
      }

      const age = performance.now() - particle.bornAt;
      const alpha = Math.max(0, 1 - age / particle.lifetime);
      ctx.fillStyle = `rgba(196, 184, 151, ${alpha * 0.72})`;
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.radius * alpha, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  drawCoinParticles(ctx, insideCrusher = false) {
    ctx.save();
    for (const particle of this.coinParticles) {
      if (Boolean(particle.insideCrusher) !== insideCrusher) {
        continue;
      }

      const age = performance.now() - particle.bornAt;
      const alpha = Math.max(0, 1 - age / particle.lifetime);
      ctx.fillStyle = `rgba(255, 209, 109, ${alpha})`;
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.radius * alpha, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  drawMergeEffects(ctx) {
    ctx.save();
    for (const effect of this.mergeEffects) {
      const age = performance.now() - effect.bornAt;
      const alpha = Math.max(0, 1 - age / effect.lifetime);
      ctx.strokeStyle = effect.color;
      ctx.globalAlpha = alpha * 0.7;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(effect.x, effect.y, effect.radius, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();
  }

  drawMergeDebug(ctx) {
    if (!CONFIG.merge.debugMerge) {
      return;
    }

    ctx.save();
    ctx.strokeStyle = "rgba(255, 211, 90, 0.45)";
    ctx.lineWidth = 2;
    for (const key of this.mergeCandidates.keys()) {
      const group = key
        .split(":")
        .map((id) => this.stones.find((stone) => stone.id === Number(id)))
        .filter(Boolean);

      for (const stone of group) {
        const mineral = getMineralData(stone);
        ctx.beginPath();
        ctx.arc(
          stone.position.x,
          stone.position.y,
          mineral.radius * CONFIG.merge.distanceMultiplier,
          0,
          Math.PI * 2,
        );
        ctx.stroke();
      }
    }
    ctx.restore();
  }

  drawHoveredStone(ctx) {
    if (!this.hoveredStone || getMineralData(this.hoveredStone).removed || getMineralData(this.hoveredStone).isMerging) {
      return;
    }

    const mineral = getMineralData(this.hoveredStone);
    ctx.save();
    ctx.strokeStyle = "rgba(255, 255, 255, 0.95)";
    ctx.lineWidth = CONFIG.grab.hoverOutlineWidth;
    ctx.beginPath();
    ctx.arc(this.hoveredStone.position.x, this.hoveredStone.position.y, mineral.radius + 5, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  drawMiner(ctx) {
    const miner = this.getMinerLayout();
    const swing = easeOutBack(this.swingProgress);

    ctx.save();
    ctx.translate(miner.x, miner.y);

    ctx.fillStyle = "rgba(0, 0, 0, 0.24)";
    ctx.beginPath();
    ctx.ellipse(4, 48, 46, 12, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = CONFIG.miner.color;
    ctx.fillRect(-22, -4, 40, 54);
    ctx.fillStyle = "#2b3443";
    ctx.fillRect(-20, 42, 16, 36);
    ctx.fillRect(6, 42, 16, 36);

    ctx.fillStyle = "#f3c194";
    ctx.beginPath();
    ctx.arc(0, -26, 23, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = CONFIG.miner.helmetColor;
    ctx.beginPath();
    ctx.arc(0, -34, 25, Math.PI, 0);
    ctx.fill();
    ctx.fillRect(-28, -34, 56, 10);

    this.drawPickaxe(ctx, miner, swing);

    ctx.fillStyle = "#151922";
    ctx.beginPath();
    ctx.arc(9, -27, 3, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  drawPickaxe(ctx, miner, swing) {
    const hitPoint = this.getMiningHitPoint();
    const grip = { x: 24, y: -4 };
    const hitLocal = { x: hitPoint.x - miner.x, y: hitPoint.y - miner.y };
    const windup = { x: -16, y: -78 };
    const tip = {
      x: lerp(windup.x, hitLocal.x, swing),
      y: lerp(windup.y, hitLocal.y, swing),
    };
    const direction = Vector.normalise(Vector.create(tip.x - grip.x, tip.y - grip.y));
    const normal = { x: -direction.y, y: direction.x };

    ctx.save();
    ctx.strokeStyle = "#8b5b32";
    ctx.lineWidth = 7;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(grip.x, grip.y);
    ctx.lineTo(tip.x - direction.x * 10, tip.y - direction.y * 10);
    ctx.stroke();

    ctx.strokeStyle = CONFIG.miner.pickaxeColor;
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(tip.x - normal.x * 28, tip.y - normal.y * 28);
    ctx.quadraticCurveTo(tip.x, tip.y - 8, tip.x + normal.x * 28, tip.y + normal.y * 28);
    ctx.stroke();
    ctx.restore();
  }

  getMiningWallLayout() {
    return {
      x: this.bounds.width - CONFIG.miningWall.width / 2,
      y: this.bounds.height / 2,
      left: this.bounds.width - CONFIG.miningWall.width,
      width: CONFIG.miningWall.width,
      height: this.bounds.height,
    };
  }

  getMinerLayout() {
    const hitPoint = this.getMiningHitPoint();
    return {
      x: hitPoint.x - 94,
      y: this.bounds.height - 108,
      width: CONFIG.miner.width,
      height: CONFIG.miner.height,
    };
  }

  getDangerLineY() {
    return CONFIG.danger.lineY;
  }
}

function randomBetween(min, max) {
  return min + Math.random() * (max - min);
}

function getMineralType(typeId) {
  return MINERAL_TYPES.find((mineral) => mineral.id === typeId) ?? MINERAL_TYPES[0];
}

function getMineralData(stone) {
  if (!stone.plugin) {
    stone.plugin = {};
  }
  if (!stone.plugin.mineral) {
    stone.plugin.mineral = {};
  }
  return stone.plugin.mineral;
}

function isMaxTier(stone) {
  return getMineralData(stone).tier >= MINERAL_TYPES.length - 1;
}

function areMineralsAdjacent(stoneA, stoneB) {
  const mineralA = getMineralData(stoneA);
  const mineralB = getMineralData(stoneB);
  const distance = Vector.magnitude(Vector.sub(stoneA.position, stoneB.position));
  return distance <= (mineralA.radius + mineralB.radius) * CONFIG.merge.distanceMultiplier;
}

function getGroupKey(group) {
  return group
    .map((stone) => stone.id)
    .sort((a, b) => a - b)
    .join(":");
}

function drawMineralBody(ctx, stone) {
  const vertices = stone.vertices;
  if (!vertices.length) {
    return;
  }

  ctx.save();
  ctx.fillStyle = stone.render.fillStyle;
  ctx.strokeStyle = stone.render.strokeStyle;
  ctx.lineWidth = stone.render.lineWidth;
  ctx.beginPath();
  ctx.moveTo(vertices[0].x, vertices[0].y);
  for (let index = 1; index < vertices.length; index += 1) {
    ctx.lineTo(vertices[index].x, vertices[index].y);
  }
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.restore();
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function formatNumber(value) {
  return new Intl.NumberFormat("en-US").format(value);
}

function pick(items) {
  return items[Math.floor(Math.random() * items.length)];
}

function randomStable(seed, min, max) {
  const value = Math.sin(seed * 12.9898) * 43758.5453;
  return min + (value - Math.floor(value)) * (max - min);
}

function randomPointInCircle(radius) {
  const angle = randomBetween(0, Math.PI * 2);
  const distance = Math.sqrt(Math.random()) * radius;
  return {
    x: Math.cos(angle) * distance,
    y: Math.sin(angle) * distance,
  };
}

function createIrregularVertices(center, sides, radius) {
  return Array.from({ length: sides }, (_, index) => {
    const angle = (Math.PI * 2 * index) / sides + randomBetween(-0.08, 0.08);
    const pointRadius = radius * randomBetween(0.78, 1.14);
    return {
      x: center.x + Math.cos(angle) * pointRadius,
      y: center.y + Math.sin(angle) * pointRadius,
    };
  });
}

function degreesToRadians(degrees) {
  return (degrees * Math.PI) / 180;
}

function clampVector(vector, maxMagnitude) {
  const magnitude = Vector.magnitude(vector);
  if (magnitude <= maxMagnitude) {
    return vector;
  }
  return Vector.mult(Vector.normalise(vector), maxMagnitude);
}

function lerp(start, end, amount) {
  return start + (end - start) * amount;
}

function easeOutBack(value) {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(value - 1, 3) + c1 * Math.pow(value - 1, 2);
}

const game = new MiningGame(document.querySelector("#game-canvas"));
game.start();
window.__miningGame = game;
