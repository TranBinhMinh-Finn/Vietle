import { useEffect, useRef, useState } from "react";
import GameMap from "./GameMap";
import { loadProvinceData } from "./LoadData";
import adjacencyData from './assets/gis/merged/merged_adjacency.json';
import {getProvinceNameById, getProvinceIdByName} from "./utils";
import './App.css';
import AutoSuggestInput from "./AutoSuggestInput";

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

        const province = provinces.find(p => 
          p.name === guessedProvince
        );

        if(province == null) {
            alert("Invalid province");
            return;
        }

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
        <div id="main-game" className="box-border flex w-full h-screen pt-15 grow content-center">
            <div className="min-w-1xl max-w-[55vw] flex content-center justify-end p-4 grow">
            {
                loading ? null : <>
                    <GameMap 
                        ref={gameMapRef}
                        provinces = {provinces}
                        markMapReady={markMapReady}
                        
                    />
                </>
                
            }
            </div>
            
            <div className="max-w-3xl mr-5 mt-30">
                <div className="w-full max-w-1xl mx-auto px-4 my-6 flex flex-col gap-2
                rounded-lg p-4">
                {
                    challenge ? 
                    <h3>Kết nối <strong style={{color: '#61bd6c'}}>{challenge.startName}
                        </strong> đến <strong style={{color: '#e05c56'}}>{challenge.endName}</strong>
                    </h3>
                    : null
                }   
                </div>
            
                <div className="flex flex-col w-full py-6">
                    <div className="w-full max-w-7xl mx-auto px-4 mt-8 mb-2 flex flex-col gap-2
                    rounded-lg p-4">
                        <div className="block text-sm font-medium">
                            Nhập tên tỉnh
                        </div>
                        <AutoSuggestInput
                            provinceNames={provinces.map(province => province.name)}
                            handleSubmit={handleGuess}
                        />
                        <button 
                            className="bg-[#141516] text-white px-4 py-2 rounded-md text-sm font-medium disabled:cursor-not-allowed transition-colors"
                            onClick={handleGuess}>Đoán</button>
                    </div>
            
                    <div className="w-full max-w-full mx-auto px-4 mt-2 flex flex-col rounded-lg">
                        <label className="block text-sm font-medium mb-2">
                            Các tỉnh đã đoán:
                        </label>
                        <ol className="flex flex-wrap gap-1">
                        {
                            guessedProvinces.map((province, index) => 
                                <li key={getProvinceIdByName(province)}
                                    className="bg-[#3b4043] px-3 py-2 rounded-full text-sm font-medium"
                                >
                                    {index+1}. {province}</li>
                            )
                        }
                        </ol>
                        
                    </div>
                </div>

            </div>
            
        </div>
    )
}

export default Game;