import React, { useEffect, useState } from 'react';
import { useParamsContext } from './ParamsContext.js';
import { effects } from '../effects/index.mjs';
import { fetchPresetNames } from './presets.mjs';
import EffectControls from './subviews/index.js';

export default function ControlPanel() {
  const { params, dispatch, sendPatch } = useParamsContext();
  const [presetNames, setPresetNames] = useState([]);
  const [presetInput, setPresetInput] = useState('');

  const activeEffectId = params.effect || 'gradient';
  const activeEffect = effects[activeEffectId] || effects.gradient;
  const effectParams = (params.effects && params.effects[activeEffectId]) || {};

  useEffect(() => {
    fetchPresetNames(window).then(setPresetNames).catch(() => {});
  }, []);

  const handlePresetSelect = async (name) => {
    await fetch(`/preset/load/${encodeURIComponent(name)}`);
  };

  const handlePresetSave = async () => {
    if (!presetInput) return;
    await fetch(`/preset/save/${encodeURIComponent(presetInput)}`, { method: 'POST' });
    setPresetInput('');
    fetchPresetNames(window).then(setPresetNames).catch(() => {});
  };

  const setPostParam = (key, value) => {
    dispatch({ post: { [key]: value } }, false);
    sendPatch({ [key]: value });
  };

  const setEffectParam = (key, value) => {
    dispatch({ effects: { [activeEffectId]: { [key]: value } } }, false);
    sendPatch({ [key]: value });
  };

  const handleTintChange = (index, value) => {
    const tintArray = params.post?.tint ? [...params.post.tint] : [1, 1, 1];
    tintArray[index] = value;
    setPostParam('tint', tintArray);
  };

  return (
    <div className="panel">
      <fieldset>
        <legend>Presets</legend>
        <div className="row">
          <div className="presetRow">
            {presetNames.map((name) => (
              <div key={name} className="presetItem" onClick={() => handlePresetSelect(name)}>
                <img src={`/preset/preview/${encodeURIComponent(name)}`} alt={name} />
                <div>{name}</div>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <input value={presetInput} onChange={(e) => setPresetInput(e.target.value)} placeholder="name" />
            <button onClick={handlePresetSave}>Save</button>
          </div>
        </div>
      </fieldset>

      <fieldset>
        <legend>Effect</legend>
        <div className="row">
          <label>
            Effect
            <select value={activeEffectId} onChange={(e) => dispatch({ effect: e.target.value })}>
              {Object.values(effects).map((eff) => (
                <option key={eff.id} value={eff.id}>{eff.displayName}</option>
              ))}
            </select>
          </label>
        </div>
        <div className="row">
          <EffectControls schema={activeEffect.paramSchema} values={effectParams} onChange={setEffectParam} />
        </div>
      </fieldset>

      <fieldset>
        <legend>General</legend>
        <div className="row">
          <label>
            Brightness
            <input type="range" min="0" max="1" step="0.01" value={params.post?.brightness ?? 0} onChange={(e) => setPostParam('brightness', parseFloat(e.target.value))} />
            <span>{params.post?.brightness ?? 0}</span>
          </label>
          <label>
            Gamma
            <input type="range" min="0.5" max="3" step="0.01" value={params.post?.gamma ?? 1} onChange={(e) => setPostParam('gamma', parseFloat(e.target.value))} />
            <span>{params.post?.gamma ?? 1}</span>
            <small className="desc">brightness curve</small>
          </label>
          <label>
            FPS cap
            <input type="range" min="1" max="60" step="1" value={params.fpsCap ?? 60} onChange={(e) => dispatch({ fpsCap: parseInt(e.target.value, 10) })} />
            <span>{params.fpsCap ?? 60}</span>
          </label>
          <label>
            Render mode
            <select value={params.renderMode || 'duplicate'} onChange={(e) => dispatch({ renderMode: e.target.value })}>
              <option value="duplicate">duplicate</option>
              <option value="extended">extended</option>
              <option value="mirror">mirror</option>
            </select>
          </label>
        </div>
      </fieldset>

      <fieldset>
        <legend>Orientation</legend>
        <div className="row">
          <label>
            Pitch
            <input type="range" min="-360" max="360" step="0.1" value={params.post?.pitchSpeed ?? 0} onChange={(e) => setPostParam('pitchSpeed', parseFloat(e.target.value))} />
            <input type="number" min="0" max="360" step="0.1" value={params.post?.pitch ?? 0} onChange={(e) => setPostParam('pitch', parseFloat(e.target.value))} style={{ width: '60px' }} />
          </label>
          <label>
            Yaw
            <input type="range" min="-360" max="360" step="0.1" value={params.post?.yawSpeed ?? 0} onChange={(e) => setPostParam('yawSpeed', parseFloat(e.target.value))} />
            <input type="number" min="0" max="360" step="0.1" value={params.post?.yaw ?? 0} onChange={(e) => setPostParam('yaw', parseFloat(e.target.value))} style={{ width: '60px' }} />
          </label>
        </div>
      </fieldset>

      <fieldset>
        <legend>Strobe</legend>
        <div className="row">
          <label>
            Strobe Hz
            <input type="range" min="0" max="20" step="0.1" value={params.post?.strobeHz ?? 0} onChange={(e) => setPostParam('strobeHz', parseFloat(e.target.value))} />
            <span>{params.post?.strobeHz ?? 0}</span>
          </label>
          <label>
            Duty
            <input type="range" min="0" max="1" step="0.01" value={params.post?.strobeDuty ?? 0} onChange={(e) => setPostParam('strobeDuty', parseFloat(e.target.value))} />
            <span>{params.post?.strobeDuty ?? 0}</span>
            <small className="desc">on-time %</small>
          </label>
          <label>
            Low
            <input type="range" min="0" max="1" step="0.01" value={params.post?.strobeLow ?? 0} onChange={(e) => setPostParam('strobeLow', parseFloat(e.target.value))} />
            <span>{params.post?.strobeLow ?? 0}</span>
            <small className="desc">min brightness</small>
          </label>
        </div>
      </fieldset>

      <fieldset>
        <legend>Tint</legend>
        <div className="row">
          <label>
            Tint R
            <input type="range" min="0" max="1" step="0.01" value={params.post?.tint ? params.post.tint[0] : 1} onChange={(e) => handleTintChange(0, parseFloat(e.target.value))} />
            <span>{params.post?.tint ? params.post.tint[0] : 1}</span>
          </label>
          <label>
            Tint G
            <input type="range" min="0" max="1" step="0.01" value={params.post?.tint ? params.post.tint[1] : 1} onChange={(e) => handleTintChange(1, parseFloat(e.target.value))} />
            <span>{params.post?.tint ? params.post.tint[1] : 1}</span>
          </label>
          <label>
            Tint B
            <input type="range" min="0" max="1" step="0.01" value={params.post?.tint ? params.post.tint[2] : 1} onChange={(e) => handleTintChange(2, parseFloat(e.target.value))} />
            <span>{params.post?.tint ? params.post.tint[2] : 1}</span>
          </label>
        </div>
      </fieldset>
    </div>
  );
}

