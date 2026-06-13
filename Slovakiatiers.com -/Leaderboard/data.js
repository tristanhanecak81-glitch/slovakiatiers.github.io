const leaderboardData = [
    // 100 placeholder entries (rank 1..100)
    
    
];

for (let i = 1; i <= 99; i++) {
    leaderboardData.push({
        rank: i,
        name: "?",
        title: "?",
        points: "?",
        avatar: "?",
        region: "?",
        color: "#333",
        tiers: ["?"]
    });
}

// Insert LakerL123 as the first player
const newPlayer = {
    rank: 1,
    name: "LakerL123",
    title: "?",
    points: "?",
    avatar: "LakerL123",
    region: "?",
    color: "#ff6b35",
    tiers: ["?"]
};
leaderboardData.unshift(newPlayer);

// Reassign ranks
leaderboardData.forEach((p, i) => p.rank = i + 1);
