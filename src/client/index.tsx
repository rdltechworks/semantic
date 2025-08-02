
import React, { useState, useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import * as BABYLON from '@babylonjs/core';

// Main App Component: Manages the overall state (login, system selection)
const App = () => {
  const [username, setUsername] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [systemId, setSystemId] = useState<string | null>(null);

  const handleLogin = (name: string) => {
    if (name) {
      setUsername(name);
      setIsLoggedIn(true);
    }
  };

  const handleSystemSelect = (selectedSystemId: string) => {
    setSystemId(selectedSystemId);
  };

  // Render different screens based on the app state
  if (!isLoggedIn) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  if (!systemId) {
    return <SystemSelectScreen username={username} onSelect={handleSystemSelect} />;
  }

  return <GameScene systemId={systemId} username={username} />;
};

// Login Screen Component
const LoginScreen = ({ onLogin }) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    const name = e.target.elements.username.value;
    onLogin(name);
  };

  return (
    <div style={{ textAlign: 'center', marginTop: '50px', color: 'white' }}>
      <h1>Enter the Galaxy</h1>
      <form onSubmit={handleSubmit}>
        <input type="text" name="username" placeholder="Enter your name" required style={{ padding: '10px', fontSize: '16px' }} />
        <button type="submit" style={{ padding: '10px 20px', fontSize: '16px', marginLeft: '10px' }}>Enter</button>
      </form>
    </div>
  );
};

// System Selection Screen Component
const SystemSelectScreen = ({ username, onSelect }) => {
  return (
    <div style={{ textAlign: 'center', marginTop: '50px', color: 'white' }}>
      <h1>Welcome, {username}!</h1>
      <h2>Choose a Solar System</h2>
      <button onClick={() => onSelect('sol-system')}>Join Sol System</button>
      <button onClick={() => onSelect('proxima-system')}>Join Proxima Centauri</button>
    </div>
  );
};

// Game Scene Component: Handles Babylon.js rendering and PartyKit connection
const GameScene = ({ systemId, username }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const engine = new BABYLON.Engine(canvasRef.current, true);
    const scene = new BABYLON.Scene(engine);
    scene.clearColor = new BABYLON.Color4(0.02, 0.02, 0.1, 1);

    const camera = new BABYLON.ArcRotateCamera("camera", -Math.PI / 2, Math.PI / 2.5, 100, BABYLON.Vector3.Zero(), scene);
    camera.attachControl(canvasRef.current, true);

    new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), scene);

    // Load system-specific geometry
    import { createStar } from './StarFactory';

// Game Scene Component: Handles Babylon.js rendering and PartyKit connection
const GameScene = ({ systemId, username }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const engine = new BABYLON.Engine(canvasRef.current, true);
    const scene = new BABYLON.Scene(engine);
    scene.clearColor = new BABYLON.Color4(0.02, 0.02, 0.1, 1);

    const camera = new BABYLON.ArcRotateCamera("camera", -Math.PI / 2, Math.PI / 2.5, 100, BABYLON.Vector3.Zero(), scene);
    camera.attachControl(canvasRef.current, true);

    new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), scene);

    // Use the StarFactory to create the star
    createStar(scene, systemId);

    // Scene setup based on systemId
    if (systemId === 'sol-system') {
      const earth = BABYLON.MeshBuilder.CreateSphere("earth", { diameter: 2 }, scene);
      earth.position.x = 20;
    } else if (systemId === 'proxima-system') {
      const exoplanet = BABYLON.MeshBuilder.CreateSphere("exoplanet", { diameter: 1.5 }, scene);
      exoplanet.position.x = 15;
    }

    const localPlayer = BABYLON.MeshBuilder.CreateSphere(`player-${username}`, { diameter: 1 }, scene);
    const localPlayerMat = new BABYLON.StandardMaterial("localPlayerMat", scene);
    localPlayerMat.emissiveColor = BABYLON.Color3.Green();
    localPlayer.material = localPlayerMat;

    const remotePlayers = new Map<string, BABYLON.Mesh>();
    const partySocket = new WebSocket(`wss://${window.location.host}/party/${systemId}`);

    partySocket.onopen = () => {
      partySocket.send(JSON.stringify({ type: 'identify', username }));
    };

    partySocket.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      switch (msg.type) {
        case 'sync':
          msg.players.forEach(p => {
            if (p.id !== partySocket.id && !remotePlayers.has(p.id)) {
              const remotePlayer = BABYLON.MeshBuilder.CreateSphere(p.id, { diameter: 1 }, scene);
              remotePlayers.set(p.id, remotePlayer);
            }
          });
          break;
        case 'join':
          if (msg.player.id !== partySocket.id && !remotePlayers.has(msg.player.id)) {
            const remotePlayer = BABYLON.MeshBuilder.CreateSphere(msg.player.id, { diameter: 1 }, scene);
            remotePlayers.set(msg.player.id, remotePlayer);
          }
          break;
        case 'leave':
          remotePlayers.get(msg.id)?.dispose();
          remotePlayers.delete(msg.id);
          break;
        case 'move':
          const playerMesh = remotePlayers.get(msg.id);
          if (playerMesh) {
            playerMesh.position = new BABYLON.Vector3(msg.position.x, msg.position.y, msg.position.z);
          }
          break;
      }
    };

    let time = 0;
    const renderLoop = scene.onBeforeRenderObservable.add(() => {
        time += 0.01;
        localPlayer.position.x = Math.cos(time) * 30;
        localPlayer.position.z = Math.sin(time) * 30;
        if (partySocket.readyState === WebSocket.OPEN) {
            partySocket.send(JSON.stringify({ type: 'move', position: { x: localPlayer.position.x, y: localPlayer.position.y, z: localPlayer.position.z } }));
        }
    });

    engine.runRenderLoop(() => scene.render());
    const resizeHandler = () => engine.resize();
    window.addEventListener('resize', resizeHandler);

    // Cleanup on component unmount
    return () => {
      scene.onBeforeRenderObservable.remove(renderLoop);
      partySocket.close();
      engine.dispose();
      window.removeEventListener('resize', resizeHandler);
    };
  }, [systemId, username]); // Re-run effect if systemId or username changes

  return <canvas ref={canvasRef} style={{ width: '100vw', height: '100vh', display: 'block' }} />;
};

// Render the main App component
const container = document.getElementById('root');
const root = createRoot(container!);
root.render(<App />);
