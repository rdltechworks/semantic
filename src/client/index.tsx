import React, { useState, useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import * as BABYLON from '@babylonjs/core';

const App = () => {
  const [username, setUsername] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [system, setSystem] = useState(null);

  const handleLogin = (e) => {
    e.preventDefault();
    const name = e.target.elements.username.value;
    if (name) {
      setUsername(name);
      setIsLoggedIn(true);
    }
  };

  if (!isLoggedIn) {
    return (
      <div style={{ textAlign: 'center', marginTop: '50px' }}>
        <h1>Enter the Galaxy</h1>
        <form onSubmit={handleLogin}>
          <input type="text" name="username" placeholder="Enter your name" />
          <button type="submit">Enter</button>
        </form>
      </div>
    );
  }

  if (!system) {
    return (
      <div style={{ textAlign: 'center', marginTop: '50px' }}>
        <h1>Welcome, {username}!</h1>
        <h2>Choose a Solar System to Join</h2>
        <button onClick={() => setSystem('sol-system')}>Join Sol System</button>
        <button onClick={() => setSystem('proxima-system')}>Join Proxima Centauri</button>
      </div>
    );
  }

  return <GameScene systemId={system} username={username} />;
};

const GameScene = ({ systemId, username }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const engine = new BABYLON.Engine(canvasRef.current, true);
    const scene = new BABYLON.Scene(engine);
    scene.clearColor = new BABYLON.Color4(0.02, 0.02, 0.1, 1);

    const camera = new BABYLON.ArcRotateCamera("camera", -Math.PI / 2, Math.PI / 2.5, 100, BABYLON.Vector3.Zero(), scene);
    camera.attachControl(canvasRef.current, true);

    const light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), scene);

    // Scene setup based on systemId
    if (systemId === 'sol-system') {
      const sun = BABYLON.MeshBuilder.CreateSphere("sun", { diameter: 10 }, scene);
      sun.material = new BABYLON.StandardMaterial("sunMat", scene);
      (sun.material as BABYLON.StandardMaterial).emissiveColor = BABYLON.Color3.Yellow();

      const earth = BABYLON.MeshBuilder.CreateSphere("earth", { diameter: 2 }, scene);
      earth.position.x = 20;
    } else if (systemId === 'proxima-system') {
      const proxima = BABYLON.MeshBuilder.CreateSphere("proxima", { diameter: 5 }, scene);
      proxima.material = new BABYLON.StandardMaterial("proximaMat", scene);
      (proxima.material as BABYLON.StandardMaterial).emissiveColor = BABYLON.Color3.Red();

      const exoplanet = BABYLON.MeshBuilder.CreateSphere("exoplanet", { diameter: 1.5 }, scene);
      exoplanet.position.x = 15;
    }

    const localPlayer = BABYLON.MeshBuilder.CreateSphere("localPlayer", { diameter: 1 }, scene);
    localPlayer.material = new BABYLON.StandardMaterial("localPlayerMat", scene);
    (localPlayer.material as BABYLON.StandardMaterial).emissiveColor = BABYLON.Color3.Green();

    const remotePlayers = new Map();

    // PartyKit WebSocket connection
    const partySocket = new WebSocket(`wss://${window.location.host}/party/${systemId}`);

    partySocket.onopen = () => {
      partySocket.send(JSON.stringify({ type: 'identify', username }));
    };

    partySocket.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.type === 'sync') {
        msg.players.forEach(p => {
          if (p.id !== partySocket.id) {
            const remotePlayer = BABYLON.MeshBuilder.CreateSphere(p.id, { diameter: 1 }, scene);
            remotePlayers.set(p.id, remotePlayer);
          }
        });
      }
      if (msg.type === 'join') {
        const remotePlayer = BABYLON.MeshBuilder.CreateSphere(msg.id, { diameter: 1 }, scene);
        remotePlayers.set(msg.id, remotePlayer);
      }
      if (msg.type === 'leave') {
        remotePlayers.get(msg.id)?.dispose();
        remotePlayers.delete(msg.id);
      }
      if (msg.type === 'move') {
        const playerMesh = remotePlayers.get(msg.id);
        if (playerMesh) {
          playerMesh.position = new BABYLON.Vector3(msg.position.x, msg.position.y, msg.position.z);
        }
      }
    };

    // Simple movement and update loop
    scene.onBeforeRenderObservable.add(() => {
        if (localPlayer) {
            localPlayer.position.x += 0.01;
            partySocket.send(JSON.stringify({ type: 'move', position: {x: localPlayer.position.x, y: localPlayer.position.y, z: localPlayer.position.z} }));
        }
    });

    engine.runRenderLoop(() => {
      scene.render();
    });

    window.addEventListener('resize', () => {
      engine.resize();
    });

    return () => {
      partySocket.close();
      engine.dispose();
    };
  }, [systemId, username]);

  return <canvas ref={canvasRef} style={{ width: '100%', height: '100%' }} />;
};

const container = document.getElementById('root');
const root = createRoot(container!);
root.render(<App />);