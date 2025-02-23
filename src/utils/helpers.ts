export const shuffleArray = <T>(array: T[]): T[] => {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
};

export const getRoleDescription = (role: string): string => {
    const roleDescriptions: { [key: string]: string } = {
        "Merlin": "The Merlin knows who the spies are, but must be careful not to reveal their identity.",
        "Assassin": "The Assassin tries to identify Merlin and can win the game by eliminating him.",
        "Spy": "The Spy knows who the other spies are and works to sabotage the missions.",
        "Loyal Servant": "The Loyal Servants work to complete the missions and protect Merlin.",
        "Morgana": "Morgana appears as Merlin to the Assassin, misleading him.",
        "Percival": "Percival knows who Merlin is, but not who the spies are."
    };
    return roleDescriptions[role] || "Role not recognized.";
};

export const isValidVote = (vote: string): boolean => {
    return vote === "approve" || vote === "reject";
};