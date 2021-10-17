title = "Solo Mission";

description = `
 Survive for as
Long as Possible



[Use Mouse to
  Move Player]
`;

characters = [
`
  ll
  ll
ccllcc
ccllcc
ccllcc
cc  cc
`,
`
rr  rr
rrrrrr
rrpprr
rrrrrr
  rr
  rr
`,
`
y  y
yyyyyy
 y  y
yyyyyy
 y  y
`,
`
ll
ll
`
];

const G = {
  WIDTH: 100,
  HEIGHT: 150,

  STAR_SPEED_MIN: 0.5,
	STAR_SPEED_MAX: 1.0,

  PLAYER_FIRE_RATE: 4,
  PLAYER_GUN_OFFSET: 3,
  PLAYER_HP: 100,

  FBULLET_SPEED: 5,

  ENEMY_MIN_BASE_SPEED: 1.0,
  ENEMY_MAX_BASE_SPEED: 1.5,
  ENEMY_FIRE_RATE: 50,

  EBULLET_SPEED: 1,
  EBULLET_ROTATION_SPD: 0.1
}

options = {
  theme: 'crt',
  viewSize: {x: G.WIDTH, y: G.HEIGHT},
  seed: 2,
  isPlayingBgm: true,
  isReplayEnabled: true,
  isCapturing: true,
  isCapturingGameCanvasOnly: true,
  captureCanvasScale: 2
};

/**
  * @typedef {{
  * pos: Vector,
  * speed: number
  * }} Star
  */

/**
  * @type  { Star [] }
  */
let stars;

/**
  * @typedef {{
  * pos: Vector,
  * firingCooldown: number,
  * isFiringLeft: boolean,
  * life: number
  * }} Player
  */

/**
  * @type { Player }
  */
let player;

/**
  * @typedef {{
  * pos: Vector
  * }} FBullet
  */

/**
  * @type { FBullet [] }
  */
  let fBullets;

/**
  * @typedef {{
  * pos: Vector,
  * firingCooldown: number
  * }} Enemy
  */

/**
  * @type { Enemy [] }
  */
let enemies;

/**
  * @type { number }
  */
let currentEnemySpeed;

/**
 * @type { number }
 */
let currentEBulletSpeed;

/**
  * @type { number }
  */
let waveCount;

// New type
/**
  * @typedef {{
  * pos: Vector,
  * angle: number,
  * rotation: number
  * }} EBullet
  */

/**
  * @type { EBullet [] }
  */
let eBullets;

// The game loop function
function update() {
  // The init function running at startup
  if (!ticks) {
    // A CrispGameLib function
    // First argument (number): number of times to run the second argument
    // Second argument (function): a function that returns an object. This
    // object is then added to an array. This array will eventually be
    // returned as output of the times() function.
    stars = times(20, () => {
      // Random number generator function
      // rnd( min, max )
      const posX = rnd(0, G.WIDTH);
      const posY = rnd(0, G.HEIGHT);
      // An object of type Star with appropriate properties
      return {
        // Creates a Vector
        pos: vec(posX, posY),
        // More RNG
        speed: rnd(G.STAR_SPEED_MIN, G.STAR_SPEED_MAX)
      };
    });

    player = {
      pos: vec(G.WIDTH * 0.5, G.HEIGHT * 0.5),
      firingCooldown: G.PLAYER_FIRE_RATE,
      isFiringLeft: true,
      life: G.PLAYER_HP
    };

    fBullets = [];
    enemies = [];
    eBullets = [];

    waveCount = 0;
    currentEnemySpeed = 0;
    currentEBulletSpeed = 0;
  }

  if (enemies.length === 0) {
    currentEnemySpeed = rnd(G.ENEMY_MIN_BASE_SPEED, G.ENEMY_MAX_BASE_SPEED) * difficulty;
    currentEBulletSpeed = rnd(G.EBULLET_SPEED, 1.5) * difficulty;
    for (let i = 0; i < 9; i++) {
      const posX = rnd(0, G.WIDTH);
      const posY = -rnd(i * G.HEIGHT * 0.1);
      enemies.push({
        pos: vec(posX, posY),
        firingCooldown: G.ENEMY_FIRE_RATE 
      });
    }

    waveCount++; // Increase the tracking variable by one

    if(G.PLAYER_HP < 50) {
      G.PLAYER_FIRE_RATE = 3;
    }
  }

  // Update for Star
  stars.forEach((s) => {
    // Move the star downwards
    s.pos.y += s.speed;
    // Bring the star back to top once it's past the bottom of the screen
    s.pos.wrap(0, G.WIDTH, 0, G.HEIGHT);

    // Choose a color to draw
    color("light_black");
    // Draw the star as a square of size 1
    box(s.pos, 1);
  });

  // Updating and drawing the player
  player.pos = vec(input.pos.x, input.pos.y);
  player.pos.clamp(0, G.WIDTH, 0, G.HEIGHT);
  // Cooling down for the next shot
  player.firingCooldown--;
  // Time to fire the next shot
  if (player.firingCooldown <= 0) {
    // Get the side from which the bullet is fired
    const offset = (player.isFiringLeft)
    ? -G.PLAYER_GUN_OFFSET
    : G.PLAYER_GUN_OFFSET;
    // Create the bullet
    fBullets.push({
      pos: vec(player.pos.x + offset, player.pos.y)
    });
    // Reset the firing cooldown
    player.firingCooldown = G.PLAYER_FIRE_RATE;
    // Switch the side of the firing gun by flipping the boolean value
    player.isFiringLeft = !player.isFiringLeft;

    if (G.PLAYER_HP > 50) {
      color("yellow");
    } else {
      color("purple");
    }
    // Generate particles
    particle(
      player.pos.x + offset, // x coordinate
      player.pos.y, // y coordinate
      4, // The number of particles
      1, // The speed of the particles
      -PI/2, // The emitting angle
      PI/4  // The emitting width
    );
  }

  // Engine particles
  particle(
    player.pos.x,
    player.pos.y,
    3,
    1,
    PI/2,
    PI/5
  );

  color ("black");
  char("a", player.pos);

  text("HP:" + G.PLAYER_HP.toString(), 3, 15);

  // Updating and drawing bullets
  fBullets.forEach((fb) => {
    // Move the bullets upwards
    fb.pos.y -= G.FBULLET_SPEED;
    
    // Drawing
    if (G.PLAYER_HP > 50) {
      color("yellow");
    } else {
      color("purple");
    }
    char("d", fb.pos);
  });

  // Another update loop
  remove(enemies, (e) => {
    e.pos.y += currentEnemySpeed;
    e.firingCooldown--;
    if (e.firingCooldown <= 0) {
      eBullets.push({
        pos: vec(e.pos.x, e.pos.y),
        angle: e.pos.angleTo(player.pos),
        rotation: rnd()
      });
      e.firingCooldown = G.ENEMY_FIRE_RATE;
      play("select");
    }

    color("black");
    // Shorthand to check for collision against another specific type
    // Also draw the sprite
    const isCollidingWithFBullets = char("b", e.pos).isColliding.char.d;

    // Check whether to make a small particle explosion at the position
    if (isCollidingWithFBullets) {
      if (G.PLAYER_HP > 50) {
        color("yellow");
      } else {
        color("purple");
      }
      particle(e.pos);
      play("explosion");
      addScore(10 * waveCount, e.pos);
    }

    // Also another condition to remove the object
    return (isCollidingWithFBullets || e.pos.y > G.HEIGHT);
  });

  remove(fBullets, (fb) => {
    // Interaction from fBullets to enemies, after enemies have been drawn
    if (G.PLAYER_HP > 50) {
      color("yellow");
    } else {
      color("purple");
    }
    const isCollidingWithEnemies = box(fb.pos, 2).isColliding.char.b;
    return (isCollidingWithEnemies || fb.pos.y < 0);
  });

  remove(eBullets, (eb) => {
    // Old-fashioned trigonometry to find out the velocity on each axis
    eb.pos.x += currentEBulletSpeed * Math.cos(eb.angle);
    eb.pos.y += currentEBulletSpeed * Math.sin(eb.angle);
    // The bullet also rotates around itself
    eb.rotation += G.EBULLET_ROTATION_SPD;

    color("red");
    const isCollidingWithPlayer = char("c", eb.pos, {rotation: eb.rotation}).isColliding.char.a;

    if (isCollidingWithPlayer) {
      // End the game
      G.PLAYER_HP--;
      play("powerUp"); 
    }

    const isCollidingWithFBullets = char("c", eb.pos, {rotation: eb.rotation}).isColliding.char.d;

    if (isCollidingWithFBullets) {
      if (G.PLAYER_HP > 50) {
        color("yellow");
      } else {
        color("purple");
      }
      particle(eb.pos);
      addScore(1 * waveCount, eb.pos);
    }

    // If eBullet is not onscreen, remove it
    return (isCollidingWithFBullets ||!eb.pos.isInRect(0, 0, G.WIDTH, G.HEIGHT));
  });

  if(G.PLAYER_HP < 0) {
    end();
    G.PLAYER_HP = 100;
  }
}