import { useEffect, useRef, useState } from "react";
import GameMap from "./GameMap";
import {loadProvinceData, getProvinceNameById, getProvinceIdByName, GameModes, getTodaysSeed, RNG} from "./utils";
import AutoSuggestInput from "./components/AutoSuggestInput";
import { useToast } from "./components/Toast";
import { LoaderCircle } from "lucide-react";

const Game = ({gameMode = GameModes.DAILY, showResult}) => {
    const toast = useToast();
    const [provinces, setProvinces] = useState([]);
    const [loading, setIsLoading] = useState(true);
    const [challenge, setChallenge] = useState(null);
    const [mapReady, setMapReady] = useState(false);
    const [completed, setCompleted] = useState(false);
    const [adjacencyData, setAdjacencyData] = useState({});
    
    const [guessedProvinces, setGuessedProvinces] = useState([]);
    
    const gameMapRef = useRef(null);
    const parent = useRef({});
    const rank = useRef({})
    const maxRank = useRef(0);
    const todaysSeed = getTodaysSeed();

    const getRandomEndProvinceAndPath = (startId, seed = null, min_distance = 3) => {
        let queue = [startId];
        const visited = new Set([startId]);
        const traceBack = {};
        const distance = {};
        const potentialEndIds = [];
        
        distance[startId] = 0;
        while (queue.length > 0) {
            const currentId = queue.shift();
            
            const neighbors = adjacencyData[currentId] || [];
            
            for (const neighborId of neighbors) {
                if (!visited.has(neighborId)) {
                    visited.add(neighborId);
                    distance[neighborId] = distance[currentId] + 1;
                    queue.push(neighborId);
                    traceBack[neighborId] = currentId;
                    if (distance[neighborId] >= min_distance) {
                        potentialEndIds.push(neighborId);
                    }
                }
            }
        }

        const endId = potentialEndIds[Math.floor((seed ? RNG(seed * 37 + 1) : Math.random()) * potentialEndIds.length)];

        let path = [endId];
        let currentId = endId;
        while(currentId != startId) {
            currentId = traceBack[currentId];
            path = [currentId, ...path];
        }
        return [endId, path];
    }

    const generateNewChallenge = (seed = null) => {
        const provinceIds = Object.keys(adjacencyData);

        const startId = provinceIds[Math.floor((seed ? RNG(seed) : Math.random()) * provinceIds.length)];
        const [endId, pathInId] = getRandomEndProvinceAndPath(startId, seed);
        
        const optimalPath = pathInId.map((provinceId) => getProvinceNameById(provinceId));
        const guessLimit = Math.max(Math.round((optimalPath.length - 2) * 1.3), optimalPath.length + 1);
        
        const challenge = {
            startId: startId,
            endId: endId,
            startName: getProvinceNameById(startId),
            endName: getProvinceNameById(endId),
            optimalPath: optimalPath,
            guessLimit: guessLimit
        }

        return challenge;
    };

    useEffect(() => {
        const loadData = async () => {
            var provinceData, adjacencyData;
            try {
                provinceData = await loadProvinceData();
                setProvinces(provinceData);
                
                const response = await fetch('/assets/gis/merged/merged_adjacency.json');
                adjacencyData = await response.json(); 
                setAdjacencyData(adjacencyData);
                setIsLoading(false);
            } catch (err) {
                console.error('Failed to load data:', err);
            }
        }
        
        loadData();
        
    }, []);

    useEffect(() => {
        if(mapReady) {
            if(gameMode == GameModes.PRACTICE)
                handleNewChallenge();
            else {
                prepareDailyChallenge();
            }
        }
            
    }, [mapReady]);

    useEffect(() => {
        if(!mapReady)
            return;
        if(gameMode == GameModes.PRACTICE)
            handleNewChallenge();
        else {
            prepareDailyChallenge();
        }
    }, [gameMode]);

    const markMapReady = () => {
        setMapReady(true);
    };

    const STORAGE_KEY = 'daily-challenge-progress';

    const saveProgress = (progress, seed = todaysSeed) => {
        const allProgress = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
        allProgress[seed] = progress;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(allProgress));
    }
    
    const loadProgress = (seed = todaysSeed) => {
        const allProgress = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
        return allProgress[seed] || {
            rank: {},
            parent: {},
            maxRank: 0,
            guessedProvinces: [],
            completed: false,
            playerWon: false,
        }; 
    }

    const prepareDailyChallenge = () => {
        
        const newChallenge = generateNewChallenge(todaysSeed);
        const progress = loadProgress(todaysSeed);
        // console.log(progress);
        gameMapRef.current.renderChallenge(newChallenge);
        
        setChallenge(newChallenge);
        const savedGuessedProvinces = progress.guessedProvinces;
        setGuessedProvinces(savedGuessedProvinces);
        savedGuessedProvinces.forEach(p => {
            gameMapRef.current.highlightProvince(p);
        })

        rank.current = progress.rank;
        parent.current = progress.parent;
        maxRank.current = progress.maxRank;
        setCompleted(progress.completed);
        if(maxRank.current == 0) {
            makeSet(newChallenge.startId);
            makeSet(newChallenge.endId);
        }

        if(progress.completed) {
            const result = {
                playerWon: progress.playerWon,
                guessesCount: savedGuessedProvinces.length
            }
            showResult(newChallenge, result)
        }
    }

    const handleNewChallenge = () => {
        const newChallenge = generateNewChallenge();
        gameMapRef.current.renderChallenge(newChallenge);

        setChallenge(newChallenge);
        setGuessedProvinces([]);
        rank.current = {};
        parent.current = {};
        maxRank.current = 0;
        setCompleted(false);
        makeSet(newChallenge.startId);
        makeSet(newChallenge.endId);
        
    };

    const uniteSet = (nodeA, nodeB) => {
        var a = findSet(nodeA);
        var b = findSet(nodeB);
        
        if(a != b) {
            if (rank.current[a] > rank.current[b]) {
                parent.current[a] = b;
                rank.current[a] = rank.current[b];
            }
            else {
                parent.current[b] = a;
                rank.current[b] = rank.current[a];
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
        rank.current[node] = maxRank.current;
        // console.log(node, rank.current[node]);
    }

    const handleGuess = () => {
        const guessInput = document.getElementById('guess');
        const guessedProvince = guessInput.value.trim();

        const province = provinces.find(p => 
          p.name === guessedProvince
        );

        if(province == null) {
            toast("Tên không hợp lệ");
            return;
        }

        if(guessedProvinces.includes(guessedProvince)) {
            toast("Tên đã có trong danh sách");
            return;
        }

        if(guessedProvince == challenge.startName || guessedProvince == challenge.endName) {
            toast("Không cần đoán điểm bắt đầu và kết thúc");
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

        var completed = false, playerWon = false;
        if(findSet(challenge.endId) == challenge.startId) {
            const result = {
                playerWon: true,
                guessesCount: guessedProvinces.length + 1
            }
            completed = true;
            playerWon = true;
            showResult(challenge, result);
        }

        if(guessedProvinces.length + 1 > challenge.guessLimit) {
            const result = {
                playerWon: false,
            }
            completed = true;
            playerWon = false;
            showResult(challenge, result);
        }
        
        const progress = {
            rank: rank.current,
            parent: parent.current,
            maxRank: maxRank.current,
            guessedProvinces: [...guessedProvinces, guessedProvince],
            completed: completed,
            playerWon: playerWon,
        }; 

        setCompleted(completed);
        saveProgress(progress)
    };

    return (
        <div id="main-game" className="box-border flex flex-col md:flex-row w-full h-screen pt-10 content-center">
        {
            loading ? 
            <div className="flex self-center items-center mx-auto my-auto">
                <LoaderCircle size={48} className="text-white animate-spin"/> 
                <div className="ml-2 font-medium"></div>Đang tải...
            </div>
            : 
            <>
                <div className="w-full flex content-center md:max-w-[55vw] md:justify-center pt-10 p-4 md:pl-30 md:grow">
                    <GameMap 
                        ref={gameMapRef}
                        provinces = {provinces}
                        markMapReady={markMapReady}
                        
                    />
                </div>
            
                <div className="md:w-[50vw] md:mr-5 md:mt-30 md:grow">
                    <div className="w-full md:max-w-2xl md:mr-auto md:my-6 flex flex-col gap-2 p-4">
                    {
                        challenge ? 
                        <h3 className="text-left">Kết nối <strong style={{color: '#61bd6c'}}>{challenge.startName}
                            </strong> đến <strong style={{color: '#e05c56'}}>{challenge.endName}</strong>
                        </h3>
                        : null
                    }   
                    </div>
                
                    <div className="flex flex-col w-full md:py-6 md:max-w-lg">
                        <div className="w-full max-w-7xl mx-auto px-4 md:mt-8 mb-2 flex flex-col gap-2
                        rounded-lg p-4">
                            <div className="block text-sm font-medium">
                                Nhập tên tỉnh
                            </div>
                                <AutoSuggestInput
                                    provinceNames={provinces.map(province => province.name)}
                                    handleSubmit={handleGuess}
                                    disabled={completed}
                                />
                            <button 
                                className="bg-[#141516] text-white px-4 py-2 rounded-md text-sm font-medium disabled:cursor-not-allowed"
                                onClick={handleGuess}
                                disabled={completed}
                                >Đoán {challenge ? `(${guessedProvinces.length}/${challenge?.guessLimit})` : null}
                                
                            </button>
                            {
                                gameMode == GameModes.PRACTICE ? (
                                    <button
                                        className="bg-[#141516] text-white px-4 py-2 rounded-md text-sm font-medium disabled:cursor-not-allowed"
                                        onClick={handleNewChallenge}
                                    >
                                        Thử thách mới
                                    </button>
                                ) : null
                            }
                            
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
            </>
            }
        </div>
    )
}

export default Game;