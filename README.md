# Chronicles of the Synergistic Sphere

**Tagline:** An open-world adventure where you program AI agents to explore a universe built from real exoplanet data, piecing together the lost knowledge of an ancient civilization.

## Core Concept

"Chronicles of the Synergistic Sphere" is a vast, multiplayer space exploration game. Players take on the role of a "Synthesizer," an architect and programmer on a mission to reconstruct the fragmented **Knowledge Graph** of a highly advanced ancient civilization by exploring a universe of diverse solar systems.

Each solar system is a unique, real-time environment where players can interact with each other, planets, and resources. The game world is procedurally generated, with its diverse biomes, physics, and environmental challenges seeded by **real NASA exoplanet data**, creating a scientifically grounded and endlessly explorable universe.

## Key Features

*   **Multiplayer Universe:** Explore a galaxy of solar systems, each acting as a real-time, shared "room" where you can encounter other players.
*   **Procedurally Generated Solar Systems:** Discover unique worlds with planets, stars, and environmental effects based on real exoplanet data.
*   **Dynamic Knowledge Graph:** The core of the game. As you piece together the graph, you unlock new technologies, reveal profound narratives, and witness the world's environment and its inhabitants change in response to the rediscovered knowledge.
*   **Programmable AI Agents:** Command a team of specialized AI agents, not just a single character. Customize their core logic and behaviors to solve complex challenges.
*   **Smart Environments:** The world is not static. It reacts to your actions. Ecosystems evolve, cities reconfigure their infrastructure, and ancient defense systems activate based on the state of the Knowledge Graph.

## Technology Stack

This project will be built using a modern, web-native, and high-performance technology stack:

*   **Frontend:** **React** for the UI and HUD, with **Babylon.js** for high-performance 3D rendering.
*   **Real-time Multiplayer:** **PartyKit** for handling stateful, real-time communication within each solar system.
*   **Backend API:** **Cloudflare Workers** (using Hono for routing) for serving game data, handling authentication, and other backend logic.
*   **Database:** **Cloudflare D1** for all persistent data, including player accounts, ship inventories, and the Knowledge Graph.
*   **Asset Storage:** **Cloudflare R2** for storing large game assets like 3D models and textures.
*   **Session & Caching:** **Cloudflare KV** for managing user sessions and caching frequently accessed data.

## Architecture Overview

The game is designed as a monorepo with three primary services:

1.  **Client (`/src/client`):** The React/Babylon.js application that players interact with. It handles rendering, user input, and communication with the backend services.
2.  **Party Server (`/src/server/party`):** The real-time engine powered by PartyKit. Each solar system is a separate "room" that manages and syncs the state of all players and objects within it.
3.  **API Server (`/src/server/api`):** A stateless Cloudflare Worker that provides RESTful APIs for non-real-time game data, served from D1 and R2.

## Implementation Plan

The project will be developed in phases to manage complexity.

*   **Phase 1: Foundation & Core Multiplayer:** Establish the monorepo, a basic Babylon.js client, and a PartyKit server to sync player movement in a single solar system.
*   **Phase 2: World Persistence & Data:** Implement D1 schemas, build API endpoints to serve solar system data, and dynamically generate the 3D world from that data.
*   **Phase 3: Core Gameplay Loop:** Introduce player authentication, a galaxy map for traveling between systems (rooms), and basic interactions like scanning planets.
*   **Phase 4: Advanced Features & Polish:** Build out the Knowledge Graph system, introduce AI agents, implement an inventory system, and refine the UI/UX.

## Project Status

This project is currently in the **architectural planning phase**. This document outlines the core vision and technical blueprint. The next step is to begin Phase 1 by developing a prototype of the core multiplayer and rendering loop.

