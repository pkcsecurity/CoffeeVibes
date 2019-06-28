AFRAME.registerComponent('shoot-tomato', {
  init: function() {
    const camera = document.getElementById('camera');
    const bombDropSnd = document.querySelector('#bombDrop').components.sound;
    const bombExplodeSnd = document.querySelector('#bombExplode').components.sound;

    this.el.sceneEl.addEventListener('touchstart', (event) => {
      bombDropSnd.playSound();

      // Create element to be thrown, setting position, scale, and model
      const tomato = document.createElement('a-entity');
      tomato.setAttribute('position', camera.object3D.position);
      tomato.setAttribute('scale', '0.2 0.2 0.2');
      tomato.setAttribute('gltf-model', '#starbucks-glb');

      // Choose a random rotation offset for some variation
      const randomRotation = { x: -90 + Math.random() * 30, y: Math.random() * 360, z: 0 };
      tomato.setAttribute('rotation', randomRotation);

      // Set velocity, rotated with camera direction
      const velocity = new THREE.Vector3(0, 0, -20);
      velocity.applyQuaternion(camera.object3D.quaternion);
      tomato.setAttribute('velocity', velocity);

      // Add physics body
      tomato.setAttribute('body', {
        type: 'dynamic',
        sphereRadius: 0.5,
        shape: 'sphere',
      });

      // Add tomato to scene
      this.el.sceneEl.appendChild(tomato);

      let didCollide = false;
      tomato.addEventListener('collide', (event) => {
        // Only want to do the splat once, and with the ground only
        if (didCollide || event.detail.body.el.id != 'ground') {
          return;
        }
        didCollide = true;

        tomato.setAttribute('visible', 'false');

        bombDropSnd.stopSound();
        bombExplodeSnd.playSound();

        const collisionStats = event.detail.contact;

        const newElement = document.createElement('a-entity');

        newElement.setAttribute('position', collisionStats.rj);

        const randomYRotation = Math.random() * 360;
        newElement.setAttribute('rotation', '0 ' + randomYRotation + ' 0');

        newElement.setAttribute('visible', 'false');
        newElement.setAttribute('scale', '0.10 0.10 0.10');

        newElement.setAttribute('gltf-model', '#starbucks-glb');
        this.el.sceneEl.appendChild(newElement);

        newElement.addEventListener('model-loaded', () => {
          // Once the model is loaded, we are ready to show it popping in using an animation
          newElement.setAttribute('visible', 'true');
          newElement.setAttribute('animation', {
            property: 'scale',
            to: '0.15 0.15 0.15',
            easing: 'easeOutElastic',
            dur: 800,
          });
        });

        // We can't remove the thrown tomato until the physics step is over
        setTimeout(() => {
          tomato.parentNode.removeChild(tomato);
        }, 0);
      });
    });
  },
});
