import { useEffect, useRef, useState } from "react";
import GameMap from "./GameMap";
import { loadProvinceData } from "./LoadData";
import adjacencyData from './assets/gis/merged/merged_adjacency.json';
import {getProvinceNameById, getProvinceIdByName} from "./utils";
import './App.css';

const Game = () => {
    const [provinces, setProvinces] = useState([]);
    const [loading, setIsLoading] = useState(true);
    const [challenge, setChallenge] = useState(null);
    const [mapReady, setMapReady] = useState(false);
    
    const [guessedProvinces, setGuessedProvinces] = useState([]);
    const gameMapRef = useRef(null);
    let parent = useRef({});
    let rank = useRef({})
    const maxRank = useRef(0);

    const getRandomEndProvince = (startId, min_distance = 3) => {
        const queue = [[startId]];
        const visited = new Set([startId]);
        const distance = {};
        const potentialEndIds = [];
        
        distance[startId] = 0;
        while (queue.length > 0) {
            const path = queue.shift();
            const currentId = path[path.length - 1];
            
            const neighbors = adjacencyData[currentId] || [];
            
            for (const neighborId of neighbors) {
                if (!visited.has(neighborId)) {
                    visited.add(neighborId);
                    distance[neighborId] = distance[currentId] + 1;
                    queue.push([...path, neighborId]);
                    if (distance[neighborId] >= min_distance) {
                        potentialEndIds.push(neighborId);
                    }
                }
            }
        }

        return potentialEndIds[Math.floor(Math.random() * potentialEndIds.length)];
    }

    const generateNewChallenge = () => {
        const provinceIds = Object.keys(adjacencyData);

        const startProvince = provinceIds[Math.floor(Math.random() * provinceIds.length)];
        const endProvince = getRandomEndProvince(startProvince);
        
        const challenge = {
            startId: startProvince,
            endId: endProvince,
            startName: getProvinceNameById(startProvince),
            endName: getProvinceNameById(endProvince),
        }

        return challenge;
    };

    useEffect(() => {
        const loadData = async () => {
            var provinceData;
            try {
                provinceData = await loadProvinceData();
                setProvinces(provinceData);
                setIsLoading(false);
            } catch (err) {
                console.error('Failed to load data:', err);
            }
            return provinceData;
        }
        
        loadData();
    }, []);

    useEffect(() => {
        if(mapReady)
            handleNewChallenge();
    }, [mapReady]);

    const markMapReady = () => {
        setMapReady(true);
    };

    const handleNewChallenge = () => {
        const newChallenge = generateNewChallenge();
        gameMapRef.current.renderChallenge(newChallenge);
        makeSet(newChallenge.startId);
        makeSet(newChallenge.endId);
        setChallenge(newChallenge);
        setGuessedProvinces([]);
    };

    const uniteSet = (nodeA, nodeB) => {
        var a = findSet(nodeA);
        var b = findSet(nodeB);
        
        if(a != b) {
            if (rank[a] > rank[b]) {
                parent.current[a] = b;
                rank[a] = rank[b];
            }
            else {
                parent.current[b] = a;
                rank[b] = rank[a];
            }
            
        }
    };

    const findSet = (node) => {
        if(node == parent.current[node]) {
            return node;
        }
        const p = findSet(parent.current[node]);
        parent.current[node] = p;
        return p;
    };

    const makeSet = (node) => {
        maxRank.current = maxRank.current * 1 + 1;
        parent.current[node] = node;
        rank[node] = maxRank.current;
        // console.log(node, rank[node]);
    }

    const handleGuess = () => {
        const guessInput = document.getElementById('guess');
        const guessedProvince = guessInput.value.trim();

        if(guessedProvinces.includes(guessedProvince)) {
            alert("Already guessed");
            return;
        }

        if(guessedProvince == challenge.startName || guessedProvince == challenge.endName) {
            alert("Guess should not include start or end");
            return;
        }

        setGuessedProvinces(prev => [...prev, guessedProvince]);
        gameMapRef.current.highlightProvince(guessedProvince);

        const guessedId = getProvinceIdByName(guessedProvince);

        makeSet(guessedId);
        
        for(let neighborId of adjacencyData[guessedId]) {
            if(guessedProvinces.includes(getProvinceNameById(neighborId)) 
                || neighborId == challenge.startId 
                || neighborId == challenge.endId) {
                uniteSet(guessedId, neighborId);
            }
        }   

        if(findSet(challenge.endId) == challenge.startId) {
            alert("You won!")
            console.log("Player won");
        }

        if(guessedProvinces.length > 20) {
            alert("You lose...")
        }
    };

    return (
        <div id="main-game" className="shadow-lg ax-w-xl mx-auto">
            <div>
            {
                challenge ? 
                <h3>Hôm nay tôi muốn đi từ <strong style={{color: '#28a745'}}>{challenge.startName}
                    </strong> đến <strong style={{color: '#dc3545'}}>{challenge.endName}</strong>
                </h3>
                : null
            }
            </div >
            {
                loading ? null : <>
                    <GameMap 
                        ref={gameMapRef}
                        provinces = {provinces}
                        markMapReady={markMapReady}
                    />
                </>
                
            }
            <div>
                <input 
                id="guess" 
                className="w-full bg-slate-800 
                        border border-slate-700 
                        text-white placeholder-slate-400 px-4 py-3 rounded-lg 
                        focus:outline-none focus:ring-2 focus:ring-teal-400 
                        focus:border-transparent transition-all"/>
                <button onClick={handleGuess}>Guess</button>
            </div>
            
            <div>
                <h3>Guesses:</h3>
                <ol>
                {
                    guessedProvinces.map(province => 
                        <li key={getProvinceIdByName(province)}>
                            {province}</li>
                    )
                }
                </ol>
                
            </div>

        </div>
    )
}

export default Game;