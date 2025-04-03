function preload() {
  // Load the images by iterating over the image names array
  ["Ocean1_1", "Ocean1_2", "Ocean2_1", "Ocean2_2"].forEach((name) => {
    images[name] = loadImage(name + ".jpg"); // Load each image and store it in the 'images' object
  });
}

function setup() {
  // Create the canvas with a width of 1920px and height of 1080px 
  createCanvas(1920, 1080); 

  // Randomize the order of image keys and store the result in 'imageRandom'
  imageRandom = shuffle(Object.keys(images));

  // Randomly select a background image from 'imageRandom' and store it in 'backgroundImage'
  backgroundImage = random(imageRandom);

  // Call 'spawnWaterDrops' to spawn 3 water drops initially
  spawnWaterDrops(3); 

  // Set the frame rate to 24 frames per second
  frameRate(24); 
}

let images = {}; // Object to store loaded images

// Define the grid size with 64 columns and 36 rows
let gridCols = 64, 
  gridRows = 36;

// Size of each grid cell in pixels
let cellSize = 30;

// Array to store water drop effects
let waterDrop = []; 

// Array to store the randomized order of images
let imageRandom = []; 

// Variable to store the selected background image
let backgroundImage; 

// Class to represent the water drop effect
class Drop {
  constructor(x, y, layers) {
    this.x = x; // X-coordinate for the water drop
    this.y = y; // Y-coordinate for the water drop
    this.layers = layers; // Number of layers for the water drop effect
    this.startTime = millis(); // Record the start time of the effect
    this.duration = random(5000, 10000); // Random duration between 5 to 10 seconds for the fade effect
  }

  // Method to check if the animation is finished
  isFinished() {
    // Returns true if the current time exceeds the start time plus the duration
    return millis() - this.startTime > this.duration;
  }
}

function draw() {
  // Draw the background using the randomly selected image
  background(images[backgroundImage]);

  // Iterate over each water drop and draw the circular effect for each one
  for (let drop of waterDrop) {
    drawCircularEffect(drop);
  }

  // Remove finished water drops and spawn new ones if there are fewer than 3 drops
  waterDrop = waterDrop.filter((drop) => !drop.isFinished());
  if (waterDrop.length < 3) {
    spawnWaterDrops(3 - waterDrop.length);
  }
}

function spawnWaterDrops(count) {
  // Spawn the specified number of water drops
  for (let i = 0; i < count; i++) {
    // Randomly calculate the X and Y position of the center of each water drop
    let centerX = int(random(3, gridCols - 4)) * cellSize;
    let centerY = int(random(3, gridRows - 4)) * cellSize;

    // Randomly select 3 or 4 layers for the water drop effect
    let layers = random([3, 4]);

    // Create a new drop object and add it to the waterDrop array
    waterDrop.push(new Drop(centerX, centerY, layers));
  }
}

function drawCircularEffect(drop) {
  // Calculate the elapsed time since the water drop started
  let elapsed = millis() - drop.startTime;
  // Calculate the progress as a value between 0 and 1 based on the elapsed time and duration
  let progress = elapsed / drop.duration;
  // Apply the easing function to smooth out the progress
  let easedProgress = easeInOutCubic(progress);

  // Calculate the alpha value for the drop's transparency, making it fade in the last 30% of its duration
  let alpha = map(easedProgress, 0.7, 1, 255, 0);

  // Set the maximum number of layers for the water drop effect (either 3 or 4)
  let maxRadius = drop.layers === 4 ? 4 : 3;

  // Loop through each layer (from outermost to innermost)
  for (let i = maxRadius - 1; i >= 0; i--) {
    // Calculate the radius of each layer, making it expand over time
    let radius = 40 + i * 80 * easedProgress; 

    // Calculate the size of the mask for each layer (twice the radius)
    let maskSize = radius * 2;
    // Create a new graphics object for the mask
    let mask = createGraphics(maskSize, maskSize);

    // Clear the mask and prepare it for drawing
    mask.clear();
    mask.fill(255, alpha); // Fill the mask with white color and the calculated alpha (transparency)
    mask.noStroke(); // Disable stroke (outline) for the mask
    mask.ellipse(maskSize / 2, maskSize / 2, maskSize); // Draw a circular mask

    // Get a part of the image for the current layer, using the calculated position and size
    let layerImage = images[imageRandom[i]].get(
      drop.x - radius,
      drop.y - radius,
      maskSize,
      maskSize
    );
    // Apply the mask to the image layer
    layerImage.mask(mask);

    // Draw the image layer with the mask applied
    image(layerImage, drop.x - radius, drop.y - radius);
  }
}

// Ease function for a smooth start and end to the animation
function easeInOutCubic(t) {
  // If t (prgress of the animation) is less than 0.5, make it accelerate, otherwise decelerate
  return t < 0.5 ? 4 * t * t * t : 1 - pow(-2 * t + 2, 3) / 2; 
}
