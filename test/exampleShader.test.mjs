import test from 'node:test';
import assert from 'assert/strict';
import * as exampleShader from '../src/effects/library/exampleShader.mjs';

function getPixel(sceneFloat32, sceneWidth, xPosition, yPosition){
  const offset = (yPosition * sceneWidth + xPosition) * 3;
  return [sceneFloat32[offset], sceneFloat32[offset + 1], sceneFloat32[offset + 2]];
}

function approximately(value, target){
  return Math.abs(value - target) < 1e-3;
}

test('example shader toggles colors based on time and speed', () => {
  const sceneWidth = 2;
  const sceneHeight = 2;
  const sceneBuffer = new Float32Array(sceneWidth * sceneHeight * 3);

  exampleShader.render(sceneBuffer, sceneWidth, sceneHeight, 0, {});
  for (let yPosition = 0; yPosition < sceneHeight; yPosition++){
    for (let xPosition = 0; xPosition < sceneWidth; xPosition++){
      const [red, green, blue] = getPixel(sceneBuffer, sceneWidth, xPosition, yPosition);
      assert(approximately(red, 0) && approximately(green, 0) && approximately(blue, 0));
    }
  }

  exampleShader.render(sceneBuffer, sceneWidth, sceneHeight, 0.3, {});
  for (let yPosition = 0; yPosition < sceneHeight; yPosition++){
    for (let xPosition = 0; xPosition < sceneWidth; xPosition++){
      const [red, green, blue] = getPixel(sceneBuffer, sceneWidth, xPosition, yPosition);
      assert(approximately(red, 1) && approximately(green, 1) && approximately(blue, 1));
    }
  }

  exampleShader.render(sceneBuffer, sceneWidth, sceneHeight, 0.3, { strobeSpeed: 1 });
  for (let yPosition = 0; yPosition < sceneHeight; yPosition++){
    for (let xPosition = 0; xPosition < sceneWidth; xPosition++){
      const [red, green, blue] = getPixel(sceneBuffer, sceneWidth, xPosition, yPosition);
      assert(approximately(red, 0) && approximately(green, 0) && approximately(blue, 0));
    }
  }
});
