const canvas = document.querySelector('canvas')
const c = canvas.getContext('2d')

canvas.width = 1024
canvas.height = 576

c.fillRect(0, 0, canvas.width, canvas.height)

const gravity = 0.7

const background = new Sprite({
    position: {
        x: 0,
        y: 0,
    },
    imageSrc: './img/blade-brawl-bg.gif'
})

const player = new Fighter({
    position: {
        x: 100,
        y: 0
    },
    velocity: {
        x: 0,
        y: 0
    },
    offset: {
        x: 0,
        y: 0
    },
    imageSrc: './img/sprite1/samurai/Idle.png',
    framesMax: 6,
    scale: 2.5,
    offset: {
        x: - 60 + 100,
        y: 250 - 100
    },
    sprites: {
        idle : {
            imageSrc: './img/sprite1/samurai/Idle.png',
            framesMax: 6,
        },
        run : {
            imageSrc: './img/sprite1/samurai/Run.png',
            framesMax: 8,
        },
        jump : {
            imageSrc: './img/sprite1/samurai/Jump.png',
            framesMax: 9,
        },
        attack1: {
            imageSrc: './img/sprite1/samurai/Attack_3.png',
            framesMax: 4,
        },
        takeHit: {
            imageSrc: './img/sprite1/samurai/Hurt.png',
            framesMax: 3,
        },
    },
    attackBox: {
        offset: {
            x: 120,
            y: 0
        },
        width: 200,
        height: 50
    }
})

const enemy = new Fighter({
    position: {
        x: 750,
        y: 100
    },
    velocity: {
        x: 0,
        y: 0
    },
    color: 'blue',
    offset: {
        x: -50,
        y: 0
    },
    imageSrc: './img/sprite1/Samurai_Archer/Idle.png',
    framesMax: 9,
    scale: 2.5,
    offset: {
        x: - 40 - 80,
        y: 170 - 30
    },
    sprites: {
        idle : {
            imageSrc: './img/sprite1/Samurai_Archer/Idle.png',
            framesMax: 9,
        },
        run : {
            imageSrc: './img/sprite1/Samurai_Archer/Run.png',
            framesMax: 8,
        },
        jump : {
            imageSrc: './img/sprite1/Samurai_Archer/Jump.png',
            framesMax: 9,
        },
        attack1: {
            imageSrc: './img/sprite1/Samurai_Archer/attack_2.png',
            framesMax: 5,
        },
        takeHit: {
            imageSrc: './img/sprite1/Samurai_Archer/Hurt.png',
            framesMax: 3,
        },
    },
    attackBox: {
        offset: {
            x: - 60,
            y: 0
        },
        width: 200,
        height: 50
    }
})

const keys = {
    a: {
        pressed: false
    },
    d: {
        pressed: false
    },
    ArrowRight: {
        pressed: false
    },
    ArrowLeft: {
        pressed: false
    }
}

decreaseTimer()

function animate() {
    window.requestAnimationFrame(animate)
    c.fillStyle = 'black'
    c.fillRect(0, 0, canvas.width, canvas.height)
    background.update()
    player.update()
    enemy.update()

    player.velocity.x = 0
    enemy.velocity.x = 0

    // Player movement
    if (keys.a.pressed && player.lastKey === 'a') {
        player.velocity.x = -5
        player.switchSprite('run')
    } else if (keys.d.pressed && player.lastKey === 'd') {
        player.velocity.x = 5
        player.switchSprite('run')
    } else {
        player.switchSprite('idle')
    }
    // Jumping
    if (player.velocity.y < 0) {
        player.switchSprite('jump')
    }

    if (player.velocity.x > 0 && player.velocity.x < 0) {
        player.framesMax = player.sprites.run.framesMax
    }

    // Enemy movement
    if (keys.ArrowLeft.pressed && enemy.lastKey === 'ArrowLeft') {
        enemy.velocity.x = -5
        enemy.switchSprite('run')
    } else if (keys.ArrowRight.pressed && enemy.lastKey === 'ArrowRight') {
        enemy.velocity.x = 5
        enemy.switchSprite('run')
    } else {
    enemy.switchSprite('idle')
    }

    // Jumping
    if (enemy.velocity.y < 0) {
        enemy.switchSprite('jump')
    }

    // Collision detect & enemy hit
    if (
    rectangularCollision({
        rectangle1: player,
        rectangle2: enemy
    }) &&
    player.isAttacking &&
    player.framesCurrent === 2
    ) {
        enemy.takeHit()
        player.isAttacking = false
        document.querySelector('#enemyHealth').style.width = enemy.health + '%'
    }

    // If player misses
    if (player.isAttacking && player.framesCurrent === 4) {
        player.isAttacking = false
    }

    // Collision detect & player hit
    if (
    rectangularCollision({
        rectangle1: enemy,
        rectangle2: player
    }) &&
    enemy.isAttacking &&
    enemy.framesCurrent === 3
    ) {
        player.takeHit()
        enemy.isAttacking = false
        document.querySelector('#playerHealth').style.width = player.health + '%'
    }

        // If enemy misses
        if (enemy.isAttacking && enemy.framesCurrent === 4) {
            enemy.isAttacking = false
        }

        // End game 0 health
        if (enemy.health <= 0 || player.health <= 0) {
            determineWinner({ player, enemy, timerId })
        }
}

animate()

window.addEventListener('keydown', (event) => {
    switch (event.key) {
        case 'd':
            keys.d.pressed = true
            player.lastKey = 'd'
            break
        case 'a':
            keys.a.pressed = true
            player.lastKey = 'a'
            break
        case 'w':
            player.velocity.y = -20
            break
        case ' ':
            player.attack()
            break
            
        case 'ArrowRight':
            keys.ArrowRight.pressed = true
            enemy.lastKey = 'ArrowRight'
            break
        case 'ArrowLeft':
            keys.ArrowLeft.pressed = true
            enemy.lastKey = 'ArrowLeft'
            break
        case 'ArrowUp':
            enemy.velocity.y = -20
            break
        case 'ArrowDown':
            enemy.attack()
            break
    }
})

window.addEventListener('keyup', (event) => {
    switch (event.key) {
        case 'd':
            keys.d.pressed = false
            break
        case 'a':
            keys.a.pressed = false
            break
    }  
    // Enemy keys
    switch (event.key) {
        case 'ArrowRight':
            keys.ArrowRight.pressed = false
            break
        case 'ArrowLeft':
            keys.ArrowLeft.pressed = false
            break
    }
})